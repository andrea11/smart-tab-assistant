import type { z } from "zod"
import { logger } from "../../logger/logger.ts"
import { AbstractSession, type Session } from "./session.ts"

type RequiredSingleSessionOptions = {
  modelOptions: chrome.aiOriginTrial.ModelOptions
}

type OptionalSingleSessionOptions = {
  enablePerformanceMeasure?: boolean
}

type SingleSessionOptions = RequiredSingleSessionOptions &
  OptionalSingleSessionOptions

const DEFAULT_SINGLE_SESSION_OPTIONS: Required<OptionalSingleSessionOptions> = {
  enablePerformanceMeasure: false,
}

export class SingleSession extends AbstractSession implements Session {
  private session?: chrome.aiOriginTrial.Session
  private readonly options: Required<SingleSessionOptions>

  constructor(options: SingleSessionOptions) {
    const fullOptions = { ...DEFAULT_SINGLE_SESSION_OPTIONS, ...options }
    super(fullOptions.enablePerformanceMeasure)
    this.options = fullOptions
  }

  async prompt<S extends z.ZodTypeAny>(
    content: string,
    schema: S
  ): Promise<z.infer<S>> {
    const session = await this.getSession()
    const response = await session.prompt(content)
    const parsedResponse = this.parseAiResponse(content, response, schema)
    if (!parsedResponse) {
      throw new Error("Failed to parse response")
    }
    return parsedResponse
  }

  async promptList<
    C extends z.ZodArray<z.ZodTypeAny>,
    S extends z.ZodArray<z.ZodTypeAny>,
  >(items: z.infer<C>, schema: S, chunkSize = 3): Promise<z.infer<S>> {
    try {
      const results: z.infer<S> = []

      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize)
        const prompt = JSON.stringify(chunk)
        results.push(...(await this.promptWithRetry(prompt, schema)))
      }

      return results
    } catch (error) {
      logger.error(error)
      return []
    }
  }

  destroy() {
    this.session?.destroy()
  }

  private async getSession() {
    this.session?.destroy()
    this.session = await chrome.aiOriginTrial.languageModel.create(
      this.options.modelOptions
    )
    return this.session
  }
}
