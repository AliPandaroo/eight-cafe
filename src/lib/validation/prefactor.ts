import { z } from "zod";

import { parseTableNumber } from "@/lib/prefactor/table";

export const createPrefactorSchema = z.object({
  tableLabel: z
    .string()
    .trim()
    .min(1, "شماره میز لازم است")
    .transform((value, ctx) => {
      const table = parseTableNumber(value);

      if (table === null) {
        ctx.addIssue({
          code: "custom",
          message: "شماره میز را وارد کنید؛ ۰ یعنی بیرون‌بر",
        });
        return z.NEVER;
      }

      return String(table);
    }),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1),
        variantId: z.string().min(1).optional(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "حداقل یک آیتم لازم است"),
});
