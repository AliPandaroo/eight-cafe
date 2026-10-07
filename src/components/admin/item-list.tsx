"use client";

import Link from "next/link";
import { useTransition, useSyncExternalStore } from "react";

import { CategoryBadges } from "@/components/admin/category-badges";
import {
  getCategoryFilter,
  setCategoryFilter,
  subscribeCategoryFilter,
} from "@/components/admin/category-filter";
import { StatusBadge } from "@/components/admin/status-badge";
import { Flex, Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  deleteMenuItemAction,
  moveMenuItemAction,
  toggleMenuItemAvailabilityAction,
} from "@/features/items/actions";
import { formatPrice, formatPriceRange } from "@/lib/format";
import type { CategoryRecord, MenuItemRecord } from "@/types/menu";

export function ItemList({
  items,
  categories,
}: {
  items: MenuItemRecord[];
  categories: CategoryRecord[];
}) {
  const [isPending, startTransition] = useTransition();
  const selectedCategoryId = useSyncExternalStore(
    subscribeCategoryFilter,
    getCategoryFilter,
    () => "",
  );

  const visibleItems = selectedCategoryId
    ? items.filter((item) => item.categoryId === selectedCategoryId)
    : items;

  return (
    <Stack gap={4}>
      <Flex justify="between" align="start" gap={3} wrap="wrap">
        <CategoryBadges
          allowAll
          categories={categories}
          value={selectedCategoryId}
          onChange={setCategoryFilter}
        />
        <Button asChild>
          <Link href="/admin/items/new">آیتم جدید</Link>
        </Button>
      </Flex>

      {visibleItems.length === 0 ? (
        <p className="text-sm text-text/70">آیتمی برای نمایش وجود ندارد.</p>
      ) : (
        <Stack gap={3}>
          {visibleItems.map((item, index) => {
            const category = categories.find(
              (entry) => entry.id === item.categoryId,
            );

            return (
              <Flex
                key={item.id}
                gap={3}
                className="w-full rounded-(--radius) border border-foreground/15 p-3"
              >
                {selectedCategoryId ? (
                  <Flex gap={1}>
                    <Button
                      variant="ghost"
                      disabled={index === 0 || isPending}
                      onClick={() =>
                        startTransition(() => {
                          void moveMenuItemAction(item.id, "up");
                        })
                      }
                      className="relative cursor-pointer"
                    >
                      <span className="absolute inset-0 top-[9%] m-auto h-fit text-2xl">
                        ↑
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={index === visibleItems.length - 1 || isPending}
                      onClick={() =>
                        startTransition(() => {
                          void moveMenuItemAction(item.id, "down");
                        })
                      }
                      className="relative cursor-pointer"
                    >
                      <span className="absolute inset-0 top-[9%] m-auto h-fit text-2xl">
                        ↓
                      </span>
                    </Button>
                  </Flex>
                ) : null}
                <Flex
                  justify="between"
                  align="start"
                  gap={3}
                  className="w-full"
                >
                  <Stack gap={1}>
                    <p className="text-[11px] font-bold md:text-sm">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-text/70">
                      {!selectedCategoryId ? (
                        <>
                          {category?.name ?? "بدون دسته"}{" "}
                          <span className="mx-2 inline-block font-bold">
                            ·
                          </span>{" "}
                        </>
                      ) : null}
                      {item.variants.length > 1
                        ? formatPriceRange(
                            String(
                              Math.min(
                                ...item.variants.map((variant) =>
                                  Number(variant.price),
                                ),
                              ),
                            ),
                            String(
                              Math.max(
                                ...item.variants.map((variant) =>
                                  Number(variant.price),
                                ),
                              ),
                            ),
                          )
                        : formatPrice(item.price)}
                    </p>
                    <StatusBadge
                      active={item.isAvailable}
                      activeLabel="موجود"
                      inactiveLabel="ناموجود"
                    />
                  </Stack>
                  <Flex
                    gap={2}
                    wrap="wrap"
                    justify="between"
                    className="max-w-[7.4rem] self-end md:max-w-[8.4rem]"
                  >
                    <Button asChild variant="ghost">
                      <Link href={`/admin/items/${item.id}`}>ویرایش</Link>
                    </Button>
                    <Button
                      variant="danger"
                      disabled={isPending}
                      onClick={() => {
                        if (!confirm("این آیتم حذف شود؟")) {
                          return;
                        }

                        startTransition(() => {
                          void deleteMenuItemAction(item.id);
                        });
                      }}
                    >
                      حذف
                    </Button>

                    <Button
                      variant="ghost"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(() => {
                          void toggleMenuItemAvailabilityAction(
                            item.id,
                            !item.isAvailable,
                          );
                        })
                      }
                      className="w-full"
                    >
                      {item.isAvailable ? "ناموجود کن" : "موجود کن"}
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
