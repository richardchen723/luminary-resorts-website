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
 * Uses manual capture to authorize now and charge later
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
    capture_method: 'manual', // Authorize now, charge later
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return paymentIntent
}

/**
 * Confirm a payment intent
 * Accepts both 'succeeded' (captured) and 'requires_capture' (authorized) statuses
 */
export async function confirmPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  
  // Accept both succeeded (captured) and requires_capture (authorized) statuses
  if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture') {
    return paymentIntent
  }
  
  throw new Error(`Payment intent ${paymentIntentId} is not in a valid state. Status: ${paymentIntent.status}`)
}

/**
 * Capture a previously authorized payment intent
 * Use this to charge the card after authorization
 * 
 * Example usage:
 * ```typescript
 * // Capture full authorized amount
 * const paymentIntent = await capturePaymentIntent('pi_xxx')
 * 
 * // Capture partial amount (e.g., for deposits)
 * const paymentIntent = await capturePaymentIntent('pi_xxx', 5000) // $50.00
 * ```
 * 
 * Note: Authorized payments expire after 7 days if not captured
 */
export async function capturePaymentIntent(
  paymentIntentId: string,
  amountToCapture?: number // in cents, if not provided, captures full amount
): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
    amount_to_capture: amountToCapture,
  })
  
  return paymentIntent
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
 * Create a setup intent to save payment method for future charges
 * This allows charging the card later without the 7-day authorization expiration
 */
export async function createSetupIntent(params: {
  metadata?: Record<string, string>
  description?: string
}): Promise<Stripe.SetupIntent> {
  const setupIntent = await stripe.setupIntents.create({
    payment_method_types: ['card'],
    metadata: params.metadata,
    description: params.description,
  })

  return setupIntent
}

/**
 * Charge a saved payment method
 * Use this to charge the remaining balance later (e.g., one month before check-in)
 * 
 * Example usage:
 * ```typescript
 * // Charge full amount
 * const paymentIntent = await chargeSavedPaymentMethod({
 *   paymentMethodId: 'pm_xxx',
 *   amount: 5000, // $50.00 in cents
 *   currency: 'usd',
 *   metadata: { bookingId: 'xxx', reason: 'final_payment' }
 * })
 * ```
 */
export async function chargeSavedPaymentMethod(params: {
  paymentMethodId: string
  amount: number // in cents
  currency: string
  metadata?: Record<string, string>
  description?: string
  customerId?: string // Optional: if you want to create/use a Stripe Customer
}): Promise<Stripe.PaymentIntent> {
  // Create payment intent with the saved payment method
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    payment_method: params.paymentMethodId,
    confirm: true, // Automatically confirm and charge
    off_session: true, // Indicates this is a saved payment method (no customer present)
    metadata: params.metadata,
    description: params.description,
  })

  return paymentIntent
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
