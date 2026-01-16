/**
 * Authentication and authorization utilities for admin portal
 */

import { getServerSession } from "next-auth"
import { NextRequest } from "next/server"
import { query } from "./db/client"
import { isDatabaseAvailable } from "./db/client"

export type AdminUserRole = "owner" | "admin" | "member"
export type ApprovalStatus = "pending" | "approved" | "rejected" | "suspended"

export interface AdminUser {
  id: string
  email: string
  name: string | null
  google_id: string | null
  role: AdminUserRole
  approval_status: ApprovalStatus
  approved_by: string | null
  approved_at: Date | null
  created_at: Date
  updated_at: Date
  last_login_at: Date | null
}

/**
 * Get admin user by email
 */
export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  if (!isDatabaseAvailable()) {
    return null
  }

  try {
    const result = await query<AdminUser>(
      `SELECT * FROM admin_users WHERE email = $1 LIMIT 1`,
      [email]
    )
    const user = result.rows?.[0] || null
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:40',message:'getAdminUserByEmail result',data:{email,found:!!user,role:user?.role,approval_status:user?.approval_status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return user
  } catch (error) {
    console.error("Error fetching admin user:", error)
    return null
  }
}

/**
 * Get admin user by ID
 */
export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  if (!isDatabaseAvailable()) {
    return null
  }

  try {
    const result = await query<AdminUser>(
      `SELECT * FROM admin_users WHERE id = $1 LIMIT 1`,
      [id]
    )
    return result.rows?.[0] || null
  } catch (error) {
    console.error("Error fetching admin user:", error)
    return null
  }
}

/**
 * Create or update admin user from OAuth session
 */
export async function upsertAdminUser(params: {
  email: string
  name?: string | null
  google_id?: string | null
}): Promise<AdminUser> {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not available")
  }

  const { email, name, google_id } = params

  // Check if owner email - auto-approve
  const isOwner = email === "yunhang.chen@gmail.com"
  const approvalStatus = isOwner ? "approved" : "pending"
  const role = isOwner ? "owner" : "member"

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:79',message:'upsertAdminUser called',data:{email,isOwner,role,approvalStatus},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  try {
    // Try to update existing user
    // For owner email, always ensure role and approval_status are correct
    const updateResult = await query<AdminUser>(
      `UPDATE admin_users 
       SET name = COALESCE($1, name),
           google_id = COALESCE($2, google_id),
           role = CASE WHEN $4 = 'owner' THEN 'owner' ELSE role END,
           approval_status = CASE WHEN $4 = 'owner' THEN 'approved' ELSE approval_status END,
           approved_at = CASE WHEN $4 = 'owner' AND approved_at IS NULL THEN NOW() ELSE approved_at END,
           last_login_at = NOW(),
           updated_at = NOW()
       WHERE email = $3
       RETURNING *`,
      [name, google_id, email, role]
    )

    if (updateResult.rows?.[0]) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:101',message:'Updated existing admin user',data:{email,role:updateResult.rows[0].role,approval_status:updateResult.rows[0].approval_status,isOwner},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return updateResult.rows[0]
    }

    // Create new user
    const insertResult = await query<AdminUser>(
      `INSERT INTO admin_users (email, name, google_id, role, approval_status, approved_at)
       VALUES ($1, $2, $3, $4, $5, ${isOwner ? "NOW()" : "NULL"})
       RETURNING *`,
      [email, name || null, google_id || null, role, approvalStatus]
    )

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:115',message:'Created new admin user',data:{email,role:insertResult.rows[0].role,approval_status:insertResult.rows[0].approval_status,isOwner},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    return insertResult.rows[0]
  } catch (error) {
    console.error("Error upserting admin user:", error)
    throw error
  }
}

/**
 * Check if user has required role(s)
 */
export function hasRole(user: AdminUser | null, roles: AdminUserRole[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

/**
 * Check if user is approved
 */
export function isApproved(user: AdminUser | null): boolean {
  if (!user) return false
  return user.approval_status === "approved"
}

/**
 * Check if user can access admin portal
 */
export function canAccessAdmin(user: AdminUser | null): boolean {
  const result = isApproved(user)
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:140',message:'canAccessAdmin check',data:{hasUser:!!user,role:user?.role,approval_status:user?.approval_status,canAccess:result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  return result
}

/**
 * Require authentication and approval - throws if not authorized
 */
export async function requireAuth(request: NextRequest): Promise<AdminUser> {
  // This will be called from API routes that use NextAuth session
  // For now, return a placeholder - will be implemented with NextAuth integration
  throw new Error("requireAuth not yet implemented - needs NextAuth session")
}

/**
 * Require specific role(s) - throws if user doesn't have role
 */
export function requireRole(user: AdminUser, roles: AdminUserRole[]): void {
  if (!hasRole(user, roles)) {
    throw new Error(`Insufficient permissions. Required roles: ${roles.join(", ")}`)
  }
}

/**
 * Get owner email (hardcoded)
 */
export const OWNER_EMAIL = "yunhang.chen@gmail.com"
