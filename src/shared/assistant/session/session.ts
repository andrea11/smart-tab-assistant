import type { z } from "zod"
import { logger } from "../../logger/logger.ts"

type PromptOptions = {
  maxRetries: number
}

export interface Session {
  promptObject<S extends z.ZodTypeAny>(
    content: string,
    schema: S
  ): Promise<z.infer<S> | undefined>

  promptList<
    C extends z.ZodArray<z.ZodTypeAny>,
    S extends z.ZodArray<z.ZodTypeAny>,
  >(content: z.infer<C>, schema: S, chunkSize?: number): Promise<z.infer<S>>

  destroy(): void
}

export abstract class AbstractSession implements Session {
  protected readonly enablePerformanceMeasure: boolean

  constructor(enablePerformanceMeasure: boolean) {
    this.enablePerformanceMeasure = enablePerformanceMeasure
  }

  abstract prompt<S extends z.ZodTypeAny>(
    content: string,
    schema: S
  ): Promise<z.infer<S>>

  async promptObject<S extends z.ZodTypeAny>(
    content: string,
    schema: S
  ): Promise<z.infer<S> | undefined> {
    try {
      return await this.promptWithRetry(content, schema)
    } catch (error) {
      logger.error(error)
      return undefined
    }
  }

  abstract promptList<
    C extends z.ZodArray<z.ZodTypeAny>,
    S extends z.ZodArray<z.ZodTypeAny>,
  >(content: z.infer<C>, schema: S, chunkSize: number): Promise<z.infer<S>>

  abstract destroy(): void

  private async promptWithMetrics<S extends z.ZodTypeAny>(
    content: string,
    schema: S,
    timeLabel: string
  ): Promise<S> {
    try {
      logger.time(`[Performance] ${timeLabel}`)
      const response = await this.prompt(content, schema)
      return response
    } finally {
      logger.timeEnd(`[Performance] ${timeLabel}`)
    }
  }

  protected async promptWithRetry<S extends z.ZodTypeAny>(
    content: string,
    schema: S,
    options?: Partial<PromptOptions>
  ): Promise<z.infer<S>> {
    const defaultOptions = {
      maxRetries: 3,
    }
    const { maxRetries } = { ...defaultOptions, ...options }
    try {
      logger.debug(`Prompting with retries: ${maxRetries}`, { content })
      return this.enablePerformanceMeasure
        ? await this.promptWithMetrics(content, schema, crypto.randomUUID())
        : await this.prompt(content, schema)
    } catch (error) {
      logger.error(error)
      if (maxRetries > 0) {
        return this.promptWithRetry(content, schema, {
          maxRetries: maxRetries - 1,
        })
      }
      throw error
    }
  }

  protected parseAiResponse<S extends z.ZodTypeAny>(
    prompt: string,
    response: string,
    schema: S
  ): z.infer<S> | undefined {
    try {
      return schema.parse(JSON.parse(response))
    } catch (error) {
      logger.error("Failed to parse response", {
        error,
        prompt,
        response,
      })
      return undefined
    }
  }
}
