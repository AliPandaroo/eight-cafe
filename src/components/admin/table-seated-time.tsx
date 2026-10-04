"use client"

import { useSyncExternalStore } from "react"

import {
  formatSeatedDuration,
  seatedMinutes,
} from "@/lib/table/duration"

const TICK_MS = 15_000

let cachedNow = 0

function getClientSnapshot() {
  if (cachedNow === 0) {
    cachedNow = Date.now()
  }

  return cachedNow
}

function subscribe(onStoreChange: () => void) {
  const timer = window.setInterval(() => {
    cachedNow = Date.now()
    onStoreChange()
  }, TICK_MS)

  return () => window.clearInterval(timer)
}

export function TableSeatedTime({
  seatedAt,
  now,
}: {
  seatedAt: string
  now: number
}) {
  const live = useSyncExternalStore(subscribe, getClientSnapshot, () => now)

  return (
    <p className="text-[11px] text-text/70">
      نشسته {formatSeatedDuration(seatedMinutes(seatedAt, live || now))}
    </p>
  )
}
