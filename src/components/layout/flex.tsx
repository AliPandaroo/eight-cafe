import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "tailwind-variants";

import { cn } from "@/utils/classMerge";

import { flexVariants } from "./core/config";

export type FlexProps = ComponentProps<"div"> &
  VariantProps<typeof flexVariants> & {
    asChild?: boolean;
  };

export function Flex({
  className,
  asChild,
  direction,
  align,
  justify,
  wrap,
  gap,
  inline,
  w,
  ...props
}: FlexProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(
        flexVariants({ direction, align, justify, wrap, gap, inline, w }),
        className,
      )}
      {...props}
    />
  );
}

export { flexVariants };
