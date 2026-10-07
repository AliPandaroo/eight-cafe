"use client";

import { motion } from "framer-motion";
import type { MouseEvent } from "react";

import { Flex, Stack } from "@/components/layout";
import { openMenuItem } from "@/components/menu/item-selection";
import { ItemMedia } from "@/components/menu/item-media";
import { addPrefactorItem } from "@/components/menu/prefactor-cart";
import { VariantPicker } from "@/components/menu/variant-picker";
import { useStaffRole } from "@/components/menu/staff-role";
import { canBuildPrefactor } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { formatMenuItemPrice } from "@/lib/format";
import { useState } from "react";
import { cn } from "@/utils/classMerge";
import type { MenuItemRecord } from "@/types/menu";
import Link from "next/link";

function handleOpen(event: MouseEvent<HTMLAnchorElement>, id: string) {
  if (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  ) {
    return;
  }

  event.preventDefault();
  openMenuItem(id);
}

export function ItemCard({
  item,
  priority = false,
}: {
  item: MenuItemRecord;
  priority?: boolean;
}) {
  const role = useStaffRole();
  const canOrder = canBuildPrefactor(role) && item.isAvailable;
  const [picking, setPicking] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      whileTap={{ scale: 0.985 }}
    >
      <Link
        href={`/?item=${item.id}`}
        onClick={(event) => handleOpen(event, item.id)}
        className={cn("block", !item.isAvailable && "opacity-55")}
      >
        <article>
          <Flex align="stretch" gap={2} className="flex-col">
            <ItemMedia
              src={item.imageUrl}
              alt=""
              variant="card"
              priority={priority}
            />
            <Stack gap={1} className="min-w-0 items-start text-center">
              <h3 className="text-justify text-[13px] font-bold text-text md:text-[14px]">
                {item.name}
              </h3>
              <p className="line-clamp-2 text-justify text-[11px] font-normal text-text/65">
                {item.description ? item.description : "‌"}
              </p>
              <p className="self-end pt-1 text-[13px] text-foreground">
                {formatMenuItemPrice(item)}
              </p>
            </Stack>
          </Flex>
        </article>
      </Link>
      {canOrder ? (
        <Button
          variant="ghost"
          className="mt-1 w-full py-1 text-[11px]"
          onClick={(event) => {
            event.stopPropagation();
            if ((item.variants?.length ?? 0) > 0) {
              setPicking(true);
              return;
            }

            addPrefactorItem(item);
          }}
        >
          افزودن
        </Button>
      ) : null}
      {picking ? (
        <VariantPicker item={item} onClose={() => setPicking(false)} />
      ) : null}
    </motion.div>
  );
}
