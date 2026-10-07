import { BulkCoffeeCalculator } from "@/components/admin/bulk-coffee/calculator";
import { BulkCoffeeSales } from "@/components/admin/bulk-coffee/sales";
import { BulkCoffeeSections } from "@/components/admin/bulk-coffee/sections";
import { BulkCoffeeTypes } from "@/components/admin/bulk-coffee/types";
import { MoneyStat } from "@/components/admin/shared/money-stat";
import { Stack } from "@/components/layout";
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

      <MoneyStat label="فله" value={sumBulkCoffeeAmount(saleItems)} />

      <BulkCoffeeSections
        types={
          !types.ok ? (
            <p className="text-sm text-red-200">{types.error}</p>
          ) : (
            <BulkCoffeeTypes types={typeItems} />
          )
        }
        calculator={<BulkCoffeeCalculator types={typeItems} />}
        sales={
          !sales.ok ? (
            <p className="text-sm text-red-200">{sales.error}</p>
          ) : (
            <BulkCoffeeSales sales={saleItems} />
          )
        }
      />
    </Stack>
  );
}
