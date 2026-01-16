/**
 * POST /api/payment/confirm
 * Confirm Stripe payment and create Hostaway reservation + database booking
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getPaymentIntent, confirmPaymentIntent } from "@/lib/stripe"
import { createBookingOperation } from "@/lib/booking-operations"
import { getListingIdBySlug } from "@/lib/listing-map"
import { roundToTwoDecimals } from "@/lib/utils"
import { sendBookingConfirmationEmail } from "@/lib/email"
import { getCabinBySlugSync } from "@/lib/cabins"
import { addMessageToConversation } from "@/lib/hostaway"
import { getReferralCodeFromRequest } from "@/lib/discounts"
import { createBookingAttribution } from "@/lib/attribution"

interface ConfirmPaymentRequest {
  paymentIntentId: string
  slug: string
  checkIn: string
  checkOut: string
  guests: number
  pets?: number
  infants?: number
  // Exact pricing from review page - MUST be provided
  pricing?: {
    nightlyRate: number
    nights: number
    subtotal: number
    discounted_subtotal?: number // Subtotal after discount (if discount applied)
    cleaningFee: number
    tax: number
    channelFee: number
    petFee: number
    total: number
    currency: string
    discount?: {
      type: "percent" | "fixed"
      value: number
      amount: number
    }
  }
  guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
    specialRequests?: string
  }
}

export async function POST(request: Request) {
  try {
    const body: ConfirmPaymentRequest = await request.json()
    const { paymentIntentId, slug, checkIn, checkOut, guests, pets = 0, infants = 0, pricing, guestInfo } = body

    // Validate required fields
    if (!paymentIntentId || !slug || !checkIn || !checkOut || !guests || !guestInfo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify payment intent
    let paymentIntent
    try {
      paymentIntent = await getPaymentIntent(paymentIntentId)
    } catch (error: any) {
      return NextResponse.json(
        { error: `Invalid payment intent: ${error.message}` },
        { status: 400 }
      )
    }

    // Check payment status
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Payment not succeeded. Status: ${paymentIntent.status}` },
        { status: 400 }
      )
    }

    // Get listing ID
    const listingId = getListingIdBySlug(slug)
    if (!listingId) {
      return NextResponse.json(
        { error: `No listing found for cabin: ${slug}` },
        { status: 404 }
      )
    }

    // Use exact pricing from review page - this is the source of truth
    let finalPricing
    if (pricing && pricing.total && pricing.total > 0) {
      // Validate that pricing total matches payment intent amount (within 1 cent tolerance)
      const paymentAmountInDollars = paymentIntent.amount / 100
      const pricingTotalRounded = roundToTwoDecimals(pricing.total)
      const amountDifference = Math.abs(paymentAmountInDollars - pricingTotalRounded)
      
      if (amountDifference > 0.01) {
        console.warn(
          `Pricing mismatch: payment intent amount (${paymentAmountInDollars}) ` +
          `does not match provided pricing total (${pricingTotalRounded})`
        )
        // Still proceed, but log the warning
      }
      
      // Use the exact pricing from review page
      finalPricing = {
        total: roundToTwoDecimals(pricing.total),
        currency: pricing.currency || 'USD',
        nightlyRate: roundToTwoDecimals(pricing.nightlyRate),
        subtotal: roundToTwoDecimals(pricing.subtotal),
        cleaningFee: roundToTwoDecimals(pricing.cleaningFee),
        tax: roundToTwoDecimals(pricing.tax),
        channelFee: roundToTwoDecimals(pricing.channelFee),
        petFee: roundToTwoDecimals(pricing.petFee || 0),
        // Include discount information if present
        discount: pricing.discount ? {
          type: pricing.discount.type,
          value: pricing.discount.value,
          amount: roundToTwoDecimals(pricing.discount.amount),
        } : undefined,
        discounted_subtotal: pricing.discounted_subtotal ? roundToTwoDecimals(pricing.discounted_subtotal) : undefined,
      }
    } else {
      // Fallback: pricing not provided (should not happen in normal flow)
      // Use payment intent amount as total
      const paymentAmountInDollars = paymentIntent.amount / 100
      const nights = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      // Estimate breakdown from total (reverse calculation)
      // This is a fallback and should rarely be used
      const estimatedSubtotal = roundToTwoDecimals(paymentAmountInDollars / 1.14) // Approximate: total / (1 + tax_rate + channel_fee_rate + cleaning_fee_ratio)
      const estimatedCleaningFee = 100
      const estimatedTax = roundToTwoDecimals(estimatedSubtotal * 0.12)
      const estimatedChannelFee = roundToTwoDecimals(estimatedSubtotal * 0.02)
      const estimatedNightlyRate = nights > 0 ? roundToTwoDecimals(estimatedSubtotal / nights) : 0
      
      finalPricing = {
        total: roundToTwoDecimals(paymentAmountInDollars),
        currency: paymentIntent.currency || 'USD',
        nightlyRate: estimatedNightlyRate,
        subtotal: estimatedSubtotal,
        cleaningFee: estimatedCleaningFee,
        tax: estimatedTax,
        channelFee: estimatedChannelFee,
      }
      
      console.warn('Pricing not provided in request, using estimated breakdown from payment intent amount')
    }

    // Create booking (Hostaway reservation + database storage)
    try {
      const { booking, hostawayReservationId } = await createBookingOperation({
        paymentIntentId,
        listingId,
        checkIn,
        checkOut,
        guests,
        adults: guests, // Assume all adults for now
        pets,
        infants,
        guestInfo,
        pricing: finalPricing,
        stripeMetadata: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      })

      const confirmationCode = `LR-${booking.id.substring(0, 8).toUpperCase()}`
      
      // Check for referral code and create attribution
      const cookieStore = await cookies()
      const referralCode = getReferralCodeFromRequest(cookieStore)
      
      if (referralCode && pricing) {
        try {
          // Calculate discount amount (original subtotal - discounted subtotal)
          // If pricing has discount info, use it; otherwise calculate from subtotal
          const originalSubtotal = pricing.subtotal
          const discountedSubtotal = pricing.discounted_subtotal || pricing.subtotal
          const discountApplied = originalSubtotal - discountedSubtotal
          
          // Revenue basis is the original subtotal (before discount)
          await createBookingAttribution({
            bookingId: booking.id,
            referralCode,
            revenueBasis: originalSubtotal,
            guestDiscountApplied: discountApplied,
          })
          
          console.log(`✅ Booking attribution created for referral code: ${referralCode}`)
        } catch (attributionError: any) {
          // Log error but don't fail the booking
          console.warn(`⚠️  Failed to create booking attribution: ${attributionError.message}`)
        }
      }
      
      // Get cabin information for email
      const cabin = getCabinBySlugSync(slug)
      const cabinName = cabin?.name || slug.charAt(0).toUpperCase() + slug.slice(1)
      
      // Calculate nights
      const nights = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      // Post special requests to Hostaway conversation if provided
      if (guestInfo.specialRequests && guestInfo.specialRequests.trim()) {
        try {
          if (hostawayReservationId > 0) {
            await addMessageToConversation(
              hostawayReservationId,
              `Special Request: ${guestInfo.specialRequests.trim()}`,
              1 // isIncoming: 1 = from guest
            )
            console.log(`✅ Special request posted to Hostaway conversation for reservation ${hostawayReservationId}`)
          }
        } catch (messageError: any) {
          // Log error but don't fail the booking
          console.warn(`⚠️  Failed to post special request to Hostaway conversation: ${messageError.message}`)
        }
      }

      // Send confirmation email (don't await - send in background)
      sendBookingConfirmationEmail({
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        guestEmail: guestInfo.email,
        confirmationCode,
        cabinName,
        checkIn,
        checkOut,
        nights,
        guests,
        pricing: finalPricing,
      }).catch((emailError) => {
        // Log email error but don't fail the booking
        console.error("Failed to send confirmation email:", emailError)
      })

      return NextResponse.json({
        success: true,
        booking: {
          id: booking.id,
          confirmationCode,
          hostawayReservationId,
        },
      })
    } catch (error: any) {
      console.error('Error creating booking:', error)
      
      // If Hostaway reservation was created but database failed, we have a problem
      // For now, return error - in production, you might want to queue a retry
      return NextResponse.json(
        { error: `Failed to create booking: ${error.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in payment confirmation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
