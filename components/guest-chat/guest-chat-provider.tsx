"use client"

import Link from "next/link"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  trackChatMessageSent,
  trackChatOpened,
  trackChatReplyReceived,
  trackChatStarted,
} from "@/lib/analytics"
import type {
  CreateGuestChatThreadInput,
  GuestChatContext,
  GuestChatIntent,
  GuestChatThreadDetail,
} from "@/types/guest-chat"

type OpenChatOptions = {
  context?: Partial<GuestChatContext>
  initialIntent?: GuestChatIntent
}

type GuestChatContextValue = {
  openChat: (options?: OpenChatOptions) => void
  closeChat: () => void
  isOpen: boolean
}

const GuestChatContextObject = createContext<GuestChatContextValue | null>(null)

const intentOptions: Array<{ value: GuestChatIntent; label: string }> = [
  { value: "availability", label: "Availability" },
  { value: "cabin_question", label: "Cabin question" },
  { value: "special_request", label: "Special request" },
  { value: "general", label: "General question" },
]

function getSourceType(pathname: string): string {
  if (pathname.startsWith("/stay/")) return "stay_page"
  if (pathname === "/contact") return "contact_page"
  if (pathname === "/") return "home_page"
  return "site_page"
}

function mergeContext(
  base: Partial<GuestChatContext> | null,
  next: Partial<GuestChatContext> | null
): Partial<GuestChatContext> | null {
  const merged = {
    ...(base || {}),
    ...(next || {}),
  }

  const hasValue = Object.values(merged).some(
    (value) => value !== null && value !== undefined && value !== ""
  )

  return hasValue ? merged : null
}

function formatMessageTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  return format(date, "MMM d, h:mm a")
}

function countStaffMessages(thread: GuestChatThreadDetail | null) {
  if (!thread) return 0
  return thread.messages.filter((message) => message.authorType === "staff").length
}

export function GuestChatProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/"
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/admin-auth")
  const [isOpen, setIsOpen] = useState(false)
  const [thread, setThread] = useState<GuestChatThreadDetail | null>(null)
  const [isLoadingThread, setIsLoadingThread] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingContext, setPendingContext] = useState<Partial<GuestChatContext> | null>(null)
  const [selectedIntent, setSelectedIntent] = useState<GuestChatIntent>("general")
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [draftMessage, setDraftMessage] = useState("")
  const previousStaffMessageCount = useRef(0)

  function buildDefaultContext() {
    return {
      sourcePath: pathname,
      sourceType: getSourceType(pathname),
    }
  }

  async function loadThread(options?: { silent?: boolean }) {
    if (isAdminPath) {
      setIsLoadingThread(false)
      return
    }

    if (!options?.silent) {
      setIsLoadingThread(true)
    }

    try {
      const response = await fetch("/api/chat/thread", {
        credentials: "same-origin",
        cache: "no-store",
      })

      if (response.status === 404) {
        previousStaffMessageCount.current = 0
        setThread(null)
        setIsUnavailable(false)
        setError(null)
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Chat is currently unavailable")
      }

      const data = await response.json()
      const nextThread = (data.thread || null) as GuestChatThreadDetail | null

      setThread((currentThread) => {
        const nextStaffCount = countStaffMessages(nextThread)
        if (
          currentThread &&
          nextThread &&
          nextStaffCount > previousStaffMessageCount.current
        ) {
          trackChatReplyReceived(nextThread.id)
        }

        previousStaffMessageCount.current = nextStaffCount
        return nextThread
      })

      setIsUnavailable(false)
      setError(null)
    } catch (loadError: any) {
      setIsUnavailable(true)
      if (!options?.silent) {
        setError(loadError.message || "Chat is currently unavailable")
      }
    } finally {
      if (!options?.silent) {
        setIsLoadingThread(false)
      }
    }
  }

  useEffect(() => {
    void loadThread()
  }, [isAdminPath])

  useEffect(() => {
    if (!thread) return

    setGuestName(thread.guestName)
    setGuestEmail(thread.guestEmail)
    setGuestPhone(thread.guestPhone || "")
  }, [thread?.id, thread?.guestEmail, thread?.guestName, thread?.guestPhone])

  useEffect(() => {
    if (!isOpen || isAdminPath) return

    const intervalId = window.setInterval(() => {
      void loadThread({ silent: true })
    }, 10000)

    return () => window.clearInterval(intervalId)
  }, [isOpen, isAdminPath])

  useEffect(() => {
    if (!isOpen || !thread || thread.guestUnreadCount === 0) return

    void fetch("/api/chat/thread/read", {
      method: "POST",
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) return
        const data = await response.json()
        if (data.thread) {
          setThread(data.thread)
        }
      })
      .catch(() => {})
  }, [isOpen, thread?.id, thread?.guestUnreadCount])

  function openChat(options?: OpenChatOptions) {
    if (!thread || options?.context) {
      setPendingContext((currentContext) =>
        mergeContext(
          mergeContext(currentContext, !thread ? buildDefaultContext() : null),
          options?.context || null
        )
      )
    }

    if (options?.initialIntent) {
      setSelectedIntent(options.initialIntent)
    }

    setError(null)
    setIsOpen(true)
    trackChatOpened(pathname)
  }

  function closeChat() {
    setIsOpen(false)
  }

  async function handleCreateThread() {
    const message = draftMessage.trim()
    if (!guestName.trim() || !guestEmail.trim() || !message) {
      setError("Please add your name, email, and message.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const payload: CreateGuestChatThreadInput = {
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim() || null,
      message,
      intent: selectedIntent,
      context: mergeContext(pendingContext, buildDefaultContext()) || undefined,
    }

    try {
      const response = await fetch("/api/chat/thread", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || "Failed to start chat")
      }

      setThread(data.thread)
      previousStaffMessageCount.current = countStaffMessages(data.thread)
      setPendingContext(null)
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
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          message,
          guestPhone: guestPhone.trim() || null,
          context: pendingContext || undefined,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || "Failed to send message")
      }

      setThread(data.thread)
      previousStaffMessageCount.current = countStaffMessages(data.thread)
      setPendingContext(null)
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
      await fetch("/api/chat/thread", {
        method: "DELETE",
        credentials: "same-origin",
      })

      setThread(null)
      previousStaffMessageCount.current = 0
      setPendingContext(buildDefaultContext())
      setSelectedIntent("general")
      setDraftMessage("")
    } catch (resetError: any) {
      setError(resetError.message || "Failed to reset conversation")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentContext = mergeContext(thread?.context || null, pendingContext)
  const unreadCount = thread?.guestUnreadCount || 0
  const showLauncher = !isAdminPath

  return (
    <GuestChatContextObject.Provider value={{ openChat, closeChat, isOpen }}>
      {children}

      {showLauncher && (
        <>
          {!isOpen && (
            <div className="fixed bottom-24 right-4 z-50 lg:bottom-6 lg:right-6">
              <Button
                type="button"
                size="lg"
                className="relative h-auto rounded-[1.75rem] border border-primary/15 px-6 py-4 shadow-2xl"
                onClick={() => openChat()}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/14">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span className="flex flex-col items-start text-left leading-none">
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground/75">
                      Questions?
                    </span>
                    <span className="mt-1 text-base font-semibold tracking-tight">
                      Chat with us
                    </span>
                  </span>
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-xs font-semibold text-primary">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
              <div className="flex h-full flex-col">
                <SheetHeader className="border-b border-border pb-4">
                  <div className="flex items-start justify-between gap-3 pr-8">
                    <div>
                      <SheetTitle>Chat with Luminary</SheetTitle>
                      <SheetDescription>
                        A member of our team will reply here.
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
                        {currentContext.guests ? ` • ${currentContext.guests} guest${currentContext.guests === 1 ? "" : "s"}` : ""}
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
                              return (
                                <div key={message.id} className="text-center text-xs text-muted-foreground">
                                  {message.body}
                                </div>
                              )
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
                                      {message.adminUserName || "Luminary"}
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
                          {!thread.guestPhone && (
                            <div className="mb-3">
                              <Input
                                value={guestPhone}
                                onChange={(event) => setGuestPhone(event.target.value)}
                                placeholder="Phone (optional, helps with booking requests)"
                              />
                            </div>
                          )}

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
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
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
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => void loadThread()}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retry chat
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-0 flex-1 flex-col">
                      <ScrollArea className="min-h-0 flex-1">
                        <div className="space-y-5 p-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              What can we help with?
                            </p>
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

                          <div className="grid gap-3">
                            <Input
                              value={guestName}
                              onChange={(event) => setGuestName(event.target.value)}
                              placeholder="Your name"
                            />
                            <Input
                              type="email"
                              value={guestEmail}
                              onChange={(event) => setGuestEmail(event.target.value)}
                              placeholder="Your email"
                            />
                            <Input
                              value={guestPhone}
                              onChange={(event) => setGuestPhone(event.target.value)}
                              placeholder="Phone (optional)"
                            />
                            <Textarea
                              value={draftMessage}
                              onChange={(event) => setDraftMessage(event.target.value)}
                              placeholder="Tell us about your trip, preferred cabin, or question..."
                              rows={6}
                            />
                          </div>
                        </div>
                      </ScrollArea>

                      <div className="border-t border-border p-4">
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
                              <Send className="mr-2 h-4 w-4" />
                              Start chat
                            </>
                          )}
                        </Button>
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
        </>
      )}
    </GuestChatContextObject.Provider>
  )
}

export function useGuestChat() {
  const context = useContext(GuestChatContextObject)

  if (!context) {
    throw new Error("useGuestChat must be used within GuestChatProvider")
  }

  return context
}
