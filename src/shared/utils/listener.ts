// biome-ignore lint/suspicious/noExplicitAny: by design
export interface Listener<T extends (...args: any[]) => Promise<void> | void> {
  call(...args: Parameters<T>): void
  addListener(listener: T): void
  removeListener(listener: T): void
  removeListeners(): void
}

export function makeListener<
  // biome-ignore lint/suspicious/noExplicitAny: by design
  T extends (...args: any[]) => Promise<void> | void,
>(): Listener<T> {
  return Object.freeze({
    listeners: new Set<T>(),
    async call(...args: Parameters<T>) {
      for (const listener of this.listeners) {
        try {
          await listener(...args)
        } catch {
          // ignore
        }
      }
    },
    addListener(listener: T) {
      this.listeners.add(listener)
    },
    removeListener(listener: T) {
      this.listeners.delete(listener)
    },
    removeListeners() {
      this.listeners.clear()
    },
  })
}

export type Hooks<H> = {
  [K in keyof H]: Omit<H[K], "call">
}
