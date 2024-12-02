import { assistant } from "../../shared/assistant/assistant.ts"
import { logger } from "../../shared/logger/logger.ts"
import { storage } from "../../shared/storage/storage.ts"
import { makeListener } from "../../shared/utils/listener.ts"
import { getCategoriesExample } from "../services/category.ts"
import { onClicked } from "./action.ts"
import { assertAiEnabled } from "./ai.ts"
import { updateExtensionIconBadge } from "./badge.ts"
import { onInstalledListener } from "./runtime.ts"
import { onChanged } from "./storage.ts"
import { onUpdatedListener } from "./tabs.ts"

export type ExtensionState = "active" | "disabled" | "inactive"

let extensionState: ExtensionState = "active"

const getExtensionState = () => extensionState
export const setExtensionState = (state: ExtensionState) => {
  extensionState = state
  updateExtensionIconBadge(state)
  onExtensionStateChange.call(state)
}
export const onExtensionStateChange =
  makeListener<(state: ExtensionState) => void>()

export const waitExtensionStateChange = () => {
  const { promise, resolve } = Promise.withResolvers<void>()

  const callback = () => {
    resolve()
    onExtensionStateChange.removeListener(callback)
  }

  onExtensionStateChange.addListener(callback)

  return promise
}

export const startExtension = async () => {
  logger.debug("Starting extension...")
  setExtensionState("inactive")
  chrome.runtime.onInstalled.addListener(onInstalledListener)
  chrome.tabs.onUpdated.addListener(onUpdatedListener)
  chrome.action.onClicked.addListener(onClicked)
  storage.onChanged.addListener(onChanged)

  await assertAiEnabled()
  const { options } = (await storage.get()) ?? {}

  if (options) {
    assistant.setup(
      options.profile,
      await getCategoriesExample(options.categories)
    )
  }
}

export const stopExtension = () => {
  logger.debug("Stopping extension...")
  chrome.runtime.onInstalled.removeListener(onInstalledListener)
  chrome.tabs.onUpdated.removeListener(onUpdatedListener)

  storage.destroy()
  assistant.destroy()
  setExtensionState("disabled")
}

export const toggleExtensionState = async () => {
  switch (getExtensionState()) {
    case "active": {
      await waitExtensionStateChange()
      if (getExtensionState() === "inactive") {
        stopExtension()
      }
      break
    }
    case "inactive": {
      stopExtension()
      break
    }
    case "disabled": {
      await startExtension()
      break
    }
    default:
      break
  }
}
