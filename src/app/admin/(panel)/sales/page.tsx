import { BulkCoffeeCalculator } from "@/components/admin/bulk-coffee-calculator";
import { BulkCoffeeSales } from "@/components/admin/bulk-coffee-sales";
import { BulkCoffeeTypes } from "@/components/admin/bulk-coffee-types";
import { MoneyStat } from "@/components/admin/money-stat";
import { Grid, Stack } from "@/components/layout";
import { requireManager } from "@/lib/admin/session";
import {
  listBulkCoffeeSales,
  listBulkCoffeeTypes,
  sumBulkCoffeeAmount,
} from "@/lib/bulk-coffee/store";
import { currentWeekRange } from "@/lib/prefactor/range";

export default async function AdminSalesPage() {
  await requireManager();
  const week = currentWeekRange();
  const [types, sales] = await Promise.all([
    listBulkCoffeeTypes(),
    listBulkCoffeeSales(week),
  ]);

  const typeItems = types.ok ? types.data : [];
  const saleItems = sales.ok ? sales.data : [];

  return (
    <Stack gap={6} className="w-full">
      <Stack gap={1}>
        <h1 className="text-lg font-semibold md:text-xl">فروش</h1>
        <p className="text-justify text-xs text-text/70 md:text-sm">
          فروش فله قهوه را اینجا ثبت کنید. مقدار را گرم یا تومن بگذارید؛ نوع و
          قیمت روز را خودتان مشخص می‌کنید. مبلغ با زمان ثبت به دخل هفته اضافه
          می‌شود.
        </p>
      </Stack>

      <MoneyStat label="فله این هفته" value={sumBulkCoffeeAmount(saleItems)} />

      <Grid cols={2} gap={3}  className="grid-cols-1 md:grid-cols-2 justify-between content-between">
        <Stack
          gap={3}
          className="max-w-5xl rounded-(--radius) border border-foreground/15 p-3"
        >
          <h2 className="text-sm font-semibold">قهوه روز</h2>
          <p className="text-[11px] text-text/55">
            انواع موجود و قیمت کیلو را اینجا بگذارید. فقط نوع‌های موجود در
            ماشین‌حساب دیده می‌شوند.
          </p>
          {!types.ok ? (
            <p className="text-sm text-red-200">{types.error}</p>
          ) : (
            <BulkCoffeeTypes types={typeItems} />
          )}
        </Stack>

        <Stack
          gap={3}
          className="max-w-xl rounded-(--radius) border border-foreground/15 p-3 h-fit"
        >
          <h2 className="text-sm font-semibold">ماشین‌حساب فله</h2>
          <BulkCoffeeCalculator types={typeItems} />
        </Stack>
      </Grid>

      <Stack
        gap={3}
        className="max-w-5xl rounded-(--radius) border border-foreground/15 p-3"
      >
        <h2 className="text-sm font-semibold">فروش‌های این هفته</h2>
        {!sales.ok ? (
          <p className="text-sm text-red-200">{sales.error}</p>
        ) : (
          <BulkCoffeeSales sales={saleItems} />
        )}
      </Stack>
    </Stack>
  );
}
