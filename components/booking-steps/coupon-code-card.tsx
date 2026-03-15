"use client"

import { TicketPercent, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CouponCodeCardProps {
  value: string
  appliedCode: string | null
  isApplying: boolean
  message: {
    type: "success" | "error"
    text: string
  } | null
  onChange: (value: string) => void
  onApply: () => void
  onRemove: () => void
}

export function CouponCodeCard({
  value,
  appliedCode,
  isApplying,
  message,
  onChange,
  onApply,
  onRemove,
}: CouponCodeCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
          <TicketPercent className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Coupon Code</h3>
            <p className="text-sm text-muted-foreground">
              Have a Luminary Resorts offer? Apply it here before payment.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="coupon-code">Enter code</Label>
              <Input
                id="coupon-code"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="ABCDE-FGHIJ"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={onApply} disabled={isApplying || !value.trim()}>
                {isApplying ? "Applying..." : "Apply"}
              </Button>
              {appliedCode && (
                <Button type="button" variant="outline" onClick={onRemove}>
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          {appliedCode && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Applied code: <span className="font-semibold">{appliedCode}</span>
            </div>
          )}

          {message && (
            <div
              className={`rounded-md px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-destructive/20 bg-destructive/10 text-destructive"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
