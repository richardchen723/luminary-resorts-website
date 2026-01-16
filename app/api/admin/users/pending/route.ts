/**
 * GET /api/admin/users - Get all admin users (admin and owner only)
 */

import { NextRequest, NextResponse } from "next/server"
import { requireRoleApi } from "@/lib/auth-helpers"
import { query } from "@/lib/db/client"
import type { AdminUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireRoleApi(request, ["admin", "owner"])

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    let queryStr = "SELECT * FROM admin_users"
    const queryParams: any[] = []

    if (status !== "all") {
      queryStr += " WHERE approval_status = $1"
      queryParams.push(status)
    }

    queryStr += " ORDER BY created_at DESC"

    const result = await query<AdminUser>(queryStr, queryParams.length > 0 ? queryParams : undefined)

    return NextResponse.json({ users: result.rows || [] })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    )
  }
}
