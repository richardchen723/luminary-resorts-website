"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import {
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import {
  trackChatMessageSent,
  trackChatReplyReceived,
  trackChatStarted,
} from "@/lib/analytics"
import type {
  CreateGuestChatThreadInput,
  GuestChatContext,
  GuestChatIntent,
  GuestChatMessage,
  GuestChatThreadDetail,
} from "@/types/guest-chat"
import { GUEST_CHAT_SENDER_LABEL } from "@/lib/guest-chat-utils"

const intentOptions: Array<{ value: GuestChatIntent; label: string }> = [
  { value: "availability", label: "Availability" },
  { value: "cabin_question", label: "Cabin question" },
  { value: "special_request", label: "Special request" },
  { value: "general", label: "General question" },
]

interface GuestChatPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  thread: GuestChatThreadDetail | null
  onThreadChange: (thread: GuestChatThreadDetail | null) => void
  context?: Partial<GuestChatContext> | null
  initialIntent?: GuestChatIntent
  initialGuestName?: string
  initialGuestPhone?: string
  smsFallbackEnabled: boolean
}

function mergeContext(
  base: Partial<GuestChatContext> | null,
  next: Partial<GuestChatContext> | null
): Partial<GuestChatContext> | null {
  const merged = { ...(base || {}), ...(next || {}) }
  const hasValue = Object.values(merged).some(
    (value) => value !== null && value !== undefined && value !== ""
  )
  return hasValue ? merged : null
}

function formatMessageTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : format(date, "MMM d, h:mm a")
}

function countStaffMessages(thread: GuestChatThreadDetail | null) {
  return thread?.messages.filter((message) => message.authorType === "staff").length || 0
}

function SystemMessageCard({ message }: { message: GuestChatMessage }) {
  return (
    <div className="flex justify-center">
      <div className="max-w-[92%] rounded-2xl border border-border bg-muted/35 px-4 py-3 text-sm text-foreground">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Luminary Resorts
        </p>
        <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}

export function GuestChatPanel({
  open,
  onOpenChange,
  thread,
  onThreadChange,
  context,
  initialIntent = "general",
  initialGuestName = "",
  initialGuestPhone = "",
  smsFallbackEnabled,
}: GuestChatPanelProps) {
  const [isLoadingThread, setIsLoadingThread] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIntent, setSelectedIntent] = useState<GuestChatIntent>(initialIntent)
  const [guestName, setGuestName] = useState(initialGuestName)
  const [guestPhone, setGuestPhone] = useState(initialGuestPhone)
  const [draftMessage, setDraftMessage] = useState("")
  const previousStaffMessageCount = useRef(countStaffMessages(thread))

  const loadThread = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) setIsLoadingThread(true)

      try {
        const response = await fetch("/api/chat/thread", {
          credentials: "same-origin",
          cache: "no-store",
        })

        if (response.status === 404) {
          previousStaffMessageCount.current = 0
          onThreadChange(null)
          setIsUnavailable(false)
          setError(null)
          return
        }

        const data = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(data?.error || "Chat is currently unavailable")
        }

        const nextThread = (data.thread || null) as GuestChatThreadDetail | null
        const nextStaffCount = countStaffMessages(nextThread)
        if (
          nextThread &&
          previousStaffMessageCount.current > 0 &&
          nextStaffCount > previousStaffMessageCount.current
        ) {
          trackChatReplyReceived(nextThread.id)
        }

        previousStaffMessageCount.current = nextStaffCount
        onThreadChange(nextThread)
        setIsUnavailable(false)
        setError(null)
      } catch (loadError: any) {
        setIsUnavailable(true)
        if (!options?.silent) {
          setError(loadError.message || "Chat is currently unavailable")
        }
      } finally {
        if (!options?.silent) setIsLoadingThread(false)
      }
    },
    [onThreadChange]
  )

  useEffect(() => {
    if (!open) return
    setSelectedIntent(initialIntent)
    setGuestName(thread?.guestName || initialGuestName)
    setGuestPhone(thread?.guestPhone || initialGuestPhone)
    setError(null)
    void loadThread()
  }, [
    initialGuestName,
    initialGuestPhone,
    initialIntent,
    loadThread,
    open,
    thread?.guestName,
    thread?.guestPhone,
    thread?.id,
  ])

  useEffect(() => {
    if (!open) return
    const intervalId = window.setInterval(() => void loadThread({ silent: true }), 10000)
    return () => window.clearInterval(intervalId)
  }, [loadThread, open])

  useEffect(() => {
    if (!open || !thread?.id) return

    const sendPresence = (state: "open" | "heartbeat" | "closed", useBeacon = false) => {
      const payload = JSON.stringify({ state })
      if (useBeacon && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/chat/thread/presence",
          new Blob([payload], { type: "application/json" })
        )
        return
      }

      void fetch("/api/chat/thread/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: payload,
        keepalive: state === "closed",
      }).catch(() => {})
    }

    sendPresence("open")
    const heartbeatId = window.setInterval(() => sendPresence("heartbeat"), 10000)
    const handlePageHide = () => sendPresence("closed", true)
    window.addEventListener("pagehide", handlePageHide)

    return () => {
      window.clearInterval(heartbeatId)
      window.removeEventListener("pagehide", handlePageHide)
      sendPresence("closed", true)
    }
  }, [open, thread?.id])

  useEffect(() => {
    if (!open || !thread || thread.guestUnreadCount === 0) return

    void fetch("/api/chat/thread/read", {
      method: "POST",
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) return
        const data = await response.json()
        if (data.thread) onThreadChange(data.thread)
      })
      .catch(() => {})
  }, [onThreadChange, open, thread])

  async function handleCreateThread() {
    const message = draftMessage.trim()
    if (!guestName.trim() || !guestPhone.trim() || !message) {
      setError("Please add your name, phone number, and message.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const payload: CreateGuestChatThreadInput = {
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      message,
      intent: selectedIntent,
      context: mergeContext(thread?.context || null, context || null) || undefined,
    }

    try {
      const response = await fetch("/api/chat/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || "Failed to start chat")

      onThreadChange(data.thread)
      previousStaffMessageCount.current = countStaffMessages(data.thread)
      setDraftMessage("")
      trackChatStarted(data.thread.id)
      trackChatMessageSent(data.thread.id)
    } catch (submitError: any) {
      setError(submitError.message || "Failed to start chat")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSendMessage() {
    const message = draftMessage.trim()
    if (!message) {
      setError("Please enter a message.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/chat/thread/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          message,
          guestPhone: guestPhone.trim() || null,
          context: context || undefined,
        }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || "Failed to send message")

      onThreadChange(data.thread)
      previousStaffMessageCount.current = countStaffMessages(data.thread)
      setDraftMessage("")
      trackChatMessageSent(data.thread.id)
    } catch (submitError: any) {
      setError(submitError.message || "Failed to send message")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStartNewConversation() {
    setIsSubmitting(true)
    setError(null)

    try {
      await fetch("/api/chat/thread", { method: "DELETE", credentials: "same-origin" })
      onThreadChange(null)
      previousStaffMessageCount.current = 0
      setSelectedIntent("general")
      setDraftMessage("")
    } catch (resetError: any) {
      setError(resetError.message || "Failed to reset conversation")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentContext = mergeContext(thread?.context || null, context || null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-border p-4 pb-4">
            <div className="flex items-start justify-between gap-3 pr-8">
              <div>
                <SheetTitle>Chat with Luminary</SheetTitle>
                <SheetDescription>
                  Message our team here. We&apos;ll make sure you don&apos;t miss our reply.
                </SheetDescription>
              </div>
              {thread && (
                <Badge variant={thread.status === "waiting_on_team" ? "default" : "secondary"}>
                  {thread.status === "waiting_on_team"
                    ? "Waiting on team"
                    : thread.status === "waiting_on_guest"
                      ? "Waiting on you"
                      : thread.status}
                </Badge>
              )}
            </div>

            {currentContext && (
              <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                <p className="font-medium text-foreground">
                  {currentContext.cabinName || currentContext.listingSlug || "General inquiry"}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {currentContext.checkIn && currentContext.checkOut
                    ? `${currentContext.checkIn} to ${currentContext.checkOut}`
                    : "No stay dates selected yet"}
                  {currentContext.guests
                    ? ` • ${currentContext.guests} guest${currentContext.guests === 1 ? "" : "s"}`
                    : ""}
                </p>
              </div>
            )}
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col">
            {isLoadingThread ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : thread ? (
              <>
                <ScrollArea className="min-h-0 flex-1">
                  <div className="space-y-4 p-4">
                    {thread.messages.map((message) => {
                      if (message.authorType === "system") {
                        return <SystemMessageCard key={message.id} message={message} />
                      }

                      const isGuestMessage = message.authorType === "guest"
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isGuestMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                              isGuestMessage
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-muted/40 text-foreground"
                            }`}
                          >
                            {!isGuestMessage && (
                              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {message.adminUserName || GUEST_CHAT_SENDER_LABEL}
                              </p>
                            )}
                            <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
                            <p
                              className={`mt-2 text-[11px] ${
                                isGuestMessage
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                {thread.status === "closed" || thread.status === "spam" ? (
                  <div className="border-t border-border p-4">
                    <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                      <p className="font-medium text-foreground">This conversation is closed.</p>
                      <p className="mt-1 text-muted-foreground">
                        Start a new conversation if you need anything else.
                      </p>
                    </div>
                    <Button
                      type="button"
                      className="mt-3 w-full rounded-full"
                      onClick={() => void handleStartNewConversation()}
                      disabled={isSubmitting}
                    >
                      Start new conversation
                    </Button>
                  </div>
                ) : (
                  <div className="border-t border-border p-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={draftMessage}
                        onChange={(event) => setDraftMessage(event.target.value)}
                        placeholder="Write your message..."
                        rows={3}
                        className="min-h-24"
                      />
                      <Button
                        type="button"
                        size="icon"
                        className="h-auto rounded-2xl px-4"
                        onClick={() => void handleSendMessage()}
                        disabled={isSubmitting}
                        aria-label="Send message"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Replies from Luminary Resorts will appear here. Linked stay inquiries are also
                      kept in our Hostaway inbox.
                    </p>
                  </div>
                )}
              </>
            ) : isUnavailable ? (
              <div className="flex flex-1 flex-col justify-between p-4">
                <div className="space-y-3 rounded-md border border-border bg-muted/30 p-4 text-sm">
                  <p className="font-medium text-foreground">Chat is temporarily unavailable.</p>
                  <p className="text-muted-foreground">
                    You can still reach us directly and we&apos;ll help with your stay.
                  </p>
                </div>
                <div className="space-y-3 p-1">
                  <Button asChild className="w-full rounded-full">
                    <a href="tel:+14045908346">
                      <Phone className="mr-2 h-4 w-4" />
                      Call (404) 590-8346
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link href="/contact">
                      <Mail className="mr-2 h-4 w-4" />
                      Open contact form
                    </Link>
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => void loadThread()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry chat
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <ScrollArea className="min-h-0 flex-1">
                  <div className="space-y-5 p-4">
                    <div className="rounded-2xl bg-muted/40 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <MessageCircle className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-medium text-foreground">Welcome to Luminary Resorts</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            One of our team members will reply here shortly. You can keep browsing—if
                            you leave before seeing our response, we&apos;ll send it to the phone number
                            you provide so you don&apos;t miss it.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">What can we help with?</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {intentOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setSelectedIntent(option.value)}
                            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                              selectedIntent === option.value
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground hover:bg-muted"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="guest-chat-name">Your name</Label>
                        <Input
                          id="guest-chat-name"
                          autoComplete="name"
                          value={guestName}
                          onChange={(event) => setGuestName(event.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="guest-chat-phone">Phone number</Label>
                        <Input
                          id="guest-chat-phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="(404) 555-1234"
                          value={guestPhone}
                          onChange={(event) => setGuestPhone(event.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="guest-chat-message">How can we help?</Label>
                        <Textarea
                          id="guest-chat-message"
                          value={draftMessage}
                          onChange={(event) => setDraftMessage(event.target.value)}
                          placeholder="Tell us about your trip, preferred cabin, or question..."
                          rows={5}
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="space-y-2 border-t border-border p-4">
                  <Button
                    type="button"
                    className="w-full rounded-full"
                    onClick={() => void handleCreateThread()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting chat...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Start web chat
                      </>
                    )}
                  </Button>
                  <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                    {smsFallbackEnabled
                      ? "By starting chat, you agree that we may text this number if you leave before reading our reply. Message and data rates may apply. Reply STOP to opt out."
                      : "We use your information only to respond to this inquiry."}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="border-t border-border bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <div className="flex items-start gap-2">
                  <XCircle className="mt-0.5 h-4 w-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
