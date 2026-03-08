import { NextRequest, NextResponse } from "next/server"
import { requireAuthApi } from "@/lib/auth-helpers"
import {
  CHAT_UNAVAILABLE_ERROR,
  assignAdminThread,
  assignThreadSchema,
} from "@/lib/chat"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAuthApi(request)
    const resolvedParams = params instanceof Promise ? await params : params
    const body = assignThreadSchema.parse(await request.json())
    const thread = await assignAdminThread(
      resolvedParams.id,
      body.assignedAdminUserId || null
    )

    return NextResponse.json({ thread })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }

    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid assignee payload", details: error.flatten?.() },
        { status: 400 }
      )
    }

    const status =
      error?.message === CHAT_UNAVAILABLE_ERROR
        ? 503
        : error?.message === "Chat thread not found" || error?.message === "Assigned admin user not found"
          ? 404
          : 500

    return NextResponse.json(
      { error: error?.message || "Failed to assign chat thread" },
      { status }
    )
  }
}
