"use client";

import { motion } from "framer-motion";

import { Center, Stack } from "@/components/layout";
import { BrandMark } from "@/components/menu/brand-mark";

export function Splash({ name }: { name: string }) {
  return (
    <Center className="min-h-full bg-background px-6">
      <Stack align="center" gap={4}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrandMark size="lg" />
        </motion.div>
        <motion.h1
          className="text-center font-brand text-[18px] font-normal text-text"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
        >
          {name}
        </motion.h1>
        <motion.p
          className="text-[11px] text-text/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.14 }}
        >
          menup
        </motion.p>
      </Stack>
    </Center>
  );
}
