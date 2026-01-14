/**
 * POST /api/test/email
 * Send a test booking confirmation email
 */

import { NextResponse } from "next/server"
import { sendBookingConfirmationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    // Test booking data
    const testData = {
      guestName: "Yunhang Chen",
      guestEmail: "yunhang.chen@gmail.com",
      confirmationCode: "LR-TEST123",
      cabinName: "Cabin Dew",
      checkIn: "2026-01-19",
      checkOut: "2026-01-21",
      nights: 2,
      guests: 2,
      pricing: {
        nightlyRate: 180.00,
        subtotal: 360.00,
        cleaningFee: 100.00,
        tax: 43.20,
        channelFee: 7.20,
        total: 510.40,
        currency: "USD",
      },
    }

    await sendBookingConfirmationEmail(testData)

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testData.guestEmail}`,
    })
  } catch (error: any) {
    console.error("Error sending test email:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send test email",
      },
      { status: 500 }
    )
  }
}
