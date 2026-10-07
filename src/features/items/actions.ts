"use server";

import { redirect } from "next/navigation";

import {
  createMenuItem,
  deleteMenuItem,
  getMenuItem,
  listMenuItems,
  moveMenuItem,
  updateMenuItem,
} from "@/lib/menu/item";
import {
  isUploadFile,
  removeLocalImage,
  saveMenuImage,
} from "@/lib/menu/upload";
import { rejectUnlessManager as denyUnlessManager } from "@/lib/admin/guard";
import { revalidatePaths } from "@/lib/admin/revalidate";
import { fail } from "@/lib/menu/result";
import { adminInputToPrice } from "@/lib/format";

async function rejectUnlessManager() {
  return denyUnlessManager("فقط مدیر می‌تواند منو را ویرایش کند");
}

function refreshItemPaths() {
  revalidatePaths("/", "/admin", "/admin/items", "/admin/categories");
}

async function resolveImageUrl(formData: FormData, currentUrl?: string | null) {
  const uploaded = formData.get("image");
  const removeImage = formData.get("removeImage") === "true";

  if (isUploadFile(uploaded)) {
    const saved = await saveMenuImage(uploaded);

    if (!saved.ok) {
      return saved;
    }

    await removeLocalImage(currentUrl);
    return { ok: true as const, url: saved.url };
  }

  if (removeImage) {
    await removeLocalImage(currentUrl);
    return { ok: true as const, url: null };
  }

  return { ok: true as const, url: currentUrl ?? undefined };
}

export async function listMenuItemsAction(filters?: { categoryId?: string }) {
  return listMenuItems(filters);
}

export async function saveMenuItemAction(_prev: unknown, formData: FormData) {
  const denied = await rejectUnlessManager();

  if (denied) {
    return denied;
  }

  const id = String(formData.get("id") ?? "");
  const current = id ? await getMenuItem(id) : null;

  if (id && current && !current.ok) {
    return current;
  }

  const image = await resolveImageUrl(
    formData,
    current && current.ok ? current.data.imageUrl : null,
  );

  if (!image.ok) {
    return fail(image.error);
  }

  const hasVariants = formData.get("hasVariants") === "true";
  const titles = formData.getAll("variantTitle").map(String);
  const prices = formData.getAll("variantPrice").map(String);
  const grams = formData.getAll("variantCoffeeGrams").map(String);
  const ids = formData.getAll("variantId").map(String);
  const variants = hasVariants
    ? titles
        .map((title, index) => ({
          id: ids[index] || undefined,
          title: title.trim(),
          price: adminInputToPrice(prices[index] ?? ""),
          coffeeGrams: grams[index] ?? "",
        }))
        .filter((variant) => variant.title)
    : [];

  if (hasVariants && variants.length < 1) {
    return fail("حداقل یک سایز لازم است");
  }

  const basePrice = hasVariants
    ? String(Math.min(...variants.map((variant) => Number(variant.price) || 0)))
    : adminInputToPrice(String(formData.get("price") ?? ""));

  const payload = {
    categoryId: String(formData.get("categoryId") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: basePrice,
    coffeeGrams: hasVariants
      ? String(
          Math.max(
            0,
            ...variants.map((variant) => Number(variant.coffeeGrams) || 0),
          ),
        )
      : String(formData.get("coffeeGrams") ?? ""),
    imageUrl: image.url,
    isAvailable: formData.get("isAvailable") === "true",
    variants,
  };

  const result = id
    ? await updateMenuItem({ id, ...payload })
    : await createMenuItem(payload);

  if (!result.ok) {
    return result;
  }

  refreshItemPaths();
  redirect("/admin/items");
}

export async function toggleMenuItemAvailabilityAction(
  id: string,
  isAvailable: boolean,
) {
  const denied = await rejectUnlessManager();

  if (denied) {
    return denied;
  }

  const result = await updateMenuItem({ id, isAvailable });

  if (result.ok) {
    refreshItemPaths();
  }

  return result;
}

export async function deleteMenuItemAction(id: string) {
  const denied = await rejectUnlessManager();

  if (denied) {
    return denied;
  }

  const current = await getMenuItem(id);
  const result = await deleteMenuItem(id);

  if (result.ok && current.ok) {
    await removeLocalImage(current.data.imageUrl);
    refreshItemPaths();
  }

  return result;
}

export async function moveMenuItemAction(id: string, direction: "up" | "down") {
  const denied = await rejectUnlessManager();

  if (denied) {
    return denied;
  }

  const result = await moveMenuItem(id, direction);

  if (result.ok) {
    refreshItemPaths();
  }

  return result;
}
