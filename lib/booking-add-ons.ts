export const BOOKING_ADD_ON_PACKAGE_PRICE = 190

export const BOOKING_ADD_ON_PACKAGES = [
  {
    id: "romantic",
    name: "Romantic Package",
    price: BOOKING_ADD_ON_PACKAGE_PRICE,
    image: "/packages/sol-romantic.jpg",
    description:
      "A warm arrival setup for couples, with romantic floral touches, soft candle-style ambience, and a chilled celebratory beverage waiting in the cabin.",
    details: [
      "Romantic floral and candle-style setup",
      "Chilled celebratory beverage",
    ],
  },
  {
    id: "birthday",
    name: "Birthday Package",
    price: BOOKING_ADD_ON_PACKAGE_PRICE,
    image: "/packages/sol-birthday.jpg",
    description:
      "A cheerful birthday welcome with festive decor and a small celebration setup prepared before arrival.",
    details: [
      "Festive birthday decor",
      "Celebration setup before arrival",
    ],
  },
] as const

export type BookingAddOnPackage = (typeof BOOKING_ADD_ON_PACKAGES)[number]
export type BookingAddOnPackageId = BookingAddOnPackage["id"]

export interface BookingAddOnPackageSelection {
  id: BookingAddOnPackageId
  name: string
  price: number
}

export function getBookingAddOnPackage(
  packageId?: string | null
): BookingAddOnPackage | null {
  if (!packageId) return null
  return (
    BOOKING_ADD_ON_PACKAGES.find((addOnPackage) => addOnPackage.id === packageId) ||
    null
  )
}

export function getBookingAddOnPackageFee(packageId?: string | null): number {
  return getBookingAddOnPackage(packageId)?.price || 0
}

export function getBookingAddOnPackageSelection(
  packageId?: string | null
): BookingAddOnPackageSelection | null {
  const addOnPackage = getBookingAddOnPackage(packageId)
  if (!addOnPackage) return null

  return {
    id: addOnPackage.id,
    name: addOnPackage.name,
    price: addOnPackage.price,
  }
}

export function formatBookingAddOnPackageSelection(
  addOnPackage?: BookingAddOnPackageSelection | null
): string {
  return addOnPackage ? `${addOnPackage.name} ($${addOnPackage.price})` : "None selected"
}
