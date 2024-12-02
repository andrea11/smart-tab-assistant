import { storage } from "../../shared/storage/storage.ts"
import { isAiEnabled } from "./ai.ts"

export const onInstalledListener = async () => {
  const getOptions = async () => (await storage.get()) ?? { options: undefined }
  const [{ options }, isAiApiEnabled] = await Promise.all([
    getOptions(),
    isAiEnabled(),
  ])
  if (isAiApiEnabled && !options) {
    chrome.runtime.openOptionsPage()
  }
}
