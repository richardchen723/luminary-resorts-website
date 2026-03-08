import { NextRequest, NextResponse } from "next/server"
import { requireAuthApi } from "@/lib/auth-helpers"
import { CHAT_UNAVAILABLE_ERROR, getAdminChatThread } from "@/lib/chat"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAuthApi(request)
    const resolvedParams = params instanceof Promise ? await params : params
    const thread = await getAdminChatThread(resolvedParams.id)

    if (!thread) {
      return NextResponse.json(
        { error: "Chat thread not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ thread })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }

    const status = error?.message === CHAT_UNAVAILABLE_ERROR ? 503 : 500
    return NextResponse.json(
      { error: error?.message || "Failed to load chat thread" },
      { status }
    )
  }
}
