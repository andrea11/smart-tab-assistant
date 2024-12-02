import { z } from "zod"

export const profileSchema = z.object({
  name: z.enum(["cautious", "balanced", "aggressive"]),
  description: z.string(),
  image: z.string(),
})

export type Profile = z.infer<typeof profileSchema>

export type ProfileType = Profile["name"]
