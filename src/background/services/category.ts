import type { CategoryExample } from "../../shared/model/schemas/category-example.ts"
import type { Category } from "../../shared/model/schemas/category.ts"
import type { TabPrompt } from "../../shared/model/schemas/tab-prompt.ts"
import { TabGroups } from "./tabs/groups.ts"
import { Tabs } from "./tabs/tabs.ts"

export const getCategoriesExample = async (
  categories: Category[],
  tabPerCategoryLimit = 1
): Promise<CategoryExample[]> => {
  return (
    await Promise.all(
      categories.map(async (category) => {
        const tabGroup = await TabGroups.getTabGroupByName(category.name)
        if (!tabGroup?.groupId) {
          return
        }

        const tabs = await Tabs.getTabsByGroup(tabGroup.groupId)
        return {
          name: category.name,
          description: category.description,
          tabs: tabs
            .toSorted(() => Math.random() - 0.5)
            .filter((_, index) => index < tabPerCategoryLimit)
            .map(
              (tab) =>
                ({
                  id: tab.id,
                  title: tab.title,
                  url: tab.url,
                }) as TabPrompt
            ),
        } satisfies CategoryExample
      })
    )
  ).filter((cat) => !!cat)
}
