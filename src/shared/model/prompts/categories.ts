import type { Category } from "../schemas/category.ts"

export const generateCategoriesPrompt = (
  categories: Category[]
) => `***Categories***

${categories
  .map((category) => {
    return `* ${category.name} * ${category.description ? `(Description: ${category.description})` : ""}`
  })
  .join("\n")}
`
