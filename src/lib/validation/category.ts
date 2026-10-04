import { z } from "zod"

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const updateCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export const deleteCategorySchema = z.object({
  id: z.string().min(1),
})

export const moveCategorySchema = z.object({
  id: z.string().min(1),
  direction: z.enum(["up", "down"]),
})

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
