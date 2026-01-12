"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon } from "lucide-react"

interface ExpandableDescriptionProps {
  fullDescription: string
  previewText: string
}

export function ExpandableDescription({ fullDescription, previewText }: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-4">
      <div className="prose prose-lg max-w-none">
        {isExpanded ? (
          <div className="space-y-4 text-muted-foreground leading-relaxed whitespace-pre-line">
            {fullDescription}
          </div>
        ) : (
          <div className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
            {previewText}
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="gap-2 text-primary hover:text-primary/80"
      >
        {isExpanded ? (
          <>
            Read less
            <ChevronDownIcon className="w-4 h-4 rotate-180 transition-transform" />
          </>
        ) : (
          <>
            Read more
            <ChevronDownIcon className="w-4 h-4 transition-transform" />
          </>
        )}
      </Button>
    </div>
  )
}
