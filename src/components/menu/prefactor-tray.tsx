"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";

import { Stack } from "@/components/layout";
import {
  cartTotal,
  clearPrefactorCart,
  getPrefactorCart,
  setPrefactorQuantity,
  subscribePrefactorCart,
} from "@/components/menu/prefactor-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { createPrefactorAction } from "@/features/prefactor/actions";
import { formatPrice } from "@/lib/format";
import { parseTableNumber } from "@/lib/prefactor/table";
import { MinusIcon, PlusIcon } from "lucide-react";

export function PrefactorTray() {
  const lines = useSyncExternalStore(
    subscribePrefactorCart,
    getPrefactorCart,
    () => [],
  );
  const [tableLabel, setTableLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (saved) {
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    }
  }, [saved]);

  if (lines.length === 0 && !saved) {
    return null;
  }

  function submit() {
    if (parseTableNumber(tableLabel) === null) {
      setError("شماره میز لازم است؛ ۰ یعنی بیرون‌بر");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createPrefactorAction({
        tableLabel,
        lines: lines.map((line) => ({
          itemId: line.itemId,
          variantId: line.variantId,
          quantity: line.quantity,
        })),
      });

      if (!result.ok) {
        setSaved(false);
        setError(result.error);
        return;
      }

      clearPrefactorCart();
      setTableLabel("");
      setSaved(true);
    });
  }

  return (
    <div className="fixed inset-x-0 pb-20 md:pb-3 bottom-0 z-40 border-t border-foreground/15 bg-background/75 px-4 pt-3 backdrop-blur-sm">
      <Stack gap={2} className="mx-auto max-w-xl">
        {lines.length > 0 ? (
          <p className="text-[11px] text-text/60">پیش‌فاکتور</p>
        ) : null}
        {lines.map((line) => (
          <div
            key={
              line.variantId ? `${line.itemId}:${line.variantId}` : line.itemId
            }
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="min-w-0 truncate">{line.name}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="p-0.5 flex justify-center items-center"
                onClick={() =>
                  setPrefactorQuantity(
                    line.itemId,
                    line.quantity - 1,
                    line.variantId,
                  )
                }
              >
                <MinusIcon className="size-4.5 text-foreground!" />
              </Button>
              <span className="font-bold min-w-5 inline-block text-center">
                {line.quantity}
              </span>
              <Button
                variant="ghost"
                className="p-0.5 flex justify-center items-center"
                onClick={() =>
                  setPrefactorQuantity(
                    line.itemId,
                    line.quantity + 1,
                    line.variantId,
                  )
                }
              >
                <PlusIcon className="size-4.5 text-foreground!" />
              </Button>
            </div>
          </div>
        ))}
        {lines.length > 0 ? (
          <>
            <Input
              value={tableLabel}
              inputMode="numeric"
              onChange={(event) => setTableLabel(event.target.value)}
              placeholder="شماره میز — ۰ بیرون‌بر"
            />
            <div className="flex items-center justify-between gap-3">
              <span>{formatPrice(cartTotal(lines))}</span>
              <Button
                variant="primary"
                type="button"
                disabled={pending}
                onClick={submit}
              >
                {pending ? "در حال ثبت..." : "ثبت پیش‌فاکتور"}
              </Button>
            </div>
          </>
        ) : null}
        {error ? <p className="text-[11px] text-red-200">{error}</p> : null}
        {saved ? (
          // after delay, clear the saved state
          <p className="text-[11px] text-text/75 text-center mx-auto">
            پیش‌فاکتور ثبت شد.
          </p>
        ) : null}
      </Stack>
    </div>
  );
}
