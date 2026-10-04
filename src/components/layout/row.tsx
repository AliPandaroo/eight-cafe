import type { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import type { VariantProps } from "tailwind-variants"

import { cn } from "@/utils/classMerge"

import { rowVariants, type GapToken } from "./core/config"
import { resolveRowGutterClasses } from "./core/utils"

export type RowProps = ComponentProps<"div"> &
  VariantProps<typeof rowVariants> & {
    asChild?: boolean
    /** Uniform gutter, or `[horizontal, vertical]` tuple. */
    gutter?: GapToken | [GapToken, GapToken]
    gutterX?: GapToken
    gutterY?: GapToken
  }

/** 12-column grid row with configurable gutter spacing. */
export function Row({
  className,
  asChild,
  align,
  justify,
  w,
  gutter,
  gutterX,
  gutterY,
  ...props
}: RowProps) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      className={cn(
        rowVariants({ align, justify, w }),
        resolveRowGutterClasses({ gutter, gutterX, gutterY }),
        className,
      )}
      {...props}
    />
  )
}

export { rowVariants }
