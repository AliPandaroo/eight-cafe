import { z } from "zod";

import { parseUnsignedNumber } from "@/lib/parse/number";

export function parseExpenseAmount(value: string) {
  const amount = parseUnsignedNumber(value, { allowDecimal: true, min: 0 });

  if (amount === null || amount <= 0) {
    return null;
  }

  return Math.round(amount);
}

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1, "عنوان لازم است").max(80),
  amount: z
    .string()
    .trim()
    .min(1, "مبلغ لازم است")
    .transform((value, ctx) => {
      const amount = parseExpenseAmount(value);

      if (amount === null) {
        ctx.addIssue({
          code: "custom",
          message: "مبلغ را مثل ۴٬۵۰۰٬۰۰۰ وارد کنید",
        });
        return z.NEVER;
      }

      return String(amount);
    }),
});
