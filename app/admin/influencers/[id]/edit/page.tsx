/**
 * Edit influencer page
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

interface Influencer {
  id: string
  name: string
  email: string | null
  phone: string | null
  instagram_handle: string | null
  tiktok_handle: string | null
  notes: string | null
  status: "active" | "inactive"
}

export default function EditInfluencerPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Influencer | null>(null)

  useEffect(() => {
    loadInfluencer()
  }, [params.id])

  async function loadInfluencer() {
    try {
      const response = await fetch(`/api/admin/influencers/${params.id}`)
      if (!response.ok) throw new Error("Failed to load influencer")
      const data = await response.json()
      setFormData({
        id: data.id,
        name: data.name,
        email: data.email || "",
        phone: data.phone || "",
        instagram_handle: data.instagram_handle || "",
        tiktok_handle: data.tiktok_handle || "",
        notes: data.notes || "",
        status: data.status,
      })
    } catch (error) {
      console.error("Error loading influencer:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData) return

    setSaving(true)

    try {
      const response = await fetch(`/api/admin/influencers/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: formData.email || null,
          phone: formData.phone || null,
          instagram_handle: formData.instagram_handle || null,
          tiktok_handle: formData.tiktok_handle || null,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update influencer")
      }

      router.push(`/admin/influencers/${params.id}`)
    } catch (error: any) {
      alert(error.message || "Failed to update influencer")
      setSaving(false)
    }
  }

  if (loading || !formData) {
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
          <h1 className="text-3xl font-bold text-foreground">Edit Influencer</h1>
          <p className="text-muted-foreground mt-2">Update influencer information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Influencer Information</CardTitle>
          <CardDescription>
            Update the details below. The referral code cannot be changed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram_handle">Instagram Handle</Label>
                <Input
                  id="instagram_handle"
                  placeholder="@username"
                  value={formData.instagram_handle}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram_handle: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok_handle">TikTok Handle</Label>
                <Input
                  id="tiktok_handle"
                  placeholder="@username"
                  value={formData.tiktok_handle}
                  onChange={(e) =>
                    setFormData({ ...formData, tiktok_handle: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this influencer..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
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
