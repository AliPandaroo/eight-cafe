"use client";

import { useActionState } from "react";

import { Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createCafeTableAction } from "@/features/table/actions";

export function TableForm() {
  const [state, action, pending] = useActionState(createCafeTableAction, null);

  return (
    <form key={state && state.ok ? state.data.id : "form"} action={action}>
      <Stack direction="row" gap={3} align="end">
        <Field
          label="شماره میز"
          error={
            state && !state.ok
              ? (state.fieldErrors?.number?.[0] ?? state.error)
              : undefined
          }
        >
          <Input name="number" inputMode="numeric" required />
        </Field>
        <Button
          variant="primary"
          type="submit"
          disabled={pending}
          className="shrink-0"
        >
          {pending ? "..." : "افزودن میز"}
        </Button>
      </Stack>
    </form>
  );
}
