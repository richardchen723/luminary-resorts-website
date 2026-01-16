/**
 * POST /api/admin/users/[id]/update - Update user role (admin and owner only)
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
    const adminUser = await requireRoleApi(request, ["admin", "owner"])

    // Handle params as Promise (Next.js 15+) or object (Next.js 14)
    const resolvedParams = params instanceof Promise ? await params : params

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
      [resolvedParams.id]
    )

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (userResult.rows[0].email === OWNER_EMAIL) {
      return NextResponse.json(
        { error: "Cannot modify owner account" },
        { status: 403 }
      )
    }

    // Update user role
    const updateResult = await query(
      `UPDATE admin_users 
       SET role = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, role, approval_status`,
      [role, resolvedParams.id]
    )

    if (!updateResult.rows || updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, user: updateResult.rows[0] })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    )
  }
}
