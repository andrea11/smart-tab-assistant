import browser from "webextension-polyfill"
import type { Session } from "../declarations"
import { logger } from "../shared/logger/logger.ts"
import type {
  EndResponseMessage,
  GenerateMessage,
  ResponseMessage,
  SetupModelMessage,
} from "../shared/types/messages.ts"
import type Port from "../shared/types/port.ts"

let session: Session | undefined

async function collectChunk(
  stream: AsyncIterable<string>,
  onChunk: (chunk: string) => void
) {
  let previousChunk = ""
  for await (const chunk of stream) {
    const newChunk = chunk.startsWith(previousChunk)
      ? chunk.slice(previousChunk.length)
      : chunk
    onChunk(newChunk)
    previousChunk = chunk
  }
}

async function onMessage(
  message: SetupModelMessage | GenerateMessage,
  port: Port<ResponseMessage | EndResponseMessage, GenerateMessage>
) {
  if (message.type === "setup") {
    if (session) {
      session.destroy()
    }
    session = await browser.aiOriginTrial.languageModel.create({
      systemPrompt: message.payload.systemPrompt,
      temperature: message.payload.temperature,
      topK: message.payload.topK,
    })
    return
  }

  if (message.type === "generate") {
    if (!session) {
      logger.error("Session is not set up.")
      return
    }

    const stream = session?.promptStreaming(message.payload.userPrompt)
    await collectChunk(stream, (chunk) => {
      const response: ResponseMessage = {
        type: "response",
        payload: {
          response: chunk,
        },
      }
      port.postMessage(response)
    })
    const endResponse: EndResponseMessage = {
      type: "end-response",
    }
    port.postMessage(endResponse)
  }
}

async function main() {
  browser.runtime.onInstalled.addListener((details) => {
    logger.info("Extension installed:", details)
  })

  const capabilities = await browser.aiOriginTrial.languageModel.capabilities()
  logger.info("Language model capabilities:", capabilities)

  if (capabilities.available !== "readily") {
    logger.error("The language model is not available.")
    return
  }

  browser.runtime.onConnect.addListener(
    (port: Port<ResponseMessage | EndResponseMessage, GenerateMessage>) => {
      logger.info("Port connected:", port)
      port.onMessage.addListener(onMessage)
    }
  )
}

main().catch(logger.error)
