"use server";

import { revalidatePath } from "next/cache";

import { getStaffSession } from "@/lib/admin/session";
import { getPublicMenu } from "@/lib/menu/public";
import { fail, ok } from "@/lib/menu/result";
import { fieldErrorsFromZod } from "@/lib/menu/validation";
import { currentDayRange, currentWeekRange } from "@/lib/prefactor/range";
import {
  createPrefactor,
  listPrefactors,
  setPrefactorDelivered,
} from "@/lib/prefactor/store";
import { occupyCafeTableByNumber } from "@/lib/table/store";
import { createPrefactorSchema } from "@/lib/validation/prefactor";

export async function createPrefactorAction(input: unknown) {
  const session = await getStaffSession();

  if (!session) {
    return fail("فقط مدیر یا گارسون می‌تواند پیش‌فاکتور بسازد");
  }

  const parsed = createPrefactorSchema.safeParse(input);

  if (!parsed.success) {
    return fail("سفارش نامعتبر است", fieldErrorsFromZod(parsed.error));
  }

  const menu = await getPublicMenu();

  if (!menu.ok) {
    return menu;
  }

  const catalog = new Map(
    menu.data.categories.flatMap((category) =>
      category.items.map((item) => [item.id, item]),
    ),
  );

  const lines = [];

  for (const line of parsed.data.lines) {
    const item = catalog.get(line.itemId);

    if (!item || !item.isAvailable) {
      return fail(`آیتم «${item?.name ?? line.itemId}» قابل سفارش نیست`);
    }

    const variant = line.variantId
      ? item.variants.find((entry) => entry.id === line.variantId)
      : undefined;

    if ((item.variants?.length ?? 0) > 0 && !variant) {
      return fail(`سایز «${item.name}» را انتخاب کنید`);
    }

    lines.push({
      itemId: item.id,
      name: variant ? `${item.name} · ${variant.title}` : item.name,
      unitPrice: variant?.price ?? item.price,
      quantity: line.quantity,
    });
  }

  const result = await createPrefactor({
    tableLabel: parsed.data.tableLabel,
    createdBy: session.role,
    lines,
  });

  if (result.ok) {
    await occupyCafeTableByNumber(parsed.data.tableLabel);
    revalidatePath("/admin/prefactors");
    revalidatePath("/admin/ledger");
    revalidatePath("/admin/tables");
    revalidatePath("/admin");
  }

  return result;
}

export async function listPrefactorsAction() {
  const session = await getStaffSession();

  if (!session) {
    return fail("وارد شوید");
  }

  const range =
    session.role === "manager" ? currentWeekRange() : currentDayRange();

  const result = await listPrefactors(range);

  if (!result.ok) {
    return result;
  }

  return ok({
    range: range.label,
    prefactors: result.data,
  });
}

export async function markPrefactorDeliveredAction(id: string) {
  const session = await getStaffSession();

  if (!session) {
    return fail("وارد شوید");
  }

  const result = await setPrefactorDelivered(id, true);

  if (result.ok) {
    revalidatePath("/admin/prefactors");
  }

  return result;
}
