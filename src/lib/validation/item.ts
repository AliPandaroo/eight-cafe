import { z } from "zod";

const priceSchema = z
  .union([z.number(), z.string()])
  .transform((value, ctx) => {
    const amount =
      typeof value === "number"
        ? value
        : Number(String(value).replace(/[,\s]/g, ""));

    if (!Number.isFinite(amount) || amount < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price must be a number of 0 or more",
      });
      return z.NEVER;
    }

    return String(amount);
  });

const gramsSchema = z
  .union([z.number(), z.string()])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined || value === "") {
      return 0;
    }

    const amount =
      typeof value === "number"
        ? value
        : Number(String(value).replace(/[,\s]/g, ""));

    if (!Number.isFinite(amount) || amount < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "گرم قهوه باید صفر یا بیشتر باشد",
      });
      return z.NEVER;
    }

    return amount;
  });

const variantSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().trim().min(1, "عنوان سایز لازم است").max(80),
  price: priceSchema,
  coffeeGrams: gramsSchema,
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(500).optional(),
  price: priceSchema,
  coffeeGrams: gramsSchema,
  imageUrl: z.string().trim().max(2048).optional(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  variants: z.array(variantSchema).optional(),
});

export const updateMenuItemSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  price: priceSchema.optional(),
  coffeeGrams: gramsSchema,
  imageUrl: z.string().trim().max(2048).nullable().optional(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  variants: z.array(variantSchema).optional(),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export const moveMenuItemSchema = z.object({
  id: z.string().min(1),
  direction: z.enum(["up", "down"]),
});

export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
