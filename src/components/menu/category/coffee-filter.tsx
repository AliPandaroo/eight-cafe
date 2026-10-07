"use client";

import { cn } from "@/utils/classMerge";

export function CoffeeFilterCheckbox({
  checked,
  pending,
  onChange,
}: {
  checked: boolean;
  pending: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "relative flex shrink-0 cursor-pointer items-center gap-2 rounded-(--radius) px-3 py-1 text-[13px] whitespace-nowrap ring-2",
        checked
          ? "text-foreground ring-foreground"
          : "text-text/70 ring-text/70",
        pending ? "opacity-70" : "",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-3.5 accent-background"
      />
      قهوه
    </label>
  );
}
