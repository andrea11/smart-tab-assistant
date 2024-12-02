import { z } from "zod"
import { categorySchema } from "./category.ts"
import { tabPromptSchema } from "./tab-prompt.ts"

export const categoryExampleSchema = categorySchema.extend({
  tabs: z.array(tabPromptSchema),
})

export type CategoryExample = z.infer<typeof categoryExampleSchema>
