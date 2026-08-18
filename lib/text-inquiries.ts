import { query } from "@/lib/db/client"

export type TextInquiryStatus = "pending" | "ready" | "failed"

export interface TextInquiryRecord {
  id: string
  idempotencyKey: string
  requestFingerprint: string
  guestName: string
  guestPhone: string
  listingSlug: string
  checkIn: string
  checkOut: string
  guests: number
  pets: number
  infants: number
  message: string
  sourcePath: string
  status: TextInquiryStatus
  hostawayReservationId: number | null
  hostawayConversationId: number | null
  smsMessageId: number | null
  smsStatus: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

interface TextInquiryRow {
  id: string
  idempotency_key: string
  request_fingerprint: string
  guest_name: string
  guest_phone: string
  listing_slug: string
  check_in: string | Date
  check_out: string | Date
  guests: number | string
  pets: number | string
  infants: number | string
  message: string
  source_path: string
  status: TextInquiryStatus
  hostaway_reservation_id: number | string | null
  hostaway_conversation_id: number | string | null
  sms_message_id: number | string | null
  sms_status: string | null
  error_message: string | null
  created_at: string | Date
  updated_at: string | Date
}

export interface CreateTextInquiryRecordInput {
  idempotencyKey: string
  requestFingerprint: string
  clientIpHash: string
  guestName: string
  guestPhone: string
  listingSlug: string
  checkIn: string
  checkOut: string
  guests: number
  pets: number
  infants: number
  message: string
  sourcePath: string
}

function formatDatabaseDate(value: string | Date): string {
  if (typeof value === "string") return value.slice(0, 10)
  return value.toISOString().slice(0, 10)
}

function mapTextInquiry(row: TextInquiryRow): TextInquiryRecord {
  return {
    id: row.id,
    idempotencyKey: row.idempotency_key,
    requestFingerprint: row.request_fingerprint,
    guestName: row.guest_name,
    guestPhone: row.guest_phone,
    listingSlug: row.listing_slug,
    checkIn: formatDatabaseDate(row.check_in),
    checkOut: formatDatabaseDate(row.check_out),
    guests: Number(row.guests),
    pets: Number(row.pets),
    infants: Number(row.infants),
    message: row.message,
    sourcePath: row.source_path,
    status: row.status,
    hostawayReservationId:
      row.hostaway_reservation_id === null ? null : Number(row.hostaway_reservation_id),
    hostawayConversationId:
      row.hostaway_conversation_id === null ? null : Number(row.hostaway_conversation_id),
    smsMessageId: row.sms_message_id === null ? null : Number(row.sms_message_id),
    smsStatus: row.sms_status,
    errorMessage: row.error_message,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

export async function getTextInquiryByIdempotencyKey(
  idempotencyKey: string
): Promise<TextInquiryRecord | null> {
  const result = await query<TextInquiryRow>(
    `
      SELECT *
      FROM website_text_inquiries
      WHERE idempotency_key = $1
      LIMIT 1
    `,
    [idempotencyKey]
  )

  return result.rows[0] ? mapTextInquiry(result.rows[0]) : null
}

export async function createTextInquiryRecord(
  input: CreateTextInquiryRecordInput
): Promise<{ record: TextInquiryRecord; created: boolean }> {
  const result = await query<TextInquiryRow>(
    `
      INSERT INTO website_text_inquiries (
        idempotency_key,
        request_fingerprint,
        client_ip_hash,
        guest_name,
        guest_phone,
        listing_slug,
        check_in,
        check_out,
        guests,
        pets,
        infants,
        message,
        source_path,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING *
    `,
    [
      input.idempotencyKey,
      input.requestFingerprint,
      input.clientIpHash,
      input.guestName,
      input.guestPhone,
      input.listingSlug,
      input.checkIn,
      input.checkOut,
      input.guests,
      input.pets,
      input.infants,
      input.message,
      input.sourcePath,
    ]
  )

  if (result.rows[0]) {
    return { record: mapTextInquiry(result.rows[0]), created: true }
  }

  const existing = await getTextInquiryByIdempotencyKey(input.idempotencyKey)
  if (!existing) {
    throw new Error("Failed to reserve text inquiry")
  }

  return { record: existing, created: false }
}

export async function retryFailedTextInquiry(id: string): Promise<boolean> {
  const result = await query(
    `
      UPDATE website_text_inquiries
      SET status = 'pending', error_message = NULL, updated_at = NOW()
      WHERE id = $1 AND status = 'failed'
    `,
    [id]
  )

  return result.rowCount === 1
}

export async function countRecentTextInquiryAttempts(
  guestPhone: string,
  clientIpHash: string
): Promise<number> {
  const result = await query<{ attempt_count: number | string }>(
    `
      SELECT COUNT(*) AS attempt_count
      FROM website_text_inquiries
      WHERE created_at > NOW() - INTERVAL '1 hour'
        AND (guest_phone = $1 OR client_ip_hash = $2)
    `,
    [guestPhone, clientIpHash]
  )

  return Number(result.rows[0]?.attempt_count || 0)
}

export async function markTextInquiryReady(
  id: string,
  hostawayReservationId: number,
  hostawayConversationId: number,
  smsMessageId: number,
  smsStatus: string | null
): Promise<void> {
  await query(
    `
      UPDATE website_text_inquiries
      SET
        status = 'ready',
        hostaway_reservation_id = $2,
        hostaway_conversation_id = $3,
        sms_message_id = $4,
        sms_status = $5,
        error_message = NULL,
        updated_at = NOW()
      WHERE id = $1
    `,
    [id, hostawayReservationId, hostawayConversationId, smsMessageId, smsStatus]
  )
}

export async function markTextInquiryHostawayCreated(
  id: string,
  hostawayReservationId: number
): Promise<void> {
  await query(
    `
      UPDATE website_text_inquiries
      SET
        hostaway_reservation_id = $2,
        updated_at = NOW()
      WHERE id = $1
    `,
    [id, hostawayReservationId]
  )
}

export async function markTextInquiryFailed(id: string, errorMessage: string): Promise<void> {
  await query(
    `
      UPDATE website_text_inquiries
      SET status = 'failed', error_message = $2, updated_at = NOW()
      WHERE id = $1
    `,
    [id, errorMessage.slice(0, 1000)]
  )
}
