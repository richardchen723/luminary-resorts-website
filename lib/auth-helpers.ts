/**
 * Server-side auth helpers for API routes and server components
 */

import { NextRequest, NextResponse } from "next/server"
import { getAdminUserByEmail, canAccessAdmin, requireRole, type AdminUser, type AdminUserRole } from "./auth"
import { auth } from "@/app/api/auth/[...nextauth]/route"

/**
 * Get current admin user from session (server-side)
 */
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return null
    }

    return await getAdminUserByEmail(session.user.email)
  } catch (error) {
    console.error("Error getting current admin user:", error)
    return null
  }
}

/**
 * Require authentication for API route
 * Returns admin user or throws error response
 */
export async function requireAuthApi(request: NextRequest): Promise<AdminUser> {
  const user = await getCurrentAdminUser()
  
  if (!user) {
    throw NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  if (!canAccessAdmin(user)) {
    throw NextResponse.json(
      { error: "Access denied. Your account is pending approval." },
      { status: 403 }
    )
  }

  return user
}

/**
 * Require specific role(s) for API route
 * Returns admin user or throws error response
 */
export async function requireRoleApi(
  request: NextRequest,
  roles: AdminUserRole[]
): Promise<AdminUser> {
  const user = await requireAuthApi(request)
  
  try {
    requireRole(user, roles)
  } catch (error: any) {
    throw NextResponse.json(
      { error: error.message || "Insufficient permissions" },
      { status: 403 }
    )
  }

  return user
}
