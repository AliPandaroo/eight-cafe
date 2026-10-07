import Link from "next/link";

import { WeekFlowChart } from "@/components/admin/week-flow-chart";
import { Flex, Grid, Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { requireManager } from "@/lib/admin/session";
import { listExpenses, sumExpenseAmount } from "@/lib/expense/store";
import { listCategories } from "@/lib/menu/category";
import { listMenuItems } from "@/lib/menu/item";
import { formatInteger } from "@/lib/format";
import {
  currentWeekRange,
  prefactorDayKey,
  tehranTodayYmd,
  weekDayYmds,
} from "@/lib/prefactor/range";
import { listPrefactors, sumPrefactorIncome } from "@/lib/prefactor/store";
import {
  listBulkCoffeeSales,
  sumBulkCoffeeAmount,
} from "@/lib/bulk-coffee/store";
import { listCafeTables } from "@/lib/table/store";
import { MoneyStat } from "@/components/admin/money-stat";

const shortcuts = [
  { href: "/", label: "ساخت سفارش" },
  { href: "/admin/sales", label: "فروش فله" },
  { href: "/admin/items/new", label: "آیتم جدید" },
  { href: "/admin/settings", label: "تنظیمات" },
];

export default async function AdminDashboardPage() {
  await requireManager();
  const week = currentWeekRange();
  const [
    categories,
    items,
    income,
    prefators,
    expenses,
    cafeTables,
    bulkSales,
  ] = await Promise.all([
    listCategories(),
    listMenuItems(),
    sumPrefactorIncome(week),
    listPrefactors(week),
    listExpenses(week),
    listCafeTables(),
    listBulkCoffeeSales(week),
  ]);

  const categoryCount = categories.ok ? categories.data.length : 0;
  const itemList = items.ok ? items.data : [];
  const itemCount = itemList.length;
  const unavailableItems = itemList.filter((item) => !item.isAvailable);
  const weekPrefactors = prefators.ok ? prefators.data : [];
  const weekExpenses = expenses.ok ? expenses.data : [];
  const weekBulkSales = bulkSales.ok ? bulkSales.data : [];
  const incomeTotal =
    (income.ok ? Number(income.data.total) : 0) +
    sumBulkCoffeeAmount(weekBulkSales);
  const expenseTotal = sumExpenseAmount(weekExpenses);
  const orderCount = income.ok ? income.data.count : 0;
  const pendingCount = weekPrefactors.filter(
    (item) => !item.isDelivered,
  ).length;
  const floorTables = cafeTables.ok ? cafeTables.data : [];
  const emptyTables = floorTables.filter((table) => !table.seatedAt);

  const incomeByDay = new Map<string, number>();
  const expenseByDay = new Map<string, number>();

  for (const prefactor of weekPrefactors) {
    const key = prefactorDayKey(prefactor.createdAt);
    incomeByDay.set(
      key,
      (incomeByDay.get(key) ?? 0) + (Number(prefactor.total) || 0) * 1000,
    );
  }

  for (const sale of weekBulkSales) {
    const key = prefactorDayKey(sale.createdAt);
    incomeByDay.set(key, (incomeByDay.get(key) ?? 0) + (sale.amount || 0));
  }

  for (const expense of weekExpenses) {
    const key = prefactorDayKey(expense.createdAt);
    expenseByDay.set(
      key,
      (expenseByDay.get(key) ?? 0) + (Number(expense.amount) || 0),
    );
  }

  const days = weekDayYmds(week).map((ymd) => ({
    ymd,
    income: incomeByDay.get(ymd) ?? 0,
    expense: expenseByDay.get(ymd) ?? 0,
  }));

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

      <Grid cols={2} gap={3} className="sm:grid-cols-3">
        <MoneyStat
          label={`دخل هفته · ${formatInteger(orderCount)} سفارش`}
          value={incomeTotal}
        />
        <MoneyStat label="خرج هفته" value={expenseTotal} />
        <MoneyStat label="بازگشت سرمایه" value={incomeTotal - expenseTotal} />
      </Grid>

      <WeekFlowChart days={days} todayYmd={tehranTodayYmd()} />

      <Grid cols={2} gap={3} className="md:grid-cols-4">
        <Stat label="در انتظار تحویل" value={pendingCount}>
          <Button asChild variant="ghost">
            <Link href="/admin/prefactors">مدیریت پیش‌فاکتورها</Link>
          </Button>
        </Stat>
        <Stat label="میزهای خالی" value={emptyTables.length}>
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
        </Stat>
        <Stat label="ناموجودی" value={unavailableItems.length}>
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
        </Stat>
        <Stat label="دسته‌ها" value={categoryCount}>
          <Button asChild variant="ghost">
            <Link href="/admin/categories">مدیریت دسته‌ها</Link>
          </Button>
        </Stat>
        <Stat label="آیتم‌ها" value={itemCount}>
          <Button variant="primary" asChild>
            <Link href="/admin/items/new">افزودن آیتم</Link>
          </Button>
        </Stat>
      </Grid>
    </Stack>
  );
}

function Stat({
  label,
  value,
  children,
}: {
  label: string;
  value: number;
  children?: React.ReactNode;
}) {
  return (
    <Flex
      direction="col"
      className="rounded-(--radius) border border-foreground/15 p-4"
    >
      <p className="text-[11px] text-text/70">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <div className="mt-auto mr-auto w-fit">{children}</div>
    </Flex>
  );
}
