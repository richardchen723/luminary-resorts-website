import { NextRequest, NextResponse } from "next/server"
import { requireAuthApi } from "@/lib/auth-helpers"
import {
  CHAT_UNAVAILABLE_ERROR,
  listAdminChatThreads,
} from "@/lib/chat"
import type { GuestChatListFilter } from "@/types/guest-chat"

export async function GET(request: NextRequest) {
  try {
    await requireAuthApi(request)

    const { searchParams } = new URL(request.url)
    const filter = (searchParams.get("filter") || "open") as GuestChatListFilter
    const threads = await listAdminChatThreads(filter)

    return NextResponse.json({ threads })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }

    const status = error?.message === CHAT_UNAVAILABLE_ERROR ? 503 : 500
    return NextResponse.json(
      { error: error?.message || "Failed to load chat threads" },
      { status }
    )
  }
}
