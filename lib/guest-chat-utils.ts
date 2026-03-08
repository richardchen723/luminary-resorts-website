export const GUEST_CHAT_PLACEHOLDER_EMAIL_DOMAIN = "guest-chat.luminaryresorts.com"

export const GUEST_CHAT_AUTOMATED_RESPONSE =
  "Hello and welcome! Thank you for reaching out to Luminary Resorts at Hilltop. One of our team members will be with you shortly to assist you. If the chat gets disconnected for any reason, please don't worry — we'll text you on your phone right away to continue assisting you. We look forward to helping you!"

export function getGuestChatPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "")
}

export function buildGuestChatPlaceholderEmail(phone: string): string {
  const digits = getGuestChatPhoneDigits(phone) || "guest"
  return `chat+${digits}@${GUEST_CHAT_PLACEHOLDER_EMAIL_DOMAIN}`
}

export function isGuestChatPlaceholderEmail(email?: string | null): boolean {
  if (!email) return false
  return email.toLowerCase().endsWith(`@${GUEST_CHAT_PLACEHOLDER_EMAIL_DOMAIN}`)
}
