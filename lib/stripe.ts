/**
 * Stripe client initialization and utilities
 */

import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

/**
 * Get Stripe client instance (lazy initialization)
 */
function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
  }
  return stripeInstance
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent(params: {
  amount: number // in cents
  currency: string
  metadata: Record<string, string>
  description?: string
}): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    metadata: params.metadata,
    description: params.description,
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return paymentIntent
}

/**
 * Confirm a payment intent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  
  if (paymentIntent.status === 'succeeded') {
    return paymentIntent
  }
  
  throw new Error(`Payment intent ${paymentIntentId} is not succeeded. Status: ${paymentIntent.status}`)
}

/**
 * Get payment intent by ID
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

/**
 * Create a refund
 */
export async function createRefund(params: {
  paymentIntentId: string
  amount?: number // in cents, if not provided, full refund
  reason?: Stripe.RefundCreateParams.Reason
  metadata?: Record<string, string>
}): Promise<Stripe.Refund> {
  const refund = await stripe.refunds.create({
    payment_intent: params.paymentIntentId,
    amount: params.amount,
    reason: params.reason,
    metadata: params.metadata,
  })

  return refund
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}
