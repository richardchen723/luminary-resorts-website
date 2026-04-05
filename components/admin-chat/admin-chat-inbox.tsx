"use client"

import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { trackChatConvertedToInquiry } from "@/lib/analytics"
import { cabins } from "@/lib/cabins"
import { isGuestChatPlaceholderEmail } from "@/lib/guest-chat-utils"
import type {
  GuestChatMessage,
  GuestChatListFilter,
  GuestChatThreadDetail,
  GuestChatThreadStatus,
  GuestChatThreadSummary,
} from "@/types/guest-chat"

type ConversionDraft = {
  listingSlug: string
  checkIn: string
  checkOut: string
  guests: string
  pets: string
  infants: string
  guestPhone: string
}

const filterOptions: Array<{ value: GuestChatListFilter; label: string }> = [
  { value: "open", label: "Open" },
  { value: "waiting_on_team", label: "Waiting on team" },
  { value: "closed", label: "Closed" },
  { value: "spam", label: "Spam" },
]

const cabinOptions = cabins
  .map((cabin) => ({
    slug: cabin.slug,
    name: cabin.name,
  }))
  .sort((left, right) => left.name.localeCompare(right.name))

function formatStatusLabel(status: GuestChatThreadStatus) {
  return status.replace(/_/g, " ")
}

function formatTimestamp(value: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function buildConversionDraft(thread: GuestChatThreadDetail | null): ConversionDraft {
  return {
    listingSlug: thread?.context.listingSlug || "",
    checkIn: thread?.context.checkIn || "",
    checkOut: thread?.context.checkOut || "",
    guests: thread?.context.guests ? String(thread.context.guests) : "",
    pets: thread?.context.pets ? String(thread.context.pets) : "",
    infants: thread?.context.infants ? String(thread.context.infants) : "",
    guestPhone: thread?.guestPhone || "",
  }
}

function getGuestContactLabel(thread: Pick<GuestChatThreadSummary, "guestEmail" | "guestPhone">) {
  if (thread.guestPhone) {
    return thread.guestPhone
  }

  if (isGuestChatPlaceholderEmail(thread.guestEmail)) {
    return "Phone-first chat"
  }

  return thread.guestEmail
}

function SystemMessageCard({ message }: { message: GuestChatMessage }) {
  return (
    <div className="flex justify-center">
      <div className="max-w-[92%] rounded-2xl border border-border bg-muted/35 px-4 py-3 text-sm text-foreground">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          System
        </p>
        <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {formatTimestamp(message.createdAt)}
        </p>
      </div>
    </div>
  )
}

export function AdminChatInbox({
  currentUserId,
  currentUserName,
  initialThreadId,
}: {
  currentUserId: string
  currentUserName: string
  initialThreadId?: string | null
}) {
  const [threads, setThreads] = useState<GuestChatThreadSummary[]>([])
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(initialThreadId || null)
  const [selectedThread, setSelectedThread] = useState<GuestChatThreadDetail | null>(null)
  const [replyBody, setReplyBody] = useState("")
  const [filter, setFilter] = useState<GuestChatListFilter>("open")
  const [conversionDraft, setConversionDraft] = useState<ConversionDraft>(buildConversionDraft(null))
  const [isLoadingThreads, setIsLoadingThreads] = useState(true)
  const [isLoadingThread, setIsLoadingThread] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadThreads = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoadingThreads(true)
    }

    try {
      const response = await fetch(`/api/admin/chat/threads?filter=${filter}`, {
        cache: "no-store",
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load chat threads")
      }

      const nextThreads = (data.threads || []) as GuestChatThreadSummary[]
      setThreads(nextThreads)

      setSelectedThreadId((currentSelectedThreadId) => {
        if (currentSelectedThreadId && nextThreads.some((thread) => thread.id === currentSelectedThreadId)) {
          return currentSelectedThreadId
        }

        if (initialThreadId && nextThreads.some((thread) => thread.id === initialThreadId)) {
          return initialThreadId
        }

        return nextThreads[0]?.id || null
      })

      setError(null)
    } catch (loadError: any) {
      setError(loadError.message || "Failed to load chat threads")
    } finally {
      if (!options?.silent) {
        setIsLoadingThreads(false)
      }
    }
  }, [filter, initialThreadId])

  const markSelectedThreadRead = useCallback(async (threadId: string) => {
    try {
      const response = await fetch(`/api/admin/chat/threads/${threadId}/read`, {
        method: "POST",
      })
      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.thread) {
        return
      }

      const nextThread = data.thread as GuestChatThreadDetail
      setSelectedThread((currentThread) =>
        currentThread?.id === nextThread.id ? nextThread : currentThread
      )
      setThreads((currentThreads) =>
        currentThreads.map((thread) => (thread.id === nextThread.id ? nextThread : thread))
      )
    } catch {
      // Ignore read-state failures in the background.
    }
  }, [])

  const loadThread = useCallback(async (threadId: string, options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoadingThread(true)
    }

    try {
      const response = await fetch(`/api/admin/chat/threads/${threadId}`, {
        cache: "no-store",
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load chat thread")
      }

      const nextThread = data.thread as GuestChatThreadDetail
      setSelectedThread(nextThread)
      if (nextThread.staffUnreadCount > 0) {
        void markSelectedThreadRead(threadId)
      }
      setError(null)
    } catch (loadError: any) {
      setError(loadError.message || "Failed to load chat thread")
    } finally {
      if (!options?.silent) {
        setIsLoadingThread(false)
      }
    }
  }, [markSelectedThreadRead])

  useEffect(() => {
    void loadThreads()
  }, [loadThreads])

  useEffect(() => {
    if (!selectedThreadId) {
      setSelectedThread(null)
      setReplyBody("")
      setConversionDraft(buildConversionDraft(null))
      return
    }

    setReplyBody("")
    void loadThread(selectedThreadId)
  }, [loadThread, selectedThreadId])

  useEffect(() => {
    setConversionDraft(buildConversionDraft(selectedThread))
  }, [selectedThread])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadThreads({ silent: true })
      if (selectedThreadId) {
        void loadThread(selectedThreadId, { silent: true })
      }
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [loadThread, loadThreads, selectedThreadId])

  async function refreshAfterMutation(nextThread?: GuestChatThreadDetail | null) {
    if (nextThread) {
      setSelectedThread(nextThread)
      setSelectedThreadId(nextThread.id)
      setConversionDraft(buildConversionDraft(nextThread))
    }

    await loadThreads({ silent: true })
  }

  async function handleReply() {
    if (!selectedThreadId || !replyBody.trim()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/chat/threads/${selectedThreadId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: replyBody.trim() }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send reply")
      }

      setReplyBody("")
      await refreshAfterMutation(data.thread)
    } catch (replyError: any) {
      setError(replyError.message || "Failed to send reply")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatusChange(status: GuestChatThreadStatus) {
    if (!selectedThreadId) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/chat/threads/${selectedThreadId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update thread status")
      }

      await refreshAfterMutation(data.thread)
    } catch (statusError: any) {
      setError(statusError.message || "Failed to update thread status")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAssign(assignedAdminUserId: string | null) {
    if (!selectedThreadId) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/chat/threads/${selectedThreadId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignedAdminUserId }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update assignment")
      }

      await refreshAfterMutation(data.thread)
    } catch (assignError: any) {
      setError(assignError.message || "Failed to update assignment")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConvertToInquiry() {
    if (!selectedThreadId) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/chat/threads/${selectedThreadId}/convert-inquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingSlug: conversionDraft.listingSlug || null,
          checkIn: conversionDraft.checkIn || null,
          checkOut: conversionDraft.checkOut || null,
          guests: conversionDraft.guests ? Number.parseInt(conversionDraft.guests, 10) : null,
          pets: conversionDraft.pets ? Number.parseInt(conversionDraft.pets, 10) : null,
          infants: conversionDraft.infants ? Number.parseInt(conversionDraft.infants, 10) : null,
          guestPhone: conversionDraft.guestPhone || null,
        }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to convert thread to inquiry")
      }

      trackChatConvertedToInquiry(selectedThreadId)
      await refreshAfterMutation(data.thread)
    } catch (convertError: any) {
      setError(convertError.message || "Failed to convert thread to inquiry")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guest Chat</h1>
          <p className="mt-2 text-muted-foreground">
            Manage website conversations and convert qualified threads to Hostaway inquiries.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadThreads()}>
          Refresh inbox
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={filter === option.value ? "default" : "outline"}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="min-h-[720px]">
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingThreads ? (
              <div className="px-6 py-10 text-sm text-muted-foreground">Loading conversations...</div>
            ) : threads.length === 0 ? (
              <div className="px-6 py-10 text-sm text-muted-foreground">
                No conversations in this filter.
              </div>
            ) : (
              <ScrollArea className="h-[640px]">
                <div className="divide-y divide-border">
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={`w-full px-6 py-4 text-left transition-colors ${
                        selectedThreadId === thread.id ? "bg-muted/50" : "hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{thread.guestName}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {getGuestContactLabel(thread)}
                          </p>
                        </div>
                        {thread.staffUnreadCount > 0 && (
                          <Badge>{thread.staffUnreadCount}</Badge>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant={thread.status === "waiting_on_team" ? "default" : "secondary"}>
                          {formatStatusLabel(thread.status)}
                        </Badge>
                        {thread.assignedAdminName && (
                          <Badge variant="outline">{thread.assignedAdminName}</Badge>
                        )}
                        {thread.hostawayReservationId && (
                          <Badge variant="outline">Hostaway linked</Badge>
                        )}
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {thread.lastMessagePreview || "No messages yet"}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>{thread.context.cabinName || thread.context.listingSlug || "General inquiry"}</span>
                        <span>{formatTimestamp(thread.updatedAt)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-[720px]">
          {selectedThread ? (
            <>
              <CardHeader className="space-y-4 border-b border-border">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle>{selectedThread.guestName}</CardTitle>
                    {!isGuestChatPlaceholderEmail(selectedThread.guestEmail) && (
                      <p className="mt-1 text-sm text-muted-foreground">{selectedThread.guestEmail}</p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedThread.guestPhone || "No phone number yet"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={selectedThread.status === "waiting_on_team" ? "default" : "secondary"}>
                      {formatStatusLabel(selectedThread.status)}
                    </Badge>
                    {selectedThread.hostawayReservationId && (
                      <Badge variant="outline">
                        Hostaway #{selectedThread.hostawayReservationId}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 rounded-md border border-border bg-muted/20 p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Context</p>
                    <p className="mt-2 text-sm text-foreground">
                      {selectedThread.context.cabinName || selectedThread.context.listingSlug || "General inquiry"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedThread.context.checkIn && selectedThread.context.checkOut
                        ? `${selectedThread.context.checkIn} to ${selectedThread.context.checkOut}`
                        : "No dates captured"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedThread.context.guests
                        ? `${selectedThread.context.guests} guest${selectedThread.context.guests === 1 ? "" : "s"}`
                        : "Guest count not captured"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Assignment</p>
                    <p className="mt-2 text-sm text-foreground">
                      {selectedThread.assignedAdminName || "Unassigned"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedThread.assignedAdminUserId === currentUserId ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void handleAssign(null)}
                          disabled={isSubmitting}
                        >
                          Unassign
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void handleAssign(currentUserId)}
                          disabled={isSubmitting}
                        >
                          Assign to {currentUserName}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(selectedThread.status === "waiting_on_team" ||
                    selectedThread.status === "waiting_on_guest") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void handleStatusChange("closed")}
                      disabled={isSubmitting}
                    >
                      Close
                    </Button>
                  )}
                  {(selectedThread.status === "closed" || selectedThread.status === "spam") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void handleStatusChange("waiting_on_team")}
                      disabled={isSubmitting}
                    >
                      Reopen
                    </Button>
                  )}
                  {(selectedThread.status === "waiting_on_team" ||
                    selectedThread.status === "waiting_on_guest") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void handleStatusChange("spam")}
                      disabled={isSubmitting}
                    >
                      Mark spam
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="grid min-h-[620px] gap-6 p-0 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="flex min-h-0 flex-col border-b border-border xl:border-b-0 xl:border-r">
                  {isLoadingThread ? (
                    <div className="px-6 py-10 text-sm text-muted-foreground">Loading messages...</div>
                  ) : (
                    <ScrollArea className="h-[420px] xl:h-[620px]">
                      <div className="space-y-4 p-6">
                        {selectedThread.messages.map((message) => {
                          if (message.authorType === "system") {
                            return <SystemMessageCard key={message.id} message={message} />
                          }

                          const isGuestMessage = message.authorType === "guest"
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isGuestMessage ? "justify-start" : "justify-end"}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                                  isGuestMessage
                                    ? "border border-border bg-muted/30 text-foreground"
                                    : "bg-primary text-primary-foreground"
                                }`}
                              >
                                <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
                                <p
                                  className={`mt-2 text-[11px] ${
                                    isGuestMessage
                                      ? "text-muted-foreground"
                                      : "text-primary-foreground/70"
                                  }`}
                                >
                                  {isGuestMessage
                                    ? selectedThread.guestName
                                    : message.adminUserName || "Luminary"}
                                  {" • "}
                                  {formatTimestamp(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  )}

                  <div className="border-t border-border p-6">
                    <Textarea
                      value={replyBody}
                      onChange={(event) => setReplyBody(event.target.value)}
                      placeholder="Reply to the guest..."
                      rows={5}
                    />
                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => void handleReply()}
                        disabled={isSubmitting || selectedThread.status === "closed" || selectedThread.status === "spam"}
                      >
                        Send reply
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  <div className="space-y-3 rounded-md border border-border p-4">
                    <h2 className="font-semibold text-foreground">Convert to Hostaway inquiry</h2>
                    <p className="text-sm text-muted-foreground">
                      Use this once the thread has the stay details needed for a booking inquiry.
                    </p>

                    <div className="grid gap-3">
                      <Select
                        value={conversionDraft.listingSlug || undefined}
                        onValueChange={(value) =>
                          setConversionDraft((current) => ({
                            ...current,
                            listingSlug: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select cabin" />
                        </SelectTrigger>
                        <SelectContent>
                          {cabinOptions.map((cabin) => (
                            <SelectItem key={cabin.slug} value={cabin.slug}>
                              {cabin.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="date"
                          value={conversionDraft.checkIn}
                          onChange={(event) =>
                            setConversionDraft((current) => ({
                              ...current,
                              checkIn: event.target.value,
                            }))
                          }
                        />
                        <Input
                          type="date"
                          value={conversionDraft.checkOut}
                          onChange={(event) =>
                            setConversionDraft((current) => ({
                              ...current,
                              checkOut: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          type="number"
                          min="1"
                          value={conversionDraft.guests}
                          onChange={(event) =>
                            setConversionDraft((current) => ({
                              ...current,
                              guests: event.target.value,
                            }))
                          }
                          placeholder="Guests"
                        />
                        <Input
                          type="number"
                          min="0"
                          value={conversionDraft.pets}
                          onChange={(event) =>
                            setConversionDraft((current) => ({
                              ...current,
                              pets: event.target.value,
                            }))
                          }
                          placeholder="Pets"
                        />
                        <Input
                          type="number"
                          min="0"
                          value={conversionDraft.infants}
                          onChange={(event) =>
                            setConversionDraft((current) => ({
                              ...current,
                              infants: event.target.value,
                            }))
                          }
                          placeholder="Infants"
                        />
                      </div>
                      <Input
                        value={conversionDraft.guestPhone}
                        onChange={(event) =>
                          setConversionDraft((current) => ({
                            ...current,
                            guestPhone: event.target.value,
                          }))
                        }
                        placeholder="Guest phone"
                      />
                    </div>

                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => void handleConvertToInquiry()}
                      disabled={isSubmitting || !!selectedThread.hostawayReservationId}
                    >
                      {selectedThread.hostawayReservationId ? "Already linked" : "Convert to inquiry"}
                    </Button>
                  </div>

                  <div className="space-y-2 rounded-md border border-border p-4 text-sm">
                    <p className="font-semibold text-foreground">Thread details</p>
                    <p className="text-muted-foreground">
                      Created {formatTimestamp(selectedThread.createdAt)}
                    </p>
                    <p className="text-muted-foreground">
                      Last updated {formatTimestamp(selectedThread.updatedAt)}
                    </p>
                    <p className="text-muted-foreground">
                      Source path: {selectedThread.context.sourcePath || "Not captured"}
                    </p>
                    <p className="text-muted-foreground">
                      Intent: {selectedThread.intent.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex min-h-[720px] items-center justify-center text-sm text-muted-foreground">
              Select a conversation to view messages.
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
