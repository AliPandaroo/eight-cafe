import Link from "next/link";
import { notFound } from "next/navigation";

import { requireManager } from "@/lib/admin/session";
import { ItemForm } from "@/components/admin/items/item-form";
import { Stack } from "@/components/layout";
import { listCategories } from "@/lib/menu/category";
import { getMenuItem } from "@/lib/menu/item";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireManager();
  const { id } = await params;
  const [item, categories] = await Promise.all([
    getMenuItem(id),
    listCategories(),
  ]);

  if (!item.ok) {
    notFound();
  }

  return (
    <Stack gap={6} className="max-w-xl">
      <Stack gap={1}>
        <Link href="/admin/items" className="text-[11px] text-text/70">
          بازگشت به آیتم‌ها
        </Link>
        <h1 className="text-xl font-semibold">ویرایش آیتم</h1>
      </Stack>
      <ItemForm
        item={item.data}
        categories={categories.ok ? categories.data : []}
      />
    </Stack>
  );
}
