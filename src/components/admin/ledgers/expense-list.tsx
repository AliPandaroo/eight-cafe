"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteExpenseAction } from "@/features/expense/actions";
import { formatPrice } from "@/lib/format";
import { formatPrefactorTime } from "@/lib/prefactor/range";
import type { ExpenseRecord } from "@/types/expense";

function ExpenseDeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="danger"
      className="px-2 py-1 text-[11px]"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await deleteExpenseAction(id);
        });
      }}
    >
      {pending ? "..." : "حذف"}
    </Button>
  );
}

export function ExpenseList({ expenses }: { expenses: ExpenseRecord[] }) {
  if (expenses.length === 0) {
    return <p className="text-sm text-text/70">این هفته هزینه‌ای ثبت نشده.</p>;
  }

  return (
    <div className="divide-y divide-foreground/10 rounded-(--radius) border border-foreground/15">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between gap-3 p-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm">{expense.title}</p>
            <p className="text-[11px] text-text/55">
              {formatPrefactorTime(expense.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <p>{formatPrice(expense.amount)}</p>
            <ExpenseDeleteButton id={expense.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
