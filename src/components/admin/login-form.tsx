"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { loginAdminAction } from "@/features/admin/auth-actions";
import { Stack } from "@/components/layout";
import type { StaffRole } from "@/lib/auth/roles";

export function LoginForm({
  defaultRole = "manager",
}: {
  defaultRole?: StaffRole;
}) {
  const [state, action, pending] = useActionState(loginAdminAction, null);
  const [role, setRole] = useState<StaffRole>(defaultRole);

  return (
    <form action={action}>
      <input type="hidden" name="role" value={role} />
      <Stack gap={4}>
        <Field
          label="ورود به عنوان"
          error={state && !state.ok ? state.error : undefined}
        >
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={role === "manager" ? "primary" : "ghost"}
              className="rounded-full px-2.5 py-1 text-[11px]"
              onClick={() => setRole("manager")}
            >
              مدیر
            </Button>
            <Button
              variant={role === "waiter" ? "primary" : "ghost"}
              className="rounded-full px-2.5 py-1 text-[11px]"
              onClick={() => setRole("waiter")}
            >
              گارسون
            </Button>
          </div>
        </Field>
        <Field label="رمز عبور">
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? "در حال ورود..." : "ورود"}
        </Button>
      </Stack>
    </form>
  );
}
