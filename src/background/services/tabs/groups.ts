import { logger } from "../../../shared/logger/logger.ts"
import { Tabs } from "./tabs.ts"

export interface TabGroup {
  readonly groupId: number
  addTabs(tabIds: [number, ...number[]]): Promise<void>
  removeTabs(tabIds: [number, ...number[]]): Promise<void>
  move(index: number): Promise<void>
  getDetails(): Promise<chrome.tabGroups.TabGroup | undefined>
}

class Group implements TabGroup {
  readonly groupId: number

  constructor(groupId: number) {
    this.groupId = groupId
  }

  async addTabs(tabIds: [number, ...number[]]) {
    try {
      await chrome.tabs.group({
        groupId: this.groupId,
        tabIds,
      })
      this.clearInitialEmptyTab()
    } catch (error) {
      logger.error(error)
    }
  }

  async removeTabs(tabIds: [number, ...number[]]) {
    try {
      const tabsIdsInGroup = (await Tabs.getTabsByGroup(this.groupId))
        .map(({ id }) => id)
        .filter((id) => id !== undefined)
      const tabIdsToRemove = Array.from(
        new Set(tabsIdsInGroup).intersection(new Set(tabIds))
      )

      if (tabIdsToRemove.length === 0) {
        return
      }

      await chrome.tabs.ungroup(tabIdsToRemove as [number, ...number[]])
    } catch (error) {
      logger.error(error)
    }
  }

  async move(index: number) {
    try {
      await chrome.tabGroups.move(this.groupId, {
        index,
      })
    } catch (error) {
      logger.error(error)
    }
  }

  async getDetails() {
    try {
      return await chrome.tabGroups.get(this.groupId)
    } catch (error) {
      logger.error(error)
    }
  }

  private async clearInitialEmptyTab() {
    const tabs = await Tabs.getTabsByGroup(this.groupId)
    const tab = tabs.at(0)
    if (tab?.url === "chrome://newtab/" && tab.id) {
      Tabs.removeTabsByIds([tab.id])
    }
  }
}

async function getTabGroupById(tabGroupId: number) {
  try {
    return await chrome.tabGroups.get(tabGroupId)
  } catch (error) {
    logger.error(error)
  }
}

async function getTabGroupByName(title: string): Promise<TabGroup | undefined> {
  try {
    const tabGroups = await chrome.tabGroups.query({
      title,
    })

    if (tabGroups.length !== 1) {
      logger.warn(`Found ${tabGroups.length} tab groups with title ${title}`)
    }

    const tabGroup = tabGroups.at(0)

    if (!tabGroup) {
      return
    }

    return new Group(tabGroup.id)
  } catch (error) {
    logger.error(error)
  }
}

async function getTabGroups(): Promise<TabGroup[]> {
  try {
    const tabGroups = await chrome.tabGroups.query({})
    return tabGroups.map((group) => new Group(group.id))
  } catch (error) {
    logger.error(error)
    return []
  }
}

async function getTabGroupDetails(
  queryInfo?: Omit<chrome.tabGroups.TabGroup, "id">
): Promise<chrome.tabGroups.TabGroup[]> {
  try {
    return await chrome.tabGroups.query(queryInfo ?? {})
  } catch (error) {
    logger.error(error)
    return []
  }
}

async function createTabGroup(options: {
  title: string
  color?: chrome.tabGroups.Color
}): Promise<TabGroup | undefined> {
  try {
    const emptyTab = await chrome.tabs.create({ active: false })
    const groupId = await chrome.tabs.group({
      tabIds: emptyTab.id as number,
    })
    await chrome.tabGroups.update(groupId, {
      title: options.title,
      color: options.color,
    })
    return new Group(groupId)
  } catch (error) {
    logger.error(error)
  }
}

async function updateTabGroup(
  groupId: number,
  options: {
    title?: string
    collapsed?: boolean
    color?: chrome.tabGroups.Color
    tabIds?: [number, ...number[]]
  }
) {
  try {
    if (!(await tabGroupExist(groupId))) {
      return
    }
    if (options.tabIds) {
      await chrome.tabs.group({
        groupId,
        tabIds: options.tabIds,
      })
    }
    await chrome.tabGroups.update(groupId, {
      title: options.title,
      collapsed: options.collapsed,
      color: options.color,
    })
  } catch (error) {
    logger.error(error)
  }
}

async function tabGroupExist(groupId: number) {
  const tabGroup = (await chrome.tabGroups.query({})).find(
    (group) => group.id === groupId
  )
  return tabGroup !== undefined
}

export const TabGroups = {
  getTabGroupById,
  getTabGroupByName,
  getTabGroups,
  getTabGroupDetails,
  createTabGroup,
  updateTabGroup,
}
