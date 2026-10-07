import { ExpenseForm } from "@/components/admin/expense-form";
import { ExpenseList } from "@/components/admin/expense-list";
import { MoneyStat } from "@/components/admin/money-stat";
import { Grid, Stack } from "@/components/layout";
import { requireManager } from "@/lib/admin/session";
import {
  listBulkCoffeeSales,
  sumBulkCoffeeAmount,
} from "@/lib/bulk-coffee/store";
import { listExpenses, sumExpenseAmount } from "@/lib/expense/store";
import { formatInteger } from "@/lib/format";
import { currentWeekRange } from "@/lib/prefactor/range";
import { sumPrefactorIncome } from "@/lib/prefactor/store";

export default async function AdminLedgerPage() {
  await requireManager();
  const week = currentWeekRange();
  const [income, expenses, bulkSales] = await Promise.all([
    sumPrefactorIncome(week),
    listExpenses(week),
    listBulkCoffeeSales(week),
  ]);

  const bulkTotal = bulkSales.ok ? sumBulkCoffeeAmount(bulkSales.data) : 0;
  const incomeTotal = (income.ok ? Number(income.data.total) : 0) + bulkTotal;
  const expenseItems = expenses.ok ? expenses.data : [];
  const expenseTotal = sumExpenseAmount(expenseItems);
  const balance = incomeTotal - expenseTotal;
  const orderCount = income.ok ? income.data.count : 0;

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
          label={`دخل · ${formatInteger(orderCount)} سفارش`}
          value={incomeTotal}
        />
        <MoneyStat label="خرج" value={expenseTotal} />
        <MoneyStat label="بازگشت سرمایه" value={balance} />
      </Grid>

      {!income.ok ? (
        <p className="text-sm text-red-200">{income.error}</p>
      ) : null}
      {!expenses.ok ? (
        <p className="text-sm text-red-200">{expenses.error}</p>
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
        <ExpenseList expenses={expenseItems} />
      </Stack>
    </Stack>
  );
}
