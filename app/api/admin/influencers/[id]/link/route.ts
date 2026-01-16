/**
 * GET /api/admin/influencers/[id]/link - Get referral link and QR code
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuthApi } from "@/lib/auth-helpers"
import { getInfluencerById } from "@/lib/influencers"
import QRCode from "qrcode"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAuthApi(request)

    // Handle params as Promise (Next.js 15+) or object (Next.js 14)
    const resolvedParams = params instanceof Promise ? await params : params
    const influencer = await getInfluencerById(resolvedParams.id)

    if (!influencer) {
      return NextResponse.json(
        { error: "Influencer not found" },
        { status: 404 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const referralLink = `${baseUrl}/r/${influencer.referral_code}`

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(referralLink, {
      width: 300,
      margin: 2,
    })

    return NextResponse.json({
      referral_code: influencer.referral_code,
      referral_link: referralLink,
      qr_code_data_url: qrCodeDataUrl,
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error getting referral link:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get referral link" },
      { status: 500 }
    )
  }
}
