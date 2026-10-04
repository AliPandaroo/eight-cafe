"use client";

import { motion, type MotionValue, useTransform } from "framer-motion";

export function IntroProgress({ progress }: { progress: MotionValue<number> }) {
  const width = useTransform(progress, (value) => `${value}%`);
  const left = useTransform(progress, (value) => `max(1.75rem, ${value}%)`);
  const label = useTransform(progress, (value) => `${Math.round(value)}%`);

  return (
    <div
      dir="ltr"
      className="relative h-36 w-full overflow-hidden bg-background md:h-40"
    >
      <div className="absolute inset-0 bg-foreground/12" />
      <motion.span
        className="absolute top-1/2 z-1 font-medium tabular-nums tracking-wide text-foreground md:text-[128px] text-[56px]"
        style={{
          left,
          x: "-8%",
          y: "-50%",
        }}
      >
        {label}
      </motion.span>
      <motion.div
        className="absolute inset-y-0 left-0 z-2 bg-foreground"
        style={{ width }}
      />
    </div>
  );
}
