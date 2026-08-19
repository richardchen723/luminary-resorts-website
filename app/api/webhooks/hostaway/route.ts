import { after, NextRequest, NextResponse } from "next/server"
import { processHostawayChatMessageEvent } from "@/lib/chat"
import {
  isValidHostawayWebhookAuthorization,
  parseHostawayChatWebhook,
} from "@/lib/hostaway-webhook"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const login = process.env.HOSTAWAY_WEBHOOK_LOGIN || ""
  const password = process.env.HOSTAWAY_WEBHOOK_PASSWORD || ""
  const allowUnconfiguredDevelopment = process.env.NODE_ENV !== "production" && !login && !password

  if (
    !allowUnconfiguredDevelopment &&
    !isValidHostawayWebhookAuthorization(
      request.headers.get("authorization"),
      login,
      password
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)
  const event = parseHostawayChatWebhook(payload)

  if (!event.supported) {
    return NextResponse.json({ accepted: true, ignored: true })
  }

  if (!event.reservationId && !event.conversationId && !event.messageId) {
    console.warn("Hostaway message webhook was missing message routing IDs")
    return NextResponse.json({ accepted: true, ignored: true })
  }

  after(async () => {
    try {
      await processHostawayChatMessageEvent(event)
      // A hard tab/browser disconnect may miss the close beacon. Recheck after
      // the heartbeat expires so the same unread reply can still fall back to SMS.
      await new Promise((resolve) => setTimeout(resolve, 30000))
      await processHostawayChatMessageEvent(event)
    } catch (error) {
      console.error("Failed to process Hostaway chat webhook:", error)
    }
  })

  return NextResponse.json({ accepted: true }, { status: 202 })
}
