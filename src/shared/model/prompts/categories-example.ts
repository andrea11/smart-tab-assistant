import type { CategoryExample } from "../schemas/category-example.ts"

export const generateCategoriesExamplePrompt = (
  categoryExamples: CategoryExample[],
  withUnknown: boolean
) => `***Examples***
${
  withUnknown
    ? `User prompt: ${JSON.stringify([
        {
          id: 34512,
          title: "Google",
          url: "https://www.google.com",
        },
      ])}
    ${JSON.stringify([
      {
        id: 34512,
        category: "unknown",
      },
    ])}`
    : ""
}

${JSON.stringify(categoryExamples[0].tabs[0])}
${JSON.stringify({
  id: categoryExamples[0].tabs[0].id,
  category: categoryExamples[0].name,
})}

${JSON.stringify(categoryExamples.flatMap(({ tabs }) => tabs))}
${JSON.stringify(
  categoryExamples.flatMap((categoryExample) => {
    return categoryExample.tabs.map((tab) => ({
      id: tab.id,
      category: categoryExample.name,
    }))
  })
)}
`
