import Link from "next/link";

import { requireManager } from "@/lib/admin/session";
import { ItemForm } from "@/components/admin/item-form";
import { Stack } from "@/components/layout";
import { listCategories } from "@/lib/menu/category";

export default async function NewMenuItemPage() {
  await requireManager();
  const categories = await listCategories();
  const list = categories.ok ? categories.data : [];

  return (
    <Stack gap={6} className="max-w-xl">
      <Stack gap={1}>
        <Link href="/admin/items" className="text-[11px] text-text/70">
          بازگشت به آیتم‌ها
        </Link>
        <h1 className="text-xl font-semibold">آیتم جدید</h1>
      </Stack>
      {list.length === 0 ? (
        <p className="text-sm text-text/70">
          ابتدا یک دسته بسازید، بعد آیتم اضافه کنید.
        </p>
      ) : (
        <ItemForm categories={list} />
      )}
    </Stack>
  );
}
