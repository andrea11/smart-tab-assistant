type BaeSetupPromptPayload = {
  maxTokens?: number
  temperature?: number
  topK?: number
  defaultK?: number
}

type SetupPromptWithSystemPrompt = BaeSetupPromptPayload & {
  systemPrompt: string
  initialPrompts?: never
}

type SetupPromptWithInitialPrompts = BaeSetupPromptPayload & {
  systemPrompt?: never
  initialPrompts: string[]
}

export type SetupPromptMessage = {
  type: "setup-prompt"
  payload: SetupPromptWithSystemPrompt | SetupPromptWithInitialPrompts
}
