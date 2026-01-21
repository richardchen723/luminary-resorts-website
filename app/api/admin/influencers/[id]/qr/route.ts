/**
 * GET /api/admin/influencers/[id]/qr - Get QR code as PNG image
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://luminaryresorts.com"
    const referralLink = `${baseUrl}/r/${influencer.referral_code}`

    // Generate QR code as PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(referralLink, {
      width: 300,
      margin: 2,
    })

    return new NextResponse(qrCodeBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="qr-${influencer.referral_code}.png"`,
      },
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error generating QR code:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate QR code" },
      { status: 500 }
    )
  }
}
