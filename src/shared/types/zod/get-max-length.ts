import { z } from "zod"

export function getMaxLength(schema: z.ZodTypeAny): number | undefined {
  const hasMaxLength = z.object({ maxLength: z.number() }).safeParse(schema)
  if (hasMaxLength.success) {
    return hasMaxLength.data.maxLength
  }

  if ("unwrap" in schema && typeof schema.unwrap === "function") {
    return getMaxLength(schema.unwrap())
  }
}
