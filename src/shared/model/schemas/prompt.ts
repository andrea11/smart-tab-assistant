import { z } from "zod"

const tabCategoryResponseSchema = z
  .object({
    id: z.number(),
    category: z
      .string()
      .refine((value) => {
        if (value.toLowerCase() === "unknown") {
          return undefined
        }
        return value
      })
      .optional(),
  })
  .transform(({ category, ...rest }) =>
    category ? { category, ...rest } : undefined
  )
  .optional()

const tabCategoryArrayResponseSchema = z
  .array(tabCategoryResponseSchema)
  .min(1)
  .max(1)
  .transform((array) => array[0])

export const getTabCategoryResponseSchema = z.union([
  tabCategoryResponseSchema,
  tabCategoryArrayResponseSchema,
])

export const getAllTabCategoriesResponseSchema = z
  .array(
    z.object({
      id: z.number(),
      category: z.string().refine((value) => {
        if (value === "unknown") {
          return undefined
        }
        return value
      }),
    })
  )
  .transform((array) => array.filter(({ category }) => category !== undefined))
