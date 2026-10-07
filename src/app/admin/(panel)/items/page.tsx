import { requireManager } from "@/lib/admin/session";
import { Stack } from "@/components/layout";
import { ItemList } from "@/components/admin/items/item-list";
import { listCategories } from "@/lib/menu/category";
import { listMenuItems } from "@/lib/menu/item";

export default async function AdminItemsPage() {
  await requireManager();
  const [categories, items] = await Promise.all([
    listCategories(),
    listMenuItems(),
  ]);

  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <h1 className="text-lg font-semibold md:text-xl">آیتم‌ها</h1>
        <p className="text-justify text-xs text-text/70 md:text-sm">
          قیمت، موجودی، تصویر و ترتیب آیتم‌ها را از اینجا مدیریت کنید.
        </p>
      </Stack>
      <ItemList
        items={items.ok ? items.data : []}
        categories={categories.ok ? categories.data : []}
      />
      {!items.ok ? <p className="text-sm text-red-200">{items.error}</p> : null}
    </Stack>
  );
}
