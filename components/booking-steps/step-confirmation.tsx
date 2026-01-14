"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Users, DollarSign, Home, Mail } from "lucide-react"
import Link from "next/link"

interface StepConfirmationProps {
  confirmationCode: string
  cabinName: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  currency: string
  guestEmail: string
}

export function StepConfirmation({
  confirmationCode,
  cabinName,
  checkIn,
  checkOut,
  guests,
  totalPrice,
  currency,
  guestEmail,
}: StepConfirmationProps) {
  const nights = Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-semibold mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          Your reservation has been confirmed. A confirmation email has been sent to{" "}
          <span className="font-medium">{guestEmail}</span>.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b">
            <span className="text-sm text-muted-foreground">Confirmation Code</span>
            <span className="text-lg font-mono font-semibold">{confirmationCode}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Cabin</div>
                <div className="font-semibold">{cabinName}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Dates</div>
                <div className="font-semibold">
                  {new Date(checkIn).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(checkOut).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="text-sm text-muted-foreground">{nights} {nights === 1 ? "night" : "nights"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Guests</div>
                <div className="font-semibold">{guests} {guests === 1 ? "guest" : "guests"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Total Price</div>
                <div className="text-xl font-bold">
                  {currency === "USD" ? "$" : currency}
                  {totalPrice.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Confirmation Email</div>
                <div className="font-semibold">{guestEmail}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="flex-1 rounded-full">
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="flex-1 rounded-full">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </div>
  )
}
