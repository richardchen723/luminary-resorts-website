/**
 * Influencer business logic and database operations
 */

import { query } from "./db/client"
import { generateReferralCode } from "./referral-codes"
import type { AdminUser } from "./auth"

export interface Influencer {
  id: string
  name: string
  email: string | null
  phone: string | null
  instagram_handle: string | null
  tiktok_handle: string | null
  notes: string | null
  status: "active" | "inactive"
  referral_code: string
  created_by: string
  created_at: Date
  updated_at: Date
}

export interface CreateInfluencerInput {
  name: string
  email?: string | null
  phone?: string | null
  instagram_handle?: string | null
  tiktok_handle?: string | null
  notes?: string | null
  status?: "active" | "inactive"
}

export interface UpdateInfluencerInput extends Partial<CreateInfluencerInput> {}

/**
 * Create a new influencer
 */
export async function createInfluencer(
  input: CreateInfluencerInput,
  createdBy: AdminUser
): Promise<Influencer> {
  // Generate unique referral code
  let referralCode = generateReferralCode()
  let attempts = 0
  const maxAttempts = 10

  // Ensure code is unique
  while (attempts < maxAttempts) {
    const existing = await query<{ id: string }>(
      "SELECT id FROM influencers WHERE referral_code = $1 LIMIT 1",
      [referralCode]
    )

    if (existing.rows.length === 0) {
      break
    }

    referralCode = generateReferralCode()
    attempts++
  }

  if (attempts >= maxAttempts) {
    throw new Error("Failed to generate unique referral code")
  }

  const result = await query<Influencer>(
    `INSERT INTO influencers (
      name, email, phone, instagram_handle, tiktok_handle, notes, status, referral_code, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      input.name,
      input.email || null,
      input.phone || null,
      input.instagram_handle || null,
      input.tiktok_handle || null,
      input.notes || null,
      input.status || "active",
      referralCode,
      createdBy.id,
    ]
  )

  return result.rows[0]
}

/**
 * Get influencer by ID
 */
export async function getInfluencerById(id: string): Promise<Influencer | null> {
  const result = await query<Influencer>(
    "SELECT * FROM influencers WHERE id = $1 LIMIT 1",
    [id]
  )
  return result.rows?.[0] || null
}

/**
 * Get influencer by referral code
 */
export async function getInfluencerByReferralCode(code: string): Promise<Influencer | null> {
  const result = await query<Influencer>(
    "SELECT * FROM influencers WHERE referral_code = $1 AND status = 'active' LIMIT 1",
    [code]
  )
  return result.rows?.[0] || null
}

/**
 * List influencers with optional filters
 */
export async function listInfluencers(params: {
  status?: "active" | "inactive" | "all"
  search?: string
  page?: number
  limit?: number
}): Promise<{ influencers: Influencer[]; total: number }> {
  const { status = "all", search, page = 1, limit = 50 } = params
  const offset = (page - 1) * limit

  let whereClause = "1=1"
  const queryParams: any[] = []
  let paramIndex = 1

  if (status !== "all") {
    whereClause += ` AND status = $${paramIndex}`
    queryParams.push(status)
    paramIndex++
  }

  if (search) {
    whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR instagram_handle ILIKE $${paramIndex} OR tiktok_handle ILIKE $${paramIndex})`
    queryParams.push(`%${search}%`)
    paramIndex++
  }

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM influencers WHERE ${whereClause}`,
    queryParams
  )
  const total = parseInt(countResult.rows?.[0]?.count || "0", 10)

  // Get influencers
  const influencersResult = await query<Influencer>(
    `SELECT * FROM influencers 
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...queryParams, limit, offset]
  )

  return {
    influencers: influencersResult.rows || [],
    total,
  }
}

/**
 * Update influencer
 */
export async function updateInfluencer(
  id: string,
  input: UpdateInfluencerInput
): Promise<Influencer> {
  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (input.name !== undefined) {
    updates.push(`name = $${paramIndex++}`)
    values.push(input.name)
  }
  if (input.email !== undefined) {
    updates.push(`email = $${paramIndex++}`)
    values.push(input.email)
  }
  if (input.phone !== undefined) {
    updates.push(`phone = $${paramIndex++}`)
    values.push(input.phone)
  }
  if (input.instagram_handle !== undefined) {
    updates.push(`instagram_handle = $${paramIndex++}`)
    values.push(input.instagram_handle)
  }
  if (input.tiktok_handle !== undefined) {
    updates.push(`tiktok_handle = $${paramIndex++}`)
    values.push(input.tiktok_handle)
  }
  if (input.notes !== undefined) {
    updates.push(`notes = $${paramIndex++}`)
    values.push(input.notes)
  }
  if (input.status !== undefined) {
    updates.push(`status = $${paramIndex++}`)
    values.push(input.status)
  }

  if (updates.length === 0) {
    // No updates, just return existing
    const existing = await getInfluencerById(id)
    if (!existing) {
      throw new Error("Influencer not found")
    }
    return existing
  }

  updates.push(`updated_at = NOW()`)
  values.push(id)

  const result = await query<Influencer>(
    `UPDATE influencers 
     SET ${updates.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  )

  if (result.rows.length === 0) {
    throw new Error("Influencer not found")
  }

  return result.rows[0]
}

/**
 * Delete influencer (soft delete by setting status to inactive)
 */
export async function deleteInfluencer(id: string): Promise<void> {
  await query(
    "UPDATE influencers SET status = 'inactive', updated_at = NOW() WHERE id = $1",
    [id]
  )
}
