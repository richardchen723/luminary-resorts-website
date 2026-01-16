/**
 * GET /api/admin/influencers - List influencers
 * POST /api/admin/influencers - Create influencer
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuthApi } from "@/lib/auth-helpers"
import { listInfluencers, createInfluencer } from "@/lib/influencers"

export async function GET(request: NextRequest) {
  try {
    await requireAuthApi(request)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "active" | "inactive" | "all" | null
    const search = searchParams.get("search") || undefined
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const result = await listInfluencers({
      status: status || "all",
      search,
      page,
      limit,
    })

    return NextResponse.json({
      influencers: result.influencers,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error listing influencers:", error)
    return NextResponse.json(
      { error: error.message || "Failed to list influencers" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAuthApi(request)

    const body = await request.json()
    const { name, email, phone, instagram_handle, tiktok_handle, notes, status } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const influencer = await createInfluencer(
      {
        name,
        email,
        phone,
        instagram_handle,
        tiktok_handle,
        notes,
        status,
      },
      adminUser
    )

    return NextResponse.json(influencer, { status: 201 })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error creating influencer:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create influencer" },
      { status: 500 }
    )
  }
}
