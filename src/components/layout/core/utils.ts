import {
  breakpointPrefix,
  colSpanClassMap,
  gapScale,
  gapXScale,
  gapYScale,
  GRID_COLUMNS,
  type ColLayoutProps,
  type ColOffset,
  type ColSpan,
  type GapToken,
  type LayoutBreakpoint,
} from "./config"

function withBreakpoint(prefix: string | undefined, className: string) {
  if (!prefix) {
    return className
  }

  return `${prefix}${className}`
}

function colStartClass(offset: ColOffset, prefix?: string) {
  return withBreakpoint(prefix, `col-start-${offset + 1}`)
}

function colEndClass(offsetEnd: ColOffset, prefix?: string) {
  return withBreakpoint(prefix, `col-end-${GRID_COLUMNS + 1 - offsetEnd}`)
}

function colSpanClass(span: ColSpan, prefix?: string) {
  return withBreakpoint(prefix, colSpanClassMap[span])
}

export function buildColLayoutClasses({
  span = 12,
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
}: ColLayoutProps) {
  const classes: string[] = [colSpanClass(span)]

  if (offset !== undefined) {
    classes.push(colStartClass(offset))
  }

  if (offsetEnd !== undefined) {
    classes.push(colEndClass(offsetEnd))
  }

  const responsiveRules: Array<
    [
      LayoutBreakpoint | undefined,
      ColSpan | undefined,
      ColOffset | undefined,
      ColOffset | undefined,
    ]
  > = [
    ["sm", sm, smOffset, smOffsetEnd],
    ["md", md, mdOffset, mdOffsetEnd],
    ["lg", lg, lgOffset, lgOffsetEnd],
    ["xl", xl, xlOffset, xlOffsetEnd],
    ["xxl", xxl, xxlOffset, xxlOffsetEnd],
  ]

  for (const [
    breakpoint,
    responsiveSpan,
    responsiveOffset,
    responsiveOffsetEnd,
  ] of responsiveRules) {
    const prefix = breakpoint ? breakpointPrefix[breakpoint] : undefined

    if (responsiveSpan !== undefined) {
      classes.push(colSpanClass(responsiveSpan, prefix))
    }

    if (responsiveOffset !== undefined) {
      classes.push(colStartClass(responsiveOffset, prefix))
    }

    if (responsiveOffsetEnd !== undefined) {
      classes.push(colEndClass(responsiveOffsetEnd, prefix))
    }
  }

  return classes
}

export function resolveRowGutterClasses({
  gutter,
  gutterX,
  gutterY,
}: {
  gutter?: GapToken | [GapToken, GapToken]
  gutterX?: GapToken
  gutterY?: GapToken
}) {
  if (Array.isArray(gutter)) {
    return [gapXScale[gutter[0]], gapYScale[gutter[1]]]
  }

  const classes: string[] = []

  if (gutter !== undefined) {
    classes.push(gapScale[gutter])
  }

  if (gutterX !== undefined) {
    classes.push(gapXScale[gutterX])
  }

  if (gutterY !== undefined) {
    classes.push(gapYScale[gutterY])
  }

  return classes
}
