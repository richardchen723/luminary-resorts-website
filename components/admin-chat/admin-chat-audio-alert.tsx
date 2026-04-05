"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BellRing, Volume2, VolumeX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { GuestChatThreadSummary } from "@/types/guest-chat"

const THREAD_POLL_INTERVAL_MS = 5000
const ALERT_REPEAT_INTERVAL_MS = 10000
const AUDIO_FADE_IN_SECONDS = 0.01
const AUDIO_FADE_OUT_SECONDS = 0.22
const ALERT_PULSE_STARTS = [0, 0.18, 0.36, 0.72, 1.02, 1.28]
const ALERT_FREQUENCIES = [880, 740, 988, 740, 1108.73, 659.25]
const AUDIO_SAMPLE_RATE = 22050
const AUDIO_DURATION_SECONDS = 1.9
const AUDIO_PEAK_LEVEL = 0.92

function countUnreadStaffMessages(threads: GuestChatThreadSummary[]) {
  return threads.reduce((total, thread) => total + Math.max(thread.staffUnreadCount || 0, 0), 0)
}

function clampAudioSample(value: number) {
  return Math.max(-1, Math.min(1, value))
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index))
  }
}

function buildAlarmAudioUrl() {
  const frameCount = Math.ceil(AUDIO_SAMPLE_RATE * AUDIO_DURATION_SECONDS)
  const bytesPerSample = 2
  const dataByteLength = frameCount * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataByteLength)
  const view = new DataView(buffer)

  writeAscii(view, 0, "RIFF")
  view.setUint32(4, 36 + dataByteLength, true)
  writeAscii(view, 8, "WAVE")
  writeAscii(view, 12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, AUDIO_SAMPLE_RATE, true)
  view.setUint32(28, AUDIO_SAMPLE_RATE * bytesPerSample, true)
  view.setUint16(32, bytesPerSample, true)
  view.setUint16(34, 16, true)
  writeAscii(view, 36, "data")
  view.setUint32(40, dataByteLength, true)

  for (let frame = 0; frame < frameCount; frame += 1) {
    const time = frame / AUDIO_SAMPLE_RATE
    let sample = 0

    ALERT_PULSE_STARTS.forEach((pulseStart, index) => {
      const localTime = time - pulseStart

      if (localTime < 0 || localTime > AUDIO_FADE_OUT_SECONDS) {
        return
      }

      const baseFrequency = ALERT_FREQUENCIES[index] || 880
      const attackProgress = Math.min(localTime / AUDIO_FADE_IN_SECONDS, 1)
      const releaseProgress =
        localTime <= AUDIO_FADE_IN_SECONDS
          ? 1
          : Math.max(0, 1 - (localTime - AUDIO_FADE_IN_SECONDS) / (AUDIO_FADE_OUT_SECONDS - AUDIO_FADE_IN_SECONDS))
      const envelope = attackProgress * releaseProgress
      const squarePrimary = Math.sign(Math.sin(2 * Math.PI * baseFrequency * localTime))
      const squareHarmonic = Math.sign(Math.sin(2 * Math.PI * baseFrequency * 2 * localTime))
      const undertone = Math.sin(2 * Math.PI * baseFrequency * 0.5 * localTime)

      sample += envelope * (0.64 * squarePrimary + 0.42 * squareHarmonic + 0.18 * undertone)
    })

    const softenedSample = Math.tanh(sample * 0.95) * AUDIO_PEAK_LEVEL
    view.setInt16(44 + frame * bytesPerSample, Math.round(clampAudioSample(softenedSample) * 32767), true)
  }

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }))
}

export function AdminChatAudioAlert() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [audioSupported, setAudioSupported] = useState(true)
  const [fetchFailed, setFetchFailed] = useState(false)
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null)
  const alarmAudioUrlRef = useRef<string | null>(null)
  const unreadCountRef = useRef(0)
  const lastPolledUnreadCountRef = useRef(0)

  const ensureAlarmAudio = useCallback(() => {
    if (typeof window === "undefined" || typeof window.Audio === "undefined") {
      setAudioSupported(false)
      setAudioEnabled(false)
      return null
    }

    setAudioSupported(true)

    if (!alarmAudioUrlRef.current) {
      alarmAudioUrlRef.current = buildAlarmAudioUrl()
    }

    if (!alarmAudioRef.current) {
      const audio = new window.Audio(alarmAudioUrlRef.current)
      audio.preload = "auto"
      audio.volume = 1
      alarmAudioRef.current = audio
    }

    return alarmAudioRef.current
  }, [])

  const playUnreadAlert = useCallback(() => {
    const alarmAudio = ensureAlarmAudio()

    if (!alarmAudio) {
      setAudioEnabled(false)
      return false
    }

    try {
      alarmAudio.pause()
      alarmAudio.currentTime = 0
      const playPromise = alarmAudio.play()

      if (playPromise) {
        void playPromise
          .then(() => {
            setAudioEnabled(true)
          })
          .catch(() => {
            setAudioEnabled(false)
          })
      } else {
        setAudioEnabled(true)
      }
    } catch {
      setAudioEnabled(false)
      return false
    }

    return true
  }, [ensureAlarmAudio])

  const primeAudioPlayback = useCallback(async () => {
    const alarmAudio = ensureAlarmAudio()

    if (!alarmAudio) {
      return
    }

    try {
      alarmAudio.pause()
      alarmAudio.currentTime = 0
      alarmAudio.muted = true
      const playPromise = alarmAudio.play()
      if (playPromise) {
        await playPromise
      }

      window.setTimeout(() => {
        if (!alarmAudioRef.current) {
          return
        }

        alarmAudioRef.current.pause()
        alarmAudioRef.current.currentTime = 0
        alarmAudioRef.current.muted = false
      }, 40)

      setAudioEnabled(true)
    } catch {
      alarmAudio.muted = false
      setAudioEnabled(false)
    }
  }, [ensureAlarmAudio])

  const pollUnreadMessages = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/admin/chat/threads?filter=open", {
        cache: "no-store",
        signal,
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load guest chat alerts")
      }

      const threads = (data?.threads || []) as GuestChatThreadSummary[]
      const nextUnreadCount = countUnreadStaffMessages(threads)

      setFetchFailed(false)
      setUnreadCount(nextUnreadCount)
      unreadCountRef.current = nextUnreadCount

      if (
        nextUnreadCount > 0 &&
        nextUnreadCount > lastPolledUnreadCountRef.current
      ) {
        playUnreadAlert()
      }

      lastPolledUnreadCountRef.current = nextUnreadCount
    } catch (error: any) {
      if (error?.name === "AbortError") {
        return
      }

      setFetchFailed(true)
    }
  }, [playUnreadAlert])

  useEffect(() => {
    const abortController = new AbortController()

    void pollUnreadMessages(abortController.signal)

    const intervalId = window.setInterval(() => {
      void pollUnreadMessages()
    }, THREAD_POLL_INTERVAL_MS)

    return () => {
      abortController.abort()
      window.clearInterval(intervalId)
    }
  }, [pollUnreadMessages])

  useEffect(() => {
    if (unreadCount <= 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      playUnreadAlert()
    }, ALERT_REPEAT_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [playUnreadAlert, unreadCount])

  useEffect(() => {
    if (!audioSupported || audioEnabled) {
      return
    }

    const handleInteraction = () => {
      void primeAudioPlayback()
    }

    window.addEventListener("pointerdown", handleInteraction)
    window.addEventListener("keydown", handleInteraction)

    return () => {
      window.removeEventListener("pointerdown", handleInteraction)
      window.removeEventListener("keydown", handleInteraction)
    }
  }, [audioEnabled, audioSupported, primeAudioPlayback])

  useEffect(() => {
    return () => {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause()
        alarmAudioRef.current.src = ""
        alarmAudioRef.current.load()
      }

      alarmAudioRef.current = null

      if (alarmAudioUrlRef.current) {
        URL.revokeObjectURL(alarmAudioUrlRef.current)
        alarmAudioUrlRef.current = null
      }
    }
  }, [])

  if (!audioSupported) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm px-4 sm:px-0">
        <Card className="border-destructive/40 bg-card/95 shadow-lg backdrop-blur">
          <CardContent className="flex items-start gap-3 p-5">
            <VolumeX className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">Guest chat sound alerts unavailable</p>
              <p className="text-sm text-muted-foreground">
                This browser does not support audio playback for the repeating guest-message alarm.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (audioEnabled && unreadCount === 0 && !fetchFailed) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm px-4 sm:px-0">
      <Card className="border-amber-500/30 bg-card/95 shadow-lg backdrop-blur">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start gap-3">
            {audioEnabled ? (
              <BellRing className="mt-0.5 h-5 w-5 text-amber-600" />
            ) : (
              <Volume2 className="mt-0.5 h-5 w-5 text-amber-600" />
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">Guest chat audio alerts</p>
                {unreadCount > 0 && <Badge variant="destructive">{unreadCount} unread</Badge>}
              </div>

              {!audioEnabled ? (
                <p className="text-sm text-muted-foreground">
                  Enable sound once and the browser will play a loud repeating alarm every 10 seconds until unread guest messages are opened.
                </p>
              ) : unreadCount > 0 ? (
                <p className="text-sm text-muted-foreground">
                  An unread guest message is waiting. The alarm will keep repeating every 10 seconds until a teammate reads it.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Alerts are armed and watching for new guest messages.
                </p>
              )}

              {fetchFailed && (
                <p className="text-sm text-destructive">
                  Guest chat alerts are temporarily disconnected. Refresh the page if this keeps happening.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {!audioEnabled && (
              <Button type="button" className="flex-1" onClick={() => void primeAudioPlayback()}>
                Enable loud alerts
              </Button>
            )}
            <Button
              type="button"
              variant={audioEnabled ? "outline" : "secondary"}
              className="flex-1"
              onClick={() => {
                playUnreadAlert()
              }}
            >
              Test alarm
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
