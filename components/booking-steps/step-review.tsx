"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Calendar, Users, Home } from "lucide-react"
import type { Cabin } from "@/lib/cabins"

interface StepReviewProps {
  cabin: Cabin
  checkIn: string
  checkOut: string
  guests: number
  pets?: number
  infants?: number
  pricing: {
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
  } | null
}

export function StepReview({
  cabin,
  checkIn,
  checkOut,
  guests,
  pets = 0,
  infants = 0,
  pricing,
}: StepReviewProps) {
  const nights = Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Review Your Booking</h2>
        <p className="text-muted-foreground">Please review your booking details before proceeding.</p>
      </div>

      <Card className="p-6">
        <div className="flex gap-6">
          {cabin.images?.[0] && (
            <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 relative">
              <Image
                src={cabin.images[0]}
                alt={cabin.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{cabin.name}</h3>
            {cabin.subtitle && (
              <p className="text-muted-foreground mb-4">{cabin.subtitle}</p>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(checkIn).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(checkOut).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>
                  {guests} {guests === 1 ? "guest" : "guests"}
                  {pets > 0 && `, ${pets} ${pets === 1 ? "pet" : "pets"}`}
                  {infants > 0 && `, ${infants} ${infants === 1 ? "infant" : "infants"}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home className="w-4 h-4" />
                <span>{nights} {nights === 1 ? "night" : "nights"}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {pricing && pricing.total > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Price Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {pricing.currency === "USD" ? "$" : pricing.currency}
                {pricing.nightlyRate.toFixed(2)} × {pricing.nights} {pricing.nights === 1 ? "night" : "nights"}
              </span>
              <span className="font-medium">
                {pricing.currency === "USD" ? "$" : pricing.currency}
                {pricing.subtotal.toFixed(2)}
              </span>
            </div>

            {pricing.discount && pricing.discount.amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span className="text-muted-foreground">
                  Discount {pricing.discount.type === "percent" ? `(${pricing.discount.value}%)` : ""}
                </span>
                <span className="font-medium">
                  -{pricing.currency === "USD" ? "$" : pricing.currency}
                  {pricing.discount.amount.toFixed(2)}
                </span>
              </div>
            )}

            {pricing.discounted_subtotal && pricing.discounted_subtotal !== pricing.subtotal && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal (after discount)</span>
                <span className="font-medium">
                  {pricing.currency === "USD" ? "$" : pricing.currency}
                  {pricing.discounted_subtotal.toFixed(2)}
                </span>
              </div>
            )}

            {pricing.cleaningFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cleaning Fee</span>
                <span className="font-medium">
                  {pricing.currency === "USD" ? "$" : pricing.currency}
                  {pricing.cleaningFee.toFixed(2)}
                </span>
              </div>
            )}

            {pricing.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lodging Tax</span>
                <span className="font-medium">
                  {pricing.currency === "USD" ? "$" : pricing.currency}
                  {pricing.tax.toFixed(2)}
                </span>
              </div>
            )}

            {pricing.channelFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Guest Channel Fee</span>
                <span className="font-medium">
                  {pricing.currency === "USD" ? "$" : pricing.currency}
                  {pricing.channelFee.toFixed(2)}
                </span>
              </div>
            )}

            {pets > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pet Fee</span>
                <span className="font-medium">
                  {pricing.currency === "USD" ? "$" : pricing.currency}
                  {(pricing.petFee || 0).toFixed(2)}
                </span>
              </div>
            )}

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">
                {pricing.currency === "USD" ? "$" : pricing.currency}
                {pricing.total.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
