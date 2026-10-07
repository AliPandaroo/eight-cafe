"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { MouseEvent } from "react";

import { Stack } from "@/components/layout";
import { closeMenuItem } from "@/components/menu/item-selection";
import { ItemMedia } from "@/components/menu/item-media";
import { addPrefactorItem } from "@/components/menu/prefactor-cart";
import { VariantPicker } from "@/components/menu/variant-picker";
import { useStaffRole } from "@/components/menu/staff-role";
import { canBuildPrefactor } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { formatMenuItemPrice } from "@/lib/format";
import type { MenuItemRecord } from "@/types/menu";
import Link from "next/link";

function handleClose(event: MouseEvent<HTMLAnchorElement>) {
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
  closeMenuItem();
}

export function ItemDetail({
  item,
  coffeeOnly = false,
}: {
  item: MenuItemRecord;
  coffeeOnly?: boolean;
}) {
  const closeHref = coffeeOnly ? "/?coffee=1" : "/";
  const role = useStaffRole();
  const canOrder = canBuildPrefactor(role) && item.isAvailable;
  const [picking, setPicking] = useState(false);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenuItem();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-60 flex items-end justify-center p-4 md:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={closeHref}
        onClick={handleClose}
        className="absolute inset-0 bg-background/70"
        aria-label="بستن"
      />
      <motion.div
        className="relative z-10 w-full max-w-md rounded-(--radius) bg-background p-4 shadow-lg ring-1 ring-foreground/15"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Stack gap={4}>
          <ItemMedia
            src={item.imageUrl}
            alt={item.name}
            variant="detail"
            priority
          />
          <Stack direction="row" justify="between" align="start">
            <Stack gap={2}>
              <h2 className="text-[16px] font-bold text-text">{item.name}</h2>
              {item.description ? (
                <p className="text-[11px] leading-6 text-text/70">
                  {item.description}
                </p>
              ) : null}
              <p className="text-[14px] text-text">
                {formatMenuItemPrice(item)}
              </p>
            </Stack>
            {canOrder ? (
              <Button
                variant="primary"
                className="self-start"
                onClick={() => {
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
          </Stack>
          <Button asChild variant="ghost" className="self-center md:self-start">
            <Link href={closeHref} onClick={handleClose}>
              بستن
            </Link>
          </Button>
        </Stack>
      </motion.div>
      {picking ? (
        <VariantPicker item={item} onClose={() => setPicking(false)} />
      ) : null}
    </motion.div>
  );
}
