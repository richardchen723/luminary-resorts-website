import { NextRequest, NextResponse } from "next/server"
import { getCabinBySlug } from "@/lib/cabins"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidate every hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const cabin = await getCabinBySlug(slug)

    if (!cabin) {
      return NextResponse.json({ error: "Cabin not found" }, { status: 404 })
    }

    // Set cache headers
    return NextResponse.json(cabin, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error in cabin API route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
