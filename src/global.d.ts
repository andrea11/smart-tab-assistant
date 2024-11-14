import type browser from "webextension-polyfill";

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
  addEventListener: (type: "downloadprogress", listener: EventListener) => void;
  removeEventListener: (type: "downloadprogress", listener: EventListener) => void;
};

type ModelOptions = {
  temperature: number;
  topK: number;
  monitor?: (m: MonitorHandler) => void;
  signal?: AbortSignal;
  systemPrompt?: string;
  initialPrompts: any;
};

type Session = {};

interface AiOriginTrial {
  languageModel: {
    capabilities: () => Capabilities;
    create: (options: ModelOptions) => {};
  };
}

declare module "webextension-polyfill" {
    // Refers to the global `browser` and exports it as the default of `webextension-polyfill`.
    export default browser;
}
declare namespace Browser {
  const aiOriginTrial: AiOriginTrial;

  interface Browser {
    aiOriginTrial: AiOriginTrial;
  }
}

declare global {
  const browser: Browser.Browser;
}
