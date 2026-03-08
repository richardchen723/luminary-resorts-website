import { NextRequest, NextResponse } from "next/server"
import { requireAuthApi } from "@/lib/auth-helpers"
import {
  CHAT_UNAVAILABLE_ERROR,
  convertThreadToInquiry,
  convertThreadToInquirySchema,
} from "@/lib/chat"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAuthApi(request)
    const resolvedParams = params instanceof Promise ? await params : params
    const body = convertThreadToInquirySchema.parse(await request.json())
    const thread = await convertThreadToInquiry(resolvedParams.id, body)

    return NextResponse.json({ thread })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }

    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid conversion payload", details: error.flatten?.() },
        { status: 400 }
      )
    }

    const status =
      error?.message === CHAT_UNAVAILABLE_ERROR
        ? 503
        : error?.message === "Chat thread not found" || error?.message?.startsWith("Listing not found")
          ? 404
          : error?.message === "Thread is missing required booking details for Hostaway conversion"
            ? 409
            : 500

    return NextResponse.json(
      { error: error?.message || "Failed to convert thread to inquiry" },
      { status }
    )
  }
}
