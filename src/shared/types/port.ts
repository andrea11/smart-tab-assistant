import type { Events, Runtime } from "webextension-polyfill"

interface Port<SendMessage, ReceiveMessage> extends Runtime.Port {
  postMessage: (message: SendMessage) => void
  onMessage: Events.Event<(message: ReceiveMessage, port: this) => void>
}

export default Port
