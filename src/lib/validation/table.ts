import { z } from "zod";

import { parseTableNumber } from "@/lib/prefactor/table";

export const createCafeTableSchema = z.object({
  number: z
    .string()
    .trim()
    .min(1, "شماره میز لازم است")
    .transform((value, ctx) => {
      const table = parseTableNumber(value);

      if (table === null || table < 1) {
        ctx.addIssue({
          code: "custom",
          message: "شماره میز از ۱ تا ۹۹۹",
        });
        return z.NEVER;
      }

      return table;
    }),
});
