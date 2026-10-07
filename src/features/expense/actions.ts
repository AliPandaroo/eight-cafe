"use server";

import { rejectUnlessManager } from "@/lib/admin/guard";
import { revalidatePaths } from "@/lib/admin/revalidate";
import { createExpense, deleteExpense } from "@/lib/expense/store";
import { fail } from "@/lib/menu/result";
import { fieldErrorsFromZod } from "@/lib/menu/validation";
import { createExpenseSchema } from "@/lib/validation/expense";

function refreshLedger() {
  revalidatePaths("/admin/ledger", "/admin");
}

export async function createExpenseAction(_prev: unknown, formData: FormData) {
  const denied = await rejectUnlessManager(
    "فقط مدیر می‌تواند دخل و خرج را ببیند",
  );

  if (denied) {
    return denied;
  }

  const parsed = createExpenseSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    amount: String(formData.get("amount") ?? ""),
  });

  if (!parsed.success) {
    return fail("هزینه نامعتبر است", fieldErrorsFromZod(parsed.error));
  }

  const result = await createExpense(parsed.data);

  if (result.ok) {
    refreshLedger();
  }

  return result;
}

export async function deleteExpenseAction(id: string) {
  const denied = await rejectUnlessManager(
    "فقط مدیر می‌تواند دخل و خرج را ببیند",
  );

  if (denied) {
    return denied;
  }

  const result = await deleteExpense(id);

  if (result.ok) {
    refreshLedger();
  }

  return result;
}
