import { cn } from "@/utils/classMerge";

export function StatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border border-text-disabled/50 px-2.5 py-1 text-[11px] whitespace-nowrap text-text-disabled",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-green-300" : "bg-rose-300",
        )}
      />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
