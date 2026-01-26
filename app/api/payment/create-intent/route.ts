/**
 * POST /api/payment/create-intent
 * Create a Stripe payment intent for a booking
 * 
 * IMPORTANT: This endpoint should use the exact pricing from the review page.
 * The pricing should be passed in the request body to ensure consistency.
 */

import { NextResponse } from 'next/server'
import { createPaymentIntent, createSetupIntent } from '@/lib/stripe'
import { getListingIdBySlug } from '@/lib/listing-map'
import { roundToTwoDecimals } from '@/lib/utils'

interface CreateIntentRequest {
  slug: string
  checkIn: string
  checkOut: string
  guests: number
  // Exact pricing from review page - MUST be provided
  pricing?: {
    total: number
    currency?: string
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateIntentRequest = await request.json()
    const { slug, checkIn, checkOut, guests, pricing } = body

    // Validate required fields
    if (!slug || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, checkIn, checkOut, guests' },
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
    let totalAmount: number
    let currency: string = 'USD'

    if (pricing && pricing.total && pricing.total > 0) {
      // Use the exact pricing from the review page
      totalAmount = Math.round(roundToTwoDecimals(pricing.total) * 100) // Convert to cents
      currency = pricing.currency || 'USD'
    } else {
      // Fallback: pricing not provided (should not happen in normal flow)
      return NextResponse.json(
        { error: 'Pricing information is required. Please ensure pricing is calculated on the review page.' },
        { status: 400 }
      )
    }

    // Create setup intent to save payment method for future charges
    // This allows charging the remaining balance later without 7-day expiration
    const setupIntent = await createSetupIntent({
      metadata: {
        slug,
        listingId: listingId.toString(),
        checkIn,
        checkOut,
        guests: guests.toString(),
      },
      description: `Payment method setup for booking ${slug} from ${checkIn} to ${checkOut}`,
    })

    // Create payment intent for initial charge (e.g., 50% deposit)
    // Note: We'll charge the full amount initially, but you can modify this to charge 50%
    const paymentIntent = await createPaymentIntent({
      amount: totalAmount,
      currency,
      metadata: {
        slug,
        listingId: listingId.toString(),
        checkIn,
        checkOut,
        guests: guests.toString(),
        setupIntentId: setupIntent.id, // Link setup intent to payment intent
      },
      description: `Booking for ${slug} from ${checkIn} to ${checkOut}`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      setupIntentClientSecret: setupIntent.client_secret, // For saving payment method
      setupIntentId: setupIntent.id,
    })
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
