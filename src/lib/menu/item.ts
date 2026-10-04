import type { Row } from "@libsql/client"
import { createId, db, ensureSchema, fromBoolean, nowIso, toBoolean } from "@/lib/db/client"
import { getRestaurant } from "@/lib/db/restaurant"
import { fail, ok, type ActionResult } from "@/lib/menu/result"
import { fieldErrorsFromZod } from "@/lib/menu/validation"
import {
  createMenuItemSchema,
  updateMenuItemSchema,
} from "@/lib/validation/item"
import type { MenuItemRecord, MenuItemVariantRecord } from "@/types/menu"

function normalizePrice(value: unknown) {
  const amount = Number(value)
  return Number.isFinite(amount) ? String(amount) : String(value)
}

function mapMenuItem(row: Row): MenuItemRecord {
  return {
    id: String(row.id),
    categoryId: String(row.categoryId),
    name: String(row.name),
    description: String(row.description),
    price: normalizePrice(row.price),
    coffeeGrams: Number(row.coffeeGrams ?? 0) || 0,
    imageUrl: row.imageUrl == null ? null : String(row.imageUrl),
    isAvailable: toBoolean(Number(row.isAvailable)),
    sortOrder: Number(row.sortOrder),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
    variants: [],
  }
}

async function variantsForItems(itemIds: string[]) {
  if (itemIds.length === 0) {
    return new Map<string, MenuItemVariantRecord[]>()
  }

  await ensureSchema()
  const placeholders = itemIds.map(() => "?").join(", ")
  const result = await db.execute({
    sql: `SELECT id, itemId, title, price, sortOrder
          FROM MenuItemVariant
          WHERE itemId IN (${placeholders})
          ORDER BY sortOrder ASC, createdAt ASC`,
    args: itemIds,
  })

  const grouped = new Map<string, MenuItemVariantRecord[]>()

  for (const row of result.rows) {
    const itemId = String(row.itemId)
    const list = grouped.get(itemId) ?? []
    list.push({
      id: String(row.id),
      title: String(row.title),
      price: normalizePrice(row.price),
      sortOrder: Number(row.sortOrder),
    })
    grouped.set(itemId, list)
  }

  return grouped
}

async function attachVariants(items: MenuItemRecord[]) {
  const grouped = await variantsForItems(items.map((item) => item.id))

  for (const item of items) {
    item.variants = grouped.get(item.id) ?? []
  }

  return items
}

async function replaceVariants(
  itemId: string,
  variants: Array<{ id?: string; title: string; price: string }>,
) {
  await ensureSchema()
  await db.execute({
    sql: "DELETE FROM MenuItemVariant WHERE itemId = ?",
    args: [itemId],
  })

  const now = nowIso()

  for (const [index, variant] of variants.entries()) {
    await db.execute({
      sql: `INSERT INTO MenuItemVariant
              (id, itemId, title, price, sortOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        variant.id || createId(),
        itemId,
        variant.title,
        variant.price,
        index,
        now,
        now,
      ],
    })
  }
}

function normalizeImageUrl(value: string | null | undefined) {
  if (value === undefined) {
    return undefined
  }

  if (value === null || value === "") {
    return null
  }

  return value
}

async function assertCategoryInRestaurant(categoryId: string) {
  const restaurant = await getRestaurant()
  const result = await db.execute({
    sql: "SELECT id FROM Category WHERE id = ? AND restaurantId = ?",
    args: [categoryId, restaurant.id],
  })

  return Boolean(result.rows[0])
}

export async function getMenuItem(
  id: string,
): Promise<ActionResult<MenuItemRecord>> {
  if (!id) {
    return fail("Menu item id is required")
  }

  try {
    const restaurant = await getRestaurant()
    const result = await db.execute({
      sql: `SELECT MenuItem.id, MenuItem.categoryId, MenuItem.name, MenuItem.description,
                   MenuItem.price, MenuItem.coffeeGrams, MenuItem.imageUrl, MenuItem.isAvailable, MenuItem.sortOrder,
                   MenuItem.createdAt, MenuItem.updatedAt
            FROM MenuItem
            INNER JOIN Category ON Category.id = MenuItem.categoryId
            WHERE MenuItem.id = ? AND Category.restaurantId = ?`,
      args: [id, restaurant.id],
    })

    const row = result.rows[0]
    if (!row) {
      return fail("Menu item not found")
    }

    const item = mapMenuItem(row)
    await attachVariants([item])
    return ok(item)
  } catch (error) {
    console.error(error)
    return fail("Unable to load menu item")
  }
}

export async function listMenuItems(filters?: {
  categoryId?: string
}): Promise<ActionResult<MenuItemRecord[]>> {
  try {
    const restaurant = await getRestaurant()
    const result = filters?.categoryId
      ? await db.execute({
          sql: `SELECT MenuItem.id, MenuItem.categoryId, MenuItem.name, MenuItem.description,
                       MenuItem.price, MenuItem.coffeeGrams, MenuItem.imageUrl, MenuItem.isAvailable, MenuItem.sortOrder,
                       MenuItem.createdAt, MenuItem.updatedAt
                FROM MenuItem
                INNER JOIN Category ON Category.id = MenuItem.categoryId
                WHERE Category.restaurantId = ? AND MenuItem.categoryId = ?
                ORDER BY MenuItem.sortOrder ASC, MenuItem.createdAt ASC`,
          args: [restaurant.id, filters.categoryId],
        })
      : await db.execute({
          sql: `SELECT MenuItem.id, MenuItem.categoryId, MenuItem.name, MenuItem.description,
                       MenuItem.price, MenuItem.coffeeGrams, MenuItem.imageUrl, MenuItem.isAvailable, MenuItem.sortOrder,
                       MenuItem.createdAt, MenuItem.updatedAt
                FROM MenuItem
                INNER JOIN Category ON Category.id = MenuItem.categoryId
                WHERE Category.restaurantId = ?
                ORDER BY MenuItem.sortOrder ASC, MenuItem.createdAt ASC`,
          args: [restaurant.id],
        })

    return ok(await attachVariants(result.rows.map(mapMenuItem)))
  } catch (error) {
    console.error(error)
    return fail("Unable to load menu items")
  }
}

export async function createMenuItem(
  input: unknown,
): Promise<ActionResult<MenuItemRecord>> {
  const parsed = createMenuItemSchema.safeParse(input)

  if (!parsed.success) {
    return fail("Invalid menu item data", fieldErrorsFromZod(parsed.error))
  }

  try {
    const categoryExists = await assertCategoryInRestaurant(
      parsed.data.categoryId,
    )

    if (!categoryExists) {
      return fail("Category not found")
    }

    const existing = await db.execute({
      sql: "SELECT sortOrder FROM MenuItem WHERE categoryId = ?",
      args: [parsed.data.categoryId],
    })

    const maxSort = existing.rows.reduce(
      (max, row) => Math.max(max, Number(row.sortOrder)),
      -1,
    )

    const item: MenuItemRecord = {
      id: crypto.randomUUID(),
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      description: parsed.data.description ?? "",
      price: parsed.data.price,
      coffeeGrams: parsed.data.coffeeGrams ?? 0,
      imageUrl: normalizeImageUrl(parsed.data.imageUrl) ?? null,
      isAvailable: parsed.data.isAvailable ?? true,
      sortOrder: parsed.data.sortOrder ?? maxSort + 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      variants: [],
    }

    await db.execute({
      sql: `INSERT INTO MenuItem
              (id, categoryId, name, description, price, coffeeGrams, imageUrl, isAvailable, sortOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        item.id,
        item.categoryId,
        item.name,
        item.description,
        item.price,
        String(item.coffeeGrams),
        item.imageUrl,
        fromBoolean(item.isAvailable),
        item.sortOrder,
        item.createdAt,
        item.updatedAt,
      ],
    })

    await replaceVariants(item.id, parsed.data.variants ?? [])
    await attachVariants([item])
    return ok(item)
  } catch (error) {
    console.error(error)
    return fail("Unable to create menu item")
  }
}

export async function updateMenuItem(
  input: unknown,
): Promise<ActionResult<MenuItemRecord>> {
  const parsed = updateMenuItemSchema.safeParse(input)

  if (!parsed.success) {
    return fail("Invalid menu item data", fieldErrorsFromZod(parsed.error))
  }

  try {
    const restaurant = await getRestaurant()
    const currentResult = await db.execute({
      sql: `SELECT MenuItem.id, MenuItem.categoryId, MenuItem.name, MenuItem.description,
                   MenuItem.price, MenuItem.coffeeGrams, MenuItem.imageUrl, MenuItem.isAvailable, MenuItem.sortOrder,
                   MenuItem.createdAt, MenuItem.updatedAt
            FROM MenuItem
            INNER JOIN Category ON Category.id = MenuItem.categoryId
            WHERE MenuItem.id = ? AND Category.restaurantId = ?`,
      args: [parsed.data.id, restaurant.id],
    })

    const currentRow = currentResult.rows[0]
    if (!currentRow) {
      return fail("Menu item not found")
    }

    const current = mapMenuItem(currentRow)

    if (
      parsed.data.categoryId &&
      parsed.data.categoryId !== current.categoryId
    ) {
      const categoryExists = await assertCategoryInRestaurant(
        parsed.data.categoryId,
      )

      if (!categoryExists) {
        return fail("Category not found")
      }
    }

    const nextImageUrl = normalizeImageUrl(parsed.data.imageUrl)
    const item: MenuItemRecord = {
      ...current,
      categoryId: parsed.data.categoryId ?? current.categoryId,
      name: parsed.data.name ?? current.name,
      description: parsed.data.description ?? current.description,
      price: parsed.data.price ?? current.price,
      coffeeGrams: parsed.data.coffeeGrams ?? current.coffeeGrams,
      imageUrl: nextImageUrl === undefined ? current.imageUrl : nextImageUrl,
      isAvailable: parsed.data.isAvailable ?? current.isAvailable,
      sortOrder: parsed.data.sortOrder ?? current.sortOrder,
      updatedAt: nowIso(),
      variants: current.variants,
    }

    await db.execute({
      sql: `UPDATE MenuItem
            SET categoryId = ?, name = ?, description = ?, price = ?, coffeeGrams = ?, imageUrl = ?,
                isAvailable = ?, sortOrder = ?, updatedAt = ?
            WHERE id = ?`,
      args: [
        item.categoryId,
        item.name,
        item.description,
        item.price,
        String(item.coffeeGrams),
        item.imageUrl,
        fromBoolean(item.isAvailable),
        item.sortOrder,
        item.updatedAt,
        item.id,
      ],
    })

    if (parsed.data.variants) {
      await replaceVariants(item.id, parsed.data.variants)
    }

    await attachVariants([item])
    return ok(item)
  } catch (error) {
    console.error(error)
    return fail("Unable to update menu item")
  }
}

export async function deleteMenuItem(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  if (!id) {
    return fail("Menu item id is required")
  }

  try {
    const restaurant = await getRestaurant()
    const current = await db.execute({
      sql: `SELECT MenuItem.id
            FROM MenuItem
            INNER JOIN Category ON Category.id = MenuItem.categoryId
            WHERE MenuItem.id = ? AND Category.restaurantId = ?`,
      args: [id, restaurant.id],
    })

    if (!current.rows[0]) {
      return fail("Menu item not found")
    }

    await db.execute({
      sql: "DELETE FROM MenuItem WHERE id = ?",
      args: [id],
    })

    return ok({ id })
  } catch (error) {
    console.error(error)
    return fail("Unable to delete menu item")
  }
}

export async function moveMenuItem(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult<MenuItemRecord[]>> {
  const current = await getMenuItem(id)

  if (!current.ok) {
    return current
  }

  const listed = await listMenuItems({ categoryId: current.data.categoryId })

  if (!listed.ok) {
    return listed
  }

  const index = listed.data.findIndex((item) => item.id === id)

  if (index === -1) {
    return fail("Menu item not found")
  }

  const swapWith = direction === "up" ? index - 1 : index + 1

  if (swapWith < 0 || swapWith >= listed.data.length) {
    return ok(listed.data)
  }

  try {
    const item = listed.data[index]
    const neighbor = listed.data[swapWith]

    await db.execute({
      sql: "UPDATE MenuItem SET sortOrder = ?, updatedAt = ? WHERE id = ?",
      args: [neighbor.sortOrder, nowIso(), item.id],
    })
    await db.execute({
      sql: "UPDATE MenuItem SET sortOrder = ?, updatedAt = ? WHERE id = ?",
      args: [item.sortOrder, nowIso(), neighbor.id],
    })

    return listMenuItems({ categoryId: current.data.categoryId })
  } catch (error) {
    console.error(error)
    return fail("Unable to reorder menu items")
  }
}
