import type { Category } from "../schemas/category.ts"

export type SetupTabGroupsMessage = {
  type: "setup-tab-groups"
  payload: {
    categories: Category[]
  }
}
