export type HostawayWebsiteMessageSource = "webchat" | "text_message_form"

const HOSTAWAY_SOURCE_LABELS: Record<HostawayWebsiteMessageSource, string> = {
  webchat: "(Source: Luminary website — webchat)",
  text_message_form: "(Source: Luminary website — text-message form)",
}

/**
 * Add source context to the Hostaway-only copy of a guest message.
 * The website transcript keeps the original guest text unchanged.
 */
export function labelHostawayGuestMessage(
  body: string,
  source: HostawayWebsiteMessageSource
): string {
  const message = body.trim()
  if (!message) return ""

  const label = HOSTAWAY_SOURCE_LABELS[source]
  return message.endsWith(label) ? message : `${message}\n\n${label}`
}
