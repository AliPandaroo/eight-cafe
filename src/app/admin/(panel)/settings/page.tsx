import { headers } from "next/headers";

import { requireManager } from "@/lib/admin/session";
import { SettingsForm } from "@/components/admin/settings/settings-form";
import { SettingsQrCodes } from "@/components/admin/settings/settings-qr-codes";
import { Stack } from "@/components/layout";
import { getRestaurant } from "@/lib/db/restaurant";
import { listCategories } from "@/lib/menu/category";

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  return host ? `${protocol}://${host}` : "";
}

export default async function AdminSettingsPage() {
  await requireManager();
  const [restaurant, categories, origin] = await Promise.all([
    getRestaurant(),
    listCategories(),
    getRequestOrigin(),
  ]);

  return (
    <Stack gap={8} className="w-full">
      <Stack gap={1}>
        <h1 className="text-lg font-semibold md:text-xl">تنظیمات</h1>
        <p className="text-justify text-xs text-text/70 md:text-sm">
          قیمت پایه قهوه به‌ازای کیلوگرم است. گرم مصرفی هر آیتم در فرم آیتم وارد
          می‌شود و هزینه قهوه خودکار به قیمت منو اضافه می‌گردد. سپس سود و آفر
          اعمال می‌شود. قیمت ذخیره‌شده در پنل همان قیمت اولیه است.
        </p>
      </Stack>
      <div className="max-w-xl">
        <SettingsForm
          name={restaurant.name}
          profitPercent={restaurant.profitPercent}
          coffeePricePerKg={restaurant.coffeePricePerKg}
          offerPercent={restaurant.offerPercent}
          offerScope={restaurant.offerScope}
          offerCategoryId={restaurant.offerCategoryId}
          categories={categories.ok ? categories.data : []}
        />
      </div>
      <SettingsQrCodes origin={origin} />
    </Stack>
  );
}
