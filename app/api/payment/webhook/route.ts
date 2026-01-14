/**
 * POST /api/payment/webhook
 * Stripe webhook handler for async payment status updates
 */

import { NextResponse } from "next/server"
import { verifyWebhookSignature, stripe } from "@/lib/stripe"
import { getBookingByPaymentIntentId, updateBooking } from "@/lib/db/bookings"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set")
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  let event
  try {
    event = verifyWebhookSignature(body, signature, webhookSecret)
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${error.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as any
        console.log("Payment succeeded:", paymentIntent.id)
        
        // Update booking payment status if it exists
        const booking = await getBookingByPaymentIntentId(paymentIntent.id)
        if (booking && booking.payment_status !== "succeeded") {
          await updateBooking(booking.id, {
            payment_status: "succeeded",
          })
          console.log(`Updated booking ${booking.id} payment status to succeeded`)
        }
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as any
        console.log("Payment failed:", paymentIntent.id)
        
        // Update booking payment status
        const booking = await getBookingByPaymentIntentId(paymentIntent.id)
        if (booking) {
          await updateBooking(booking.id, {
            payment_status: "failed",
          })
          console.log(`Updated booking ${booking.id} payment status to failed`)
        }
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as any
        const paymentIntentId = charge.payment_intent
        
        if (paymentIntentId) {
          const booking = await getBookingByPaymentIntentId(paymentIntentId)
          if (booking) {
            await updateBooking(booking.id, {
              payment_status: "refunded",
            })
            console.log(`Updated booking ${booking.id} payment status to refunded`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: `Webhook processing failed: ${error.message}` },
      { status: 500 }
    )
  }
}
