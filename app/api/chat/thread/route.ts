import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import {
  CHAT_UNAVAILABLE_ERROR,
  createGuestChatThread,
  createGuestChatThreadSchema,
  getGuestChatThreadForGuest,
} from "@/lib/chat"
import {
  GUEST_CHAT_THREAD_ID_COOKIE,
  GUEST_CHAT_THREAD_TOKEN_COOKIE,
  clearGuestChatCookies,
  setGuestChatCookies,
} from "@/lib/chat-cookies"

function handleChatError(error: any) {
  if (error?.name === "ZodError") {
    return NextResponse.json(
      { error: "Invalid chat payload", details: error.flatten?.() },
      { status: 400 }
    )
  }

  const status = error?.message === CHAT_UNAVAILABLE_ERROR ? 503 : 500
  return NextResponse.json(
    { error: error?.message || "Failed to process chat request" },
    { status }
  )
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const threadId = cookieStore.get(GUEST_CHAT_THREAD_ID_COOKIE)?.value
    const guestToken = cookieStore.get(GUEST_CHAT_THREAD_TOKEN_COOKIE)?.value

    if (!threadId || !guestToken) {
      return NextResponse.json({ thread: null }, { status: 404 })
    }

    const thread = await getGuestChatThreadForGuest(threadId, guestToken)
    if (!thread) {
      const response = NextResponse.json({ thread: null }, { status: 404 })
      clearGuestChatCookies(response)
      return response
    }

    return NextResponse.json({ thread })
  } catch (error: any) {
    return handleChatError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createGuestChatThreadSchema.parse(await request.json())
    const { thread, guestToken } = await createGuestChatThread(body)
    const response = NextResponse.json({ thread }, { status: 201 })
    setGuestChatCookies(response, thread.id, guestToken)
    return response
  } catch (error: any) {
    return handleChatError(error)
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  clearGuestChatCookies(response)
  return response
}
