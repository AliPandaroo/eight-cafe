import type { ComponentProps, ReactNode } from "react";

import { Stack } from "@/components/layout";
import { cn } from "@/utils/classMerge";

const controlClass =
  "w-full rounded-(--radius) border border-foreground/25 bg-text/5 px-3 py-2 text-sm text-text outline-none placeholder:text-text-disabled read-only:cursor-not-allowed read-only:opacity-75";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <Stack gap={1} className="w-full">
      <label className="text-[11px] text-text/80">{label}</label>
      {children}
      {error ? <p className="text-[11px] text-red-200">{error}</p> : null}
    </Stack>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(controlClass, "min-h-24 resize-y", className)}
      {...props}
    />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(controlClass, className)} {...props} />;
}
