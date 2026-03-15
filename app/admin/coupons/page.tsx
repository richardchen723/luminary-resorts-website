import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight, Mail, Plus, TicketPercent } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { listCoupons } from "@/lib/coupons"

function formatDiscountLabel(coupon: {
  discount_type: "fixed" | "percent"
  discount_value: number
}) {
  return coupon.discount_type === "percent"
    ? `${coupon.discount_value}% off`
    : `$${coupon.discount_value.toFixed(2)} off`
}

function formatUsageLabel(coupon: {
  redemptions_count: number
  usage: { limit: number | null }
}) {
  if (coupon.usage.limit === null) {
    return `${coupon.redemptions_count} redeemed`
  }

  return `${coupon.redemptions_count} / ${coupon.usage.limit} used`
}

export default async function AdminCouponsPage() {
  const coupons = await listCoupons()
  const now = new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground mt-2">
            Create, manage, and email checkout-ready coupon codes.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <Plus className="mr-2 h-4 w-4" />
            New Coupon
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active coupons</CardDescription>
            <CardTitle className="text-3xl">
              {coupons.filter((coupon) => coupon.is_active).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total redemptions</CardDescription>
            <CardTitle className="text-3xl">
              {coupons.reduce((total, coupon) => total + coupon.redemptions_count, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expiring soon</CardDescription>
            <CardTitle className="text-3xl">
              {
                coupons.filter((coupon) => {
                  if (!coupon.expires_at) return false
                  const days = (coupon.expires_at.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  return days >= 0 && days <= 14
                }).length
              }
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {coupons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <TicketPercent className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">No coupons yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a coupon to start sending personalized offers to guests.
            </p>
            <Button asChild className="mt-6">
              <Link href="/admin/coupons/new">Create the first coupon</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => {
            const isExpired = coupon.expires_at ? coupon.expires_at.getTime() <= now.getTime() : false

            return (
              <Card key={coupon.id}>
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold">{coupon.name}</h2>
                      <Badge variant={coupon.is_active && !isExpired ? "default" : "secondary"}>
                        {coupon.is_active && !isExpired ? "Active" : isExpired ? "Expired" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{formatDiscountLabel(coupon)}</Badge>
                      <Badge variant="outline">{coupon.code}</Badge>
                    </div>
                    {coupon.description && (
                      <p className="text-sm text-muted-foreground">{coupon.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>{formatUsageLabel(coupon)}</span>
                      <span>
                        {coupon.expires_at
                          ? `Expires ${format(coupon.expires_at, "MMM d, yyyy")}`
                          : "No expiration"}
                      </span>
                      <span>{coupon.usage_mode === "single_use" ? "One-time use" : "Reusable"}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/admin/coupons/${coupon.id}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Manage
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href={`/admin/coupons/${coupon.id}`}>
                        Open
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
