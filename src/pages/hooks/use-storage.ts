import { useEffect, useState } from "react"

export function useStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadValue = async () => {
      try {
        const result = await chrome.storage.local.get(key)
        setValue(result[key] ?? defaultValue)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load value"))
      }
    }

    loadValue()

    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange
    }) => {
      if (key in changes) {
        setValue(changes[key].newValue ?? defaultValue)
      }
    }

    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [key, defaultValue])

  const updateValue = async (newValue: T) => {
    try {
      await chrome.storage.local.set({ [key]: newValue })
      setValue(newValue)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update value"))
    }
  }

  const removeValue = async () => {
    try {
      await chrome.storage.local.remove(key)
      setValue(defaultValue)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to remove value"))
    }
  }

  return {
    value,
    setValue: updateValue,
    remove: removeValue,
    error,
  }
}
