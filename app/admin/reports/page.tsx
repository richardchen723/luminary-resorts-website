/**
 * Reports page
 * View and manage commission reports
 */

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Mail, DollarSign } from "lucide-react"

interface ReportBooking {
  id: string
  booking_id: string
  booking_date: string
  guest_name: string
  guest_email: string
  cabin_slug: string
  cabin_name: string
  check_in: string
  check_out: string
  nights: number
  revenue_basis: number
  guest_discount_applied: number
  commission_owed: number
  commission_status: "owed" | "paid" | "cancelled"
  paid_at: string | null
  payout_notes: string | null
}

interface ReportSummary {
  total_bookings: number
  total_revenue: number
  total_discount_given: number
  total_commission_owed: number
  total_commission_paid: number
}

interface Influencer {
  id: string
  name: string
}

export default function ReportsPage() {
  const [bookings, setBookings] = useState<ReportBooking[]>([])
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [filters, setFilters] = useState({
    influencer_id: "",
    start_date: "",
    end_date: "",
    status: "all" as "all" | "owed" | "paid" | "cancelled",
  })

  useEffect(() => {
    loadInfluencers()
    loadReport()
  }, [filters])

  async function loadInfluencers() {
    try {
      const response = await fetch("/api/admin/influencers?limit=1000")
      if (response.ok) {
        const data = await response.json()
        setInfluencers(data.influencers || [])
      }
    } catch (error) {
      console.error("Error loading influencers:", error)
    }
  }

  async function loadReport() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.influencer_id) params.set("influencer_id", filters.influencer_id)
      if (filters.start_date) params.set("start_date", filters.start_date)
      if (filters.end_date) params.set("end_date", filters.end_date)
      if (filters.status !== "all") params.set("status", filters.status)

      const response = await fetch(`/api/admin/reports?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to load report")

      const data = await response.json()
      setBookings(data.bookings || [])
      setSummary(data.summary || null)
    } catch (error) {
      console.error("Error loading report:", error)
    } finally {
      setLoading(false)
    }
  }

  async function exportCSV() {
    try {
      const params = new URLSearchParams()
      if (filters.influencer_id) params.set("influencer_id", filters.influencer_id)
      if (filters.start_date) params.set("start_date", filters.start_date)
      if (filters.end_date) params.set("end_date", filters.end_date)
      if (filters.status !== "all") params.set("status", filters.status)

      const response = await fetch(`/api/admin/reports/export?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to export")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `influencer-report-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert("Failed to export report")
      console.error("Error exporting:", error)
    }
  }

  async function sendEmail() {
    if (!filters.influencer_id) {
      alert("Please select an influencer to send the report to")
      return
    }

    const confirmed = confirm(
      "Send commission report email to this influencer? Make sure the influencer's email is set."
    )
    if (!confirmed) return

    try {
      const response = await fetch("/api/admin/reports/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          influencer_id: filters.influencer_id,
          start_date: filters.start_date || null,
          end_date: filters.end_date || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send email")
      }

      alert("Report email sent successfully!")
    } catch (error: any) {
      alert(error.message || "Failed to send email")
      console.error("Error sending email:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Commission Reports</h1>
          <p className="text-muted-foreground mt-2">
            View and manage influencer commission reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={sendEmail} variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Influencer</label>
              <select
                value={filters.influencer_id}
                onChange={(e) =>
                  setFilters({ ...filters, influencer_id: e.target.value })
                }
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">All Influencers</option>
                {influencers.map((inf) => (
                  <option key={inf.id} value={inf.id}>
                    {inf.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  setFilters({ ...filters, start_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) =>
                  setFilters({ ...filters, end_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value as any })
                }
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="all">All Status</option>
                <option value="owed">Owed</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_bookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summary.total_revenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Discount Given</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summary.total_discount_given.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Commission Owed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${summary.total_commission_owed.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Commission Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${summary.total_commission_paid.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bookings found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Cabin</TableHead>
                  <TableHead>Check-in/out</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.guest_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {booking.guest_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.cabin_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(booking.check_in).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {new Date(booking.check_out).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>${booking.revenue_basis.toFixed(2)}</TableCell>
                    <TableCell>${booking.guest_discount_applied.toFixed(2)}</TableCell>
                    <TableCell>${booking.commission_owed.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.commission_status === "paid"
                            ? "default"
                            : booking.commission_status === "owed"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {booking.commission_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
