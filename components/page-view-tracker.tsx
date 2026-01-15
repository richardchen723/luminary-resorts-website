"use client"

import { useEffect } from "react"
import { trackViewStay } from "@/lib/analytics"
import { usePathname } from "next/navigation"

interface PageViewTrackerProps {
  cabinSlug?: string
}

export function PageViewTracker({ cabinSlug }: PageViewTrackerProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (cabinSlug && pathname) {
      trackViewStay(cabinSlug, pathname)
    }
  }, [cabinSlug, pathname])

  return null
}
