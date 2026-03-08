import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import {
  CHAT_UNAVAILABLE_ERROR,
  appendGuestMessageToThread,
  appendGuestChatMessageSchema,
} from "@/lib/chat"
import {
  GUEST_CHAT_THREAD_ID_COOKIE,
  GUEST_CHAT_THREAD_TOKEN_COOKIE,
} from "@/lib/chat-cookies"

function handleChatError(error: any) {
  if (error?.name === "ZodError") {
    return NextResponse.json(
      { error: "Invalid chat payload", details: error.flatten?.() },
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
    { error: error?.message || "Failed to send chat message" },
    { status }
  )
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const threadId = cookieStore.get(GUEST_CHAT_THREAD_ID_COOKIE)?.value
    const guestToken = cookieStore.get(GUEST_CHAT_THREAD_TOKEN_COOKIE)?.value

    if (!threadId || !guestToken) {
      return NextResponse.json(
        { error: "No active chat thread found" },
        { status: 404 }
      )
    }

    const body = appendGuestChatMessageSchema.parse(await request.json())
    const thread = await appendGuestMessageToThread(threadId, guestToken, body)

    return NextResponse.json({ thread })
  } catch (error: any) {
    return handleChatError(error)
  }
}
