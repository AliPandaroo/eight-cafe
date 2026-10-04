import type { Row } from "@libsql/client"
import { db, fromBoolean, nowIso, toBoolean } from "@/lib/db/client"
import { getRestaurant } from "@/lib/db/restaurant"
import { fail, ok, type ActionResult } from "@/lib/menu/result"
import { slugify, uniqueSlug } from "@/lib/menu/slug"
import { fieldErrorsFromZod } from "@/lib/menu/validation"
import {
  createCategorySchema,
  updateCategorySchema,
} from "@/lib/validation/category"
import type { CategoryRecord } from "@/types/menu"

function mapCategory(row: Row): CategoryRecord {
  return {
    id: String(row.id),
    restaurantId: String(row.restaurantId),
    name: String(row.name),
    slug: String(row.slug),
    sortOrder: Number(row.sortOrder),
    isActive: toBoolean(Number(row.isActive)),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  }
}

export async function listCategories(): Promise<
  ActionResult<CategoryRecord[]>
> {
  try {
    const restaurant = await getRestaurant()
    const result = await db.execute({
      sql: `SELECT id, restaurantId, name, slug, sortOrder, isActive, createdAt, updatedAt
            FROM Category
            WHERE restaurantId = ?
            ORDER BY sortOrder ASC, createdAt ASC`,
      args: [restaurant.id],
    })

    return ok(result.rows.map(mapCategory))
  } catch (error) {
    console.error(error)
    return fail("Unable to load categories")
  }
}

export async function createCategory(
  input: unknown,
): Promise<ActionResult<CategoryRecord>> {
  const parsed = createCategorySchema.safeParse(input)

  if (!parsed.success) {
    return fail("Invalid category data", fieldErrorsFromZod(parsed.error))
  }

  try {
    const restaurant = await getRestaurant()
    const existing = await db.execute({
      sql: "SELECT slug, sortOrder FROM Category WHERE restaurantId = ?",
      args: [restaurant.id],
    })

    const slug = uniqueSlug(
      slugify(parsed.data.name),
      existing.rows.map((row) => String(row.slug)),
    )

    const maxSort = existing.rows.reduce(
      (max, row) => Math.max(max, Number(row.sortOrder)),
      -1,
    )

    const category: CategoryRecord = {
      id: crypto.randomUUID(),
      restaurantId: restaurant.id,
      name: parsed.data.name,
      slug,
      sortOrder: parsed.data.sortOrder ?? maxSort + 1,
      isActive: parsed.data.isActive ?? true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    await db.execute({
      sql: `INSERT INTO Category
              (id, restaurantId, name, slug, sortOrder, isActive, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        category.id,
        category.restaurantId,
        category.name,
        category.slug,
        category.sortOrder,
        fromBoolean(category.isActive),
        category.createdAt,
        category.updatedAt,
      ],
    })

    return ok(category)
  } catch (error) {
    console.error(error)
    return fail("Unable to create category")
  }
}

export async function updateCategory(
  input: unknown,
): Promise<ActionResult<CategoryRecord>> {
  const parsed = updateCategorySchema.safeParse(input)

  if (!parsed.success) {
    return fail("Invalid category data", fieldErrorsFromZod(parsed.error))
  }

  try {
    const restaurant = await getRestaurant()
    const currentResult = await db.execute({
      sql: `SELECT id, restaurantId, name, slug, sortOrder, isActive, createdAt, updatedAt
            FROM Category
            WHERE id = ? AND restaurantId = ?`,
      args: [parsed.data.id, restaurant.id],
    })

    const currentRow = currentResult.rows[0]
    if (!currentRow) {
      return fail("Category not found")
    }

    const current = mapCategory(currentRow)
    let slug = current.slug

    if (parsed.data.name && parsed.data.name !== current.name) {
      const existing = await db.execute({
        sql: "SELECT slug FROM Category WHERE restaurantId = ? AND id != ?",
        args: [restaurant.id, current.id],
      })

      slug = uniqueSlug(
        slugify(parsed.data.name),
        existing.rows.map((row) => String(row.slug)),
      )
    }

    const category: CategoryRecord = {
      ...current,
      name: parsed.data.name ?? current.name,
      slug,
      sortOrder: parsed.data.sortOrder ?? current.sortOrder,
      isActive: parsed.data.isActive ?? current.isActive,
      updatedAt: nowIso(),
    }

    await db.execute({
      sql: `UPDATE Category
            SET name = ?, slug = ?, sortOrder = ?, isActive = ?, updatedAt = ?
            WHERE id = ?`,
      args: [
        category.name,
        category.slug,
        category.sortOrder,
        fromBoolean(category.isActive),
        category.updatedAt,
        category.id,
      ],
    })

    return ok(category)
  } catch (error) {
    console.error(error)
    return fail("Unable to update category")
  }
}

export async function deleteCategory(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  if (!id) {
    return fail("Category id is required")
  }

  try {
    const restaurant = await getRestaurant()
    const current = await db.execute({
      sql: "SELECT id FROM Category WHERE id = ? AND restaurantId = ?",
      args: [id, restaurant.id],
    })

    if (!current.rows[0]) {
      return fail("Category not found")
    }

    await db.execute({
      sql: "DELETE FROM MenuItem WHERE categoryId = ?",
      args: [id],
    })
    await db.execute({
      sql: "DELETE FROM Category WHERE id = ?",
      args: [id],
    })

    return ok({ id })
  } catch (error) {
    console.error(error)
    return fail("Unable to delete category")
  }
}

export async function moveCategory(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult<CategoryRecord[]>> {
  const listed = await listCategories()

  if (!listed.ok) {
    return listed
  }

  const index = listed.data.findIndex((category) => category.id === id)

  if (index === -1) {
    return fail("Category not found")
  }

  const swapWith = direction === "up" ? index - 1 : index + 1

  if (swapWith < 0 || swapWith >= listed.data.length) {
    return ok(listed.data)
  }

  try {
    const current = listed.data[index]
    const neighbor = listed.data[swapWith]

    await db.execute({
      sql: "UPDATE Category SET sortOrder = ?, updatedAt = ? WHERE id = ?",
      args: [neighbor.sortOrder, nowIso(), current.id],
    })
    await db.execute({
      sql: "UPDATE Category SET sortOrder = ?, updatedAt = ? WHERE id = ?",
      args: [current.sortOrder, nowIso(), neighbor.id],
    })

    return listCategories()
  } catch (error) {
    console.error(error)
    return fail("Unable to reorder categories")
  }
}
