import { useEffect, useState } from "react"
import Browser from "webextension-polyfill"
import type { ModelOptions, Session } from "../declarations.ts"
import { logger } from "../shared/logger/logger.ts"

const categories = [
  {
    name: "Technology",
    description: "Tech news, gadgets, and software updates",
  },
  { name: "Work", description: "Professional tools and productivity apps" },
  { name: "News", description: "Current events and breaking news sites" },
  {
    name: "Social Media",
    description: "Social networks and communication platforms",
  },
  { name: "Shopping", description: "Online stores and e-commerce websites" },
]

const initialPrompt = `
You are an AI tasked with categorizing browser tabs based on a list of provided 
categories. Each category has a name and an optional description. Given a list of 
browser tabs, each with a URL and title, you need to assign each tab to the most 
relevant category.

Here are the categories: 
${categories.map((c) => `- ${c.name}: ${c.description}`).join("\n")}

For each tab, use the title and URL to determine which category best fits it. 
If a tab does not clearly fit into any category, choose the one that seems the 
closest or mark it as "Uncategorized."

Input Format:
[
  {
    "id": 1,
    "title": "A common title for a tab",
    "url": "https://www.example-1.com"
  },
  {
    "id": 2,
    "title": "Whatever title you found",
    "url": "https://www.example-2.com"
  },
  {
    "id": 3,
    "title": "Another title for a tab",
    "url": "https://www.example-3.com"
  },
  {
    "id": 4,
    "title": "A rare title for a tab",
    "url": "https://www.example-4.com"
  }
]

Output Format:
[
  {
    "id": 1,
    "category": "${categories[0].name}",
    "title": "A common title for a tab"
  },
  {
    "id": 2,
    "category": "${categories[1].name}",
    "title": "Whatever title you found"
  },
  {
    "id": 3,
    "category": "${categories[2].name}",
    "title": "Another title for a tab"
  },
  {
    "id": 4,
    "category": "${categories[1].name}",
    "title": "A rare title for a tab"
  }
]`

const aggressivePrompt = `
You are tasked with categorizing browser tabs into predefined categories based on their URL and title.

Objective:
- Be highly aggressive in categorizing all tabs
- Ensure every tab is assigned a category
- Prioritize consistency in categorization

Rules:
- Always classify each tab without exception
- Pick closest match when category is unclear
- Never leave tabs uncategorized, even with imperfect matches
`

const balancedPrompt = `
You are tasked with categorizing browser tabs based on a set of predefined categories.

Objective:
- Prioritize consistency and quality
- Balance accuracy with completeness
- Provide qualified guesses when uncertain

Rules:
- Match tabs with most appropriate categories
- Use "maybe-{category}" prefix when uncertain
- Only use "Uncategorized" when no reasonable match exists
`

const cautiousPrompt = `
You are tasked with categorizing browser tabs into predefined categories.

Objective:
- Take a highly conservative approach
- Use previous categorizations as reference
- Prioritize accuracy over completeness

Rules:
- Only categorize with clear precedent or strong match
- Use "Unknown" or "Uncategorized" for unclear cases
- Apply "maybe-{category}" prefix for uncertain matches
`

const systemPrompt = initialPrompt + cautiousPrompt

async function collectChunk(
  stream: AsyncIterable<string>,
  onChunk: (chunk: string) => void
) {
  let previousChunk = ""
  for await (const chunk of stream) {
    const newChunk = chunk.startsWith(previousChunk)
      ? chunk.slice(previousChunk.length)
      : chunk
    onChunk(newChunk)
    previousChunk = chunk
  }
}

export default function Popup() {
  const [session, setSession] = useState<Session>()
  const [response, setResponse] = useState<string>()

  useEffect(() => {
    const setupSession = async () => {
      const options: ModelOptions = {
        systemPrompt: systemPrompt,
        temperature: 1,
        topK: 3,
      }
      setSession(await Browser.aiOriginTrial.languageModel.create(options))
    }

    setupSession().catch(logger.error)
  }, [])

  const onClick = async () => {
    if (!session) {
      logger.error("Session is not set up.")
      return
    }

    setResponse("")

    const tabs = await Browser.tabs.query({ currentWindow: true })

    const stream = session.promptStreaming(
      JSON.stringify(
        tabs.map((tab) => {
          return { id: tab.id, title: tab.title, url: tab.url }
        })
      )
    )

    await collectChunk(stream, (chunk) => {
      setResponse((response) => response + chunk)
    })
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <textarea
        placeholder={systemPrompt}
        className="m-3 h-[80vh] w-[90%] resize-none overflow-y-auto break-words rounded-lg bg-gray-50 p-4 text-gray-800 shadow-sm placeholder:text-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-400"
        readOnly={true}
        value={response}
      />
      <div className="flex gap-2">
        <button
          onClick={onClick}
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 active:translate-y-px active:transform dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Generate
        </button>
        <button
          onClick={() => setResponse("")}
          type="reset"
          className="rounded-md bg-gray-500 px-4 py-2 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-gray-600 active:translate-y-px active:transform dark:bg-gray-600 dark:hover:bg-gray-700"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
