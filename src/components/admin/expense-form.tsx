"use client";

import { useActionState } from "react";

import { Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createExpenseAction } from "@/features/expense/actions";

export function ExpenseForm() {
  const [state, action, pending] = useActionState(createExpenseAction, null);

  return (
    <form key={state && state.ok ? state.data.id : "form"} action={action}>
      <Stack gap={3}>
        <Field
          label="عنوان"
          error={
            state && !state.ok
              ? (state.fieldErrors?.title?.[0] ?? state.error)
              : undefined
          }
        >
          <Input name="title" placeholder="تعمیرات لوله آب" required />
        </Field>
        <Field
          label="مبلغ (تومن)"
          error={
            state && !state.ok ? state.fieldErrors?.amount?.[0] : undefined
          }
        >
          <Input name="amount" inputMode="numeric" required />
        </Field>
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "در حال ثبت..." : "ثبت هزینه"}
        </Button>
      </Stack>
    </form>
  );
}
