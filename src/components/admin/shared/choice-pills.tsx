"use client";

import { Button } from "@/components/ui/button";

export function ChoicePills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <Button
          key={option.id}
          variant={option.id === value ? "primary" : "ghost"}
          className="rounded-full px-2.5 py-1 text-[11px]"
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
