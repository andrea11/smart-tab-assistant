import { useEffect, useState } from "react"
import Browser from "webextension-polyfill"
import type Port from "../../shared/types/port.ts"

export default function <SendMessage, ReceiveMessage>() {
  const [port, setPort] = useState<Port<SendMessage, ReceiveMessage>>()

  useEffect(() => {
    setPort(Browser.runtime.connect())
  }, [])

  return port
}
