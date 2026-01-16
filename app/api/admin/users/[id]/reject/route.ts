/**
 * POST /api/admin/users/[id]/reject - Reject user (owner only)
 */

import { NextRequest, NextResponse } from "next/server"
import { requireRoleApi } from "@/lib/auth-helpers"
import { query } from "@/lib/db/client"
import { OWNER_EMAIL } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const adminUser = await requireRoleApi(request, ["owner"])

    // Handle params as Promise (Next.js 15+) or object (Next.js 14)
    const resolvedParams = params instanceof Promise ? await params : params

    // Check if user is owner (cannot change owner)
    const userResult = await query<{ email: string }>(
      "SELECT email FROM admin_users WHERE id = $1",
      [resolvedParams.id]
    )

    if (userResult.rows?.[0]?.email === OWNER_EMAIL) {
      return NextResponse.json(
        { error: "Cannot modify owner account" },
        { status: 403 }
      )
    }

    // Update user
    const updateResult = await query(
      `UPDATE admin_users 
       SET approval_status = 'rejected',
           approved_by = $1,
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, approval_status`,
      [adminUser.id, resolvedParams.id]
    )

    if (!updateResult.rows || updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

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
