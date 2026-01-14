"use client"

import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { CabinAvailability } from "@/lib/availability"
import { Calendar, Users, DollarSign } from "lucide-react"

interface AvailabilityResultsProps {
  cabins: CabinAvailability[]
  checkIn: string
  checkOut: string
  guests: number
  onClose?: () => void
}

export function AvailabilityResults({
  cabins,
  checkIn,
  checkOut,
  guests,
  onClose,
}: AvailabilityResultsProps) {
  const availableCabins = cabins.filter((cabin) => cabin.available)
  const unavailableCabins = cabins.filter((cabin) => !cabin.available)

  if (availableCabins.length === 0) {
    return (
      <div className="mt-6 p-6 bg-muted/50 rounded-lg text-center">
        <p className="text-lg font-medium mb-2">No availability found</p>
        <p className="text-muted-foreground text-sm">
          Unfortunately, no cabins are available for the selected dates. Please try different dates.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">
          Available Cabins ({availableCabins.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableCabins.map((cabin) => (
            <Card key={cabin.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
              {cabin.image && (
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={cabin.image}
                    alt={cabin.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-3">{cabin.name}</h4>
                <div className="space-y-2 mb-4">
                  {cabin.price && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-lg font-semibold text-foreground">
                        {cabin.currency || "$"}
                        {cabin.price.toFixed(2)}
                      </span>
                      <span className="text-sm">for your stay</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(checkIn).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(checkOut).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{guests} {guests === 1 ? "guest" : "guests"}</span>
                  </div>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full"
                  onClick={onClose}
                >
                  <Link
                    href={`/stay/${cabin.slug}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                  >
                    Book Now
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {unavailableCabins.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 text-muted-foreground">
            Unavailable ({unavailableCabins.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unavailableCabins.map((cabin) => (
              <Card
                key={cabin.slug}
                className="opacity-60 overflow-hidden"
              >
                {cabin.image && (
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={cabin.image}
                      alt={cabin.name}
                      fill
                      className="object-cover grayscale"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h4 className="text-xl font-semibold mb-2">{cabin.name}</h4>
                  <p className="text-sm text-muted-foreground">Not available for selected dates</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
