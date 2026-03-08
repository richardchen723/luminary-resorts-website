import { NextRequest, NextResponse } from "next/server"
import { requireAuthApi } from "@/lib/auth-helpers"
import {
  CHAT_UNAVAILABLE_ERROR,
  adminReplySchema,
  appendAdminReplyToThread,
} from "@/lib/chat"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const adminUser = await requireAuthApi(request)
    const resolvedParams = params instanceof Promise ? await params : params
    const body = adminReplySchema.parse(await request.json())
    const thread = await appendAdminReplyToThread(resolvedParams.id, adminUser, body)

    return NextResponse.json({ thread })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }

    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid reply payload", details: error.flatten?.() },
        { status: 400 }
      )
    }

    const status =
      error?.message === CHAT_UNAVAILABLE_ERROR
        ? 503
        : error?.message === "Chat thread not found"
          ? 404
          : error?.message === "This conversation is closed"
            ? 409
            : 500

    return NextResponse.json(
      { error: error?.message || "Failed to send reply" },
      { status }
    )
  }
}
