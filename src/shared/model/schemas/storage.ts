import { z } from "zod"
import { categorySchema } from "./category.ts"
import { profileSchema } from "./profile.ts"

export const storageSchema = z
  .object({
    options: z.object({
      profile: profileSchema.shape.name,
      categories: z.array(categorySchema),
      tabGroups: z.object({
        areManaged: z.boolean(),
      }),
    }),
  })
  .readonly()

export type Storage = z.infer<typeof storageSchema>
