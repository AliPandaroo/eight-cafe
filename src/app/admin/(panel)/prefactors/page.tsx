import { PrefactorList } from "@/components/admin/prefactors/prefactor-list";
import { Stack } from "@/components/layout";
import { requireStaff } from "@/lib/admin/session";
import { currentDayRange, currentWeekRange } from "@/lib/prefactor/range";
import { listPrefactors } from "@/lib/prefactor/store";

export default async function AdminPrefactorsPage() {
  const session = await requireStaff();
  const range =
    session.role === "manager" ? currentWeekRange() : currentDayRange();
  const prefactors = await listPrefactors(range);

  return (
    <Stack gap={6} className="w-full">
      <Stack gap={1}>
        <h1 className="text-lg font-semibold md:text-xl">پیش‌فاکتورها</h1>
        <p className="text-justify text-xs text-text/70 md:text-sm">
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
  );
}
