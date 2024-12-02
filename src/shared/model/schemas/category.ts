import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().trim(),
  description: z.string().trim().max(100).optional(),
})

export type Category = z.infer<typeof categorySchema>
