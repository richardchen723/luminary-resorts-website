import { timingSafeEqual } from "crypto"

type UnknownRecord = Record<string, unknown>

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null
}

function positiveInteger(...values: unknown[]): number | null {
  for (const value of values) {
    const parsed = typeof value === "string" ? Number.parseInt(value, 10) : Number(value)
    if (Number.isInteger(parsed) && parsed > 0) return parsed
  }
  return null
}

export interface HostawayChatWebhookEvent {
  supported: boolean
  reservationId: number | null
  conversationId: number | null
  messageId: number | null
}

/**
 * Hostaway has used both unified webhook envelopes and direct conversation
 * message payloads. Accept both shapes so the endpoint remains compatible.
 */
export function parseHostawayChatWebhook(payload: unknown): HostawayChatWebhookEvent {
  const root = asRecord(payload)
  if (!root) {
    return {
      supported: false,
      reservationId: null,
      conversationId: null,
      messageId: null,
    }
  }

  const data = asRecord(root.data)
  const result = asRecord(root.result)
  const message = asRecord(root.message)
  const objectData = asRecord(root.object)
  const records = [root, data, result, message, objectData].filter(
    (value): value is UnknownRecord => Boolean(value)
  )

  const event = records
    .map((record) => record.event)
    .find((value): value is string => typeof value === "string")
  const objectType = typeof root.object === "string" ? root.object : null
  const looksLikeMessage = records.some(
    (record) =>
      record.conversationId !== undefined ||
      record.conversationMessageId !== undefined ||
      record.isIncoming !== undefined
  )
  const supported = event
    ? event === "message.received" || event === "conversationMessage.created"
    : objectType === "conversationMessage" || looksLikeMessage

  const reservationId = positiveInteger(
    ...records.flatMap((record) => [record.reservationId, record.reservation_id])
  )
  const conversationId = positiveInteger(
    ...records.flatMap((record) => [record.conversationId, record.conversation_id])
  )
  const messageId = positiveInteger(
    root.objectId,
    ...records.flatMap((record) => [
      record.conversationMessageId,
      record.conversation_message_id,
      record.messageId,
    ])
  )

  return { supported, reservationId, conversationId, messageId }
}

export function isValidHostawayWebhookAuthorization(
  authorization: string | null,
  login: string,
  password: string
): boolean {
  if (!authorization || !login || !password) return false

  const expected = Buffer.from(`Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`)
  const actual = Buffer.from(authorization)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
