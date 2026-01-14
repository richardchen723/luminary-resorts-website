"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Card } from "@/components/ui/card"
import { Loader2, Lock } from "lucide-react"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
)

interface StepPaymentProps {
  paymentIntentId: string | null
  clientSecret: string | null
  onPaymentSuccess: (paymentIntentId: string) => void
  isLoading?: boolean
}

function PaymentForm({ onPaymentSuccess, isLoading: externalLoading }: Omit<StepPaymentProps, 'paymentIntentId' | 'clientSecret'> & { clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      if (paymentIntent && paymentIntent.status === "succeeded") {
        onPaymentSuccess(paymentIntent.id)
      } else {
        setError("Payment was not completed. Please try again.")
        setIsProcessing(false)
      }
    } catch (err: any) {
      console.error("Payment error:", err)
      setError(err.message || "An error occurred during payment. Please try again.")
      setIsProcessing(false)
    }
  }

  const isLoading = isProcessing || externalLoading || false

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Payment Information</h2>
        <p className="text-muted-foreground">Your payment information is secure and encrypted.</p>
      </div>

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

export function StepPayment({ paymentIntentId, clientSecret, onPaymentSuccess, isLoading }: StepPaymentProps) {
  if (!clientSecret) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Payment Information</h2>
          <p className="text-muted-foreground">Loading payment form...</p>
        </div>
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
      <PaymentForm clientSecret={clientSecret} onPaymentSuccess={onPaymentSuccess} isLoading={isLoading} />
    </Elements>
  )
}
