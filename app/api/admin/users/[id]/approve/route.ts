/**
 * POST /api/admin/users/[id]/approve - Approve user (owner only)
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

    const body = await request.json()
    const { role } = body

    if (!role || !["admin", "member"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'member'" },
        { status: 400 }
      )
    }

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
       SET approval_status = 'approved',
           role = $1,
           approved_by = $2,
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = $3`,
      [role, adminUser.id, params.id]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error approving user:", error)
    return NextResponse.json(
      { error: error.message || "Failed to approve user" },
      { status: 500 }
    )
  }
}
