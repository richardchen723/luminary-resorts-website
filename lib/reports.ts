/**
 * Report generation utilities
 */

import { query } from "./db/client"

export interface ReportBooking {
  id: string
  booking_id: string
  booking_date: Date
  guest_name: string
  guest_email: string
  cabin_slug: string
  cabin_name: string
  check_in: string
  check_out: string
  nights: number
  revenue_basis: number
  guest_discount_applied: number
  guest_discount_type: string
  commission_owed: number
  commission_type: string
  commission_status: "owed" | "paid" | "cancelled"
  paid_at: Date | null
  payout_notes: string | null
}

export interface ReportSummary {
  total_bookings: number
  total_revenue: number
  total_discount_given: number
  total_commission_owed: number
  total_commission_paid: number
}

export interface ReportResult {
  bookings: ReportBooking[]
  summary: ReportSummary
}

/**
 * Generate report with filters
 */
export async function generateReport(params: {
  influencer_id?: string
  start_date?: string
  end_date?: string
  status?: "all" | "owed" | "paid" | "cancelled"
  page?: number
  limit?: number
}): Promise<ReportResult> {
  const {
    influencer_id,
    start_date,
    end_date,
    status = "all",
    page = 1,
    limit = 50,
  } = params

  const offset = (page - 1) * limit

  // Build WHERE clause
  const whereConditions: string[] = []
  const queryParams: any[] = []
  let paramIndex = 1

  if (influencer_id) {
    whereConditions.push(`ba.influencer_id = $${paramIndex++}`)
    queryParams.push(influencer_id)
  }

  if (start_date) {
    whereConditions.push(`b.created_at >= $${paramIndex++}`)
    queryParams.push(start_date)
  }

  if (end_date) {
    whereConditions.push(`b.created_at <= $${paramIndex++}`)
    queryParams.push(end_date)
  }

  if (status !== "all") {
    whereConditions.push(`cl.status = $${paramIndex++}`)
    queryParams.push(status)
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

  // Get bookings
  const bookingsQuery = `
    SELECT 
      ba.id,
      ba.booking_id,
      b.created_at AS booking_date,
      CONCAT(b.guest_first_name, ' ', b.guest_last_name) AS guest_name,
      b.guest_email,
      b.slug AS cabin_slug,
      b.slug AS cabin_name,
      b.arrival_date::text AS check_in,
      b.departure_date::text AS check_out,
      (b.departure_date - b.arrival_date) AS nights,
      ba.revenue_basis,
      ba.guest_discount_applied,
      ba.guest_discount_type,
      cl.amount AS commission_owed,
      ba.commission_type,
      cl.status AS commission_status,
      cl.paid_at,
      cl.payout_notes
    FROM booking_attributions ba
    JOIN bookings b ON ba.booking_id = b.id
    JOIN commission_ledger cl ON cl.booking_attribution_id = ba.id
    ${whereClause}
    ORDER BY b.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `

  queryParams.push(limit, offset)
  const bookingsResult = await query<ReportBooking>(bookingsQuery, queryParams)

  // Get summary
  const summaryQuery = `
    SELECT 
      COUNT(ba.id) AS total_bookings,
      COALESCE(SUM(ba.revenue_basis), 0) AS total_revenue,
      COALESCE(SUM(ba.guest_discount_applied), 0) AS total_discount_given,
      COALESCE(SUM(CASE WHEN cl.status = 'owed' THEN cl.amount ELSE 0 END), 0) AS total_commission_owed,
      COALESCE(SUM(CASE WHEN cl.status = 'paid' THEN cl.amount ELSE 0 END), 0) AS total_commission_paid
    FROM booking_attributions ba
    JOIN bookings b ON ba.booking_id = b.id
    JOIN commission_ledger cl ON cl.booking_attribution_id = ba.id
    ${whereClause}
  `

  const summaryParams = queryParams.slice(0, -2) // Remove limit and offset
  const summaryResult = await query<ReportSummary>(summaryQuery, summaryParams)

  const summary = summaryResult.rows?.[0] || {
    total_bookings: 0,
    total_revenue: 0,
    total_discount_given: 0,
    total_commission_owed: 0,
    total_commission_paid: 0,
  }

  // Normalize booking data to ensure numeric fields are numbers
  const normalizedBookings = (bookingsResult.rows || []).map((booking) => ({
    ...booking,
    revenue_basis: parseFloat(booking.revenue_basis?.toString() || "0") || 0,
    guest_discount_applied: parseFloat(booking.guest_discount_applied?.toString() || "0") || 0,
    commission_owed: parseFloat(booking.commission_owed?.toString() || "0") || 0,
    nights: parseInt(booking.nights?.toString() || "0", 10) || 0,
  }))

  return {
    bookings: normalizedBookings,
    summary: {
      total_bookings: parseInt(summary.total_bookings.toString(), 10),
      total_revenue: parseFloat(summary.total_revenue.toString()),
      total_discount_given: parseFloat(summary.total_discount_given.toString()),
      total_commission_owed: parseFloat(summary.total_commission_owed.toString()),
      total_commission_paid: parseFloat(summary.total_commission_paid.toString()),
    },
  }
}

/**
 * Generate CSV content from report
 */
export function generateCSV(report: ReportResult): string {
  const headers = [
    "Booking Date",
    "Guest Name",
    "Guest Email",
    "Cabin",
    "Check-in",
    "Check-out",
    "Nights",
    "Revenue Basis",
    "Discount Applied",
    "Commission Owed",
    "Commission Status",
    "Paid At",
    "Payout Notes",
  ]

  const rows = report.bookings.map((booking) => [
    new Date(booking.booking_date).toLocaleDateString(),
    booking.guest_name,
    booking.guest_email,
    booking.cabin_name,
    booking.check_in,
    booking.check_out,
    booking.nights.toString(),
    `$${booking.revenue_basis.toFixed(2)}`,
    `$${booking.guest_discount_applied.toFixed(2)}`,
    `$${booking.commission_owed.toFixed(2)}`,
    booking.commission_status,
    booking.paid_at ? new Date(booking.paid_at).toLocaleDateString() : "",
    booking.payout_notes || "",
  ])

  const csvRows = [headers, ...rows].map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
  )

  return csvRows.join("\n")
}
