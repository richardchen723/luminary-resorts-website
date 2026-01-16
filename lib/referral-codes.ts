/**
 * Referral code generation utilities
 * Generates unique, unguessable referral codes for influencers
 */

/**
 * Generate a random alphanumeric string
 */
function randomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate a unique referral code
 * Format: inf_{12 random alphanumeric characters}
 * Example: inf_aB3xY9mK2pQ7
 */
export function generateReferralCode(): string {
  return `inf_${randomString(12)}`
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
  return /^inf_[A-Za-z0-9]{12}$/.test(code)
}
