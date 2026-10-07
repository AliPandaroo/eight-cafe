"use client";

import { useActionState, useState } from "react";

import { CategoryBadges } from "@/components/admin/category-badges";
import { Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { updateRestaurantAction } from "@/features/admin/settings-actions";
import { formatInteger } from "@/lib/format";
import type { OfferScope } from "@/lib/pricing";
import type { CategoryRecord } from "@/types/menu";

export function SettingsForm({
  name,
  profitPercent,
  coffeePricePerKg,
  offerPercent,
  offerScope,
  offerCategoryId,
  categories,
}: {
  name: string;
  profitPercent: number;
  coffeePricePerKg: number;
  offerPercent: number;
  offerScope: OfferScope;
  offerCategoryId: string | null;
  categories: CategoryRecord[];
}) {
  const [state, action, pending] = useActionState(updateRestaurantAction, null);
  const [scope, setScope] = useState<OfferScope>(offerScope);
  const [categoryId, setCategoryId] = useState(offerCategoryId ?? "");

  return (
    <form action={action}>
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="offerScope" value={scope} />
      <input type="hidden" name="offerCategoryId" value={categoryId} />
      <Stack
        gap={4}
        className="rounded-(--radius) border border-foreground/15 p-3"
      >
        <Field
          label="نام رستوران"
          error={
            state && !state.ok
              ? (state.fieldErrors?.name?.[0] ?? state.error)
              : undefined
          }
        >
          <Input readOnly disabled defaultValue={name} />
        </Field>

        <Field
          label="قیمت پایه قهوه (تومان / کیلو)"
          error={
            state && !state.ok
              ? state.fieldErrors?.coffeePricePerKg?.[0]
              : undefined
          }
        >
          <Input
            name="coffeePricePerKg"
            inputMode="numeric"
            defaultValue={
              coffeePricePerKg > 0 ? formatInteger(coffeePricePerKg) : ""
            }
          />
          <p className="mt-1 text-[10px] text-text/55 md:text-xs">
            هزینه قهوه هر آیتم + قیمت پایه + سود - تخفیف.
          </p>
        </Field>

        <Field
          label="سود شخصی (٪)"
          error={
            state && !state.ok
              ? state.fieldErrors?.profitPercent?.[0]
              : undefined
          }
        >
          <Input
            name="profitPercent"
            inputMode="decimal"
            defaultValue={String(profitPercent)}
            required
          />
        </Field>

        <Stack
          gap={4}
          className="rounded-(--radius) border border-foreground/15 p-3"
        >
          <Field
            label="آفر / تخفیف (٪)"
            error={
              state && !state.ok
                ? state.fieldErrors?.offerPercent?.[0]
                : undefined
            }
          >
            <Input
              name="offerPercent"
              inputMode="decimal"
              defaultValue={String(offerPercent)}
              required
            />
          </Field>

          <Field
            label="اعمال آفر"
            error={
              state && !state.ok
                ? (state.fieldErrors?.offerScope?.[0] ??
                  state.fieldErrors?.offerCategoryId?.[0])
                : undefined
            }
          >
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={scope === "all" ? "primary" : "ghost"}
                className="rounded-full px-2.5 py-1 text-[11px]"
                onClick={() => setScope("all")}
              >
                همه آیتم‌ها
              </Button>
              <Button
                variant={scope === "category" ? "primary" : "ghost"}
                className="rounded-full px-2.5 py-1 text-[11px]"
                onClick={() => setScope("category")}
              >
                یک دسته
              </Button>
            </div>
          </Field>

          {scope === "category" ? (
            <CategoryBadges
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
            />
          ) : null}
        </Stack>
        {state?.ok ? (
          <p className="text-sm text-text/80">تنظیمات ذخیره شد.</p>
        ) : null}
        <Button
          variant="primary"
          type="submit"
          disabled={pending}
          className="self-start"
        >
          {pending ? "در حال ذخیره..." : "ذخیره"}
        </Button>
      </Stack>
    </form>
  );
}
