"use client"

import Image from "next/image"
import { Check, Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  BOOKING_ADD_ON_PACKAGES,
  type BookingAddOnPackageId,
} from "@/lib/booking-add-ons"
import { cn } from "@/lib/utils"

const NO_PACKAGE_VALUE = "none"

interface StepPackageProps {
  selectedPackageId: BookingAddOnPackageId | null
  onSelect: (packageId: BookingAddOnPackageId | null) => void
  totalPrice?: number | null
  currency?: string
}

function formatCurrency(amount: number, currency = "USD") {
  return `${currency === "USD" ? "$" : currency}${amount.toFixed(2)}`
}

export function StepPackage({
  selectedPackageId,
  onSelect,
  totalPrice,
  currency = "USD",
}: StepPackageProps) {
  const selectedValue = selectedPackageId || NO_PACKAGE_VALUE

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Add a Celebration Package</h2>
        <p className="text-muted-foreground">
          Choose one optional package for your stay, or continue without an add-on.
        </p>
      </div>

      <RadioGroup
        value={selectedValue}
        onValueChange={(value) => {
          onSelect(
            value === NO_PACKAGE_VALUE
              ? null
              : (value as BookingAddOnPackageId)
          )
        }}
        className="grid gap-4"
      >
        <label
          htmlFor="package-none"
          onClick={() => onSelect(null)}
          className={cn(
            "flex cursor-pointer items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/40",
            selectedValue === NO_PACKAGE_VALUE && "border-primary bg-primary/5"
          )}
        >
          <RadioGroupItem id="package-none" value={NO_PACKAGE_VALUE} />
          <div className="flex-1">
            <div className="font-semibold">No package</div>
            <div className="text-sm text-muted-foreground">
              Keep the reservation as-is with no celebration add-on.
            </div>
          </div>
          <Badge variant="outline">{formatCurrency(0, currency)}</Badge>
        </label>

        {BOOKING_ADD_ON_PACKAGES.map((addOnPackage) => {
          const isSelected = selectedPackageId === addOnPackage.id

          return (
            <label
              key={addOnPackage.id}
              htmlFor={`package-${addOnPackage.id}`}
              onClick={() => onSelect(addOnPackage.id)}
              className={cn(
                "grid cursor-pointer overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent/30 md:grid-cols-[220px_1fr]",
                isSelected && "border-primary bg-primary/5"
              )}
            >
              <div className="relative h-48 md:h-full md:min-h-[220px]">
                <Image
                  src={addOnPackage.image}
                  alt={addOnPackage.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 220px, 100vw"
                />
              </div>

              <div className="flex gap-4 p-4">
                <RadioGroupItem
                  id={`package-${addOnPackage.id}`}
                  value={addOnPackage.id}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {addOnPackage.name}
                        </h3>
                        {isSelected && (
                          <Badge>
                            <Check className="w-3 h-3" />
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {addOnPackage.description}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {formatCurrency(addOnPackage.price, currency)}
                    </Badge>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {addOnPackage.details.map((detail) => (
                      <div
                        key={detail}
                        className="flex items-start gap-2 rounded-md bg-background/80 p-3 text-sm"
                      >
                        <Gift className="mt-0.5 w-4 h-4 shrink-0 text-primary" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </label>
          )
        })}
      </RadioGroup>

      {typeof totalPrice === "number" && totalPrice > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-lg font-semibold">Updated Total</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(totalPrice, currency)}
            </span>
          </div>
        </Card>
      )}
    </div>
  )
}
