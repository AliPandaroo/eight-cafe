import {
  listBulkCoffeeSales,
  sumBulkCoffeeAmount,
  sumBulkCoffeeGrams,
} from "@/lib/bulk-coffee/store";
import { listExpenses, sumExpenseAmount } from "@/lib/expense/store";
import { prefactorDayKey, weekDayYmds } from "@/lib/prefactor/range";
import { listPrefactors, sumPrefactorIncome } from "@/lib/prefactor/store";
import type { BulkCoffeeSaleRecord } from "@/types/bulk-coffee";
import type { ExpenseRecord } from "@/types/expense";
import type { PrefactorRecord } from "@/types/prefactor";

type Range = { from: string; to: string };

function addAmount(map: Map<string, number>, iso: string, amount: number) {
  const key = prefactorDayKey(iso);
  map.set(key, (map.get(key) ?? 0) + amount);
}

export function prefactorTotalToman(total: string | number) {
  return (Number(total) || 0) * 1000;
}

export function weekFlowDays(
  week: Range,
  incomeByDay: Map<string, number>,
  bulkByDay: Map<string, number>,
  expenseByDay: Map<string, number>,
) {
  return weekDayYmds(week).map((ymd) => ({
    ymd,
    income: incomeByDay.get(ymd) ?? 0,
    bulk: bulkByDay.get(ymd) ?? 0,
    expense: expenseByDay.get(ymd) ?? 0,
  }));
}

export function incomeByDayFromPrefactors(prefators: PrefactorRecord[]) {
  const incomeByDay = new Map<string, number>();

  for (const prefactor of prefators) {
    addAmount(
      incomeByDay,
      prefactor.createdAt,
      prefactorTotalToman(prefactor.total),
    );
  }

  return incomeByDay;
}

export function bulkByDayFromSales(bulkSales: BulkCoffeeSaleRecord[]) {
  const bulkByDay = new Map<string, number>();

  for (const sale of bulkSales) {
    addAmount(bulkByDay, sale.createdAt, sale.amount || 0);
  }

  return bulkByDay;
}

export function expenseByDayFromItems(expenses: ExpenseRecord[]) {
  const expenseByDay = new Map<string, number>();

  for (const expense of expenses) {
    addAmount(expenseByDay, expense.createdAt, Number(expense.amount) || 0);
  }

  return expenseByDay;
}

export async function loadWeekMoney(week: Range) {
  const [income, expenses, bulkSales, prefators] = await Promise.all([
    sumPrefactorIncome(week),
    listExpenses(week),
    listBulkCoffeeSales(week),
    listPrefactors(week),
  ]);

  const weekPrefactors = prefators.ok ? prefators.data : [];
  const weekExpenses = expenses.ok ? expenses.data : [];
  const weekBulkSales = bulkSales.ok ? bulkSales.data : [];
  const orderIncome = income.ok ? Number(income.data.total) : 0;
  const bulkTotal = sumBulkCoffeeAmount(weekBulkSales);
  const bulkGrams = sumBulkCoffeeGrams(weekBulkSales);
  const incomeTotal = orderIncome + bulkTotal;
  const expenseTotal = sumExpenseAmount(weekExpenses);

  return {
    income,
    expenses,
    bulkSales,
    prefators,
    weekPrefactors,
    weekExpenses,
    weekBulkSales,
    incomeTotal,
    orderIncome,
    bulkTotal,
    bulkGrams,
    expenseTotal,
    balance: incomeTotal - expenseTotal,
    orderCount: income.ok ? income.data.count : 0,
    incomeByDay: incomeByDayFromPrefactors(weekPrefactors),
    bulkByDay: bulkByDayFromSales(weekBulkSales),
    expenseByDay: expenseByDayFromItems(weekExpenses),
  };
}
