"use server";

import { rejectUnlessManager as denyUnlessManager } from "@/lib/admin/guard";
import { revalidatePaths } from "@/lib/admin/revalidate";
import {
  createCategory,
  deleteCategory,
  listCategories,
  moveCategory,
  updateCategory,
} from "@/lib/menu/category";

async function rejectUnlessManager() {
  return denyUnlessManager("فقط مدیر می‌تواند دسته‌ها را ویرایش کند");
}

function refreshCategoryPaths() {
  revalidatePaths("/", "/admin", "/admin/categories", "/admin/items");
}

export async function listCategoriesAction() {
  return listCategories();
}

export async function createCategoryAction(_prev: unknown, formData: FormData) {
  const denied = await rejectUnlessManager();

  if (denied) {
    return denied;
  }

  const result = await createCategory({
    name: String(formData.get("name") ?? ""),
  });

  if (result.ok) {
    refreshCategoryPaths();
  }

  return result;
}

export async function updateCategoryAction(_prev: unknown, formData: FormData) {
  const denied = await rejectUnlessManager();

  if (denied) {
    return denied;
  }

  const result = await updateCategory({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    isActive: formData.get("isActive") === "true",
  });

  if (result.ok) {
    refreshCategoryPaths();
  }

  return result;
}

export async function deleteCategoryAction(id: string) {
  const denied = await rejectUnlessManager();

  if (denied) {
    return denied;
  }

  const result = await deleteCategory(id);

  if (result.ok) {
    refreshCategoryPaths();
  }

  return result;
}

export async function moveCategoryAction(id: string, direction: "up" | "down") {
  const denied = await rejectUnlessManager();

  if (denied) {
    return denied;
  }

  const result = await moveCategory(id, direction);

  if (result.ok) {
    refreshCategoryPaths();
  }

  return result;
}
