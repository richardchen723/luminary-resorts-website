"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TextInquiryDialog } from "@/components/guest-chat/text-inquiry-dialog"
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
  textMessagingEnabled: boolean
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
  const merged = {
    ...(base || {}),
    ...(next || {}),
  }

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
  const [isTextInquiryOpen, setIsTextInquiryOpen] = useState(false)
  const [textInquiryContext, setTextInquiryContext] = useState<Partial<GuestChatContext> | null>(null)
  const [legacyThread, setLegacyThread] = useState<GuestChatThreadDetail | null>(null)

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
      .then((thread) => {
        if (!cancelled) setLegacyThread(thread)
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
    if (!textMessagingEnabled) return

    const nextContext = mergeContext(
      mergeContext(legacyThread?.context || null, buildDefaultContext()),
      options?.context || null
    )

    setTextInquiryContext(nextContext)
    setIsTextInquiryOpen(true)
    trackChatOpened(pathname)
  }

  const showTextMessaging = !isAdminPath && textMessagingEnabled

  return (
    <GuestChatContextObject.Provider value={{ openTextInquiry, textMessagingEnabled }}>
      {children}

      {showTextMessaging && (
        <>
          {!isTextInquiryOpen && (
            <div className="fixed bottom-24 right-4 z-50 lg:bottom-6 lg:right-6">
              <Button
                type="button"
                size="lg"
                className="relative h-auto rounded-[1.75rem] border border-primary/15 px-6 py-4 shadow-2xl"
                onClick={() => openTextInquiry()}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/14">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span className="flex flex-col items-start text-left leading-none">
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground/75">
                      {legacyThread ? "Welcome back" : "Questions?"}
                    </span>
                    <span className="mt-1 text-base font-semibold tracking-tight">Text with us</span>
                  </span>
                </span>
              </Button>
            </div>
          )}

          <TextInquiryDialog
            open={isTextInquiryOpen}
            onOpenChange={setIsTextInquiryOpen}
            context={textInquiryContext}
            initialGuestName={legacyThread?.guestName || ""}
            initialGuestPhone={legacyThread?.guestPhone || ""}
          />
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
