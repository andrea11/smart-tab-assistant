import browser, { type Browser } from "webextension-polyfill";

type Capabilities = {
  // 'no': The current browser supports the Prompt API, but it can't be used at the moment. This could be for a number of reasons, such as insufficient available disk space available to download the model.
  // 'readily': The current browser supports the Prompt API, and it can be used right away.
  // 'after-download
  available: "no" | "readily" | "after-download";
  // defaultTopK: The default top-K value (default: 3).
  defaultTopK: number;
  // maxTopK: The maximum top-K value (8).
  maxTopK: number;
  // defaultTemperature: The default temperature (1.0). The temperature must be between 0.0 and 2.0.
  defaultTemperature: number;
};

type MonitorHandler = {
  addEventListener: (
    type: "downloadprogress",
    listener: (this: MonitorHandler, ev: ProgressEvent<unknown>) => any
  ) => void;
  removeEventListener: (
    type: "downloadprogress",
    listener: (this: MonitorHandler, ev: ProgressEvent<unknown>) => any
  ) => void;
};

type ModelOptions = {
  temperature?: number;
  topK?: number;
  monitor?: (m: MonitorHandler) => void;
  signal?: AbortSignal;
  systemPrompt?: string;
  initialPrompts?: any;
};

type Session = {
  tokensSoFar: number;
  maxTokens: number;
  tokensLeft: number;
  clone: (options?: { signal: AbortSignal }) => Session;
  destroy: () => void;
  prompt: (prompt: string, options?: { signal: AbortSignal }) => Promise<string>;
  promptStreaming: (prompt: string, options?: { signal: AbortSignal }) => AsyncIterable<string>;
};

interface AiOriginTrial {
  languageModel: {
    capabilities: () => Promise<Capabilities>;
    create: (options: ModelOptions) => Promise<Session>;
  };
}

const experimentalBrowser: Browser & { aiOriginTrial: AiOriginTrial } = {
  ...originalBrowser,
  aiOriginTrial: browser.aiOriginTrial,
};

declare module "webextension-polyfill" {
  export default experimentalBrowser;
}
