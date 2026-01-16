/**
 * Incentive business logic and database operations
 */

import { query } from "./db/client"
import type { AdminUser } from "./auth"

export interface IncentiveRule {
  id: string
  influencer_id: string
  guest_discount_type: "percent" | "fixed"
  guest_discount_value: number
  influencer_commission_type: "percent" | "fixed"
  influencer_commission_value: number
  effective_start_date: string | null
  effective_end_date: string | null
  is_active: boolean
  notes: string | null
  created_by: string
  created_at: Date
  updated_at: Date
}

export interface CreateIncentiveInput {
  influencer_id: string
  guest_discount_type: "percent" | "fixed"
  guest_discount_value: number
  influencer_commission_type: "percent" | "fixed"
  influencer_commission_value: number
  effective_start_date?: string | null
  effective_end_date?: string | null
  notes?: string | null
}

/**
 * Get active incentive for influencer
 */
export async function getActiveIncentive(
  influencerId: string
): Promise<IncentiveRule | null> {
  const result = await query<IncentiveRule>(
    "SELECT * FROM incentive_rules WHERE influencer_id = $1 AND is_active = true LIMIT 1",
    [influencerId]
  )
  return result.rows?.[0] || null
}

/**
 * Get incentive by ID
 */
export async function getIncentiveById(id: string): Promise<IncentiveRule | null> {
  const result = await query<IncentiveRule>(
    "SELECT * FROM incentive_rules WHERE id = $1 LIMIT 1",
    [id]
  )
  return result.rows?.[0] || null
}

/**
 * List incentives for influencer (including history)
 */
export async function listIncentives(
  influencerId: string
): Promise<{ active: IncentiveRule | null; history: IncentiveRule[] }> {
  const activeResult = await query<IncentiveRule>(
    "SELECT * FROM incentive_rules WHERE influencer_id = $1 AND is_active = true LIMIT 1",
    [influencerId]
  )

  const historyResult = await query<IncentiveRule>(
    "SELECT * FROM incentive_rules WHERE influencer_id = $1 AND is_active = false ORDER BY created_at DESC",
    [influencerId]
  )

  return {
    active: activeResult.rows?.[0] || null,
    history: historyResult.rows || [],
  }
}

/**
 * Create new incentive (deactivates existing active incentive)
 */
export async function createIncentive(
  input: CreateIncentiveInput,
  createdBy: AdminUser
): Promise<IncentiveRule> {
  // Deactivate existing active incentive
  await query(
    "UPDATE incentive_rules SET is_active = false, updated_at = NOW() WHERE influencer_id = $1 AND is_active = true",
    [input.influencer_id]
  )

  // Create new active incentive
  const result = await query<IncentiveRule>(
    `INSERT INTO incentive_rules (
      influencer_id, guest_discount_type, guest_discount_value,
      influencer_commission_type, influencer_commission_value,
      effective_start_date, effective_end_date, notes, created_by, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
    RETURNING *`,
    [
      input.influencer_id,
      input.guest_discount_type,
      input.guest_discount_value,
      input.influencer_commission_type,
      input.influencer_commission_value,
      input.effective_start_date || null,
      input.effective_end_date || null,
      input.notes || null,
      createdBy.id,
    ]
  )

  // Log audit entry
  await query(
    `INSERT INTO incentive_audit_log (influencer_id, incentive_rule_id, action, changed_by, changes)
     VALUES ($1, $2, 'created', $3, $4)`,
    [
      input.influencer_id,
      result.rows[0].id,
      createdBy.id,
      JSON.stringify({
        guest_discount_type: input.guest_discount_type,
        guest_discount_value: input.guest_discount_value,
        influencer_commission_type: input.influencer_commission_type,
        influencer_commission_value: input.influencer_commission_value,
      }),
    ]
  )

  return result.rows[0]
}

/**
 * Update incentive
 */
export async function updateIncentive(
  id: string,
  input: Partial<CreateIncentiveInput>,
  updatedBy: AdminUser
): Promise<IncentiveRule> {
  // Get old values for audit
  const oldIncentive = await getIncentiveById(id)
  if (!oldIncentive) {
    throw new Error("Incentive not found")
  }

  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (input.guest_discount_type !== undefined) {
    updates.push(`guest_discount_type = $${paramIndex++}`)
    values.push(input.guest_discount_type)
  }
  if (input.guest_discount_value !== undefined) {
    updates.push(`guest_discount_value = $${paramIndex++}`)
    values.push(input.guest_discount_value)
  }
  if (input.influencer_commission_type !== undefined) {
    updates.push(`influencer_commission_type = $${paramIndex++}`)
    values.push(input.influencer_commission_type)
  }
  if (input.influencer_commission_value !== undefined) {
    updates.push(`influencer_commission_value = $${paramIndex++}`)
    values.push(input.influencer_commission_value)
  }
  if (input.effective_start_date !== undefined) {
    updates.push(`effective_start_date = $${paramIndex++}`)
    values.push(input.effective_start_date)
  }
  if (input.effective_end_date !== undefined) {
    updates.push(`effective_end_date = $${paramIndex++}`)
    values.push(input.effective_end_date)
  }
  if (input.notes !== undefined) {
    updates.push(`notes = $${paramIndex++}`)
    values.push(input.notes)
  }

  if (updates.length === 0) {
    return oldIncentive
  }

  updates.push(`updated_at = NOW()`)
  values.push(id)

  const result = await query<IncentiveRule>(
    `UPDATE incentive_rules 
     SET ${updates.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  )

  // Log audit entry
  await query(
    `INSERT INTO incentive_audit_log (influencer_id, incentive_rule_id, action, changed_by, changes)
     VALUES ($1, $2, 'updated', $3, $4)`,
    [
      oldIncentive.influencer_id,
      id,
      updatedBy.id,
      JSON.stringify({
        old: {
          guest_discount_type: oldIncentive.guest_discount_type,
          guest_discount_value: oldIncentive.guest_discount_value,
          influencer_commission_type: oldIncentive.influencer_commission_type,
          influencer_commission_value: oldIncentive.influencer_commission_value,
        },
        new: {
          guest_discount_type: result.rows[0].guest_discount_type,
          guest_discount_value: result.rows[0].guest_discount_value,
          influencer_commission_type: result.rows[0].influencer_commission_type,
          influencer_commission_value: result.rows[0].influencer_commission_value,
        },
      }),
    ]
  )

  return result.rows[0]
}

/**
 * Deactivate incentive
 */
export async function deactivateIncentive(
  id: string,
  deactivatedBy: AdminUser
): Promise<void> {
  const incentive = await getIncentiveById(id)
  if (!incentive) {
    throw new Error("Incentive not found")
  }

  await query(
    "UPDATE incentive_rules SET is_active = false, updated_at = NOW() WHERE id = $1",
    [id]
  )

  // Log audit entry
  await query(
    `INSERT INTO incentive_audit_log (influencer_id, incentive_rule_id, action, changed_by, changes)
     VALUES ($1, $2, 'deactivated', $3, $4)`,
    [
      incentive.influencer_id,
      id,
      deactivatedBy.id,
      JSON.stringify({ reason: "Manual deactivation" }),
    ]
  )
}

/**
 * Get active incentive for referral code (with date validation)
 */
export async function getActiveIncentiveForReferral(
  referralCode: string
): Promise<IncentiveRule | null> {
  const result = await query<IncentiveRule>(
    `SELECT ir.* FROM incentive_rules ir
     JOIN influencers i ON i.id = ir.influencer_id
     WHERE i.referral_code = $1 
       AND ir.is_active = true
       AND i.status = 'active'
       AND (ir.effective_start_date IS NULL OR ir.effective_start_date <= CURRENT_DATE)
       AND (ir.effective_end_date IS NULL OR ir.effective_end_date >= CURRENT_DATE)
     LIMIT 1`,
    [referralCode]
  )
  return result.rows?.[0] || null
}
