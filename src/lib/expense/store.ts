import { createId, db, ensureSchema } from "@/lib/db/client";
import { fail, ok, type ActionResult } from "@/lib/menu/result";
import type { ExpenseRecord } from "@/types/expense";

type ExpenseRow = {
  id: string;
  title: string;
  amount: string;
  createdAt: string;
};

function mapExpense(row: ExpenseRow): ExpenseRecord {
  return {
    id: row.id,
    title: row.title,
    amount: String(row.amount),
    createdAt: row.createdAt,
  };
}

export async function createExpense(input: {
  title: string;
  amount: string;
}): Promise<ActionResult<ExpenseRecord>> {
  await ensureSchema();

  const expense: ExpenseRecord = {
    id: createId(),
    title: input.title,
    amount: input.amount,
    createdAt: new Date().toISOString(),
  };

  try {
    await db.execute({
      sql: `INSERT INTO Expense (id, title, amount, createdAt)
            VALUES (?, ?, ?, ?)`,
      args: [expense.id, expense.title, expense.amount, expense.createdAt],
    });

    return ok(expense);
  } catch (error) {
    console.error(error);
    return fail("ثبت هزینه ممکن نشد");
  }
}

export async function listExpenses(range: {
  from: string;
  to: string;
}): Promise<ActionResult<ExpenseRecord[]>> {
  await ensureSchema();

  try {
    const result = await db.execute({
      sql: `SELECT id, title, amount, createdAt
            FROM Expense
            WHERE createdAt >= ? AND createdAt < ?
            ORDER BY createdAt DESC`,
      args: [range.from, range.to],
    });

    return ok((result.rows as unknown as ExpenseRow[]).map(mapExpense));
  } catch (error) {
    console.error(error);
    return fail("بارگذاری هزینه‌ها ممکن نشد");
  }
}

export async function deleteExpense(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  await ensureSchema();

  try {
    const existing = await db.execute({
      sql: "SELECT id FROM Expense WHERE id = ?",
      args: [id],
    });

    if (!existing.rows[0]) {
      return fail("هزینه پیدا نشد");
    }

    await db.execute({
      sql: "DELETE FROM Expense WHERE id = ?",
      args: [id],
    });

    return ok({ id });
  } catch (error) {
    console.error(error);
    return fail("حذف هزینه ممکن نشد");
  }
}

export function sumExpenseAmount(expenses: ExpenseRecord[]) {
  return expenses.reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0),
    0,
  );
}
