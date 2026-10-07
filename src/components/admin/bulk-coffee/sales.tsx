"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteBulkCoffeeSaleAction } from "@/features/bulk-coffee/actions";
import { formatInteger, formatPrice } from "@/lib/format";
import { formatPrefactorTime } from "@/lib/prefactor/range";
import type { BulkCoffeeSaleRecord } from "@/types/bulk-coffee";

export function BulkCoffeeSales({ sales }: { sales: BulkCoffeeSaleRecord[] }) {
  if (sales.length === 0) {
    return (
      <p className="text-sm text-text/70">این هفته فروش فله‌ای ثبت نشده.</p>
    );
  }

  return (
    <div className="divide-y divide-foreground/10 rounded-(--radius) border border-foreground/15">
      {sales.map((sale) => (
        <div
          key={sale.id}
          className="flex items-center justify-between gap-3 p-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm">{sale.typeName}</p>
            <p className="text-[11px] text-text/55">
              {formatInteger(sale.grams)} گرم ·{" "}
              {formatPrefactorTime(sale.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <p>{formatPrice(String(sale.amount))}</p>
            <SaleDeleteButton id={sale.id} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SaleDeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="danger"
      className="px-2 py-1 text-[11px]"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await deleteBulkCoffeeSaleAction(id);
        });
      }}
    >
      {pending ? "..." : "حذف"}
    </Button>
  );
}
