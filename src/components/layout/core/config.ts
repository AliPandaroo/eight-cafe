import { tv } from "@/utils/tv"

/** Tailwind spacing tokens shared across layout components. */
export const gapScale = {
  none: "gap-0",
  0.5: "gap-0.5",
  1: "gap-1",
  1.5: "gap-1.5",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
} as const

export const gapXScale = {
  none: "gap-x-0",
  0.5: "gap-x-0.5",
  1: "gap-x-1",
  1.5: "gap-x-1.5",
  2: "gap-x-2",
  3: "gap-x-3",
  4: "gap-x-4",
  5: "gap-x-5",
  6: "gap-x-6",
  8: "gap-x-8",
  10: "gap-x-10",
  12: "gap-x-12",
} as const

export const gapYScale = {
  none: "gap-y-0",
  0.5: "gap-y-0.5",
  1: "gap-y-1",
  1.5: "gap-y-1.5",
  2: "gap-y-2",
  3: "gap-y-3",
  4: "gap-y-4",
  5: "gap-y-5",
  6: "gap-y-6",
  8: "gap-y-8",
  10: "gap-y-10",
  12: "gap-y-12",
} as const

export type GapToken = keyof typeof gapScale

export const alignScale = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
} as const

export const justifyScale = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
} as const

export const directionScale = {
  row: "flex-row",
  col: "flex-col",
  rowReverse: "flex-row-reverse",
  colReverse: "flex-col-reverse",
} as const

export const wrapScale = {
  wrap: "flex-wrap",
  nowrap: "flex-nowrap",
  wrapReverse: "flex-wrap-reverse",
} as const

export const widthScale = {
  auto: "w-auto",
  full: "w-full",
  fit: "w-fit",
  maxMd: "max-w-md",
  maxLg: "max-w-lg",
  maxXl: "max-w-xl",
  max2xl: "max-w-2xl",
  max3xl: "max-w-3xl",
} as const

export const gridColsScale = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  6: "grid-cols-6",
  12: "grid-cols-12",
} as const

export type ColSpan =
  1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full" | "auto"

export type ColOffset = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export const GRID_COLUMNS = 12

export const breakpointPrefix = {
  sm: "sm:",
  md: "md:",
  lg: "lg:",
  xl: "xl:",
  xxl: "2xl:",
} as const

export type LayoutBreakpoint = keyof typeof breakpointPrefix

export const colSpanClassMap: Record<ColSpan, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
  full: "col-span-full",
  auto: "col-span-auto",
}

export type ColLayoutProps = {
  span?: ColSpan
  offset?: ColOffset
  offsetEnd?: ColOffset
  sm?: ColSpan
  smOffset?: ColOffset
  smOffsetEnd?: ColOffset
  md?: ColSpan
  mdOffset?: ColOffset
  mdOffsetEnd?: ColOffset
  lg?: ColSpan
  lgOffset?: ColOffset
  lgOffsetEnd?: ColOffset
  xl?: ColSpan
  xlOffset?: ColOffset
  xlOffsetEnd?: ColOffset
  xxl?: ColSpan
  xxlOffset?: ColOffset
  xxlOffsetEnd?: ColOffset
}

export const boxVariants = tv({
  base: "",
  variants: {
    w: widthScale,
  },
})

export const flexVariants = tv({
  base: "flex",
  variants: {
    direction: directionScale,
    align: alignScale,
    justify: justifyScale,
    wrap: wrapScale,
    gap: gapScale,
    inline: {
      true: "inline-flex",
    },
    w: widthScale,
  },
  defaultVariants: {
    direction: "row",
    align: "stretch",
    justify: "start",
    gap: "none",
  },
})

export const rowVariants = tv({
  base: "grid w-full grid-cols-12",
  variants: {
    align: alignScale,
    justify: justifyScale,
    w: widthScale,
  },
  defaultVariants: {
    align: "stretch",
    justify: "start",
  },
})

export const gridVariants = tv({
  base: "grid",
  variants: {
    cols: gridColsScale,
    gap: gapScale,
    w: widthScale,
  },
  defaultVariants: {
    gap: "none",
  },
})
