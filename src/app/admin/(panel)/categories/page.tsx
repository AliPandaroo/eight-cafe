import { requireManager } from "@/lib/admin/session"
import { Stack } from "@/components/layout"
import { CategoryManager } from "@/components/admin/category-manager"
import { listCategories } from "@/lib/menu/category"

export default async function AdminCategoriesPage() {
  await requireManager()
  const categories = await listCategories()

  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <h1 className="text-lg md:text-xl font-semibold">دسته‌ها</h1>
        <p className="text-xs md:text-sm text-text/70 text-justify">
          دسته‌ها را بسازید، مرتب کنید و فعال یا غیرفعال کنید.
        </p>
      </Stack>
      <CategoryManager categories={categories.ok ? categories.data : []} />
      {!categories.ok ? (
        <p className="text-sm text-red-200">{categories.error}</p>
      ) : null}
    </Stack>
  )
}
