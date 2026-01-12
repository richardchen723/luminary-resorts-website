"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon } from "lucide-react"

interface ExpandableAmenitiesProps {
  allAmenities: string[]
  topAmenities?: string[]
}

export function ExpandableAmenities({ allAmenities, topAmenities }: ExpandableAmenitiesProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Ensure allAmenities is an array
  const safeAmenities = Array.isArray(allAmenities) ? allAmenities : []

  // Default top amenities if not provided
  const top = topAmenities || safeAmenities.slice(0, 6)
  const displayedAmenities = isExpanded ? safeAmenities : top

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {displayedAmenities.map((amenity, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <span className="text-muted-foreground">{amenity}</span>
          </div>
        ))}
      </div>
      {safeAmenities.length > (topAmenities?.length || 6) && (
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2 text-primary hover:text-primary/80"
        >
          {isExpanded ? (
            <>
              Show less amenities
              <ChevronDownIcon className="w-4 h-4 rotate-180 transition-transform" />
            </>
          ) : (
            <>
              Show all {safeAmenities.length} amenities
              <ChevronDownIcon className="w-4 h-4 transition-transform" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}
