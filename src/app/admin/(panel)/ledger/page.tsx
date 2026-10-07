import { ExpenseForm } from "@/components/admin/ledgers/expense-form";
import { ExpenseList } from "@/components/admin/ledgers/expense-list";
import { MoneyStat } from "@/components/admin/shared/money-stat";
import { Grid, Stack } from "@/components/layout";
import { loadWeekMoney } from "@/lib/admin/week-money";
import { requireManager } from "@/lib/admin/session";
import { formatInteger } from "@/lib/format";
import { currentWeekRange } from "@/lib/prefactor/range";

export default async function AdminLedgerPage() {
  await requireManager();
  const week = currentWeekRange();
  const money = await loadWeekMoney(week);

  return (
    <Stack gap={6} className="w-full">
      <Stack gap={1}>
        <h1 className="text-lg font-semibold md:text-xl">دخل و خرج</h1>
        <p className="text-justify text-xs text-text/70 md:text-sm">
          دخل این هفته از سفارش‌ها و فروش فله جمع می‌شود. خرج را دستی بنویسید.
        </p>
      </Stack>

      <Grid cols={2} gap={3} className="sm:grid-cols-3">
        <MoneyStat
          label={`دخل · ${formatInteger(money.orderCount)} سفارش`}
          value={money.incomeTotal}
        />
        <MoneyStat label="خرج" value={money.expenseTotal} />
        <MoneyStat label="بازگشت سرمایه" value={money.balance} />
      </Grid>

      {!money.income.ok ? (
        <p className="text-sm text-red-200">{money.income.error}</p>
      ) : null}
      {!money.expenses.ok ? (
        <p className="text-sm text-red-200">{money.expenses.error}</p>
      ) : null}

      <Stack
        gap={3}
        className="max-w-xl rounded-(--radius) border border-foreground/15 p-3"
      >
        <h2 className="text-sm font-semibold">ثبت هزینه</h2>
        <ExpenseForm />
      </Stack>

      <Stack
        gap={3}
        className="max-w-5xl rounded-(--radius) border border-foreground/15 p-3"
      >
        <h2 className="text-sm font-semibold">هزینه‌های این هفته</h2>
        <ExpenseList expenses={money.weekExpenses} />
      </Stack>
    </Stack>
  );
}
