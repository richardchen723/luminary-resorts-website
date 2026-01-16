/**
 * GET /api/admin/users/pending - Get pending approval users (owner only)
 */

import { NextRequest, NextResponse } from "next/server"
import { requireRoleApi } from "@/lib/auth-helpers"
import { query } from "@/lib/db/client"
import type { AdminUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireRoleApi(request, ["owner"])

    const result = await query<AdminUser>(
      "SELECT * FROM admin_users WHERE approval_status = 'pending' ORDER BY created_at DESC"
    )

    return NextResponse.json({ users: result.rows || [] })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error fetching pending users:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch pending users" },
      { status: 500 }
    )
  }
}
