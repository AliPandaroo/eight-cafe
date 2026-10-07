"use client";

import { useActionState, useState, useTransition } from "react";

import { Flex, Stack } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import {
  createCategoryAction,
  deleteCategoryAction,
  moveCategoryAction,
  updateCategoryAction,
} from "@/features/categories/actions";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import type { CategoryRecord } from "@/types/menu";
import { PlusIcon } from "lucide-react";

function CategoryRow({
  category,
  isFirst,
  isLast,
}: {
  category: CategoryRecord;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [state, action, pending] = useActionState(updateCategoryAction, null);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(category.name);

  return (
    <form
      action={action}
      className="flex w-full gap-3 rounded-(--radius) border border-foreground/15 p-3"
    >
      <input type="hidden" name="id" value={category.id} />
      <input
        type="hidden"
        name="isActive"
        value={category.isActive ? "true" : "false"}
      />
      <Flex gap={1}>
        <Button
          variant="ghost"
          disabled={isFirst || isPending}
          onClick={() =>
            startTransition(() => {
              void moveCategoryAction(category.id, "up");
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
          disabled={isLast || isPending}
          onClick={() =>
            startTransition(() => {
              void moveCategoryAction(category.id, "down");
            })
          }
          className="relative cursor-pointer"
        >
          <span className="absolute inset-0 top-[9%] m-auto h-fit text-2xl">
            ↓
          </span>
        </Button>
      </Flex>
      <Flex justify="between" align="start" gap={3} className="w-full">
        <Stack gap={1} className="min-w-0 flex-1">
          <Field
            label="نام دسته"
            error={state && !state.ok ? state.error : undefined}
          >
            <Input
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <StatusBadge
            active={category.isActive}
            activeLabel="فعال در منو"
            inactiveLabel="غیرفعال"
          />
        </Stack>
        <Flex
          gap={2}
          wrap="wrap"
          justify="between"
          className="max-w-28 self-end md:max-w-[8.4rem]"
        >
          <Button type="submit" disabled={pending || isPending || !name.trim()}>
            ذخیره
          </Button>
          <Button
            variant="danger"
            disabled={isPending}
            onClick={() => {
              if (!confirm("این دسته و آیتم‌های آن حذف شوند؟")) {
                return;
              }

              startTransition(() => {
                void deleteCategoryAction(category.id);
              });
            }}
          >
            حذف
          </Button>
          <Button
            variant="ghost"
            disabled={isPending}
            className="w-full"
            onClick={() =>
              startTransition(() => {
                const data = new FormData();
                data.set("id", category.id);
                data.set("name", category.name);
                data.set("isActive", category.isActive ? "false" : "true");
                void updateCategoryAction(null, data);
              })
            }
          >
            {category.isActive ? "غیرفعال کن" : "فعال کن"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}

export function CategoryManager({
  categories,
}: {
  categories: CategoryRecord[];
}) {
  const [state, action, pending] = useActionState(createCategoryAction, null);
  const [name, setName] = useState("");

  return (
    <Stack gap={4}>
      <form action={action}>
        <Flex justify="between" align="end" gap={3} wrap="wrap">
          <Field
            label="دسته جدید"
            error={state && !state.ok ? state.error : undefined}
          >
            <Flex gap={2}>
              <Input
                name="name"
                required
                className="max-w-xs"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <Button
                variant="primary"
                type="submit"
                disabled={pending || !name.trim()}
              >
                <PlusIcon className="size-5" />
              </Button>
            </Flex>
          </Field>
        </Flex>
      </form>

      {categories.length === 0 ? (
        <p className="text-sm text-text/70">هنوز دسته‌ای ساخته نشده است.</p>
      ) : (
        <Stack gap={3}>
          {categories.map((category, index) => (
            <CategoryRow
              key={category.id}
              category={category}
              isFirst={index === 0}
              isLast={index === categories.length - 1}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
