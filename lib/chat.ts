import { randomBytes } from "crypto"
import { z } from "zod"
import { query, isDatabaseAvailable } from "@/lib/db/client"
import { addMessageToConversation, createInquiry } from "@/lib/hostaway"
import { getListingIdBySlug } from "@/lib/listing-map"
import { getCabinBySlugSync } from "@/lib/cabins"
import { getTransporter } from "@/lib/email"
import {
  buildGuestChatPlaceholderEmail,
  GUEST_CHAT_AUTOMATED_RESPONSE,
  isGuestChatPlaceholderEmail,
} from "@/lib/guest-chat-utils"
import type { AdminUser } from "@/lib/auth"
import type {
  AdminReplyInput,
  AppendGuestChatMessageInput,
  ConvertThreadToInquiryInput,
  CreateGuestChatThreadInput,
  GuestChatAuthorType,
  GuestChatContext,
  GuestChatIntent,
  GuestChatListFilter,
  GuestChatMessage,
  GuestChatSyncStatus,
  GuestChatThreadDetail,
  GuestChatThreadSummary,
  GuestChatThreadStatus,
} from "@/types/guest-chat"

const CHAT_UNAVAILABLE_ERROR = "Guest chat is unavailable"

const optionalStringField = (maxLength: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") return value ?? null
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    },
    z.string().max(maxLength).nullable().optional()
  )

const optionalIntegerField = (min: number, max: number) =>
  z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === "") return null
      if (typeof value === "string") return Number.parseInt(value, 10)
      return value
    },
    z.number().int().min(min).max(max).nullable().optional()
  )

export const guestChatContextSchema = z.object({
  listingSlug: optionalStringField(100),
  cabinName: optionalStringField(255),
  checkIn: optionalStringField(10),
  checkOut: optionalStringField(10),
  guests: optionalIntegerField(1, 20),
  pets: optionalIntegerField(0, 20),
  infants: optionalIntegerField(0, 20),
  sourcePath: optionalStringField(500),
  sourceType: optionalStringField(100),
})

export const createGuestChatThreadSchema = z.object({
  guestName: z.string().trim().min(1).max(255),
  guestPhone: z.string().trim().min(1).max(50),
  message: z.string().trim().min(1).max(4000),
  intent: z
    .enum(["availability", "cabin_question", "special_request", "general"])
    .optional(),
  context: guestChatContextSchema.partial().optional(),
})

export const appendGuestChatMessageSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  guestPhone: optionalStringField(50),
  context: guestChatContextSchema.partial().optional(),
})

export const adminReplySchema = z.object({
  body: z.string().trim().min(1).max(4000),
})

export const updateThreadStatusSchema = z.object({
  status: z.enum(["waiting_on_team", "waiting_on_guest", "closed", "spam"]),
})

export const assignThreadSchema = z.object({
  assignedAdminUserId: optionalStringField(100),
})

export const convertThreadToInquirySchema = z.object({
  listingSlug: optionalStringField(100),
  checkIn: optionalStringField(10),
  checkOut: optionalStringField(10),
  guests: optionalIntegerField(1, 20),
  pets: optionalIntegerField(0, 20),
  infants: optionalIntegerField(0, 20),
  guestPhone: optionalStringField(50),
})

interface GuestChatThreadRow {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  status: GuestChatThreadStatus
  intent: GuestChatIntent
  assigned_admin_user_id: string | null
  assigned_admin_name: string | null
  hostaway_reservation_id: number | string | null
  source_path: string | null
  source_type: string | null
  listing_slug: string | null
  cabin_name: string | null
  check_in: string | Date | null
  check_out: string | Date | null
  guests: number | string | null
  pets: number | string | null
  infants: number | string | null
  last_message_preview: string | null
  last_message_at: string | Date | null
  guest_unread_count: number | string | null
  staff_unread_count: number | string | null
  created_at: string | Date
  updated_at: string | Date
  closed_at: string | Date | null
}

interface GuestChatMessageRow {
  id: string
  thread_id: string
  author_type: GuestChatAuthorType
  admin_user_id: string | null
  admin_user_name: string | null
  body: string
  hostaway_message_id: number | string | null
  hostaway_sync_status: GuestChatSyncStatus
  hostaway_sync_error: string | null
  created_at: string | Date
}

const THREAD_SELECT = `
  SELECT
    t.id,
    t.guest_name,
    t.guest_email,
    t.guest_phone,
    t.status,
    t.intent,
    t.assigned_admin_user_id,
    au.name AS assigned_admin_name,
    t.hostaway_reservation_id,
    t.source_path,
    t.source_type,
    t.listing_slug,
    t.cabin_name,
    t.check_in,
    t.check_out,
    t.guests,
    t.pets,
    t.infants,
    (
      SELECT m.body
      FROM guest_chat_messages m
      WHERE m.thread_id = t.id
        AND m.author_type <> 'system'
      ORDER BY m.created_at DESC
      LIMIT 1
    ) AS last_message_preview,
    (
      SELECT m.created_at
      FROM guest_chat_messages m
      WHERE m.thread_id = t.id
        AND m.author_type <> 'system'
      ORDER BY m.created_at DESC
      LIMIT 1
    ) AS last_message_at,
    (
      SELECT COUNT(*)::int
      FROM guest_chat_messages m
      WHERE m.thread_id = t.id
        AND m.author_type = 'staff'
        AND m.created_at > COALESCE(t.last_guest_read_at, to_timestamp(0))
    ) AS guest_unread_count,
    (
      SELECT COUNT(*)::int
      FROM guest_chat_messages m
      WHERE m.thread_id = t.id
        AND m.author_type = 'guest'
        AND m.created_at > COALESCE(t.last_staff_read_at, to_timestamp(0))
    ) AS staff_unread_count,
    t.created_at,
    t.updated_at,
    t.closed_at
  FROM guest_chat_threads t
  LEFT JOIN admin_users au ON au.id = t.assigned_admin_user_id
`

function assertChatAvailable() {
  if (!isDatabaseAvailable()) {
    throw new Error(CHAT_UNAVAILABLE_ERROR)
  }
}

function normalizeContext(context?: Partial<GuestChatContext> | null): GuestChatContext {
  const parsed = guestChatContextSchema.partial().parse(context ?? {})

  return {
    listingSlug: parsed.listingSlug ?? null,
    cabinName: parsed.cabinName ?? null,
    checkIn: parsed.checkIn ?? null,
    checkOut: parsed.checkOut ?? null,
    guests: parsed.guests ?? null,
    pets: parsed.pets ?? null,
    infants: parsed.infants ?? null,
    sourcePath: parsed.sourcePath ?? null,
    sourceType: parsed.sourceType ?? null,
  }
}

function mergeContext(
  current: GuestChatContext,
  next?: Partial<GuestChatContext> | null
): GuestChatContext {
  const incoming = normalizeContext(next)

  return {
    listingSlug: incoming.listingSlug ?? current.listingSlug,
    cabinName: incoming.cabinName ?? current.cabinName,
    checkIn: incoming.checkIn ?? current.checkIn,
    checkOut: incoming.checkOut ?? current.checkOut,
    guests: incoming.guests ?? current.guests,
    pets: incoming.pets ?? current.pets,
    infants: incoming.infants ?? current.infants,
    sourcePath: incoming.sourcePath ?? current.sourcePath,
    sourceType: incoming.sourceType ?? current.sourceType,
  }
}

function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null
  const trimmed = phone.trim()
  return trimmed.length > 0 ? trimmed : null
}

function parseNullableInteger(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function toIsoString(value: string | Date | null | undefined): string | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function toDateOnly(value: string | Date | null | undefined): string | null {
  if (!value) return null
  if (typeof value === "string") {
    return value.slice(0, 10)
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }
  return null
}

function truncatePreview(value: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (trimmed.length <= 140) return trimmed
  return `${trimmed.slice(0, 137)}...`
}

function mapThreadSummary(row: GuestChatThreadRow): GuestChatThreadSummary {
  return {
    id: row.id,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    guestPhone: row.guest_phone,
    status: row.status,
    intent: row.intent,
    assignedAdminUserId: row.assigned_admin_user_id,
    assignedAdminName: row.assigned_admin_name,
    hostawayReservationId: parseNullableInteger(row.hostaway_reservation_id),
    lastMessagePreview: truncatePreview(row.last_message_preview),
    lastMessageAt: toIsoString(row.last_message_at),
    guestUnreadCount: parseNullableInteger(row.guest_unread_count) ?? 0,
    staffUnreadCount: parseNullableInteger(row.staff_unread_count) ?? 0,
    context: {
      listingSlug: row.listing_slug,
      cabinName: row.cabin_name,
      checkIn: toDateOnly(row.check_in),
      checkOut: toDateOnly(row.check_out),
      guests: parseNullableInteger(row.guests),
      pets: parseNullableInteger(row.pets),
      infants: parseNullableInteger(row.infants),
      sourcePath: row.source_path,
      sourceType: row.source_type,
    },
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date(0).toISOString(),
    closedAt: toIsoString(row.closed_at),
  }
}

function mapMessage(row: GuestChatMessageRow): GuestChatMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    authorType: row.author_type,
    adminUserId: row.admin_user_id,
    adminUserName: row.admin_user_name,
    body: row.body,
    hostawayMessageId: parseNullableInteger(row.hostaway_message_id),
    hostawaySyncStatus: row.hostaway_sync_status,
    hostawaySyncError: row.hostaway_sync_error,
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
  }
}

async function getThreadRowById(
  threadId: string,
  access?: { guestToken?: string | null }
): Promise<GuestChatThreadRow | null> {
  const params: Array<string> = [threadId]
  let whereClause = "WHERE t.id = $1"

  if (access?.guestToken) {
    params.push(access.guestToken)
    whereClause += ` AND t.guest_token = $${params.length}`
  }

  const result = await query<GuestChatThreadRow>(
    `${THREAD_SELECT} ${whereClause} LIMIT 1`,
    params
  )

  return result.rows?.[0] || null
}

async function getMessagesForThread(threadId: string): Promise<GuestChatMessage[]> {
  const result = await query<GuestChatMessageRow>(
    `
      SELECT
        m.id,
        m.thread_id,
        m.author_type,
        m.admin_user_id,
        au.name AS admin_user_name,
        m.body,
        m.hostaway_message_id,
        m.hostaway_sync_status,
        m.hostaway_sync_error,
        m.created_at
      FROM guest_chat_messages m
      LEFT JOIN admin_users au ON au.id = m.admin_user_id
      WHERE m.thread_id = $1
      ORDER BY m.created_at ASC
    `,
    [threadId]
  )

  return (result.rows || []).map(mapMessage)
}

export async function getGuestChatThreadForGuest(
  threadId: string,
  guestToken: string
): Promise<GuestChatThreadDetail | null> {
  assertChatAvailable()

  const threadRow = await getThreadRowById(threadId, { guestToken })
  if (!threadRow) {
    return null
  }

  const summary = mapThreadSummary(threadRow)
  const messages = await getMessagesForThread(threadId)

  return {
    ...summary,
    messages,
    canConvertToInquiry: canConvertThreadToInquiry(summary),
  }
}

export async function getAdminChatThread(threadId: string): Promise<GuestChatThreadDetail | null> {
  assertChatAvailable()

  const threadRow = await getThreadRowById(threadId)
  if (!threadRow) {
    return null
  }

  const summary = mapThreadSummary(threadRow)
  const messages = await getMessagesForThread(threadId)

  return {
    ...summary,
    messages,
    canConvertToInquiry: canConvertThreadToInquiry(summary),
  }
}

export async function listAdminChatThreads(
  filter: GuestChatListFilter = "open"
): Promise<GuestChatThreadSummary[]> {
  assertChatAvailable()

  let whereClause = ""
  const params: string[] = []

  if (filter === "open") {
    whereClause = "WHERE t.status IN ('waiting_on_team', 'waiting_on_guest')"
  } else {
    params.push(filter)
    whereClause = `WHERE t.status = $1`
  }

  const result = await query<GuestChatThreadRow>(
    `
      ${THREAD_SELECT}
      ${whereClause}
      ORDER BY
        CASE
          WHEN t.status = 'waiting_on_team' THEN 0
          WHEN t.status = 'waiting_on_guest' THEN 1
          WHEN t.status = 'closed' THEN 2
          ELSE 3
        END,
        t.updated_at DESC
    `,
    params.length > 0 ? params : undefined
  )

  return (result.rows || []).map(mapThreadSummary)
}

export async function createGuestChatThread(
  input: CreateGuestChatThreadInput
): Promise<{ thread: GuestChatThreadDetail; guestToken: string }> {
  assertChatAvailable()

  const parsed = createGuestChatThreadSchema.parse(input)
  const context = normalizeContext(parsed.context)
  const guestToken = randomBytes(24).toString("hex")
  const guestPhone = normalizePhone(parsed.guestPhone)

  if (!guestPhone) {
    throw new Error("Phone number is required")
  }

  const guestEmail = buildGuestChatPlaceholderEmail(guestPhone)

  const insertedThread = await query<{ id: string }>(
    `
      INSERT INTO guest_chat_threads (
        guest_token,
        guest_name,
        guest_email,
        guest_phone,
        status,
        intent,
        source_path,
        source_type,
        listing_slug,
        cabin_name,
        check_in,
        check_out,
        guests,
        pets,
        infants,
        last_guest_read_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, 'waiting_on_team', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
      )
      RETURNING id
    `,
    [
      guestToken,
      parsed.guestName.trim(),
      guestEmail,
      guestPhone,
      parsed.intent || "general",
      context.sourcePath,
      context.sourceType,
      context.listingSlug,
      context.cabinName,
      context.checkIn,
      context.checkOut,
      context.guests,
      context.pets,
      context.infants,
    ]
  )

  const threadId = insertedThread.rows?.[0]?.id
  if (!threadId) {
    throw new Error("Failed to create chat thread")
  }

  await query(
    `
      INSERT INTO guest_chat_messages (thread_id, author_type, body, hostaway_sync_status)
      VALUES ($1, 'guest', $2, 'not_applicable')
    `,
    [threadId, parsed.message.trim()]
  )

  await query(
    `
      INSERT INTO guest_chat_messages (thread_id, author_type, body, hostaway_sync_status)
      VALUES ($1, 'system', $2, 'not_applicable')
    `,
    [threadId, GUEST_CHAT_AUTOMATED_RESPONSE]
  )

  await query(
    `
      UPDATE guest_chat_threads
      SET last_guest_read_at = NOW()
      WHERE id = $1
    `,
    [threadId]
  )

  const thread = await getGuestChatThreadForGuest(threadId, guestToken)
  if (!thread) {
    throw new Error("Failed to load chat thread")
  }

  void sendChatAlertEmail({
    subject: `New guest chat from ${thread.guestName}`,
    heading: "New guest chat",
    thread,
    latestMessage: parsed.message.trim(),
  })

  return { thread, guestToken }
}

async function updateThreadContextAndMetadata(
  threadId: string,
  currentContext: GuestChatContext,
  nextContext?: Partial<GuestChatContext> | null,
  options?: {
    guestPhone?: string | null
    status?: GuestChatThreadStatus
    lastGuestRead?: boolean
    lastStaffRead?: boolean
    closeThread?: boolean
    assignedAdminUserId?: string | null
    hostawayReservationId?: number | null
  }
) {
  const merged = mergeContext(currentContext, nextContext)
  const guestPhone = options?.guestPhone !== undefined ? normalizePhone(options.guestPhone) : undefined
  const status = options?.status
  const closedAt =
    options?.closeThread === undefined
      ? undefined
      : options.closeThread
        ? "NOW()"
        : "NULL"

  const assignments: string[] = [
    "source_path = $2",
    "source_type = $3",
    "listing_slug = $4",
    "cabin_name = $5",
    "check_in = $6",
    "check_out = $7",
    "guests = $8",
    "pets = $9",
    "infants = $10",
  ]

  const params: Array<string | number | null> = [
    threadId,
    merged.sourcePath,
    merged.sourceType,
    merged.listingSlug,
    merged.cabinName,
    merged.checkIn,
    merged.checkOut,
    merged.guests,
    merged.pets,
    merged.infants,
  ]

  if (guestPhone !== undefined) {
    assignments.push(`guest_phone = $${params.length + 1}`)
    params.push(guestPhone)
  }

  if (status) {
    assignments.push(`status = $${params.length + 1}`)
    params.push(status)
  }

  if (options?.assignedAdminUserId !== undefined) {
    assignments.push(`assigned_admin_user_id = $${params.length + 1}`)
    params.push(options.assignedAdminUserId)
  }

  if (options?.hostawayReservationId !== undefined) {
    assignments.push(`hostaway_reservation_id = $${params.length + 1}`)
    params.push(options.hostawayReservationId)
  }

  if (options?.lastGuestRead) {
    assignments.push("last_guest_read_at = NOW()")
  }

  if (options?.lastStaffRead) {
    assignments.push("last_staff_read_at = NOW()")
  }

  if (closedAt !== undefined) {
    assignments.push(`closed_at = ${closedAt}`)
  }

  assignments.push("updated_at = NOW()")

  await query(
    `
      UPDATE guest_chat_threads
      SET ${assignments.join(", ")}
      WHERE id = $1
    `,
    params
  )
}

async function recordMessage(
  threadId: string,
  authorType: GuestChatAuthorType,
  body: string,
  adminUserId?: string | null
): Promise<string> {
  const result = await query<{ id: string }>(
    `
      INSERT INTO guest_chat_messages (
        thread_id,
        author_type,
        admin_user_id,
        body,
        hostaway_sync_status
      )
      VALUES ($1, $2, $3, $4, 'not_applicable')
      RETURNING id
    `,
    [threadId, authorType, adminUserId || null, body.trim()]
  )

  const messageId = result.rows?.[0]?.id
  if (!messageId) {
    throw new Error("Failed to create chat message")
  }

  return messageId
}

async function updateMessageSyncState(
  messageId: string,
  syncStatus: GuestChatSyncStatus,
  options?: {
    hostawayMessageId?: number | null
    syncError?: string | null
  }
) {
  await query(
    `
      UPDATE guest_chat_messages
      SET hostaway_sync_status = $2,
          hostaway_message_id = $3,
          hostaway_sync_error = $4
      WHERE id = $1
    `,
    [messageId, syncStatus, options?.hostawayMessageId || null, options?.syncError || null]
  )
}

async function mirrorMessageIfNeeded(
  thread: GuestChatThreadSummary,
  messageId: string,
  messageBody: string,
  authorType: "guest" | "staff"
) {
  if (!thread.hostawayReservationId) {
    return
  }

  try {
    const result = await addMessageToConversation(
      thread.hostawayReservationId,
      messageBody,
      authorType === "guest" ? 1 : 0
    )

    await updateMessageSyncState(messageId, "mirrored", {
      hostawayMessageId: result.messageId,
    })
  } catch (error: any) {
    console.error("Failed to mirror chat message to Hostaway:", error)
    await updateMessageSyncState(messageId, "failed", {
      syncError: error.message || "Failed to mirror message",
    })
  }
}

export async function appendGuestMessageToThread(
  threadId: string,
  guestToken: string,
  input: AppendGuestChatMessageInput
): Promise<GuestChatThreadDetail> {
  assertChatAvailable()

  const parsed = appendGuestChatMessageSchema.parse(input)
  const existingThread = await getGuestChatThreadForGuest(threadId, guestToken)

  if (!existingThread) {
    throw new Error("Chat thread not found")
  }

  if (existingThread.status === "closed" || existingThread.status === "spam") {
    throw new Error("This conversation is closed")
  }

  const messageId = await recordMessage(threadId, "guest", parsed.message)

  await updateThreadContextAndMetadata(threadId, existingThread.context, parsed.context, {
    guestPhone: parsed.guestPhone || undefined,
    status: "waiting_on_team",
    lastGuestRead: true,
  })

  const updatedThread = await getGuestChatThreadForGuest(threadId, guestToken)
  if (!updatedThread) {
    throw new Error("Failed to load updated thread")
  }

  await mirrorMessageIfNeeded(updatedThread, messageId, parsed.message.trim(), "guest")

  void sendChatAlertEmail({
    subject: `Guest replied in chat: ${updatedThread.guestName}`,
    heading: "New guest chat reply",
    thread: updatedThread,
    latestMessage: parsed.message.trim(),
  })

  return (await getGuestChatThreadForGuest(threadId, guestToken)) || updatedThread
}

export async function appendAdminReplyToThread(
  threadId: string,
  adminUser: AdminUser,
  input: AdminReplyInput
): Promise<GuestChatThreadDetail> {
  assertChatAvailable()

  const parsed = adminReplySchema.parse(input)
  const existingThread = await getAdminChatThread(threadId)

  if (!existingThread) {
    throw new Error("Chat thread not found")
  }

  if (existingThread.status === "closed" || existingThread.status === "spam") {
    throw new Error("This conversation is closed")
  }

  const messageId = await recordMessage(threadId, "staff", parsed.body, adminUser.id)

  await updateThreadContextAndMetadata(threadId, existingThread.context, null, {
    status: "waiting_on_guest",
    lastStaffRead: true,
    assignedAdminUserId: existingThread.assignedAdminUserId || adminUser.id,
  })

  const updatedThread = await getAdminChatThread(threadId)
  if (!updatedThread) {
    throw new Error("Failed to load updated thread")
  }

  await mirrorMessageIfNeeded(updatedThread, messageId, parsed.body.trim(), "staff")

  return (await getAdminChatThread(threadId)) || updatedThread
}

export async function updateAdminThreadStatus(
  threadId: string,
  status: GuestChatThreadStatus
): Promise<GuestChatThreadDetail> {
  assertChatAvailable()

  const existingThread = await getAdminChatThread(threadId)
  if (!existingThread) {
    throw new Error("Chat thread not found")
  }

  await updateThreadContextAndMetadata(threadId, existingThread.context, null, {
    status,
    closeThread: status === "closed" || status === "spam",
  })

  const updatedThread = await getAdminChatThread(threadId)
  if (!updatedThread) {
    throw new Error("Failed to update thread status")
  }

  return updatedThread
}

export async function assignAdminThread(
  threadId: string,
  assignedAdminUserId: string | null
): Promise<GuestChatThreadDetail> {
  assertChatAvailable()

  const existingThread = await getAdminChatThread(threadId)
  if (!existingThread) {
    throw new Error("Chat thread not found")
  }

  if (assignedAdminUserId) {
    const assignee = await query<{ id: string }>(
      `
        SELECT id
        FROM admin_users
        WHERE id = $1
          AND approval_status = 'approved'
        LIMIT 1
      `,
      [assignedAdminUserId]
    )

    if (!assignee.rows?.[0]) {
      throw new Error("Assigned admin user not found")
    }
  }

  await updateThreadContextAndMetadata(threadId, existingThread.context, null, {
    assignedAdminUserId,
  })

  const updatedThread = await getAdminChatThread(threadId)
  if (!updatedThread) {
    throw new Error("Failed to assign thread")
  }

  return updatedThread
}

export async function markGuestThreadRead(
  threadId: string,
  guestToken: string
): Promise<GuestChatThreadDetail | null> {
  assertChatAvailable()

  const existingThread = await getGuestChatThreadForGuest(threadId, guestToken)
  if (!existingThread) {
    return null
  }

  await query(
    `
      UPDATE guest_chat_threads
      SET last_guest_read_at = NOW()
      WHERE id = $1
        AND guest_token = $2
    `,
    [threadId, guestToken]
  )

  return getGuestChatThreadForGuest(threadId, guestToken)
}

export async function markAdminThreadRead(threadId: string): Promise<GuestChatThreadDetail | null> {
  assertChatAvailable()

  const existingThread = await getAdminChatThread(threadId)
  if (!existingThread) {
    return null
  }

  await query(
    `
      UPDATE guest_chat_threads
      SET last_staff_read_at = NOW()
      WHERE id = $1
    `,
    [threadId]
  )

  return getAdminChatThread(threadId)
}

export function canConvertThreadToInquiry(thread: Pick<
  GuestChatThreadSummary,
  "guestName" | "guestEmail" | "guestPhone" | "context" | "hostawayReservationId" | "status"
>): boolean {
  return (
    !thread.hostawayReservationId &&
    thread.status !== "spam" &&
    !!thread.guestName &&
    !!thread.guestEmail &&
    !!thread.guestPhone &&
    !!thread.context.listingSlug &&
    !!thread.context.checkIn &&
    !!thread.context.checkOut &&
    !!thread.context.guests
  )
}

function splitGuestName(name: string) {
  const trimmed = name.trim()
  const parts = trimmed.split(/\s+/)
  const firstName = parts[0] || "Guest"
  const lastName = parts.slice(1).join(" ") || "Guest"
  return { firstName, lastName }
}

function buildInquiryMessage(thread: GuestChatThreadDetail): string {
  const guestMessages = thread.messages
    .filter((message) => message.authorType === "guest")
    .map((message) => message.body.trim())
    .filter(Boolean)

  const messageExcerpt = guestMessages.slice(-3)
  const detailParts = [
    `Website chat inquiry from ${thread.guestName}.`,
    thread.context.cabinName || thread.context.listingSlug
      ? `Cabin: ${thread.context.cabinName || thread.context.listingSlug}`
      : null,
    thread.context.checkIn && thread.context.checkOut
      ? `Stay dates: ${thread.context.checkIn} to ${thread.context.checkOut}`
      : null,
    thread.context.guests ? `Guests: ${thread.context.guests}` : null,
    thread.context.sourcePath ? `Source page: ${thread.context.sourcePath}` : null,
    `Intent: ${thread.intent.replace(/_/g, " ")}`,
  ].filter(Boolean)

  if (messageExcerpt.length === 0) {
    return detailParts.join("\n")
  }

  return `${detailParts.join("\n")}\n\nRecent guest messages:\n${messageExcerpt
    .map((message, index) => `${index + 1}. ${message}`)
    .join("\n")}`
}

export async function convertThreadToInquiry(
  threadId: string,
  input?: ConvertThreadToInquiryInput
): Promise<GuestChatThreadDetail> {
  assertChatAvailable()

  const overrides = convertThreadToInquirySchema.parse(input ?? {})
  const existingThread = await getAdminChatThread(threadId)

  if (!existingThread) {
    throw new Error("Chat thread not found")
  }

  if (existingThread.hostawayReservationId) {
    return existingThread
  }

  const mergedContext = mergeContext(existingThread.context, {
    listingSlug: overrides.listingSlug ?? undefined,
    checkIn: overrides.checkIn ?? undefined,
    checkOut: overrides.checkOut ?? undefined,
    guests: overrides.guests ?? undefined,
    pets: overrides.pets ?? undefined,
    infants: overrides.infants ?? undefined,
  })
  const guestPhone = normalizePhone(overrides.guestPhone) ?? existingThread.guestPhone

  const eligibleThread: GuestChatThreadSummary = {
    ...existingThread,
    guestPhone,
    context: mergedContext,
  }

  if (!canConvertThreadToInquiry(eligibleThread)) {
    throw new Error("Thread is missing required booking details for Hostaway conversion")
  }

  const listingSlug = mergedContext.listingSlug as string
  const listingId = getListingIdBySlug(listingSlug)
  if (!listingId) {
    throw new Error(`Listing not found for slug: ${listingSlug}`)
  }

  const cabin = getCabinBySlugSync(listingSlug)
  const { firstName, lastName } = splitGuestName(existingThread.guestName)

  const inquiryMessage = buildInquiryMessage({
    ...existingThread,
    guestPhone,
    context: {
      ...mergedContext,
      cabinName: mergedContext.cabinName || cabin?.name || null,
    },
  })

  const inquiry = await createInquiry({
    listingId,
    checkIn: mergedContext.checkIn as string,
    checkOut: mergedContext.checkOut as string,
    guests: mergedContext.guests as number,
    adults: mergedContext.guests as number,
    pets: mergedContext.pets ?? undefined,
    infants: mergedContext.infants ?? undefined,
    guestInfo: {
      firstName,
      lastName,
      email: existingThread.guestEmail,
      phone: guestPhone as string,
      country: "US",
    },
    message: inquiryMessage,
  })

  const reservationId =
    inquiry.id || parseNullableInteger(inquiry.hostawayReservationId) || null

  await updateThreadContextAndMetadata(threadId, existingThread.context, mergedContext, {
    guestPhone,
    hostawayReservationId: reservationId,
  })

  await query(
    `
      INSERT INTO guest_chat_messages (
        thread_id,
        author_type,
        body,
        hostaway_sync_status
      )
      VALUES ($1, 'system', $2, 'not_applicable')
    `,
    [
      threadId,
      `Conversation linked to Hostaway inquiry ${reservationId ?? inquiry.hostawayReservationId}.`,
    ]
  )

  const updatedThread = await getAdminChatThread(threadId)
  if (!updatedThread) {
    throw new Error("Failed to load converted thread")
  }

  return updatedThread
}

function getChatAlertRecipients(): string[] {
  const envRecipients = process.env.CHAT_ALERT_RECIPIENTS
    ?.split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean)

  if (envRecipients && envRecipients.length > 0) {
    return envRecipients
  }

  return ["lydia@luminaryresorts.com", "usman@luminaryresorts.com"]
}

function getAdminLink(threadId: string): string | null {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)

  if (!baseUrl) {
    return null
  }

  return `${baseUrl}/admin/chat?threadId=${threadId}`
}

async function sendChatAlertEmail(options: {
  subject: string
  heading: string
  thread: GuestChatThreadSummary
  latestMessage: string
}) {
  try {
    const recipients = getChatAlertRecipients()
    const transporter = getTransporter()
    const adminLink = getAdminLink(options.thread.id)
    const context = options.thread.context
    const hasReplyableEmail = !isGuestChatPlaceholderEmail(options.thread.guestEmail)
    const emailHtml = hasReplyableEmail
      ? `<p><strong>Email:</strong> ${options.thread.guestEmail}</p>`
      : ""
    const emailText = hasReplyableEmail ? `Email: ${options.thread.guestEmail}` : null

    const html = `
      <h2>${options.heading}</h2>
      <p><strong>Guest:</strong> ${options.thread.guestName}</p>
      ${emailHtml}
      <p><strong>Phone:</strong> ${options.thread.guestPhone || "Not provided"}</p>
      <p><strong>Intent:</strong> ${options.thread.intent.replace(/_/g, " ")}</p>
      <p><strong>Status:</strong> ${options.thread.status}</p>
      <p><strong>Cabin:</strong> ${context.cabinName || context.listingSlug || "Not specified"}</p>
      <p><strong>Stay:</strong> ${
        context.checkIn && context.checkOut
          ? `${context.checkIn} to ${context.checkOut}`
          : "Not specified"
      }</p>
      <p><strong>Latest message:</strong></p>
      <p>${options.latestMessage.replace(/\n/g, "<br>")}</p>
      ${
        adminLink
          ? `<p><a href="${adminLink}">Open in admin inbox</a></p>`
          : ""
      }
    `

    await Promise.all(
      recipients.map((recipient) =>
        transporter.sendMail({
          from: `"Luminary Resorts Chat" <${process.env.GMAIL_USER}>`,
          to: recipient,
          replyTo: hasReplyableEmail ? options.thread.guestEmail : undefined,
          subject: options.subject,
          html,
          text: [
            options.heading,
            `Guest: ${options.thread.guestName}`,
            emailText,
            `Phone: ${options.thread.guestPhone || "Not provided"}`,
            `Intent: ${options.thread.intent.replace(/_/g, " ")}`,
            `Status: ${options.thread.status}`,
            `Cabin: ${context.cabinName || context.listingSlug || "Not specified"}`,
            `Stay: ${
              context.checkIn && context.checkOut
                ? `${context.checkIn} to ${context.checkOut}`
                : "Not specified"
            }`,
            "",
            "Latest message:",
            options.latestMessage,
            adminLink ? `Open in admin inbox: ${adminLink}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        })
      )
    )
  } catch (error) {
    console.error("Failed to send chat alert email:", error)
  }
}

export { CHAT_UNAVAILABLE_ERROR }
