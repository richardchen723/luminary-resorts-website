"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { StepReview } from "@/components/booking-steps/step-review"
import { StepGuestInfo } from "@/components/booking-steps/step-guest-info"
import { StepPayment } from "@/components/booking-steps/step-payment"
import type { HostawayGuestInfo, HostawayCalendarEntry } from "@/types/hostaway"
import { StepConfirmation } from "@/components/booking-steps/step-confirmation"
import { getListingIdBySlug } from "@/lib/listing-map"
import type { Cabin } from "@/lib/cabins"
import { eachDayOfInterval, parseISO, format, differenceInCalendarDays } from "date-fns"
import { roundToTwoDecimals } from "@/lib/utils"
import { trackReservationConfirmed } from "@/lib/analytics"
type BookingStep = "review" | "guest" | "payment" | "confirmation"

export default function BookingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = params.slug as string

  const checkIn = searchParams.get("checkIn") || ""
  const checkOut = searchParams.get("checkOut") || ""
  const guests = parseInt(searchParams.get("guests") || "2", 10)
  const pets = parseInt(searchParams.get("pets") || "0", 10)
  const infants = parseInt(searchParams.get("infants") || "0", 10)

  const [cabin, setCabin] = useState<Cabin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<BookingStep>("review")
  const [calendarData, setCalendarData] = useState<Record<string, HostawayCalendarEntry>>({})
  const [pricing, setPricing] = useState<{
    nightlyRate: number
    nights: number
    subtotal: number
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
    discounted_subtotal?: number
  } | null>(null)
  const [guestInfo, setGuestInfo] = useState<Partial<HostawayGuestInfo>>({})
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [setupIntentClientSecret, setSetupIntentClientSecret] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingConfirmation, setBookingConfirmation] = useState<{
    confirmationCode: string
    bookingId: string
  } | null>(null)

  useEffect(() => {
    async function loadCabin() {
      try {
        const cabinResponse = await fetch(`/api/cabins/${slug}`)
        
        if (!cabinResponse.ok) {
          router.push("/")
          return
        }
        
        const cabinData: Cabin = await cabinResponse.json()
        setCabin(cabinData)

        // Load calendar data for pricing calculation
        const listingId = getListingIdBySlug(slug)
        if (listingId) {
          try {
            const calendarResponse = await fetch(`/api/calendar/${listingId}`)
            if (calendarResponse.ok) {
              const calendarResult = await calendarResponse.json()
              setCalendarData(calendarResult.calendar || {})
            }
          } catch (err) {
            console.error("Error fetching calendar:", err)
          }
        }
      } catch (err: any) {
        console.error("Error loading cabin:", err)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      loadCabin()
    }
  }, [slug, router])

  // Load pricing when dates change or calendar data is available
  useEffect(() => {
    const abortController = new AbortController()
    
    async function loadPricing() {
      if (!checkIn || !checkOut) {
        setPricing(null)
        return
      }

      // First, try to load pricing from sessionStorage (from cabin detail page)
      // This ensures exact same price as shown on cabin detail page
      const pricingKey = `pricing_${slug}_${checkIn}_${checkOut}_${guests}_${pets}_${infants}`
      try {
        const cachedPricing = sessionStorage.getItem(pricingKey)
        if (cachedPricing) {
          const parsed = JSON.parse(cachedPricing)
          // Verify the cached pricing is for the same dates, guests, pets, and infants
          if (parsed.checkIn === checkIn && parsed.checkOut === checkOut && parsed.guests === guests && parsed.pets === pets && parsed.infants === infants) {
            // Use cached pricing if it's less than 10 minutes old
            if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
              // Recalculate pet fee in case pets changed
              const petFee = roundToTwoDecimals(pets > 0 ? 50 : 0) // $50 flat fee
              // Recalculate total: if there's a discounted subtotal, use it; otherwise use regular subtotal
              const subtotalToUse = parsed.discounted_subtotal || parsed.subtotal
              const totalWithPetFee = roundToTwoDecimals(subtotalToUse + parsed.cleaningFee + parsed.tax + parsed.channelFee + petFee)
              setPricing({
                nightlyRate: parsed.nightlyRate,
                nights: parsed.nights,
                subtotal: parsed.subtotal,
                cleaningFee: parsed.cleaningFee,
                tax: parsed.tax,
                channelFee: parsed.channelFee,
                petFee,
                total: totalWithPetFee,
                currency: parsed.currency,
                discount: parsed.discount,
                discounted_subtotal: parsed.discounted_subtotal,
              })
              return
            }
          }
        }
      } catch (e) {
        // Ignore sessionStorage errors, continue with normal pricing load
        console.warn("Failed to load pricing from sessionStorage:", e)
      }

      try {
        const listingId = getListingIdBySlug(slug)
        if (!listingId) return

        const nights = differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn))

        // Calculate pricing from calendar data (preferred method)
        // Note: If calendarData isn't loaded yet, the useEffect will re-run when it's set
        let subtotalFromCalendar: number | null = null
        let currencyFromCalendar: string = "USD"
        
        if (calendarData && Object.keys(calendarData).length > 0) {
          try {
            // Get all dates in the range (check-in to check-out, excluding check-out day)
            const checkOutDate = parseISO(checkOut)
            checkOutDate.setDate(checkOutDate.getDate() - 1) // Day before check-out
            const dateRange = eachDayOfInterval({
              start: parseISO(checkIn),
              end: checkOutDate
            })
            
            let totalPrice = 0
            let datesWithPrice = 0
            
            for (const date of dateRange) {
              const dateStr = format(date, "yyyy-MM-dd")
              const entry = calendarData[dateStr]
              
              if (entry && entry.price !== null && entry.price !== undefined) {
                totalPrice += entry.price
                datesWithPrice++
              }
            }
            
            // If we have prices for all dates, use calendar-based pricing
            if (datesWithPrice === dateRange.length && totalPrice > 0) {
              subtotalFromCalendar = totalPrice
            }
          } catch (calendarPricingError) {
            console.warn("Error calculating pricing from calendar:", calendarPricingError)
          }
        }
        
        // If we successfully calculated from calendar, still check for discount via API
        if (subtotalFromCalendar !== null && subtotalFromCalendar > 0) {
          // Check for discount via API
          try {
            const discountResponse = await fetch("/api/pricing/discount", {
              signal: abortController.signal,
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                subtotal: subtotalFromCalendar,
              }),
            })
            
            let discount = null
            if (discountResponse.ok) {
              const discountData = await discountResponse.json()
              discount = discountData.discount || null
            }
            
            const subtotalToUse = discount ? discount.discounted_subtotal : subtotalFromCalendar
            const cleaningFee = 100
            const tax = roundToTwoDecimals(subtotalToUse * 0.12)
            const channelFee = roundToTwoDecimals(subtotalToUse * 0.02)
            const petFee = roundToTwoDecimals(pets > 0 ? 50 : 0) // $50 flat fee
            const total = roundToTwoDecimals(subtotalToUse + cleaningFee + tax + channelFee + petFee)
            const nightlyRate = nights > 0 ? roundToTwoDecimals(subtotalFromCalendar / nights) : 0
            
            setPricing({
              nightlyRate,
              nights,
              subtotal: roundToTwoDecimals(subtotalFromCalendar),
              cleaningFee,
              tax,
              channelFee,
              petFee,
              total,
              currency: currencyFromCalendar,
              discount: discount ? {
                type: discount.discount_type,
                value: discount.discount_value,
                amount: discount.discount_amount,
              } : undefined,
              discounted_subtotal: discount ? discount.discounted_subtotal : undefined,
            })
            // Cancel any pending API call since we have calendar-based pricing with discount
            abortController.abort()
            return
          } catch (discountError: any) {
            // If discount API fails, use calendar pricing without discount
            if (discountError.name !== 'AbortError') {
              console.warn("Failed to get discount for calendar pricing:", discountError)
            }
            const cleaningFee = 100
            const tax = roundToTwoDecimals(subtotalFromCalendar * 0.12)
            const channelFee = roundToTwoDecimals(subtotalFromCalendar * 0.02)
            const petFee = roundToTwoDecimals(pets > 0 ? 50 : 0)
            const total = roundToTwoDecimals(subtotalFromCalendar + cleaningFee + tax + channelFee + petFee)
            const nightlyRate = nights > 0 ? roundToTwoDecimals(subtotalFromCalendar / nights) : 0
            
            setPricing({
              nightlyRate,
              nights,
              subtotal: roundToTwoDecimals(subtotalFromCalendar),
              cleaningFee,
              tax,
              channelFee,
              petFee,
              total,
              currency: currencyFromCalendar,
            })
            abortController.abort()
            return
          }
        }

        // Fallback to pricing API - retry up to 3 times
        let pricingSuccess = false
        const maxRetries = 3
        for (let attempt = 0; attempt < maxRetries && !pricingSuccess; attempt++) {
          try {
            const response = await fetch("/api/pricing", {
              signal: abortController.signal,
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                listingId,
                startDate: checkIn,
                endDate: checkOut,
                guests,
              }),
            })

            if (response.ok) {
              const pricingData = await response.json()
              
              // If request was aborted (calendar pricing succeeded), don't process API response
              if (abortController.signal.aborted) {
                return
              }
              
              if (pricingData?.breakdown?.total) {
                const breakdown = pricingData.breakdown
                // Use discounted subtotal if discount was applied, otherwise use regular subtotal
                const subtotalToUse = breakdown.discounted_subtotal ?? breakdown.subtotal
                const cleaningFee = breakdown.fees || 100
                const tax = breakdown.taxes ? roundToTwoDecimals(breakdown.taxes) : roundToTwoDecimals(subtotalToUse * 0.12)
                const channelFee = breakdown.channelFee ? roundToTwoDecimals(breakdown.channelFee) : roundToTwoDecimals(subtotalToUse * 0.02)
                const petFee = roundToTwoDecimals(pets > 0 ? 50 : 0) // $50 flat fee
                const calculatedTotal = roundToTwoDecimals(subtotalToUse + cleaningFee + tax + channelFee + petFee)
                const total = breakdown.total ? roundToTwoDecimals(breakdown.total + petFee) : calculatedTotal
                
                setPricing({
                  nightlyRate: breakdown.nightlyRate ? roundToTwoDecimals(breakdown.nightlyRate) : (breakdown.nights > 0 ? roundToTwoDecimals((breakdown.discounted_subtotal ?? breakdown.subtotal) / breakdown.nights) : 0),
                  nights: breakdown.nights || nights,
                  subtotal: roundToTwoDecimals(breakdown.subtotal),
                  cleaningFee,
                  tax,
                  channelFee,
                  petFee,
                  total,
                  currency: breakdown.currency || "USD",
                  discount: breakdown.discount,
                  discounted_subtotal: breakdown.discounted_subtotal,
                })
                pricingSuccess = true
                break
              } else if (pricingData?.breakdown?.subtotal) {
                // Has breakdown but no total - calculate it
                const breakdown = pricingData.breakdown
                // Use discounted subtotal if discount was applied, otherwise use regular subtotal
                const subtotalToUse = breakdown.discounted_subtotal ?? breakdown.subtotal
                const cleaningFee = breakdown.fees || 100
                const tax = breakdown.taxes ? roundToTwoDecimals(breakdown.taxes) : roundToTwoDecimals(subtotalToUse * 0.12)
                const channelFee = breakdown.channelFee ? roundToTwoDecimals(breakdown.channelFee) : roundToTwoDecimals(subtotalToUse * 0.02)
                const petFee = roundToTwoDecimals(pets > 0 ? 50 : 0) // $50 flat fee
                const total = roundToTwoDecimals(subtotalToUse + cleaningFee + tax + channelFee + petFee)
                
                setPricing({
                  nightlyRate: breakdown.nightlyRate ? roundToTwoDecimals(breakdown.nightlyRate) : (breakdown.nights > 0 ? roundToTwoDecimals((breakdown.discounted_subtotal ?? breakdown.subtotal) / breakdown.nights) : 0),
                  nights: breakdown.nights || nights,
                  subtotal: roundToTwoDecimals(breakdown.subtotal),
                  cleaningFee,
                  tax,
                  channelFee,
                  petFee,
                  total,
                  currency: breakdown.currency || "USD",
                  discount: breakdown.discount,
                  discounted_subtotal: breakdown.discounted_subtotal,
                })
                pricingSuccess = true
                break
              }
            }
            
            // If API call failed or no breakdown, wait before retry (except on last attempt)
            if (attempt < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1))) // Exponential backoff
            }
          } catch (fetchError: any) {
            // Ignore AbortError - it's expected when calendar pricing succeeds
            if (fetchError.name === 'AbortError') {
              return
            }
            // Wait before retry (except on last attempt)
            if (attempt < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
            }
          }
        }

        // Only use default 200 as LAST RESORT after all attempts failed
        if (!pricingSuccess) {
          // Try to get listing base price first
          try {
            const listingResponse = await fetch(`/api/listing/${listingId}`)
            if (listingResponse.ok) {
              const listingData = await listingResponse.json()
              const basePrice = listingData.basePrice
              if (basePrice && basePrice !== 200) {
                // Use actual base price from listing
                const subtotal = roundToTwoDecimals(basePrice * nights)
                const cleaningFee = 100
                const tax = roundToTwoDecimals(subtotal * 0.12)
                const channelFee = roundToTwoDecimals(subtotal * 0.02)
                const petFee = roundToTwoDecimals(pets > 0 ? 50 : 0) // $50 flat fee
                const total = roundToTwoDecimals(subtotal + cleaningFee + tax + channelFee + petFee)
                
                setPricing({
                  nightlyRate: roundToTwoDecimals(basePrice),
                  nights,
                  subtotal,
                  cleaningFee,
                  tax,
                  channelFee,
                  petFee,
                  total,
                  currency: listingData.currency || "USD",
                })
                return
              }
            }
          } catch (listingError) {
            console.error("Error getting listing for fallback pricing:", listingError)
          }
          
          // LAST RESORT: use hardcoded base price only after all other attempts failed
          console.warn("All pricing attempts failed, using default price as last resort")
          const basePrice = 200
          const subtotal = roundToTwoDecimals(basePrice * nights)
          const cleaningFee = 100
          const tax = roundToTwoDecimals(subtotal * 0.12)
          const channelFee = roundToTwoDecimals(subtotal * 0.02)
          const petFee = roundToTwoDecimals(pets > 0 ? 50 : 0) // $50 flat fee
          const total = roundToTwoDecimals(subtotal + cleaningFee + tax + channelFee + petFee)
          
          setPricing({
            nightlyRate: roundToTwoDecimals(basePrice),
            nights,
            subtotal,
            cleaningFee,
            tax,
            channelFee,
            petFee,
            total,
            currency: "USD",
          })
        }
      } catch (err: any) {
        // Ignore AbortError - it's expected when calendar pricing succeeds
        if (err.name !== 'AbortError') {
          console.error("Error loading pricing:", err)
        }
      }
    }

    loadPricing()
    
    // Cleanup: abort any pending requests when effect re-runs or component unmounts
    return () => {
      abortController.abort()
    }
  }, [slug, checkIn, checkOut, guests, pets, calendarData])

  const handleNext = () => {
    if (currentStep === "review") {
      setCurrentStep("guest")
    } else if (currentStep === "guest") {
      // Validate guest info
      if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
        setError("Please fill in all required guest information fields")
        return
      }
      setError(null)
      setCurrentStep("payment")
    } else if (currentStep === "payment") {
      // Submit the payment form
      const paymentForm = document.getElementById("payment-form") as HTMLFormElement
      if (paymentForm) {
        paymentForm.requestSubmit()
      }
      setError(null)
    }
  }

  const handleBack = () => {
    if (currentStep === "guest") {
      setCurrentStep("review")
    } else if (currentStep === "payment") {
      setCurrentStep("guest")
    }
  }

  // Create payment intent when moving to payment step
  useEffect(() => {
    if (currentStep === "payment" && !clientSecret && pricing && cabin) {
      createPaymentIntent()
    }
  }, [currentStep, clientSecret, pricing, cabin])

  const createPaymentIntent = async () => {
    if (!cabin || !checkIn || !checkOut || !pricing) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/payment/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          checkIn,
          checkOut,
          guests,
          // Send exact pricing from review page - this ensures payment uses same price
          pricing: {
            nightlyRate: pricing.nightlyRate,
            nights: pricing.nights,
            subtotal: pricing.subtotal,
            cleaningFee: pricing.cleaningFee,
            tax: pricing.tax,
            channelFee: pricing.channelFee,
            petFee: pricing.petFee,
            total: pricing.total,
            currency: pricing.currency,
            discount: pricing.discount,
            discounted_subtotal: pricing.discounted_subtotal,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create payment intent")
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
      setPaymentIntentId(data.paymentIntentId)
      setSetupIntentClientSecret(data.setupIntentClientSecret || null)
    } catch (err: any) {
      setError(err.message || "Failed to initialize payment. Please try again.")
      console.error("Error creating payment intent:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string, paymentMethodId?: string) => {
    if (!cabin || !checkIn || !checkOut || !guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
      setError("Missing required information")
      return
    }

    if (!pricing) {
      setError("Pricing information is missing")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/payment/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethodId, // Pass saved payment method ID for future charges
          slug,
          checkIn,
          checkOut,
          guests,
          pets,
          infants,
          // Send exact pricing from review page - this ensures booking uses same price
          pricing: {
            nightlyRate: pricing.nightlyRate,
            nights: pricing.nights,
            subtotal: pricing.subtotal,
            discounted_subtotal: pricing.discounted_subtotal,
            cleaningFee: pricing.cleaningFee,
            tax: pricing.tax,
            channelFee: pricing.channelFee,
            petFee: pricing.petFee,
            total: pricing.total,
            currency: pricing.currency,
            discount: pricing.discount,
          },
          guestInfo: {
            firstName: guestInfo.firstName,
            lastName: guestInfo.lastName,
            email: guestInfo.email,
            phone: guestInfo.phone,
            address: guestInfo.address,
            city: guestInfo.city,
            state: guestInfo.state,
            zipCode: guestInfo.zipCode,
            country: guestInfo.countryCode || "US",
            specialRequests: guestInfo.specialRequests,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to confirm booking")
      }

      const data = await response.json()
      
      if (data.success && data.booking) {
        setBookingConfirmation({
          confirmationCode: data.booking.confirmationCode,
          bookingId: data.booking.id,
        })
        setCurrentStep("confirmation")
        // Track reservation confirmation
        trackReservationConfirmed(slug, data.booking.id)
      } else {
        throw new Error("Booking confirmation failed")
      }
    } catch (err: any) {
      setError(err.message || "Failed to confirm booking. Please contact support.")
      console.error("Error confirming booking:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!cabin || !checkIn || !checkOut) {
    return null
  }

  const steps: { id: BookingStep; label: string }[] = [
    { id: "review", label: "Review" },
    { id: "guest", label: "Guest Info" },
    { id: "payment", label: "Payment" },
    { id: "confirmation", label: "Confirmation" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12 mt-20">
        {/* Progress Steps */}
        {currentStep !== "confirmation" && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        index <= currentStepIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div
                      className={`mt-2 text-sm ${
                        index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        index < currentStepIndex ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          {error && (
            <Card className="p-4 mb-6 bg-destructive/10 border-destructive">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </Card>
          )}

          {currentStep === "review" && (
            <StepReview
              cabin={cabin}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              pets={pets}
              infants={infants}
              pricing={pricing}
            />
          )}

          {currentStep === "guest" && (
            <StepGuestInfo guestInfo={guestInfo} onUpdate={setGuestInfo} />
          )}

          {currentStep === "payment" && (
            <StepPayment
              paymentIntentId={paymentIntentId}
              clientSecret={clientSecret}
              setupIntentClientSecret={setupIntentClientSecret}
              onPaymentSuccess={handlePaymentSuccess}
              isLoading={isSubmitting}
              pricing={pricing ? {
                total: pricing.total,
                currency: pricing.currency,
              } : null}
              checkIn={checkIn || undefined}
            />
          )}

          {currentStep === "confirmation" && bookingConfirmation && pricing && (
            <StepConfirmation
              confirmationCode={bookingConfirmation.confirmationCode}
              cabinName={cabin.name}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              totalPrice={pricing.total}
              currency={pricing.currency}
              guestEmail={guestInfo.email || ""}
            />
          )}

          {currentStep !== "confirmation" && (
            <div className="flex gap-4 mt-8">
              {currentStep !== "review" && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-full"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                size="lg"
                className="flex-1 rounded-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentStep === "payment" ? (
                  "Complete Booking"
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
