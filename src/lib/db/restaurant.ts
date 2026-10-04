import { createId, db, ensureSchema, nowIso } from "@/lib/db/client"
import { parsePercent, type OfferScope } from "@/lib/pricing"
import { RESTAURANT } from "@/lib/restaurant"

export type RestaurantRecord = {
  id: string
  name: string
  slug: string
  profitPercent: number
  offerPercent: number
  offerScope: OfferScope
  offerCategoryId: string | null
  coffeePricePerKg: number
  createdAt: string
  updatedAt: string
}

type RestaurantRow = {
  id: string
  name: string
  slug: string
  profitPercent?: string | number | null
  offerPercent?: string | number | null
  offerScope?: string | null
  offerCategoryId?: string | null
  coffeePricePerKg?: string | number | null
  createdAt: string
  updatedAt: string
}

function mapRestaurant(row: RestaurantRow): RestaurantRecord {
  const offerScope = row.offerScope === "category" ? "category" : "all"

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    profitPercent: parsePercent(row.profitPercent),
    offerPercent: parsePercent(row.offerPercent),
    offerScope,
    offerCategoryId: row.offerCategoryId ?? null,
    coffeePricePerKg: parsePercent(row.coffeePricePerKg),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getRestaurant() {
  await ensureSchema()

  const existing = await db.execute({
    sql: `SELECT id, name, slug, profitPercent, offerPercent, offerScope, offerCategoryId, coffeePricePerKg, createdAt, updatedAt
          FROM Restaurant WHERE slug = ?`,
    args: [RESTAURANT.slug],
  })

  if (existing.rows[0]) {
    return mapRestaurant(existing.rows[0] as unknown as RestaurantRow)
  }

  const restaurant: RestaurantRecord = {
    id: createId(),
    name: RESTAURANT.name,
    slug: RESTAURANT.slug,
    profitPercent: 0,
    offerPercent: 0,
    offerScope: "all",
    offerCategoryId: null,
    coffeePricePerKg: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  await db.execute({
    sql: `INSERT INTO Restaurant (
            id, name, slug, profitPercent, offerPercent, offerScope, offerCategoryId, coffeePricePerKg, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      restaurant.id,
      restaurant.name,
      restaurant.slug,
      String(restaurant.profitPercent),
      String(restaurant.offerPercent),
      restaurant.offerScope,
      restaurant.offerCategoryId,
      String(restaurant.coffeePricePerKg),
      restaurant.createdAt,
      restaurant.updatedAt,
    ],
  })

  return restaurant
}

export async function updateRestaurantSettings(input: {
  name: string
  profitPercent: number
  offerPercent: number
  offerScope: OfferScope
  offerCategoryId: string | null
  coffeePricePerKg: number
}) {
  const restaurant = await getRestaurant()
  const nextName = input.name.trim()

  if (!nextName) {
    return restaurant
  }

  const offerCategoryId =
    input.offerScope === "category" ? input.offerCategoryId : null
  const updatedAt = nowIso()

  await db.execute({
    sql: `UPDATE Restaurant
          SET name = ?, profitPercent = ?, offerPercent = ?, offerScope = ?, offerCategoryId = ?, coffeePricePerKg = ?, updatedAt = ?
          WHERE id = ?`,
    args: [
      nextName,
      String(input.profitPercent),
      String(input.offerPercent),
      input.offerScope,
      offerCategoryId,
      String(input.coffeePricePerKg),
      updatedAt,
      restaurant.id,
    ],
  })

  return {
    ...restaurant,
    name: nextName,
    profitPercent: input.profitPercent,
    offerPercent: input.offerPercent,
    offerScope: input.offerScope,
    offerCategoryId,
    coffeePricePerKg: input.coffeePricePerKg,
    updatedAt,
  }
}
