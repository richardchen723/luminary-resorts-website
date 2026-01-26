"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Card } from "@/components/ui/card"
import { Loader2, Lock } from "lucide-react"
import { parseISO, differenceInDays } from "date-fns"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
)

interface StepPaymentProps {
  paymentIntentId: string | null
  clientSecret: string | null
  setupIntentClientSecret?: string | null // For saving payment method
  onPaymentSuccess: (paymentIntentId: string, paymentMethodId?: string) => void
  isLoading?: boolean
  pricing?: {
    total: number
    currency: string
  } | null
  checkIn?: string // Check-in date to verify 1 month advance requirement
}

function PaymentForm({ onPaymentSuccess, isLoading: externalLoading, pricing, setupIntentClientSecret, checkIn }: Omit<StepPaymentProps, 'paymentIntentId' | 'clientSecret'> & { clientSecret: string; setupIntentClientSecret?: string | null }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPaymentMethodType, setSelectedPaymentMethodType] = useState<string | null>('card') // Default to 'card' since it's the default payment method

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || "Please check your payment information")
        setIsProcessing(false)
        return
      }

      // Step 1: Confirm setup intent to save payment method (if setup intent is provided)
      let paymentMethodId: string | undefined
      if (setupIntentClientSecret) {
        try {
          const { error: setupError, setupIntent } = await stripe.confirmSetup({
            elements,
            clientSecret: setupIntentClientSecret,
            redirect: "if_required",
          })

          if (setupError) {
            setError(setupError.message || "Failed to save payment method. Please try again.")
            setIsProcessing(false)
            return
          }

          if (setupIntent && setupIntent.status === "succeeded" && setupIntent.payment_method) {
            paymentMethodId = typeof setupIntent.payment_method === 'string' 
              ? setupIntent.payment_method 
              : setupIntent.payment_method.id
          }
        } catch (setupErr: any) {
          console.error("Setup intent error:", setupErr)
          // Continue with payment even if setup fails (non-critical)
          console.warn("Payment method saving failed, but continuing with payment")
        }
      }

      // Step 2: Confirm payment intent to authorize/charge
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/booking/confirmation",
        },
        redirect: "if_required",
      })

      if (confirmError) {
        setError(confirmError.message || "Payment failed. Please try again.")
        setIsProcessing(false)
        return
      }

      // Accept both 'succeeded' (captured) and 'requires_capture' (authorized) statuses
      // With manual capture, payment will be authorized (requires_capture) but not yet charged
      if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "requires_capture")) {
        // Extract payment method ID from payment intent if not already saved
        const finalPaymentMethodId = paymentMethodId || 
          (paymentIntent.payment_method ? 
            (typeof paymentIntent.payment_method === 'string' ? paymentIntent.payment_method : paymentIntent.payment_method.id) 
            : undefined)
        
        onPaymentSuccess(paymentIntent.id, finalPaymentMethodId)
      } else {
        setError("Payment was not authorized. Please try again.")
        setIsProcessing(false)
      }
    } catch (err: any) {
      console.error("Payment error:", err)
      setError(err.message || "An error occurred during payment. Please try again.")
      setIsProcessing(false)
    }
  }

  const isLoading = isProcessing || externalLoading || false

  // Check if booking is at least 1 month (30 days) in advance
  const isAtLeastOneMonthAway = checkIn ? (() => {
    try {
      const checkInDate = parseISO(checkIn)
      const today = new Date()
      const daysUntilCheckIn = differenceInDays(checkInDate, today)
      return daysUntilCheckIn >= 30
    } catch {
      return false
    }
  })() : false

  // Listen for payment method type changes from PaymentElement
  useEffect(() => {
    if (!elements) return

    const paymentElement = elements.getElement('payment')
    if (!paymentElement) return

    const handleChange = (event: any) => {
      // The event.value.type contains the payment method type (e.g., 'card', 'cashapp', 'affirm', etc.)
      if (event.value?.type) {
        setSelectedPaymentMethodType(event.value.type)
      }
    }

    paymentElement.on('change', handleChange)

    return () => {
      paymentElement.off('change', handleChange)
    }
  }, [elements])

  // Check if card payment method is selected
  const isCardSelected = selectedPaymentMethodType === 'card'
  const showInstallmentMessage = isCardSelected && isAtLeastOneMonthAway

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Payment Information</h2>
        <p className="text-muted-foreground">Your payment information is secure and encrypted.</p>
      </div>

      {pricing && pricing.total > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-primary">
              {pricing.currency === "USD" ? "$" : pricing.currency}
              {pricing.total.toFixed(2)}
            </span>
          </div>
        </Card>
      )}

      {showInstallmentMessage && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-foreground">
            Confirm your booking now—pay in 3 installments. Available for bookings made at least 1 month in advance.
          </p>
        </Card>
      )}

      <Card className="p-6">
        <div className="space-y-4">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Your payment information is encrypted and secure.</span>
          </div>
        </div>
      </Card>
    </form>
  )
}

export function StepPayment({ paymentIntentId, clientSecret, setupIntentClientSecret, onPaymentSuccess, isLoading, pricing, checkIn }: StepPaymentProps) {
  if (!clientSecret) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Payment Information</h2>
        <p className="text-muted-foreground">Loading payment form...</p>
      </div>
      {pricing && pricing.total > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-primary">
              {pricing.currency === "USD" ? "$" : pricing.currency}
              {pricing.total.toFixed(2)}
            </span>
          </div>
        </Card>
      )}
      <Card className="p-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    </div>
  )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
        },
      }}
    >
      <PaymentForm 
        clientSecret={clientSecret} 
        setupIntentClientSecret={setupIntentClientSecret}
        onPaymentSuccess={onPaymentSuccess} 
        isLoading={isLoading} 
        pricing={pricing}
        checkIn={checkIn}
      />
    </Elements>
  )
}
