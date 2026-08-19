import { cookies } from "next/headers"
import { after, NextRequest, NextResponse } from "next/server"
import {
  CHAT_UNAVAILABLE_ERROR,
  guestChatPresenceSchema,
  routeUnreadHostawayRepliesToSms,
  updateGuestChatPresence,
} from "@/lib/chat"
import {
  GUEST_CHAT_THREAD_ID_COOKIE,
  GUEST_CHAT_THREAD_TOKEN_COOKIE,
} from "@/lib/chat-cookies"

export async function POST(request: NextRequest) {
  try {
    const { state } = guestChatPresenceSchema.parse(await request.json())
    const cookieStore = await cookies()
    const threadId = cookieStore.get(GUEST_CHAT_THREAD_ID_COOKIE)?.value
    const guestToken = cookieStore.get(GUEST_CHAT_THREAD_TOKEN_COOKIE)?.value

    if (!threadId || !guestToken) {
      return NextResponse.json({ success: false }, { status: 404 })
    }

    const updated = await updateGuestChatPresence(threadId, guestToken, state)
    if (!updated) {
      return NextResponse.json({ success: false }, { status: 404 })
    }

    if (state === "closed") {
      after(async () => {
        const result = await routeUnreadHostawayRepliesToSms(threadId)
        if (result.status === "failed") {
          console.error("Failed to route unread chat reply by SMS:", result.error)
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Invalid presence state" }, { status: 400 })
    }

    const status = error?.message === CHAT_UNAVAILABLE_ERROR ? 503 : 500
    return NextResponse.json(
      { error: error?.message || "Failed to update chat presence" },
      { status }
    )
  }
}
