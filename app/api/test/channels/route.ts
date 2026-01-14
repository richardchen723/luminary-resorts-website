/**
 * Test endpoint to list available channels from Hostaway
 * GET /api/test/channels
 */

import { NextResponse } from "next/server"
import { makeRequest } from "@/lib/hostaway"

export async function GET() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "This endpoint is only available in development" },
        { status: 403 }
      )
    }

    const endpoints = [
      "/channels",
      "/channelManager/channels",
      "/channel-manager/channels",
    ]

    const results: any[] = []

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`)
        const result = await makeRequest<any>(endpoint)
        results.push({
          endpoint,
          success: true,
          result,
        })
        // If one succeeds, return it
        return NextResponse.json({
          success: true,
          endpoint,
          channels: result,
        })
      } catch (error: any) {
        results.push({
          endpoint,
          success: false,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: false,
      message: "Could not find channels endpoint",
      results,
    }, { status: 404 })
  } catch (error: any) {
    console.error("Error fetching channels:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch channels",
      },
      { status: 500 }
    )
  }
}
