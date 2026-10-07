import Link from "next/link";

import { AdminStat } from "@/components/admin/shared/admin-stat";
import { MoneyStat } from "@/components/admin/shared/money-stat";
import { WeekFlowChart } from "@/components/admin/ledgers/week-flow-chart";
import { Grid, Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { requireManager } from "@/lib/admin/session";
import { loadWeekMoney, weekFlowDays } from "@/lib/admin/week-money";
import { formatInteger, formatKilogramsFromGrams } from "@/lib/format";
import { listCategories } from "@/lib/menu/category";
import { listMenuItems } from "@/lib/menu/item";
import { currentWeekRange, tehranTodayYmd } from "@/lib/prefactor/range";
import { listCafeTables } from "@/lib/table/store";

const shortcuts = [
  { href: "/", label: "ساخت سفارش" },
  { href: "/admin/sales", label: "فروش فله" },
  { href: "/admin/items/new", label: "آیتم جدید" },
  { href: "/admin/settings", label: "تنظیمات" },
];

export default async function AdminDashboardPage() {
  await requireManager();
  const week = currentWeekRange();
  const [categories, items, cafeTables, money] = await Promise.all([
    listCategories(),
    listMenuItems(),
    listCafeTables(),
    loadWeekMoney(week),
  ]);

  const categoryCount = categories.ok ? categories.data.length : 0;
  const itemList = items.ok ? items.data : [];
  const unavailableItems = itemList.filter((item) => !item.isAvailable);
  const pendingCount = money.weekPrefactors.filter(
    (item) => !item.isDelivered,
  ).length;
  const emptyTables = (cafeTables.ok ? cafeTables.data : []).filter(
    (table) => !table.seatedAt,
  );
  const days = weekFlowDays(
    week,
    money.incomeByDay,
    money.bulkByDay,
    money.expenseByDay,
  );

  return (
    <Stack gap={8} className="w-full">
      <Stack gap={1}>
        <h1 className="text-lg font-semibold md:text-xl">داشبورد</h1>
        <p className="text-justify text-xs text-text/70 md:text-sm">
          خلاصه این هفته و میانبر کارهای پرتکرار مدیر.
        </p>
      </Stack>

      <Grid cols={2} gap={2} className="sm:grid-cols-3">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="rounded-(--radius) border border-foreground/15 px-3 py-3 text-sm text-text/85"
          >
            {shortcut.label}
          </Link>
        ))}
      </Grid>

      <Grid cols={2} gap={3} className="sm:grid-cols-4">
        <MoneyStat
          label={`دخل · ${formatInteger(money.orderCount)} سفارش`}
          value={money.orderIncome}
        />
        <MoneyStat
          label={`فله · ${formatKilogramsFromGrams(money.bulkGrams)} کیلوگرم`}
          value={money.bulkTotal}
        />
        <MoneyStat label="خرج" value={money.expenseTotal} />
        <MoneyStat label="بازگشت سرمایه" value={money.balance} />
      </Grid>

      <WeekFlowChart days={days} todayYmd={tehranTodayYmd()} />

      <Grid cols={2} gap={3} className="md:grid-cols-4">
        <AdminStat label="در انتظار تحویل" value={pendingCount}>
          <Button asChild variant="ghost">
            <Link href="/admin/prefactors">مدیریت پیش‌فاکتورها</Link>
          </Button>
        </AdminStat>
        <AdminStat label="میزهای خالی" value={emptyTables.length}>
          {emptyTables.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {emptyTables.map((table) => (
                <Link
                  key={table.id}
                  href="/admin/tables"
                  className="rounded-full bg-text-disabled/20 px-2.5 py-1 text-[11px] whitespace-nowrap text-white transition-colors hover:bg-text-disabled/60"
                >
                  {table.number}
                </Link>
              ))}
            </div>
          ) : null}
        </AdminStat>
        <AdminStat label="ناموجودی" value={unavailableItems.length}>
          {unavailableItems.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {unavailableItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/items/${item.id}`}
                  className="rounded-full bg-text-disabled/20 px-2.5 py-1 text-[11px] whitespace-nowrap text-white transition-colors hover:bg-text-disabled/60"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          ) : null}
        </AdminStat>
        <AdminStat label="دسته‌ها" value={categoryCount}>
          <Button asChild variant="ghost">
            <Link href="/admin/categories">مدیریت دسته‌ها</Link>
          </Button>
        </AdminStat>
        <AdminStat label="آیتم‌ها" value={itemList.length}>
          <Button variant="primary" asChild>
            <Link href="/admin/items/new">افزودن آیتم</Link>
          </Button>
        </AdminStat>
      </Grid>
    </Stack>
  );
}
