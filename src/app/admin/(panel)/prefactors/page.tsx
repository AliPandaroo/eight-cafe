import { PrefactorList } from "@/components/admin/prefactor-list"
import { Stack } from "@/components/layout"
import { requireStaff } from "@/lib/admin/session"
import { currentDayRange, currentWeekRange } from "@/lib/prefactor/range"
import { listPrefactors } from "@/lib/prefactor/store"

export default async function AdminPrefactorsPage() {
  const session = await requireStaff()
  const range =
    session.role === "manager" ? currentWeekRange() : currentDayRange()
  const prefactors = await listPrefactors(range)

  return (
    <Stack gap={6} className="w-full">
      <Stack gap={1}>
        <h1 className="text-lg md:text-xl font-semibold">پیش‌فاکتورها</h1>
        <p className="text-xs md:text-sm text-text/70 text-justify">
          {session.role === "manager"
            ? "همه پیش‌فاکتورهای این هفته."
            : "پیش‌فاکتورهای امروز."}
        </p>
      </Stack>
      <PrefactorList
        prefactors={prefactors.ok ? prefactors.data : []}
        groupByDay={session.role === "manager"}
        emptyLabel={
          prefactors.ok
            ? session.role === "manager"
              ? "این هفته پیش‌فاکتوری ثبت نشده."
              : "امروز پیش‌فاکتوری ثبت نشده."
            : prefactors.error
        }
      />
    </Stack>
  )
}
