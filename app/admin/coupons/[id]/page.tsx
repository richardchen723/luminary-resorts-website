"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Copy, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type DiscountType = "fixed" | "percent"
type UsageMode = "single_use" | "multi_use"

interface CouponResponse {
  id: string
  name: string
  description: string | null
  code: string
  discount_type: DiscountType
  discount_value: number
  expires_at: string | null
  usage_mode: UsageMode
  max_redemptions: number | null
  redemptions_count: number
  is_active: boolean
  usage: {
    limit: number | null
    remaining: number | null
  }
}

export default function CouponDetailPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailMessage, setEmailMessage] = useState<string | null>(null)
  const [coupon, setCoupon] = useState<CouponResponse | null>(null)
  const [hasUsageLimit, setHasUsageLimit] = useState(true)
  const [emailData, setEmailData] = useState({
    firstName: "",
    email: "",
  })
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_type: "fixed" as DiscountType,
    discount_value: "0",
    expires_at: "",
    usage_mode: "single_use" as UsageMode,
    max_redemptions: "1",
    is_active: true,
  })

  useEffect(() => {
    async function loadCoupon() {
      try {
        const response = await fetch(`/api/admin/coupons/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to load coupon")
        }

        const data: CouponResponse = await response.json()
        setCoupon(data)
        setHasUsageLimit(data.usage.limit !== null)
        setFormData({
          name: data.name,
          description: data.description || "",
          discount_type: data.discount_type,
          discount_value: data.discount_value.toString(),
          expires_at: data.expires_at ? data.expires_at.slice(0, 10) : "",
          usage_mode: data.usage_mode,
          max_redemptions: data.max_redemptions?.toString() || "10",
          is_active: data.is_active,
        })
      } catch (loadError: any) {
        setError(loadError.message || "Failed to load coupon")
      } finally {
        setLoading(false)
      }
    }

    loadCoupon()
  }, [params.id])

  const usageHint = useMemo(() => {
    if (formData.usage_mode === "single_use") {
      return "One checkout total can redeem this coupon."
    }

    return hasUsageLimit
      ? "The coupon stops working after the total-use limit is reached."
      : "The coupon can be reused without a cap."
  }, [formData.usage_mode, hasUsageLimit])

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/coupons/${params.id}`, {
        method: "PATCH",
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
        throw new Error(payload.error || "Failed to update coupon")
      }

      const updated: CouponResponse = await response.json()
      setCoupon(updated)
      setEmailMessage("Coupon saved.")
    } catch (saveError: any) {
      setError(saveError.message || "Failed to update coupon")
    } finally {
      setSaving(false)
    }
  }

  async function handleSendEmail(event: React.FormEvent) {
    event.preventDefault()
    setSending(true)
    setError(null)
    setEmailMessage(null)

    try {
      const response = await fetch(`/api/admin/coupons/${params.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || "Failed to send coupon email")
      }

      setEmailMessage(payload.message || "Coupon email sent.")
    } catch (sendError: any) {
      setError(sendError.message || "Failed to send coupon email")
    } finally {
      setSending(false)
    }
  }

  function copyCouponCode() {
    if (coupon?.code) {
      navigator.clipboard.writeText(coupon.code)
      setEmailMessage("Coupon code copied.")
    }
  }

  if (loading) {
    return <div className="py-8 text-center">Loading...</div>
  }

  if (!coupon) {
    return <div className="py-8 text-center">Coupon not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/coupons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{coupon.name}</h1>
          <p className="text-muted-foreground mt-2">
            Manage checkout rules, current usage, and guest delivery.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Coupon Settings</CardTitle>
            <CardDescription>
              Code generation is fixed; the rule set and availability stay editable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon code</Label>
                  <div className="flex gap-2">
                    <Input id="code" value={coupon.code} readOnly />
                    <Button type="button" variant="outline" size="icon" onClick={copyCouponCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
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
                  <Label htmlFor="name">Internal name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
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
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(event) => setFormData({ ...formData, is_active: event.target.checked })}
                />
                Coupon is active
              </label>

              {(error || emailMessage) && (
                <div
                  className={`rounded-md px-4 py-3 text-sm ${
                    error
                      ? "border border-destructive/20 bg-destructive/10 text-destructive"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {error || emailMessage}
                </div>
              )}

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Snapshot</CardTitle>
              <CardDescription>Current redemption progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Redeemed or reserved</span>
                <span className="font-semibold">{coupon.redemptions_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Limit</span>
                <span className="font-semibold">
                  {coupon.usage.limit === null ? "Unlimited" : coupon.usage.limit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-semibold">
                  {coupon.usage.remaining === null ? "Unlimited" : coupon.usage.remaining}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span className="font-semibold">
                  {coupon.expires_at ? format(new Date(coupon.expires_at), "MMM d, yyyy") : "Never"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send Coupon Email</CardTitle>
              <CardDescription>
                Test the guest-facing email and personalization from the backend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guest-first-name">Guest first name</Label>
                  <Input
                    id="guest-first-name"
                    value={emailData.firstName}
                    onChange={(event) =>
                      setEmailData({ ...emailData, firstName: event.target.value })
                    }
                    placeholder="Avery"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-email">Guest email</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={emailData.email}
                    onChange={(event) => setEmailData({ ...emailData, email: event.target.value })}
                    placeholder="avery@example.com"
                  />
                </div>
                <Button type="submit" disabled={sending} className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  {sending ? "Sending..." : "Send Coupon Email"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
