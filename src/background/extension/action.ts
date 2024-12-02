import { toggleExtensionState } from "./extension-state.ts"

export const onClicked = async () => {
  await toggleExtensionState()
}
