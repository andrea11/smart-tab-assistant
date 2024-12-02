import { logger } from "../../shared/logger/logger.ts"

export async function isAiEnabled() {
  const capabilities = await chrome.aiOriginTrial.languageModel.capabilities()
  logger.debug("Language model capabilities:", capabilities)

  return capabilities.available === "readily"
}

export async function assertAiEnabled() {
  if (await isAiEnabled()) {
    return
  }

  chrome.windows.create({
    url: chrome.runtime.getURL("src/options/error.html"),
  })
  throw new Error("The language model is not available.")
}
