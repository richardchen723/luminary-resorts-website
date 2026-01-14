/**
 * POST /api/payment/confirm
 * Confirm Stripe payment and create Hostaway reservation + database booking
 */

import { NextResponse } from "next/server"
import { getPaymentIntent, confirmPaymentIntent } from "@/lib/stripe"
import { createBookingOperation } from "@/lib/booking-operations"
import { getListingIdBySlug } from "@/lib/listing-map"
import { roundToTwoDecimals } from "@/lib/utils"
import { sendBookingConfirmationEmail } from "@/lib/email"
import { getCabinBySlugSync } from "@/lib/cabins"

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
    cleaningFee: number
    tax: number
    channelFee: number
    total: number
    currency: string
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
      
      // Get cabin information for email
      const cabin = getCabinBySlugSync(slug)
      const cabinName = cabin?.name || slug.charAt(0).toUpperCase() + slug.slice(1)
      
      // Calculate nights
      const nights = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      )
      
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
