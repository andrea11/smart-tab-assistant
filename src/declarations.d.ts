// biome-ignore lint/style/noNamespace: override chrome-types
declare namespace chrome {
  // biome-ignore lint/style/noNamespace: adding aiOriginTrial experimental API
  export namespace aiOriginTrial {
    interface LanguageModel {
      capabilities(): Promise<Capabilities>
      create(options?: ModelOptions): Promise<Session>
    }

    export const languageModel: LanguageModel

    export type Capabilities = {
      // 'no': The current browser supports the Prompt API, but it can't be used at the moment. This could be for a number of reasons, such as insufficient available disk space available to download the model.
      // 'readily': The current browser supports the Prompt API, and it can be used right away.
      // 'after-download
      available: "no" | "readily" | "after-download"
      // defaultTopK: The default top-K value (default: 3).
      defaultTopK: number
      // maxTopK: The maximum top-K value (8).
      maxTopK: number
      // defaultTemperature: The default temperature (1.0). The temperature must be between 0.0 and 2.0.
      defaultTemperature: number
    }

    export type MonitorHandler = {
      addEventListener: (
        type: "downloadprogress",
        listener: (this: MonitorHandler, ev: ProgressEvent) => void
      ) => void
      removeEventListener: (
        type: "downloadprogress",
        listener: (this: MonitorHandler, ev: ProgressEvent) => void
      ) => void
    }

    export type ModelOptions = UtilityTypes.Either<
      { temperature?: never; topK?: never },
      {
        temperature: number
        topK: number
      }
    > & {
      monitor?: (m: MonitorHandler) => void
      signal?: AbortSignal
    } & Partial<
        UtilityTypes.Either<
          { systemPrompt: string },
          {
            initialPrompts: { role: string; content: string }[]
          }
        >
      >

    export type Session = {
      readonly maxTokens: number
      readonly tokensLeft: number
      readonly tokensSoFar: number
      readonly topK: number
      readonly temperature: number
      clone: (options?: { signal: AbortSignal }) => Session
      destroy: () => void
      prompt: (
        prompt: string,
        options?: { signal: AbortSignal }
      ) => Promise<string>
      promptStreaming: (
        prompt: string,
        options?: { signal: AbortSignal }
      ) => AsyncIterable<string>
      countPromptTokens: (prompt: string) => Promise<0>
    }
  }

  // biome-ignore lint/style/noNamespace: overriding runtime.Port type
  export namespace runtime {
    /**
     * Port interface for typed message communication between extension components.
     * @template SentMessage - Type of messages this port can send
     * @template ReceivedMessage - Type of messages this port can receive
     */
    // biome-ignore lint/suspicious/noExplicitAny: add message types to Port type
    export interface Port<SentMessage = any, ReceivedMessage = any> {
      /**
       * Send a message to the other end of the port.
       * @throws Error if port is disconnected
       * @param message Message to send (must be JSON serializable)
       * @template SentMessage Type enforced for outgoing messages
       */
      postMessage(message: SentMessage): void

      /**
       * Event fired when port is disconnected.
       * - Fired at most once per port
       * - When manually disconnected, only fires on other end
       * - May include chrome.runtime.lastError if disconnected by error
       * @template SentMessage Type of messages this port sends
       * @template ReceivedMessage Type of messages this port receives
       */
      onDisconnect: chrome.events.Event<
        (port: Port<SentMessage, ReceivedMessage>) => void
      >

      /**
       * Event fired when receiving a message from the other end.
       * @template ReceivedMessage Type enforced for incoming messages
       */
      onMessage: chrome.events.Event<
        (message: ReceivedMessage, port: Port) => void
      >
    }
  }
}
