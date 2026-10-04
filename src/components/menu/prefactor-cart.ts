import type { MenuItemRecord, MenuItemVariantRecord } from "@/types/menu"

export type PrefactorCartLine = {
  itemId: string
  variantId?: string
  name: string
  unitPrice: string
  quantity: number
}

type Listener = () => void

const listeners = new Set<Listener>()
let lines: PrefactorCartLine[] = []

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

export function cartLineKey(itemId: string, variantId?: string) {
  return variantId ? `${itemId}:${variantId}` : itemId
}

function sameLine(line: PrefactorCartLine, itemId: string, variantId?: string) {
  return line.itemId === itemId && (line.variantId ?? "") === (variantId ?? "")
}

export function getPrefactorCart() {
  return lines
}

export function subscribePrefactorCart(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function addPrefactorItem(
  item: MenuItemRecord,
  variant?: MenuItemVariantRecord,
) {
  if (!item.isAvailable) {
    return
  }

  if ((item.variants?.length ?? 0) > 0 && !variant) {
    return
  }

  const unitPrice = variant?.price ?? item.price
  const name = variant ? `${item.name} · ${variant.title}` : item.name
  const current = lines.find((line) => sameLine(line, item.id, variant?.id))

  if (current) {
    current.quantity = Math.min(99, current.quantity + 1)
    lines = [...lines]
  } else {
    lines = [
      ...lines,
      {
        itemId: item.id,
        variantId: variant?.id,
        name,
        unitPrice,
        quantity: 1,
      },
    ]
  }

  notify()
}

export function setPrefactorQuantity(
  itemId: string,
  quantity: number,
  variantId?: string,
) {
  if (quantity <= 0) {
    lines = lines.filter((line) => !sameLine(line, itemId, variantId))
  } else {
    lines = lines.map((line) =>
      sameLine(line, itemId, variantId)
        ? { ...line, quantity: Math.min(99, quantity) }
        : line,
    )
  }

  notify()
}

export function clearPrefactorCart() {
  lines = []
  notify()
}

export function cartTotal(current = lines) {
  return String(
    Math.ceil(
      current.reduce(
        (sum, line) => sum + (Number(line.unitPrice) || 0) * line.quantity,
        0,
      ),
    ),
  )
}
