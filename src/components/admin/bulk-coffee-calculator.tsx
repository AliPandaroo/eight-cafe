"use client";

import { useActionState, useState } from "react";

import { Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createBulkCoffeeSaleAction } from "@/features/bulk-coffee/actions";
import { quoteBulkCoffee, type BulkCoffeeUnit } from "@/lib/bulk-coffee/calc";
import { formatInteger, formatPrice } from "@/lib/format";
import { toAsciiDigits } from "@/lib/prefactor/table";
import type { BulkCoffeeTypeRecord } from "@/types/bulk-coffee";
import { cn } from "@/utils/classMerge";

function parseLiveValue(value: string) {
  const amount = Number(toAsciiDigits(value).replace(/[,\s٬]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function BulkCoffeeCalculator({
  types,
}: {
  types: BulkCoffeeTypeRecord[];
}) {
  const available = types.filter((item) => item.isActive);
  const [state, action, pending] = useActionState(
    createBulkCoffeeSaleAction,
    null,
  );
  const [typeId, setTypeId] = useState(available[0]?.id ?? "");
  const [unit, setUnit] = useState<BulkCoffeeUnit>("grams");
  const [value, setValue] = useState("");
  const selected = available.find((item) => item.id === typeId) ?? available[0];
  const quote = selected
    ? quoteBulkCoffee(selected.pricePerKg, unit, parseLiveValue(value))
    : null;

  if (available.length === 0) {
    return (
      <p className="text-sm text-text/70">
        اول در قهوه روز حداقل یک نوع موجود بگذارید.
      </p>
    );
  }

  return (
    <form key={state && state.ok ? state.data.id : "sale"} action={action}>
      <input type="hidden" name="typeId" value={selected?.id ?? typeId} />
      <input type="hidden" name="unit" value={unit} />
      <Stack gap={3}>
        {state && !state.ok ? (
          <p className="text-sm text-red-200">
            {state.fieldErrors?.value?.[0] ??
              state.fieldErrors?.typeId?.[0] ??
              state.error}
          </p>
        ) : null}

        <Field label="نوع قهوه">
          <div className="flex flex-wrap gap-1.5">
            {available.map((item) => (
              <Button
                key={item.id}
                variant={item.id === selected?.id ? "primary" : "ghost"}
                className="rounded-full px-2.5 py-1 text-[11px]"
                onClick={() => setTypeId(item.id)}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </Field>

        {selected ? (
          <p className="text-[11px] text-text/55">
            قیمت روز: {formatInteger(selected.pricePerKg)} تومن / کیلو
          </p>
        ) : null}

        <div className="flex gap-1.5">
          <Button
            variant={unit === "grams" ? "primary" : "ghost"}
            className={cn("flex-1")}
            onClick={() => setUnit("grams")}
          >
            گرم
          </Button>
          <Button
            variant={unit === "toman" ? "primary" : "ghost"}
            className="flex-1"
            onClick={() => setUnit("toman")}
          >
            تومن
          </Button>
        </div>

        <Field label={unit === "grams" ? "مقدار (گرم)" : "مبلغ (تومن)"}>
          <Input
            name="value"
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={unit === "grams" ? "۲۵۰" : "۳۰۰۰۰۰"}
            required
          />
        </Field>

        {quote ? (
          <p className="text-sm text-text/85">
            {unit === "grams" ? (
              <>مبلغ: {formatPrice(String(quote.amount))}</>
            ) : (
              <>وزن: {formatInteger(quote.grams)} گرم</>
            )}
          </p>
        ) : selected && selected.pricePerKg <= 0 ? (
          <p className="text-[11px] text-red-200">
            قیمت کیلو این نوع هنوز صفر است.
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "در حال ثبت..." : "ثبت فروش فله"}
        </Button>
      </Stack>
    </form>
  );
}
