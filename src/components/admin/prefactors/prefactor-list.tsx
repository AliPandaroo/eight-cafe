import { PrefactorDeliverButton } from "@/components/admin/prefactors/prefactor-deliver-button";
import { Grid, Stack } from "@/components/layout";
import { formatPrice } from "@/lib/format";
import {
  formatPrefactorTime,
  formatPrefactorWeekday,
  prefactorDayKey,
} from "@/lib/prefactor/range";
import { formatTableLabel } from "@/lib/prefactor/table";
import { cn } from "@/utils/classMerge";
import type { PrefactorRecord } from "@/types/prefactor";

function groupByTehranDay(prefactors: PrefactorRecord[]) {
  const groups = new Map<string, PrefactorRecord[]>();

  for (const prefactor of prefactors) {
    const key = prefactorDayKey(prefactor.createdAt);
    const day = groups.get(key) ?? [];
    day.push(prefactor);
    groups.set(key, day);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, items]) => ({
      key,
      label: formatPrefactorWeekday(items[0].createdAt),
      prefactors: [...items].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime(),
      ),
    }));
}

function PrefactorDayHeading({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center gap-3">
      <span className="shrink-0 text-sm text-text/80">{label}</span>
      <span className="h-px min-w-0 flex-1 bg-foreground/15" aria-hidden />
    </div>
  );
}

function PrefactorCards({ prefactors }: { prefactors: PrefactorRecord[] }) {
  return (
    <Grid
      cols={1}
      gap={3}
      w="full"
      className="sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    >
      {prefactors.map((prefactor) => (
        <article
          key={prefactor.id}
          className={cn(
            "flex h-full min-w-0 flex-col rounded-(--radius) border border-foreground/15 p-3 transition-opacity",
            prefactor.isDelivered && "opacity-40 hover:opacity-80",
          )}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-text/60">
            <span>{formatPrefactorTime(prefactor.createdAt)}</span>
            <span>{formatTableLabel(prefactor.tableLabel)}</span>
          </div>
          <Stack gap={1} className="min-w-0 flex-1">
            {prefactor.lines.map((line) => (
              <p key={line.id} className="truncate text-sm text-text">
                {line.name}
                <span className="text-text/55"> × {line.quantity}</span>
              </p>
            ))}
          </Stack>
          <div className="mt-3 flex items-end justify-between gap-2">
            <PrefactorDeliverButton
              id={prefactor.id}
              isDelivered={prefactor.isDelivered}
            />
            <p>{formatPrice(prefactor.total)}</p>
          </div>
        </article>
      ))}
    </Grid>
  );
}

export function PrefactorList({
  prefactors,
  emptyLabel,
  groupByDay = false,
}: {
  prefactors: PrefactorRecord[];
  emptyLabel: string;
  groupByDay?: boolean;
}) {
  if (prefactors.length === 0) {
    return <p className="text-sm text-text/70">{emptyLabel}</p>;
  }

  if (!groupByDay) {
    return <PrefactorCards prefactors={prefactors} />;
  }

  return (
    <Stack gap={6} className="w-full">
      {groupByTehranDay(prefactors).map((day) => (
        <Stack key={day.key} gap={3} className="w-full">
          <PrefactorDayHeading label={day.label} />
          <PrefactorCards prefactors={day.prefactors} />
        </Stack>
      ))}
    </Stack>
  );
}
