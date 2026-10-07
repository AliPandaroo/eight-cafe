import { z } from "zod";

import { toAsciiDigits } from "@/lib/prefactor/table";

export function parseExpenseAmount(value: string) {
  const normalized = toAsciiDigits(value)
    .trim()
    .replace(/[,\s٬]/g, "");

  if (!normalized || !/^\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 99_999_999_999) {
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
