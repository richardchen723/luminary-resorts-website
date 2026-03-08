export type GuestChatThreadStatus =
  | "waiting_on_team"
  | "waiting_on_guest"
  | "closed"
  | "spam"

export type GuestChatAuthorType = "guest" | "staff" | "system"

export type GuestChatSyncStatus = "not_applicable" | "mirrored" | "failed"

export type GuestChatIntent =
  | "availability"
  | "cabin_question"
  | "special_request"
  | "general"

export type GuestChatListFilter = "open" | "waiting_on_team" | "closed" | "spam"

export interface GuestChatContext {
  listingSlug: string | null
  cabinName: string | null
  checkIn: string | null
  checkOut: string | null
  guests: number | null
  pets: number | null
  infants: number | null
  sourcePath: string | null
  sourceType: string | null
}

export interface GuestChatMessage {
  id: string
  threadId: string
  authorType: GuestChatAuthorType
  adminUserId: string | null
  adminUserName: string | null
  body: string
  hostawayMessageId: number | null
  hostawaySyncStatus: GuestChatSyncStatus
  hostawaySyncError: string | null
  createdAt: string
}

export interface GuestChatThreadSummary {
  id: string
  guestName: string
  guestEmail: string
  guestPhone: string | null
  status: GuestChatThreadStatus
  intent: GuestChatIntent
  assignedAdminUserId: string | null
  assignedAdminName: string | null
  hostawayReservationId: number | null
  lastMessagePreview: string | null
  lastMessageAt: string | null
  guestUnreadCount: number
  staffUnreadCount: number
  context: GuestChatContext
  createdAt: string
  updatedAt: string
  closedAt: string | null
}

export interface GuestChatThreadDetail extends GuestChatThreadSummary {
  messages: GuestChatMessage[]
  canConvertToInquiry: boolean
}

export interface CreateGuestChatThreadInput {
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  message: string
  intent?: GuestChatIntent
  context?: Partial<GuestChatContext>
}

export interface AppendGuestChatMessageInput {
  message: string
  guestPhone?: string | null
  context?: Partial<GuestChatContext>
}

export interface AdminReplyInput {
  body: string
}

export interface ConvertThreadToInquiryInput {
  listingSlug?: string | null
  checkIn?: string | null
  checkOut?: string | null
  guests?: number | null
  pets?: number | null
  infants?: number | null
  guestPhone?: string | null
}
