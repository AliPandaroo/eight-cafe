"use client"

import { motion } from "framer-motion"
import { createPortal } from "react-dom"

import { Flex, Stack } from "@/components/layout"
import { addPrefactorItem } from "@/components/menu/prefactor-cart"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import type { MenuItemRecord } from "@/types/menu"

export function VariantPicker({
  item,
  onClose,
}: {
  item: MenuItemRecord
  onClose: () => void
}) {
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 md:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/70"
        aria-label="بستن"
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-[var(--radius)] bg-background p-4 shadow-lg ring-1 ring-foreground/15"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Stack gap={3}>
          <Stack gap={1}>
            <h2 className="text-sm font-semibold">{item.name}</h2>
            <p className="text-[11px] text-text/70">یک سایز انتخاب کنید.</p>
          </Stack>
          <Stack gap={2}>
            {item.variants.map((variant) => (
              <Button
                key={variant.id}
                type="button"
                variant="ghost"
                className="w-full justify-between px-3 py-2 text-sm"
                onClick={() => {
                  addPrefactorItem(item, variant)
                  onClose()
                }}
              >
                <span>{variant.title}</span>
                <Flex justify="end" align="center" gap={1}>
                  {formatPrice(variant.price, variant.compareAtPrice)}
                </Flex>
              </Button>
            ))}
          </Stack>
          <Button type="button" variant="ghost" className="self-center md:self-start" onClick={onClose}>
            انصراف
          </Button>
        </Stack>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
