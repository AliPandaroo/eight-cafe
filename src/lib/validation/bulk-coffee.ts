import { z } from "zod";

import { toAsciiDigits } from "@/lib/prefactor/table";

function parsePositiveNumber(value: string, allowDecimal: boolean) {
  const normalized = toAsciiDigits(value)
    .trim()
    .replace(/[,\s٬]/g, "");

  if (
    !normalized ||
    !(allowDecimal ? /^\d+(\.\d+)?$/ : /^\d+$/).test(normalized)
  ) {
    return null;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 99_999_999_999) {
    return null;
  }

  return amount;
}

const pricePerKgSchema = z
  .union([z.string(), z.number()])
  .transform((value, ctx) => {
    if (value === "" || value === undefined) {
      return 0;
    }

    const amount =
      typeof value === "number"
        ? value
        : (parsePositiveNumber(String(value), false) ??
          (toAsciiDigits(String(value)).replace(/[,\s٬]/g, "") === "0"
            ? 0
            : null));

    if (amount === null || amount < 0) {
      ctx.addIssue({
        code: "custom",
        message: "قیمت کیلو را به تومن بنویسید",
      });
      return z.NEVER;
    }

    return amount;
  });

export const saveBulkCoffeeTypeSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1, "نام نوع لازم است").max(80),
  pricePerKg: pricePerKgSchema,
  isActive: z.boolean().optional(),
});

export const createBulkCoffeeSaleSchema = z.object({
  typeId: z.string().min(1, "نوع قهوه را انتخاب کنید"),
  unit: z.enum(["grams", "toman"]),
  value: z
    .string()
    .trim()
    .min(1, "مقدار لازم است")
    .transform((value, ctx) => {
      const amount = parsePositiveNumber(value, true);

      if (amount === null) {
        ctx.addIssue({
          code: "custom",
          message: "مقدار را درست وارد کنید",
        });
        return z.NEVER;
      }

      return amount;
    }),
});
