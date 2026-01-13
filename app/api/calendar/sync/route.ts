/**
 * POST /api/calendar/sync
 * Trigger calendar sync for all listings
 * Can be called by cron job or admin
 */

import { NextResponse } from "next/server"
import { syncAllCalendars } from "@/lib/calendar-sync"

export async function POST(request: Request) {
  try {
    // Optional: Add authentication/authorization check here
    // For now, allow anyone to trigger sync (you may want to restrict this)
    
    // Check for authorization header or API key
    const authHeader = request.headers.get("authorization")
    const apiKey = request.headers.get("x-api-key")
    
    // In production, verify API key or auth token
    // For now, we'll allow it but log it
    if (!authHeader && !apiKey) {
      console.warn("Calendar sync triggered without authentication")
    }
    
    // Run sync in background (don't wait for completion)
    syncAllCalendars().catch((error) => {
      console.error("Background calendar sync failed:", error)
    })
    
    return NextResponse.json({
      success: true,
      message: "Calendar sync started",
    })
  } catch (error: any) {
    console.error("Error starting calendar sync:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to start calendar sync",
      },
      { status: 500 }
    )
  }
}
