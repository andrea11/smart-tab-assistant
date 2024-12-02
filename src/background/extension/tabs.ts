import { assistant } from "../../shared/assistant/assistant.ts"
import { logger } from "../../shared/logger/logger.ts"
import { TabGroups } from "../services/tabs/groups.ts"
import { setExtensionState } from "./extension-state.ts"

export const onUpdatedListener = async (
  tabId: number,
  changeInfo: {
    status?: chrome.tabs.TabStatus
  },
  tab: chrome.tabs.Tab
) => {
  if (!assistant.hasBeenSetup()) {
    logger.debug("Assistant not set up")
    return
  }

  if (changeInfo.status !== "complete") {
    logger.debug("Tab not completely loaded:", { tab })
    return
  }

  if (!(tab.title && tab.url)) {
    throw new Error('Manifest must include the "tabs" permission')
  }

  if (tab.url.startsWith("chrome://")) {
    logger.debug("Ignoring tab:", { tab })
    return
  }

  logger.debug("Requesting category for tab:", { tab })

  setExtensionState("active")

  const { category } =
    (await assistant.getCategoryForTab({
      id: tabId,
      title: tab.title,
      url: tab.url,
    })) ?? {}

  logger.debug("Category for tab:", { tabId, category })

  if (category) {
    const tabGroup =
      (await TabGroups.getTabGroupByName(category)) ??
      (await TabGroups.createTabGroup({ title: category }))
    tabGroup?.addTabs([tabId])
  }

  setExtensionState("inactive")
}
