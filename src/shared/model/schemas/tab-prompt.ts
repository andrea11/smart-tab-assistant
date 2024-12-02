import { z } from "zod"

export const tabPromptSchema = z.object({
  id: z.number(),
  title: z.string(),
  url: z.string().url(),
})

export type TabPrompt = z.infer<typeof tabPromptSchema>
