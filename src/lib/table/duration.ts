import { formatInteger } from "@/lib/format"

export function seatedMinutes(seatedAt: string, now = Date.now()) {
  const started = new Date(seatedAt).getTime()

  if (!Number.isFinite(started)) {
    return 0
  }

  return Math.max(0, Math.floor((now - started) / 60_000))
}

export function formatSeatedDuration(minutes: number) {
  const count = formatInteger(minutes)

  if (minutes < 60) {
    return `${count} دقیقه`
  }

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (rest === 0) {
    return `${formatInteger(hours)} ساعت`
  }

  return `${formatInteger(hours)} ساعت و ${formatInteger(rest)} دقیقه`
}
