/**
 * Commission calculation utilities
 */

/**
 * Calculate commission amount
 * @param revenueBasis - Revenue basis (subtotal before discount)
 * @param commissionType - "percent" or "fixed"
 * @param commissionValue - Commission value (percentage or fixed amount)
 * @returns Commission amount
 */
export function calculateCommission(
  revenueBasis: number,
  commissionType: "percent" | "fixed",
  commissionValue: number
): number {
  if (commissionType === "percent") {
    return Math.max(0, revenueBasis * (commissionValue / 100))
  } else {
    // Fixed commission
    return Math.max(0, commissionValue)
  }
}

/**
 * Round to 2 decimal places (for currency)
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100
}
