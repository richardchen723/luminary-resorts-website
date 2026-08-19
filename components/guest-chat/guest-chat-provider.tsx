"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GuestChatPanel } from "@/components/guest-chat/guest-chat-panel"
import { trackChatOpened } from "@/lib/analytics"
import type {
  GuestChatContext,
  GuestChatIntent,
  GuestChatThreadDetail,
} from "@/types/guest-chat"

type OpenTextInquiryOptions = {
  context?: Partial<GuestChatContext>
  initialIntent?: GuestChatIntent
}

type GuestChatContextValue = {
  openTextInquiry: (options?: OpenTextInquiryOptions) => void
  setLauncherSuppressed: (source: string, suppressed: boolean) => void
}

const GuestChatContextObject = createContext<GuestChatContextValue | null>(null)

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
  const merged = { ...(base || {}), ...(next || {}) }
  const hasValue = Object.values(merged).some(
    (value) => value !== null && value !== undefined && value !== ""
  )
  return hasValue ? merged : null
}

export function GuestChatProvider({
  children,
  textMessagingEnabled,
}: {
  children: React.ReactNode
  textMessagingEnabled: boolean
}) {
  const pathname = usePathname() || "/"
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/admin-auth")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatContext, setChatContext] = useState<Partial<GuestChatContext> | null>(null)
  const [chatIntent, setChatIntent] = useState<GuestChatIntent>("general")
  const [thread, setThread] = useState<GuestChatThreadDetail | null>(null)
  const [launcherSuppressions, setLauncherSuppressions] = useState<Set<string>>(() => new Set())

  const setLauncherSuppressed = useCallback((source: string, suppressed: boolean) => {
    setLauncherSuppressions((current) => {
      const next = new Set(current)
      if (suppressed) next.add(source)
      else next.delete(source)
      return next
    })
  }, [])

  useEffect(() => {
    if (isAdminPath) return

    let cancelled = false
    void fetch("/api/chat/thread", {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null
        const data = await response.json()
        return (data.thread || null) as GuestChatThreadDetail | null
      })
      .then((nextThread) => {
        if (!cancelled) setThread(nextThread)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [isAdminPath])

  function buildDefaultContext(): Partial<GuestChatContext> {
    return {
      sourcePath: pathname,
      sourceType: getSourceType(pathname),
    }
  }

  function openTextInquiry(options?: OpenTextInquiryOptions) {
    const nextContext = mergeContext(
      mergeContext(thread?.context || null, buildDefaultContext()),
      options?.context || null
    )

    setChatContext(nextContext)
    setChatIntent(options?.initialIntent || "general")
    setIsChatOpen(true)
    trackChatOpened(pathname)
  }

  const showGuestChat = !isAdminPath
  const isLauncherSuppressed = launcherSuppressions.size > 0
  const unreadCount = thread?.guestUnreadCount || 0

  return (
    <GuestChatContextObject.Provider
      value={{ openTextInquiry, setLauncherSuppressed }}
    >
      {children}

      {showGuestChat && (
        <>
          {!isChatOpen && !isLauncherSuppressed && (
            <div className="fixed right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-50 lg:right-6 lg:bottom-6">
              <Button
                type="button"
                size="lg"
                className="relative h-12 w-12 rounded-full border border-primary/15 p-0 shadow-2xl sm:h-auto sm:w-auto sm:rounded-[1.75rem] sm:px-6 sm:py-4"
                onClick={() => openTextInquiry()}
                aria-label={thread ? "Open your chat with Luminary" : "Chat with Luminary"}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/14 sm:h-11 sm:w-11">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span className="hidden flex-col items-start text-left leading-none sm:flex">
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground/75">
                      {thread ? "Welcome back" : "Questions?"}
                    </span>
                    <span className="mt-1 text-base font-semibold tracking-tight">Chat with us</span>
                  </span>
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-xs font-semibold text-primary">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
          )}

          <GuestChatPanel
            open={isChatOpen}
            onOpenChange={setIsChatOpen}
            thread={thread}
            onThreadChange={setThread}
            context={chatContext}
            initialIntent={chatIntent}
            initialGuestName={thread?.guestName || ""}
            initialGuestPhone={thread?.guestPhone || ""}
            smsFallbackEnabled={textMessagingEnabled}
          />
        </>
      )}
    </GuestChatContextObject.Provider>
  )
}

export function useGuestChat() {
  const context = useContext(GuestChatContextObject)
  if (!context) throw new Error("useGuestChat must be used within GuestChatProvider")
  return context
}
