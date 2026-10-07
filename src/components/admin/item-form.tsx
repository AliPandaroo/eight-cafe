"use client";

import { useActionState, useState, useSyncExternalStore } from "react";

import { CategoryBadges } from "@/components/admin/category-badges";
import {
  getCategoryFilter,
  subscribeCategoryFilter,
} from "@/components/admin/category-filter";
import { Flex, Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { saveMenuItemAction } from "@/features/items/actions";
import { priceToAdminInput } from "@/lib/format";
import type { CategoryRecord, MenuItemRecord } from "@/types/menu";
import { PlusIcon } from "lucide-react";

export function ItemForm({
  categories,
  item,
}: {
  categories: CategoryRecord[];
  item?: MenuItemRecord;
}) {
  const [state, action, pending] = useActionState(saveMenuItemAction, null);
  const [removeImage, setRemoveImage] = useState(false);
  const filteredCategoryId = useSyncExternalStore(
    subscribeCategoryFilter,
    getCategoryFilter,
    () => "",
  );
  const defaultCategoryId =
    item?.categoryId ??
    (categories.some((category) => category.id === filteredCategoryId)
      ? filteredCategoryId
      : (categories[0]?.id ?? ""));
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? "");
  const selectedCategoryId = categoryId || defaultCategoryId;
  const [hasVariants, setHasVariants] = useState(
    (item?.variants.length ?? 0) > 0,
  );
  const [variants, setVariants] = useState(
    item?.variants.length
      ? item.variants.map((variant) => ({
          id: variant.id,
          title: variant.title,
          price: priceToAdminInput(variant.price),
          coffeeGrams: variant.coffeeGrams ? String(variant.coffeeGrams) : "",
        }))
      : [
          { id: "", title: "", price: "", coffeeGrams: "" },
          { id: "", title: "", price: "", coffeeGrams: "" },
        ],
  );

  return (
    <form action={action}>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <input
        type="hidden"
        name="removeImage"
        value={removeImage ? "true" : "false"}
      />
      <Stack gap={4}>
        {state && !state.ok ? (
          <p className="text-sm text-red-200">{state.error}</p>
        ) : null}

        <input type="hidden" name="categoryId" value={selectedCategoryId} />
        <Field
          label="دسته"
          error={
            state && !state.ok ? state.fieldErrors?.categoryId?.[0] : undefined
          }
        >
          <CategoryBadges
            categories={categories}
            value={selectedCategoryId}
            onChange={setCategoryId}
          />
        </Field>

        <Field
          label="نام آیتم"
          error={state && !state.ok ? state.fieldErrors?.name?.[0] : undefined}
        >
          <Input name="name" defaultValue={item?.name} required />
        </Field>

        <Field
          label="توضیح"
          error={
            state && !state.ok ? state.fieldErrors?.description?.[0] : undefined
          }
        >
          <Textarea name="description" defaultValue={item?.description} />
        </Field>

        {hasVariants ? null : (
          <Field
            label="قیمت پایه"
            error={
              state && !state.ok ? state.fieldErrors?.price?.[0] : undefined
            }
          >
            <Input
              name="price"
              inputMode="numeric"
              defaultValue={item ? priceToAdminInput(item.price) : ""}
              placeholder=""
              required
            />
          </Field>
        )}

        <Stack className="rounded-(--radius) border border-foreground/15 p-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              className="inline-block size-6 appearance-none rounded border border-foreground/30 bg-transparent checked:bg-foreground"
              type="checkbox"
              name="hasVariants"
              value="true"
              checked={hasVariants}
              onChange={(event) => {
                setHasVariants(event.target.checked);
                if (event.target.checked && variants.length < 2) {
                  setVariants([
                    { id: "", title: "", price: "", coffeeGrams: "" },
                    { id: "", title: "", price: "", coffeeGrams: "" },
                  ]);
                }
              }}
            />
            سایز دارد
          </label>

          {hasVariants ? (
            <Stack gap={3}>
              {variants.map((variant, index) => (
                <div
                  key={`${variant.id}-${index}`}
                  className="grid grid-cols-2 gap-2 rounded-(--radius) border border-foreground/15 p-2 md:grid-cols-3"
                >
                  {variant.id ? (
                    <input type="hidden" name="variantId" value={variant.id} />
                  ) : (
                    <input type="hidden" name="variantId" value="" />
                  )}
                  <Field label="عنوان">
                    <Input
                      name="variantTitle"
                      value={variant.title}
                      onChange={(event) => {
                        const next = [...variants];
                        next[index] = { ...variant, title: event.target.value };
                        setVariants(next);
                      }}
                      required
                    />
                  </Field>
                  <Field label="قیمت پایه">
                    <Input
                      name="variantPrice"
                      inputMode="numeric"
                      value={variant.price}
                      onChange={(event) => {
                        const next = [...variants];
                        next[index] = { ...variant, price: event.target.value };
                        setVariants(next);
                      }}
                      required
                    />
                  </Field>
                  <div className="col-span-2 md:col-span-1">
                    <Field label="گرم قهوه">
                      <Input
                        name="variantCoffeeGrams"
                        inputMode="decimal"
                        value={variant.coffeeGrams}
                        onChange={(event) => {
                          const next = [...variants];
                          next[index] = {
                            ...variant,
                            coffeeGrams: event.target.value,
                          };
                          setVariants(next);
                        }}
                      />
                    </Field>
                  </div>
                  {variants.length > 1 ? (
                    <Button
                      type="button"
                      variant="danger"
                      className="col-span-full self-start px-2 py-1 text-[11px]"
                      onClick={() =>
                        setVariants(variants.filter((_, row) => row !== index))
                      }
                    >
                      حذف
                    </Button>
                  ) : null}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                className="self-end p-1"
                onClick={() =>
                  setVariants([
                    ...variants,
                    { id: "", title: "", price: "", coffeeGrams: "" },
                  ])
                }
              >
                <PlusIcon className="size-5 text-foreground!" />
              </Button>
            </Stack>
          ) : null}
        </Stack>
        {hasVariants ? (
          <p className="text-[10px] text-text/55 md:text-xs">
            هزینه قهوه هر سایز جدا حساب می‌شود و به قیمت پایه همان سایز اضافه
            می‌گردد.
          </p>
        ) : (
          <Field
            label="گرم قهوه مصرفی"
            error={
              state && !state.ok
                ? state.fieldErrors?.coffeeGrams?.[0]
                : undefined
            }
          >
            <Input
              name="coffeeGrams"
              inputMode="decimal"
              defaultValue={item?.coffeeGrams ? String(item.coffeeGrams) : ""}
              placeholder="مثلاً ۲۱"
            />
            <p className="mt-1 text-[10px] text-text/55 md:text-xs">
              هزینه قهوه خودکار حساب می‌شود و به قیمت پایه اضافه می‌گردد. برای
              آیتم بدون قهوه خالی بگذارید.
            </p>
          </Field>
        )}

        <Field label="تصویر">
          <Input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
        </Field>

        {item?.imageUrl && !removeImage ? (
          <Stack gap={2}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-28 w-28 rounded-(--radius) object-cover"
            />
            <Button
              variant="ghost"
              className="self-start"
              onClick={() => setRemoveImage(true)}
            >
              حذف تصویر فعلی
            </Button>
          </Stack>
        ) : null}

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            className="inline-block size-6 appearance-none rounded border border-foreground/30 bg-transparent checked:bg-foreground focus:ring-foreground"
            type="checkbox"
            name="isAvailable"
            value="true"
            defaultChecked={item?.isAvailable ?? true}
          />
          موجود است
        </label>

        <Flex gap={2}>
          <Button type="submit" disabled={pending}>
            {pending ? "در حال ذخیره..." : "ذخیره آیتم"}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
