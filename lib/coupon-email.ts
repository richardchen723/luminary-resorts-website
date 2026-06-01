export interface CouponEmailDiscount {
  type: "fixed" | "percent"
  value: number
}

export function formatCouponOfferLabel(discount: CouponEmailDiscount): string {
  return discount.type === "percent"
    ? `${discount.value}% off your stay`
    : `$${discount.value.toFixed(2)} off your stay`
}

export function getDefaultCouponEmailSubject(discount: CouponEmailDiscount): string {
  return `${formatCouponOfferLabel(discount)} from Luminary Resorts`
}

export function getCouponEmailSubject(
  subject: string | null | undefined,
  discount: CouponEmailDiscount
): string {
  const trimmedSubject = subject?.trim()

  return trimmedSubject || getDefaultCouponEmailSubject(discount)
}
