import { logger } from "../../../shared/logger/logger.ts"

async function getAllUngroupedTabs() {
  try {
    const tabs = await chrome.tabs.query({
      groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      windowId: chrome.windows.WINDOW_ID_CURRENT,
    })
    return tabs
  } catch (error) {
    logger.error(error)
    return []
  }
}

async function getAllGroupedTabs() {
  try {
    const tabs = await chrome.tabs.query({
      windowId: chrome.windows.WINDOW_ID_CURRENT,
    })
    return tabs.filter(
      (tab) => tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE
    )
  } catch (error) {
    logger.error(error)
    return []
  }
}

async function getTabsByGroup(groupId: number) {
  try {
    const tabs = await chrome.tabs.query({
      groupId,
      windowId: chrome.windows.WINDOW_ID_CURRENT,
    })
    return tabs
  } catch (error) {
    logger.error(error)
    return []
  }
}

async function removeTabsByIds(tabIds: number[]) {
  try {
    await chrome.tabs.remove(tabIds)
  } catch (error) {
    logger.error(error)
  }
}

export const Tabs = {
  getAllUngroupedTabs,
  getAllGroupedTabs,
  getTabsByGroup,
  removeTabsByIds,
}
