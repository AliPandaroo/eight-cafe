"use client";

import { useActionState, useTransition } from "react";

import { Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import {
  deleteBulkCoffeeTypeAction,
  saveBulkCoffeeTypeAction,
} from "@/features/bulk-coffee/actions";
import type { BulkCoffeeTypeRecord } from "@/types/bulk-coffee";

function TypeRow({ item }: { item: BulkCoffeeTypeRecord }) {
  const [state, action, pending] = useActionState(
    saveBulkCoffeeTypeAction,
    null,
  );
  const [deleting, startDelete] = useTransition();

  return (
    <form
      action={action}
      className="grid gap-2 rounded-(--radius) border border-foreground/15 p-3 sm:grid-cols-[1fr_8rem_auto]"
    >
      <input type="hidden" name="id" value={item.id} />
      <Field
        label="نام"
        error={state && !state.ok ? state.fieldErrors?.name?.[0] : undefined}
      >
        <Input name="name" defaultValue={item.name} required />
      </Field>
      <Field
        label="تومن / کیلو"
        error={
          state && !state.ok ? state.fieldErrors?.pricePerKg?.[0] : undefined
        }
      >
        <Input
          name="pricePerKg"
          inputMode="numeric"
          defaultValue={item.pricePerKg ? String(item.pricePerKg) : ""}
        />
      </Field>
      <Stack gap={2} className="justify-start">
        <label className="flex items-center gap-2 text-[11px]">
          <input
            type="checkbox"
            name="isActive"
            value="true"
            defaultChecked={item.isActive}
            className="size-3.5 accent-foreground"
          />
          موجود
        </label>
        <div className="flex gap-1.5">
          <Button type="submit" disabled={pending} className="px-2 py-1">
            {pending ? "..." : "ذخیره"}
          </Button>
          <Button
            variant="danger"
            className="px-2 py-1"
            disabled={deleting}
            onClick={() => {
              startDelete(() => {
                void deleteBulkCoffeeTypeAction(item.id);
              });
            }}
          >
            حذف
          </Button>
        </div>
      </Stack>
    </form>
  );
}

export function BulkCoffeeTypes({ types }: { types: BulkCoffeeTypeRecord[] }) {
  const [state, action, pending] = useActionState(
    saveBulkCoffeeTypeAction,
    null,
  );

  return (
    <Stack gap={3}>
      {types.map((item) => (
        <TypeRow key={item.id} item={item} />
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
