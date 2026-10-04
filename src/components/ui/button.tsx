import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "tailwind-variants";

import { cn } from "@/utils/classMerge";
import { tv } from "@/utils/tv";

export const buttonVariants = tv({
  base: "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] px-3 py-2 text-[11px] md:text-sm font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
  variants: {
    variant: {
      primary: "bg-foreground text-ink min-w-[69px]",
      ghost: "border border-foreground/25 bg-transparent text-text",
      danger: "border border-red-300/40 bg-red-500/30 text-red-100",
      circle: "bg-foreground text-ink",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  asChild,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      {...(asChild ? {} : { type })}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}
