import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "tailwind-variants";

import { cn } from "@/utils/classMerge";

import { boxVariants } from "./core/config";

export type BoxProps = ComponentProps<"div"> &
  VariantProps<typeof boxVariants> & {
    asChild?: boolean;
  };

export function Box({ className, asChild, w, ...props }: BoxProps) {
  const Comp = asChild ? Slot : "div";

  return <Comp className={cn(boxVariants({ w }), className)} {...props} />;
}
