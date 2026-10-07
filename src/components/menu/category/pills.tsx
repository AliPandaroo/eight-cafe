"use client";

import type { MouseEvent } from "react";
import { motion } from "framer-motion";

import { cn } from "@/utils/classMerge";

export type CategoryPill = { id: string; slug: string; name: string };

export function CategoryPills({
  categories,
  activeSlug,
  reveal,
  onSelect,
}: {
  categories: CategoryPill[];
  activeSlug: string;
  reveal: boolean;
  onSelect: (event: MouseEvent<HTMLAnchorElement>, slug: string) => void;
}) {
  return (
    <>
      {categories.map((category, index) => {
        const active = category.slug === activeSlug;

        return (
          <motion.a
            key={category.id}
            href={`#${category.slug}`}
            data-category-slug={category.slug}
            onClick={(event) => onSelect(event, category.slug)}
            initial={reveal ? { opacity: 0, y: 14 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: reveal ? 0.08 + index * 0.11 : 0,
              duration: 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
              "relative shrink-0 rounded-(--radius) px-3 py-1.5 text-[13px] whitespace-nowrap",
              active ? "text-ink" : "text-text/55",
            )}
          >
            {active ? (
              <motion.span
                layoutId="active-category"
                className="absolute inset-0 rounded-(--radius) bg-foreground"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            ) : null}
            <span className="relative z-10">{category.name}</span>
          </motion.a>
        );
      })}
    </>
  );
}
