/**
 * POST /api/admin/users/[id]/remove - Remove/delete user (admin and owner only)
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

    // Check if user is owner (cannot delete owner)
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
        { error: "Cannot delete owner account" },
        { status: 403 }
      )
    }

    // Prevent deleting yourself
    if (userResult.rows[0].email === adminUser.email) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 403 }
      )
    }

    // Delete user
    const deleteResult = await query(
      `DELETE FROM admin_users 
       WHERE id = $1
       RETURNING id, email`,
      [resolvedParams.id]
    )

    if (!deleteResult.rows || deleteResult.rows.length === 0) {
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
    console.error("Error removing user:", error)
    return NextResponse.json(
      { error: error.message || "Failed to remove user" },
      { status: 500 }
    )
  }
}
