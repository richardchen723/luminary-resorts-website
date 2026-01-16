/**
 * Referral redirect handler (Route Handler)
 * Sets cookie and redirects to homepage or specific cabin
 * This must be a Route Handler because cookies can only be modified in Route Handlers or Server Actions
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getInfluencerByReferralCode } from "@/lib/influencers"
import { getActiveIncentiveForReferral } from "@/lib/incentives"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> | { code: string } }
) {
  // Handle params as Promise (Next.js 15+) or object (Next.js 14)
  const resolvedParams = params instanceof Promise ? await params : params
  const referralCode = resolvedParams.code

  // Validate referral code format
  if (!referralCode || !referralCode.startsWith("inf_") || referralCode.length < 16) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    // Check if influencer exists and is active
    const influencer = await getInfluencerByReferralCode(referralCode)

    if (!influencer) {
      // Invalid or inactive influencer - redirect without setting cookie
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Check if active incentive exists
    const incentive = await getActiveIncentiveForReferral(referralCode)

    if (!incentive) {
      // No active incentive - redirect without setting cookie
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Set cookie (30-day expiry)
    const cookieStore = await cookies()
    cookieStore.set("luminary_referral", referralCode, {
      httpOnly: false, // Needed for client-side reading
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    // Get cabin from query params if present
    const url = new URL(request.url)
    const cabin = url.searchParams.get("cabin")
    const redirectPath = cabin ? `/stay/${cabin}` : "/"
    
    return NextResponse.redirect(new URL(redirectPath, request.url))
  } catch (error) {
    console.error("Error in referral redirect API:", error)
    // On error, redirect to homepage without cookie
    return NextResponse.redirect(new URL("/", request.url))
  }
}
