/**
 * Incentive configuration page
 */

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

interface Incentive {
  id: string
  guest_discount_type: "percent" | "fixed"
  guest_discount_value: number
  influencer_commission_type: "percent" | "fixed"
  influencer_commission_value: number
  effective_start_date: string | null
  effective_end_date: string | null
  notes: string | null
}

export default function IncentivesPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeIncentive, setActiveIncentive] = useState<Incentive | null>(null)
  const [formData, setFormData] = useState({
    guest_discount_type: "percent" as "percent" | "fixed",
    guest_discount_value: "",
    influencer_commission_type: "percent" as "percent" | "fixed",
    influencer_commission_value: "",
    effective_start_date: "",
    effective_end_date: "",
    notes: "",
  })

  useEffect(() => {
    loadIncentives()
  }, [params.id])

  async function loadIncentives() {
    try {
      const response = await fetch(`/api/admin/influencers/${params.id}/incentives`)
      if (!response.ok) throw new Error("Failed to load incentives")
      const data = await response.json()

      if (data.active) {
        setActiveIncentive(data.active)
        setFormData({
          guest_discount_type: data.active.guest_discount_type,
          guest_discount_value: data.active.guest_discount_value.toString(),
          influencer_commission_type: data.active.influencer_commission_type,
          influencer_commission_value: data.active.influencer_commission_value.toString(),
          effective_start_date: data.active.effective_start_date || "",
          effective_end_date: data.active.effective_end_date || "",
          notes: data.active.notes || "",
        })
      }
    } catch (error) {
      console.error("Error loading incentives:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/influencers/${params.id}/incentives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_discount_type: formData.guest_discount_type,
          guest_discount_value: parseFloat(formData.guest_discount_value),
          influencer_commission_type: formData.influencer_commission_type,
          influencer_commission_value: parseFloat(formData.influencer_commission_value),
          effective_start_date: formData.effective_start_date || null,
          effective_end_date: formData.effective_end_date || null,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create incentive")
      }

      router.push(`/admin/influencers/${params.id}`)
    } catch (error: any) {
      alert(error.message || "Failed to save incentive")
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/influencers/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configure Incentive</h1>
          <p className="text-muted-foreground mt-2">
            Set discount and commission rates for this influencer
          </p>
        </div>
      </div>

      {activeIncentive && (
        <Card>
          <CardHeader>
            <CardTitle>Current Active Incentive</CardTitle>
            <CardDescription>
              Creating a new incentive will deactivate the current one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Guest Discount</p>
                <p className="text-foreground font-medium">
                  {activeIncentive.guest_discount_type === "percent"
                    ? `${activeIncentive.guest_discount_value}%`
                    : `$${activeIncentive.guest_discount_value}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Influencer Commission</p>
                <p className="text-foreground font-medium">
                  {activeIncentive.influencer_commission_type === "percent"
                    ? `${activeIncentive.influencer_commission_value}%`
                    : `$${activeIncentive.influencer_commission_value}`}
                </p>
              </div>
              {activeIncentive.effective_start_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="text-foreground">
                    {new Date(activeIncentive.effective_start_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {activeIncentive.effective_end_date && (
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="text-foreground">
                    {new Date(activeIncentive.effective_end_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>New Incentive Configuration</CardTitle>
          <CardDescription>
            Configure the discount guests receive and the commission the influencer earns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Guest Discount</Label>
                <div className="grid gap-4 md:grid-cols-2 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="guest_discount_type">Type</Label>
                    <select
                      id="guest_discount_type"
                      value={formData.guest_discount_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          guest_discount_type: e.target.value as any,
                        })
                      }
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                      <option value="percent">Percent (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest_discount_value">Value *</Label>
                    <Input
                      id="guest_discount_value"
                      type="number"
                      step="0.01"
                      min="0"
                      max={formData.guest_discount_type === "percent" ? "100" : undefined}
                      required
                      value={formData.guest_discount_value}
                      onChange={(e) =>
                        setFormData({ ...formData, guest_discount_value: e.target.value })
                      }
                      placeholder={formData.guest_discount_type === "percent" ? "10" : "50"}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Influencer Commission</Label>
                <div className="grid gap-4 md:grid-cols-2 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="influencer_commission_type">Type</Label>
                    <select
                      id="influencer_commission_type"
                      value={formData.influencer_commission_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          influencer_commission_type: e.target.value as any,
                        })
                      }
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                      <option value="percent">Percent (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="influencer_commission_value">Value *</Label>
                    <Input
                      id="influencer_commission_value"
                      type="number"
                      step="0.01"
                      min="0"
                      max={formData.influencer_commission_type === "percent" ? "100" : undefined}
                      required
                      value={formData.influencer_commission_value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          influencer_commission_value: e.target.value,
                        })
                      }
                      placeholder={formData.influencer_commission_type === "percent" ? "15" : "100"}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="effective_start_date">Start Date (Optional)</Label>
                  <Input
                    id="effective_start_date"
                    type="date"
                    value={formData.effective_start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, effective_start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effective_end_date">End Date (Optional)</Label>
                  <Input
                    id="effective_end_date"
                    type="date"
                    value={formData.effective_end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, effective_end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this incentive..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : activeIncentive ? "Update Incentive" : "Create Incentive"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/admin/influencers/${params.id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
