import { formatInteger } from "@/lib/format";
import { formatPrefactorWeekday } from "@/lib/prefactor/range";
import { cn } from "tailwind-variants";

function tomanLabel(value: number) {
  return `${formatInteger(value)} تومن`;
}

export type WeekFlowDay = {
  ymd: string;
  income: number;
  expense: number;
};

export function WeekFlowChart({
  days,
  todayYmd,
}: {
  days: WeekFlowDay[];
  todayYmd: string;
}) {
  const peak = Math.max(1, ...days.flatMap((day) => [day.income, day.expense]));

  return (
    <div className="rounded-(--radius) border border-foreground/15 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">دخل و خرج این هفته</h2>
        <div className="flex gap-3 text-[11px] text-text/70">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-foreground" />
            دخل
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-text/30" />
            خرج
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 items-end gap-2" dir="rtl">
        {days.map((day) => {
          const label = formatPrefactorWeekday(`${day.ymd}T12:00:00.000+03:30`);
          const incomeHeight = Math.max(
            day.income > 0 ? 8 : 0,
            (day.income / peak) * 100,
          );
          const expenseHeight = Math.max(
            day.expense > 0 ? 8 : 0,
            (day.expense / peak) * 100,
          );

          return (
            <div
              key={day.ymd}
              className="flex min-w-0 flex-col items-center gap-2"
            >
              <div className="flex h-36 w-full items-end justify-center gap-0.5">
                <div
                  className="w-[42%] cursor-pointer rounded-t-sm bg-foreground"
                  style={{
                    height: `${incomeHeight ? incomeHeight : day.ymd <= todayYmd ? 2 : 0}%`,
                  }}
                  title={`دخل ${tomanLabel(day.income)}`}
                />
                <div
                  className="w-[42%] cursor-pointer rounded-t-sm bg-text/30"
                  style={{
                    height: `${expenseHeight ? expenseHeight : day.ymd <= todayYmd ? 2 : 0}%`,
                  }}
                  title={`خرج ${tomanLabel(day.expense)}`}
                />
              </div>
              <p
                className={cn(
                  "text-center text-[10px] leading-4 text-text/70",
                  day.ymd > todayYmd && "opacity-40",
                  day.ymd === todayYmd && "font-bold",
                  day.ymd < todayYmd && "opacity-80!",
                )}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
