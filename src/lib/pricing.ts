export type OfferScope = "all" | "category"

export type PricingSettings = {
  profitPercent: number
  offerPercent: number
  offerScope: OfferScope
  offerCategoryId: string | null
  coffeePricePerKg: number
}

/** Coffee cost in هزار تومن, same unit as item base prices. */
export function coffeeCostFromKg(pricePerKg: number, grams: number) {
  if (pricePerKg <= 0 || grams <= 0) {
    return 0
  }

  return (pricePerKg / 1000) * grams / 1000
}

export function parsePercent(value: unknown) {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return 0
  }

  return amount
}

/** Menu prices are whole هزار تومن. Always ceil, never decimals. */
export function toWholeMenuPrice(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0
  }

  return Math.ceil(amount)
}

export function applyItemPricing(
  basePrice: string,
  settings: PricingSettings,
  categoryId: string,
  coffeeGrams = 0,
) {
  const base = Number(basePrice)
  const profit = Math.max(0, settings.profitPercent)
  const offer = Math.min(100, Math.max(0, settings.offerPercent))

  if (!Number.isFinite(base)) {
    return { price: basePrice, compareAtPrice: null as string | null }
  }

  const coffeeCost = coffeeCostFromKg(settings.coffeePricePerKg, coffeeGrams)
  const withProfit = (base + coffeeCost) * (1 + profit / 100)
  const offerApplies =
    offer > 0 &&
    (settings.offerScope === "all" ||
      (settings.offerScope === "category" &&
        settings.offerCategoryId === categoryId))

  const final = offerApplies ? withProfit * (1 - offer / 100) : withProfit

  return {
    price: String(toWholeMenuPrice(final)),
    compareAtPrice: offerApplies ? String(toWholeMenuPrice(withProfit)) : null,
  }
}
