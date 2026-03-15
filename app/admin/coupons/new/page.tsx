"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type DiscountType = "fixed" | "percent"
type UsageMode = "single_use" | "multi_use"

export default function NewCouponPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUsageLimit, setHasUsageLimit] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_type: "fixed" as DiscountType,
    discount_value: "25",
    expires_at: "",
    usage_mode: "single_use" as UsageMode,
    max_redemptions: "1",
    is_active: true,
  })

  const usageHint = useMemo(() => {
    if (formData.usage_mode === "single_use") {
      return "One checkout total can redeem this coupon."
    }

    return hasUsageLimit
      ? "Multiple guests can use the coupon until the limit is reached."
      : "Multiple guests can use the coupon without a cap."
  }, [formData.usage_mode, hasUsageLimit])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          discount_type: formData.discount_type,
          discount_value: parseFloat(formData.discount_value),
          expires_at: formData.expires_at || null,
          usage_mode: formData.usage_mode,
          max_redemptions:
            formData.usage_mode === "single_use"
              ? 1
              : hasUsageLimit
                ? parseInt(formData.max_redemptions, 10)
                : null,
          is_active: formData.is_active,
        }),
      })

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.error || "Failed to create coupon")
      }

      const coupon = await response.json()
      router.push(`/admin/coupons/${coupon.id}`)
    } catch (submissionError: any) {
      setError(submissionError.message || "Failed to create coupon")
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/coupons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Coupon</h1>
          <p className="text-muted-foreground mt-2">
            Generate a secure code and define how it behaves at checkout.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupon Rules</CardTitle>
          <CardDescription>
            Codes are generated automatically with short, high-entropy formatting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Internal name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  placeholder="Spring couples offer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">Expiration date</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(event) => setFormData({ ...formData, expires_at: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_type">Discount type</Label>
                <select
                  id="discount_type"
                  value={formData.discount_type}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      discount_type: event.target.value as DiscountType,
                    })
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="fixed">Fixed amount</option>
                  <option value="percent">Percentage</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  {formData.discount_type === "fixed" ? "Discount amount (USD)" : "Discount percent"}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0.01"
                  step={formData.discount_type === "fixed" ? "0.01" : "1"}
                  max={formData.discount_type === "percent" ? "100" : undefined}
                  value={formData.discount_value}
                  onChange={(event) => setFormData({ ...formData, discount_value: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage_mode">Usage rules</Label>
                <select
                  id="usage_mode"
                  value={formData.usage_mode}
                  onChange={(event) => {
                    const nextMode = event.target.value as UsageMode
                    setFormData({
                      ...formData,
                      usage_mode: nextMode,
                      max_redemptions: nextMode === "single_use" ? "1" : formData.max_redemptions,
                    })
                    if (nextMode === "single_use") {
                      setHasUsageLimit(true)
                    }
                  }}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="single_use">One-time use</option>
                  <option value="multi_use">Multiple-use</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_redemptions">Usage limit</Label>
                <Input
                  id="max_redemptions"
                  type="number"
                  min="1"
                  step="1"
                  disabled={formData.usage_mode === "single_use" || !hasUsageLimit}
                  value={formData.usage_mode === "single_use" ? "1" : formData.max_redemptions}
                  onChange={(event) => setFormData({ ...formData, max_redemptions: event.target.value })}
                />
                <p className="text-xs text-muted-foreground">{usageHint}</p>
              </div>
            </div>

            {formData.usage_mode === "multi_use" && (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={hasUsageLimit}
                  onChange={(event) => setHasUsageLimit(event.target.checked)}
                />
                Limit total redemptions
              </label>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Email copy / notes</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                placeholder="Included in the guest-facing coupon email."
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(event) => setFormData({ ...formData, is_active: event.target.checked })}
              />
              Coupon is active immediately after creation
            </label>

            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Coupon"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/coupons">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
