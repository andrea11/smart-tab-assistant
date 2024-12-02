import type { z } from "zod"
import { logger } from "../../logger/logger.ts"
import { AbstractSession, type Session } from "./session.ts"

/**
 * The number of tokens remaining in the session before a new session is created.
 * This is used to prevent the session from losing initial context because of overflow.
 */
const REMAINING_TOKEN_THRESHOLD = 500

type State = {
  sessions: {
    busy: boolean
    session: chrome.aiOriginTrial.Session
    errors: number
  }[]
  pendingSessionRequests: {
    resolve: (session: chrome.aiOriginTrial.Session) => void
  }[]
  size: number
}

type RequiredSessionPoolOptions = {
  modelOptions: chrome.aiOriginTrial.ModelOptions
}

type OptionalSessionPoolOptions = {
  enablePerformanceMeasure?: boolean
  maxPoolSize?: number
}

type SessionPoolOptions = RequiredSessionPoolOptions &
  OptionalSessionPoolOptions

const DEFAULT_SESSION_OPTIONS: Required<OptionalSessionPoolOptions> = {
  maxPoolSize: 5,
  enablePerformanceMeasure: false,
}

export class SessionPool extends AbstractSession implements Session {
  private readonly state: State
  private readonly options: Required<SessionPoolOptions>

  constructor(options: SessionPoolOptions) {
    const fullOptions = { ...DEFAULT_SESSION_OPTIONS, ...options }
    super(fullOptions.enablePerformanceMeasure ?? false)
    this.state = { sessions: [], pendingSessionRequests: [], size: 0 }
    this.options = fullOptions
  }

  async prompt<S extends z.ZodTypeAny>(
    content: string,
    schema: S
  ): Promise<z.infer<S>> {
    const session = await this.getSession()

    if (!session) {
      throw new Error("No available sessions")
    }

    let response: string
    let sessionToRelease = session
    try {
      response = await session.prompt(content)
      const parsedResponse = this.parseAiResponse(content, response, schema)
      if (!parsedResponse) {
        this.deleteSession(session)
        ;({ session: sessionToRelease } = await this.createSession())
        throw new Error("Failed to parse response")
      }
      return parsedResponse
    } finally {
      this.releaseSession(sessionToRelease)
    }
  }

  async promptList<
    C extends z.ZodArray<z.ZodTypeAny>,
    S extends z.ZodArray<z.ZodTypeAny>,
  >(items: z.infer<C>, schema: S, chunkSize = 3): Promise<z.infer<S>> {
    try {
      const chunks = Array.from(
        { length: Math.ceil(items.length / chunkSize) },
        (_, i) => items.slice(i * chunkSize, (i + 1) * chunkSize)
      )

      const chunkResults = await Promise.all(
        chunks.map((chunk) => {
          const prompt = JSON.stringify(chunk)
          return this.promptWithRetry(prompt, schema)
        })
      )

      return chunkResults.filter((result) => result !== undefined).flat()
    } catch (error) {
      logger.error(error)
      return []
    }
  }

  private async createSession() {
    const session = await chrome.aiOriginTrial.languageModel.create(
      this.options.modelOptions
    )
    const stateSession = { session, busy: false, errors: 0 }
    this.state.sessions.push(stateSession)
    return stateSession
  }

  private deleteSession(session: chrome.aiOriginTrial.Session) {
    const sessionIndex = this.state.sessions.findIndex(
      (state) => state.session === session
    )
    this.state.sessions.splice(sessionIndex, 1)
    session.destroy()
  }

  destroy() {
    for (const { session } of this.state.sessions) {
      session.destroy()
    }
    this.state.sessions.length = 0
  }

  private async getSession() {
    let availableSession = this.state.sessions.find((session) => !session.busy)

    if (!availableSession && this.state.size >= this.options.maxPoolSize) {
      const { promise, resolve } =
        Promise.withResolvers<chrome.aiOriginTrial.Session>()
      logger.debug("Waiting for available session")
      this.state.pendingSessionRequests.push({ resolve })
      promise.then((session) => {
        if (session.tokensLeft >= REMAINING_TOKEN_THRESHOLD) {
          return session
        }

        this.deleteSession(session)
        return this.getSession()
      })
      return promise
    }

    if (!availableSession) {
      logger.debug("Creating new session", {
        poolSize: this.state.size,
        maxPoolSize: this.options.maxPoolSize,
      })
      this.state.size++
      try {
        availableSession = await this.createSession()
      } catch (error) {
        this.state.size--
        throw error
      }
    }

    availableSession.busy = true
    return availableSession.session
  }

  private releaseSession(session: chrome.aiOriginTrial.Session) {
    const sessionState = this.state.sessions.find(
      (state) => state.session === session
    )

    if (!sessionState) {
      throw new Error("No session to release")
    }

    if (this.state.pendingSessionRequests.length > 0) {
      const { resolve } = this.state.pendingSessionRequests.shift() ?? {}
      resolve?.(session)
      return
    }

    logger.debug("Releasing session")
    sessionState.busy = false
  }
}
