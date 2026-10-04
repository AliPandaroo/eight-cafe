import type { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import type { VariantProps } from "tailwind-variants"

import { cn } from "@/utils/classMerge"

import { gridVariants } from "./core/config"

export type GridProps = ComponentProps<"div"> &
  VariantProps<typeof gridVariants> & {
    asChild?: boolean
  }

export function Grid({
  className,
  asChild,
  cols,
  gap,
  w,
  ...props
}: GridProps) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      className={cn(gridVariants({ cols, gap, w }), className)}
      {...props}
    />
  )
}
