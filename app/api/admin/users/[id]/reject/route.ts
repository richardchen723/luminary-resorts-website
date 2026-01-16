/**
 * POST /api/admin/users/[id]/reject - Reject user (owner only)
 */

import { NextRequest, NextResponse } from "next/server"
import { requireRoleApi } from "@/lib/auth-helpers"
import { query } from "@/lib/db/client"
import { OWNER_EMAIL } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await requireRoleApi(request, ["owner"])

    // Check if user is owner (cannot change owner)
    const userResult = await query<{ email: string }>(
      "SELECT email FROM admin_users WHERE id = $1",
      [params.id]
    )

    if (userResult.rows?.[0]?.email === OWNER_EMAIL) {
      return NextResponse.json(
        { error: "Cannot modify owner account" },
        { status: 403 }
      )
    }

    // Update user
    await query(
      `UPDATE admin_users 
       SET approval_status = 'rejected',
           approved_by = $1,
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = $2`,
      [adminUser.id, params.id]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error rejecting user:", error)
    return NextResponse.json(
      { error: error.message || "Failed to reject user" },
      { status: 500 }
    )
  }
}
