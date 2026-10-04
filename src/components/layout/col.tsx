import type { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/utils/classMerge"

import {
  type ColLayoutProps,
  type ColOffset,
  type ColSpan,
} from "./core/config"
import { buildColLayoutClasses } from "./core/utils"

export type ColProps = ComponentProps<"div"> &
  ColLayoutProps & {
    asChild?: boolean
  }

/** Grid column inside `<Row>` — span, offset, and responsive sizes. */
export function Col({
  className,
  asChild,
  span,
  offset,
  offsetEnd,
  sm,
  smOffset,
  smOffsetEnd,
  md,
  mdOffset,
  mdOffsetEnd,
  lg,
  lgOffset,
  lgOffsetEnd,
  xl,
  xlOffset,
  xlOffsetEnd,
  xxl,
  xxlOffset,
  xxlOffsetEnd,
  ...props
}: ColProps) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      className={cn(
        buildColLayoutClasses({
          span,
          offset,
          offsetEnd,
          sm,
          smOffset,
          smOffsetEnd,
          md,
          mdOffset,
          mdOffsetEnd,
          lg,
          lgOffset,
          lgOffsetEnd,
          xl,
          xlOffset,
          xlOffsetEnd,
          xxl,
          xxlOffset,
          xxlOffsetEnd,
        }),
        className,
      )}
      {...props}
    />
  )
}

export type { ColLayoutProps, ColOffset, ColSpan }
