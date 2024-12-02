import { assistant } from "../../shared/assistant/assistant.ts"
import type { Storage } from "../../shared/model/schemas/storage.ts"
import type { TabPrompt } from "../../shared/model/schemas/tab-prompt.ts"
import { getCategoriesExample } from "../services/category.ts"
import { TabGroups } from "../services/tabs/groups.ts"
import { Tabs } from "../services/tabs/tabs.ts"
import { setExtensionState } from "./extension-state.ts"
import { keepAlive } from "./persist.ts"

export const onChanged = async (changes: Storage | undefined) => {
  const assistantWasSetup = assistant.hasBeenSetup()
  assistant.destroy()

  if (!changes) {
    return
  }

  const tabGroupDetails = await TabGroups.getTabGroupDetails()
  const tabGroupToCreate = changes.options.categories.filter(
    (category) =>
      !tabGroupDetails.map(({ title }) => title).includes(category.name)
  )

  for (const { name } of tabGroupToCreate) {
    await TabGroups.createTabGroup({ title: name })
  }

  assistant.setup(
    changes.options.profile,
    await getCategoriesExample(changes.options.categories)
  )

  if (!assistantWasSetup) {
    await categorizeAllUngroupedTabs()
  }
}

const categorizeAllUngroupedTabs = async () => {
  keepAlive(true)

  const ungroupedTabs = (await Tabs.getAllUngroupedTabs()).filter(
    (tab) => !tab.url?.startsWith("chrome://")
  )
  setExtensionState("active")

  const categories = await assistant.getCategoriesForTabs(
    ungroupedTabs.map(
      (tab) =>
        ({
          id: tab.id,
          title: tab.title,
          url: tab.url,
        }) as TabPrompt
    )
  )

  for (const { id, category } of categories) {
    const tabGroup =
      (await TabGroups.getTabGroupByName(category)) ??
      (await TabGroups.createTabGroup({ title: category }))
    tabGroup?.addTabs([id])
  }

  setExtensionState("inactive")

  keepAlive(false)
}
