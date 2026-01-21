/**
 * Influencer detail page
 * Shows influencer info, referral link, QR code, and stats
 */

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Download, Settings, Edit } from "lucide-react"
import Image from "next/image"

interface InfluencerDetail {
  id: string
  name: string
  email: string | null
  phone: string | null
  instagram_handle: string | null
  tiktok_handle: string | null
  notes: string | null
  status: "active" | "inactive"
  referral_code: string
  referral_link: string
  active_incentive: {
    id: string
    guest_discount_type: string
    guest_discount_value: number
    influencer_commission_type: string
    influencer_commission_value: number
  } | null
  stats: {
    total_bookings: number
    total_revenue: number
    total_commission_owed: number
    total_commission_paid: number
  }
}

export default function InfluencerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [influencer, setInfluencer] = useState<InfluencerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState<string | null>(null)

  useEffect(() => {
    loadInfluencer()
    loadQRCode()
  }, [params.id])

  async function loadInfluencer() {
    try {
      const response = await fetch(`/api/admin/influencers/${params.id}`)
      if (!response.ok) throw new Error("Failed to load influencer")
      const data = await response.json()
      setInfluencer(data)
    } catch (error) {
      console.error("Error loading influencer:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadQRCode() {
    try {
      const response = await fetch(`/api/admin/influencers/${params.id}/link`)
      if (!response.ok) throw new Error("Failed to load QR code")
      const data = await response.json()
      setQrCode(data.qr_code_data_url)
    } catch (error) {
      console.error("Error loading QR code:", error)
    }
  }

  function copyReferralLink() {
    if (influencer?.referral_link) {
      navigator.clipboard.writeText(influencer.referral_link)
      alert("Referral link copied to clipboard!")
    }
  }

  async function downloadQRCode() {
    try {
      const response = await fetch(`/api/admin/influencers/${params.id}/qr`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to download QR code" }))
        throw new Error(errorData.error || "Failed to download QR code")
      }

      // Check if response is actually an image
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.startsWith("image/")) {
        const errorData = await response.json().catch(() => ({ error: "Invalid response format" }))
        throw new Error(errorData.error || "Server returned invalid format")
      }

      // Get the blob from the response
      const blob = await response.blob()
      
      // Create a temporary download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `qr-${influencer?.referral_code || "code"}.png`
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error("Error downloading QR code:", error)
      alert(error.message || "Failed to download QR code")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!influencer) {
    return <div className="text-center py-8">Influencer not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/influencers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{influencer.name}</h1>
          <p className="text-muted-foreground mt-2">Influencer Profile</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/influencers/${params.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={influencer.status === "active" ? "default" : "secondary"}>
                {influencer.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-foreground">{influencer.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="text-foreground">{influencer.phone || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Instagram</p>
              <p className="text-foreground">
                {influencer.instagram_handle ? `@${influencer.instagram_handle.replace("@", "")}` : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">TikTok</p>
              <p className="text-foreground">
                {influencer.tiktok_handle ? `@${influencer.tiktok_handle.replace("@", "")}` : "-"}
              </p>
            </div>
            {influencer.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-foreground whitespace-pre-wrap">{influencer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referral Link & QR */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Link</CardTitle>
            <CardDescription>Share this link with the influencer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Referral Code</p>
              <p className="font-mono text-sm bg-muted p-2 rounded">{influencer.referral_code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Referral Link</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={influencer.referral_link}
                  className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                />
                <Button onClick={copyReferralLink} size="icon" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {qrCode && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">QR Code</p>
                <div className="flex items-center gap-4">
                  <Image
                    src={qrCode}
                    alt="QR Code"
                    width={150}
                    height={150}
                    className="border rounded"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadQRCode}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Incentive */}
        <Card>
          <CardHeader>
            <CardTitle>Active Incentive</CardTitle>
            <CardDescription>Current discount and commission settings</CardDescription>
          </CardHeader>
          <CardContent>
            {influencer.active_incentive ? (
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Guest Discount</p>
                  <p className="text-foreground">
                    {influencer.active_incentive.guest_discount_type === "percent"
                      ? `${influencer.active_incentive.guest_discount_value}%`
                      : `$${influencer.active_incentive.guest_discount_value}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Influencer Commission</p>
                  <p className="text-foreground">
                    {influencer.active_incentive.influencer_commission_type === "percent"
                      ? `${influencer.active_incentive.influencer_commission_value}%`
                      : `$${influencer.active_incentive.influencer_commission_value}`}
                  </p>
                </div>
                <Button asChild variant="outline" className="mt-4">
                  <Link href={`/admin/influencers/${params.id}/incentives`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Incentive
                  </Link>
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  No active incentive configured
                </p>
                <Button asChild>
                  <Link href={`/admin/influencers/${params.id}/incentives`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Incentive
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{influencer.stats.total_bookings}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">${influencer.stats.total_revenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commission Owed</p>
              <p className="text-2xl font-bold text-orange-600">
                ${influencer.stats.total_commission_owed.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commission Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ${influencer.stats.total_commission_paid.toFixed(2)}
              </p>
            </div>
            <Button asChild variant="outline" className="mt-4">
              <Link href={`/admin/reports?influencer_id=${params.id}`}>
                View Full Report
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
