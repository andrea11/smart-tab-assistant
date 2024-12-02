import { z } from "zod"
import { categorySchema } from "./category.ts"
import { profileSchema } from "./profile.ts"

export const formSchema = z.object({
  legal: z
    .object({
      accepted: z.boolean(),
    })
    .required(),
  profile: z.object({ selected: profileSchema }),
  categories: z
    .array(categorySchema.extend({ isTabGroup: z.coerce.boolean().optional() }))
    .min(1),
  tabGroups: z.object({
    areManaged: z.boolean(),
  }),
})

export type FormSchema = typeof formSchema
