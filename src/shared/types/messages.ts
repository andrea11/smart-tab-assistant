export type SetupModelMessage = {
  type: "setup"
  payload: {
    systemPrompt?: string
    initialPrompts?: string[]
    maxTokens?: number
    temperature?: number
    topK?: number
    defaultK?: number
  }
}

export type GenerateMessage = {
  type: "generate"
  payload: {
    userPrompt: string
  }
}

export type ResponseMessage = {
  type: "response"
  payload: { response: string }
}

export type EndResponseMessage = {
  type: "end-response"
}

export type Messages = GenerateMessage | ResponseMessage | EndResponseMessage
