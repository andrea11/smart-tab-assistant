export type ProcessPromptMessage = {
  type: "process-prompt"
  payload: {
    userPrompt: string
  }
}
