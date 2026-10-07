"use server";

import { rejectUnlessManager } from "@/lib/admin/guard";
import { revalidatePaths } from "@/lib/admin/revalidate";
import { getStaffSession } from "@/lib/admin/session";
import { fail } from "@/lib/menu/result";
import { fieldErrorsFromZod } from "@/lib/menu/validation";
import {
  createCafeTable,
  deleteCafeTable,
  freeCafeTable,
  occupyCafeTable,
} from "@/lib/table/store";
import { createCafeTableSchema } from "@/lib/validation/table";

function refreshTables() {
  revalidatePaths("/admin/tables", "/admin");
}

export async function createCafeTableAction(
  _prev: unknown,
  formData: FormData,
) {
  const denied = await rejectUnlessManager("فقط مدیر می‌تواند میز اضافه کند");

  if (denied) {
    return denied;
  }

  const parsed = createCafeTableSchema.safeParse({
    number: String(formData.get("number") ?? ""),
  });

  if (!parsed.success) {
    return fail("شماره میز نامعتبر است", fieldErrorsFromZod(parsed.error));
  }

  const result = await createCafeTable(parsed.data.number);

  if (result.ok) {
    refreshTables();
  }

  return result;
}

export async function occupyCafeTableAction(id: string) {
  const session = await getStaffSession();

  if (!session) {
    return fail("وارد شوید");
  }

  const result = await occupyCafeTable(id);

  if (result.ok) {
    refreshTables();
  }

  return result;
}

export async function freeCafeTableAction(id: string) {
  const session = await getStaffSession();

  if (!session) {
    return fail("وارد شوید");
  }

  const result = await freeCafeTable(id);

  if (result.ok) {
    refreshTables();
  }

  return result;
}

export async function deleteCafeTableAction(id: string) {
  const denied = await rejectUnlessManager("فقط مدیر می‌تواند میز را حذف کند");

  if (denied) {
    return denied;
  }

  const result = await deleteCafeTable(id);

  if (result.ok) {
    refreshTables();
  }

  return result;
}
