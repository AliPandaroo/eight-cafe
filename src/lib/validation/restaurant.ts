import { z } from "zod";

function amountSchema(message: string) {
  return z.union([z.number(), z.string()]).transform((value, ctx) => {
    const amount =
      typeof value === "number"
        ? value
        : Number(String(value).replace(/[,\s]/g, ""));

    if (!Number.isFinite(amount) || amount < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
      });
      return z.NEVER;
    }

    return amount;
  });
}

const percentSchema = amountSchema("درصد باید صفر یا بیشتر باشد");
const coffeePriceSchema = amountSchema("قیمت کیلو باید صفر یا بیشتر باشد");

export const updateRestaurantSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80),
    profitPercent: percentSchema,
    coffeePricePerKg: coffeePriceSchema,
    offerPercent: percentSchema,
    offerScope: z.enum(["all", "category"]),
    offerCategoryId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.offerPercent > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["offerPercent"],
        message: "آفر نمی‌تواند بیشتر از ۱۰۰٪ باشد",
      });
    }

    if (
      value.offerScope === "category" &&
      value.offerPercent > 0 &&
      !value.offerCategoryId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["offerCategoryId"],
        message: "یک دسته برای آفر انتخاب کنید",
      });
    }
  });
