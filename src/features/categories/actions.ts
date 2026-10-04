"use server"

import { revalidatePath } from "next/cache"

import { getStaffSession } from "@/lib/admin/session"
import {
  createCategory,
  deleteCategory,
  listCategories,
  moveCategory,
  updateCategory,
} from "@/lib/menu/category"
import { fail } from "@/lib/menu/result"

async function rejectUnlessManager() {
  const session = await getStaffSession()

  if (session?.role !== "manager") {
    return fail("فقط مدیر می‌تواند دسته‌ها را ویرایش کند")
  }

  return null
}

function refreshCategoryPaths() {
  revalidatePath("/")
  revalidatePath("/admin")
  revalidatePath("/admin/categories")
  revalidatePath("/admin/items")
}

export async function listCategoriesAction() {
  return listCategories()
}

export async function createCategoryAction(_prev: unknown, formData: FormData) {
  const denied = await rejectUnlessManager()

  if (denied) {
    return denied
  }

  const result = await createCategory({
    name: String(formData.get("name") ?? ""),
  })

  if (result.ok) {
    refreshCategoryPaths()
  }

  return result
}

export async function updateCategoryAction(_prev: unknown, formData: FormData) {
  const denied = await rejectUnlessManager()

  if (denied) {
    return denied
  }

  const result = await updateCategory({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    isActive: formData.get("isActive") === "true",
  })

  if (result.ok) {
    refreshCategoryPaths()
  }

  return result
}

export async function deleteCategoryAction(id: string) {
  const denied = await rejectUnlessManager()

  if (denied) {
    return denied
  }

  const result = await deleteCategory(id)

  if (result.ok) {
    refreshCategoryPaths()
  }

  return result
}

export async function moveCategoryAction(id: string, direction: "up" | "down") {
  const denied = await rejectUnlessManager()

  if (denied) {
    return denied
  }

  const result = await moveCategory(id, direction)

  if (result.ok) {
    refreshCategoryPaths()
  }

  return result
}
