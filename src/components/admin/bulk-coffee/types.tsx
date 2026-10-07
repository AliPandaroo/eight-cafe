"use client";

import { useActionState } from "react";

import { BulkCoffeeTypeRow } from "@/components/admin/bulk-coffee/type-row";
import { Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { saveBulkCoffeeTypeAction } from "@/features/bulk-coffee/actions";
import type { BulkCoffeeTypeRecord } from "@/types/bulk-coffee";

export function BulkCoffeeTypes({ types }: { types: BulkCoffeeTypeRecord[] }) {
  const [state, action, pending] = useActionState(
    saveBulkCoffeeTypeAction,
    null,
  );

  return (
    <Stack gap={3}>
      {types.map((item) => (
        <BulkCoffeeTypeRow key={item.id} item={item} />
      ))}
      <form
        action={action}
        className="grid gap-2 rounded-(--radius) border border-dashed border-foreground/20 p-3 sm:grid-cols-[1fr_8rem_auto]"
      >
        <Field
          label="نوع جدید"
          error={state && !state.ok ? state.fieldErrors?.name?.[0] : undefined}
        >
          <Input name="name" placeholder="مثلاً روبو ۸۰/۲۰" required />
        </Field>
        <Field label="تومن / کیلو">
          <Input name="pricePerKg" inputMode="numeric" />
        </Field>
        <input type="hidden" name="isActive" value="true" />
        <Button type="submit" disabled={pending} className="self-end">
          {pending ? "..." : "افزودن"}
        </Button>
      </form>
    </Stack>
  );
}
