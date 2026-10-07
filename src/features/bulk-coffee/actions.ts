"use server";

import { rejectUnlessManager } from "@/lib/admin/guard";
import { revalidatePaths } from "@/lib/admin/revalidate";
import { quoteBulkCoffee } from "@/lib/bulk-coffee/calc";
import {
  createBulkCoffeeSale,
  deleteBulkCoffeeSale,
  deleteBulkCoffeeType,
  getBulkCoffeeType,
  saveBulkCoffeeType,
} from "@/lib/bulk-coffee/store";
import { fail } from "@/lib/menu/result";
import { fieldErrorsFromZod } from "@/lib/menu/validation";
import {
  createBulkCoffeeSaleSchema,
  saveBulkCoffeeTypeSchema,
} from "@/lib/validation/bulk-coffee";

function refreshSales() {
  revalidatePaths("/admin/sales", "/admin/ledger", "/admin");
}

async function requireSalesManager() {
  return rejectUnlessManager("فقط مدیر می‌تواند فروش فله را ثبت کند");
}

export async function saveBulkCoffeeTypeAction(
  _prev: unknown,
  formData: FormData,
) {
  const denied = await requireSalesManager();

  if (denied) {
    return denied;
  }

  const parsed = saveBulkCoffeeTypeSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    name: String(formData.get("name") ?? ""),
    pricePerKg: String(formData.get("pricePerKg") ?? ""),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return fail("نوع قهوه نامعتبر است", fieldErrorsFromZod(parsed.error));
  }

  const result = await saveBulkCoffeeType(parsed.data);

  if (result.ok) {
    refreshSales();
  }

  return result;
}

export async function deleteBulkCoffeeTypeAction(id: string) {
  const denied = await requireSalesManager();

  if (denied) {
    return denied;
  }

  const result = await deleteBulkCoffeeType(id);

  if (result.ok) {
    refreshSales();
  }

  return result;
}

export async function createBulkCoffeeSaleAction(
  _prev: unknown,
  formData: FormData,
) {
  const denied = await requireSalesManager();

  if (denied) {
    return denied;
  }

  const parsed = createBulkCoffeeSaleSchema.safeParse({
    typeId: String(formData.get("typeId") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    value: String(formData.get("value") ?? ""),
  });

  if (!parsed.success) {
    return fail("فروش نامعتبر است", fieldErrorsFromZod(parsed.error));
  }

  const coffeeType = await getBulkCoffeeType(parsed.data.typeId);

  if (!coffeeType.ok) {
    return coffeeType;
  }

  if (!coffeeType.data.isActive) {
    return fail("این نوع قهوه امروز موجود نیست");
  }

  const quote = quoteBulkCoffee(
    coffeeType.data.pricePerKg,
    parsed.data.unit,
    parsed.data.value,
  );

  if (!quote) {
    return fail("اول قیمت کیلو این نوع را در قهوه روز بگذارید");
  }

  const result = await createBulkCoffeeSale({
    typeId: coffeeType.data.id,
    typeName: coffeeType.data.name,
    unit: parsed.data.unit,
    inputValue: String(parsed.data.value),
    grams: quote.grams,
    amount: quote.amount,
    pricePerKg: coffeeType.data.pricePerKg,
  });

  if (result.ok) {
    refreshSales();
  }

  return result;
}

export async function deleteBulkCoffeeSaleAction(id: string) {
  const denied = await requireSalesManager();

  if (denied) {
    return denied;
  }

  const result = await deleteBulkCoffeeSale(id);

  if (result.ok) {
    refreshSales();
  }

  return result;
}
