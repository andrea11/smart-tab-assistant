import type { ExtensionState } from "./extension-state.ts"

const addExtensionIconBadge = async (state: ExtensionState) => {
  await Promise.all([
    chrome.action.setBadgeTextColor({ color: getTextColorByState(state) }),
    chrome.action.setBadgeText({ text: getTextByState(state) }),
  ])
}

const getTextByState = (state: ExtensionState) => {
  if (state === "active") {
    return "▶️"
  }

  if (state === "disabled") {
    return "⏸"
  }

  return ""
}

const getTextColorByState = (state: ExtensionState) => {
  if (state === "active") {
    return "#22c55e"
  }

  if (state === "disabled") {
    return "#f59e0b"
  }

  return ""
}

export const updateExtensionIconBadge = async (state: ExtensionState) => {
  if (state === "inactive") {
    await removeExtensionIconBadge()
    return
  }

  await addExtensionIconBadge(state)
}

const removeExtensionIconBadge = async () => {
  await chrome.action.setBadgeText({ text: "" })
}
