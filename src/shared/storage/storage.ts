import type { z } from "zod"
import { logger } from "../logger/logger.ts"
import { type Storage, storageSchema } from "../model/schemas/storage.ts"
import { type Listener, makeListener } from "../utils/listener.ts"

type StorageArea = keyof Omit<typeof chrome.storage, "onChanged">

export interface StorageManager<
  T extends { [key: string]: unknown } = { [key: string]: unknown },
> {
  get: () => Promise<T | undefined>
  set: (items: T) => Promise<void>
  clear: () => Promise<void>
  onChanged: Listener<(changes: T | undefined) => void>
  destroy: () => void
}

export class StorageManagerImpl<T extends { [key: string]: unknown }>
  implements StorageManager<T>
{
  private readonly storageArea: StorageArea
  private readonly storageKey: string
  private readonly storageSchema: z.ZodType<T>

  constructor(
    storageArea: StorageArea,
    storageKey: string,
    storageSchema: z.ZodSchema
  ) {
    this.storageArea = storageArea
    this.storageKey = storageKey
    this.storageSchema = storageSchema
    chrome.storage[this.storageArea].onChanged.addListener(
      this.onStorageChanged
    )
  }

  async get(): Promise<T | undefined> {
    const { [this.storageKey]: storage } = await chrome.storage[
      this.storageArea
    ].get(this.storageKey)

    if (!storage || Object.keys(storage).length === 0) {
      return undefined
    }

    const parsedStorage = await this.storageSchema.safeParseAsync(storage)
    if (!parsedStorage.success) {
      logger.error("Invalid storage options:", {
        error: parsedStorage.error,
        storage,
      })
      return undefined
    }
    return parsedStorage.data
  }

  async set(options: T) {
    await chrome.storage[this.storageArea].set({ [this.storageKey]: options })
  }

  async clear() {
    await chrome.storage[this.storageArea].remove(this.storageKey)
  }

  readonly onChanged: Listener<(changes: T | undefined) => void> =
    makeListener()

  private readonly onStorageChanged = (changes: {
    [name: string]: chrome.storage.StorageChange
  }) => {
    if (!changes[this.storageKey]) {
      return
    }

    if (changes[this.storageKey].newValue === undefined) {
      this.onChanged.call(undefined)
      return
    }

    const parsedChanges = this.storageSchema.safeParse(
      changes[this.storageKey].newValue
    )
    if (!parsedChanges.success) {
      logger.error(`Invalid storage ${this.storageKey}:`, parsedChanges.error)
      return
    }

    this.onChanged.call(parsedChanges.data)
  }

  destroy() {
    chrome.storage[this.storageArea].onChanged.removeListener(
      this.onStorageChanged
    )
    this.onChanged.removeListeners()
  }
}

export const storage: StorageManager<Storage> = new StorageManagerImpl<Storage>(
  "local",
  "options_v1",
  storageSchema
)
