import { z } from "zod";

import { parseUnsignedNumber } from "@/lib/parse/number";

const pricePerKgSchema = z
  .union([z.string(), z.number()])
  .transform((value, ctx) => {
    if (value === "" || value === undefined) {
      return 0;
    }

    const amount =
      typeof value === "number"
        ? value
        : parseUnsignedNumber(String(value), { min: 0 });

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
      const amount = parseUnsignedNumber(value, {
        allowDecimal: true,
        min: 0,
      });

      if (amount === null || amount <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "مقدار را درست وارد کنید",
        });
        return z.NEVER;
      }

      return amount;
    }),
});
