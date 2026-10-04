import { formatPrice } from "@/lib/format"

export function MoneyStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius)] border border-foreground/15 p-4">
      <p className="text-[11px] text-text/70">{label}</p>
      <p className="mt-2 text-sm font-semibold">
        {formatPrice(
          String(value),
          null,
          value < 0 ? "text-red-400" : "text-foreground",
        )}
      </p>
    </div>
  )
}
