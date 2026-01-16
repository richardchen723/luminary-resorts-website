/**
 * POST /api/admin/commission/[id]/mark-paid - Mark commission as paid
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuthApi } from "@/lib/auth-helpers"
import { query } from "@/lib/db/client"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await requireAuthApi(request)

    const body = await request.json()
    const { payout_notes } = body

    // Update commission ledger
    await query(
      `UPDATE commission_ledger 
       SET status = 'paid', 
           paid_at = NOW(), 
           paid_by = $1,
           payout_notes = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [adminUser.id, payout_notes || null, params.id]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error marking commission as paid:", error)
    return NextResponse.json(
      { error: error.message || "Failed to mark commission as paid" },
      { status: 500 }
    )
  }
}
