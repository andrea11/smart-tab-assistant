import type React from "react"
import { useEffect, useState } from "react"
import type {
  GenerateMessage,
  ResponseMessage,
  SetupModelMessage,
} from "../shared/types/messages.ts"
import useRuntimePort from "./hooks/useRuntimePort.ts"

type PromptResponse = {
  isGenerating: boolean
  response: string
}

export default function Options() {
  const port = useRuntimePort<
    GenerateMessage | SetupModelMessage,
    ResponseMessage
  >()
  const [promptResponse, setPromptResponse] = useState<PromptResponse>({
    isGenerating: false,
    response: "",
  })
  const [formValues, setFormValues] = useState<FormValues>({
    systemPrompt: "",
    userPrompt: "",
    defaultTopK: 3,
    topK: 8,
    temperature: 1,
  })
  const [currentFormValues, setCurrentFormValues] = useState<FormValues>({
    systemPrompt: "",
    userPrompt: "",
    defaultTopK: 3,
    topK: 8,
    temperature: 1,
  })
  const [activePrompt, setActivePrompt] = useState<
    "initialPrompts" | "systemPrompt"
  >("initialPrompts")

  useEffect(() => {
    if (!port) {
      return
    }
    port.onMessage.addListener((message) => {
      if (message.type === "response") {
        setPromptResponse((promptResponse) => ({
          ...promptResponse,
          response: promptResponse.response + message.payload.response,
        }))
        return
      }
      if (message.type === "end-response") {
        setPromptResponse((promptResponse) => ({
          ...promptResponse,
          isGenerating: false,
        }))
      }
    })
  }, [port])

  const handleChange = (e: HandleChangeEvent) => {
    const { name, value } = e.target
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  interface FormValues {
    systemPrompt: string
    userPrompt: string
    defaultTopK: number
    topK: number
    temperature: number
  }

  interface HandleChangeEvent {
    target: {
      name: string
      value: string
    }
  }

  const handlePromptToggle = () => {
    setActivePrompt((prev) =>
      prev === "initialPrompts" ? "systemPrompt" : "initialPrompts"
    )
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const isFormDirty =
      formValues.systemPrompt !== currentFormValues.systemPrompt &&
      formValues.defaultTopK !== currentFormValues.defaultTopK &&
      formValues.topK !== currentFormValues.topK &&
      formValues.temperature !== currentFormValues.temperature
    const isUserPromptDirty =
      formValues.userPrompt !== currentFormValues.userPrompt

    if (!(isFormDirty || isUserPromptDirty)) {
      return
    }

    if (isFormDirty) {
      port?.postMessage({
        type: "setup",
        payload: {
          systemPrompt: formValues.systemPrompt,
          topK: formValues.topK,
          temperature: formValues.temperature,
        },
      })
    }

    if (isUserPromptDirty) {
      port?.postMessage({
        type: "generate",
        payload: {
          userPrompt: formValues.userPrompt,
        },
      })
    }

    setPromptResponse({
      isGenerating: true,
      response: "",
    })
    setCurrentFormValues(formValues)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg bg-gray-100 p-4 shadow-md"
    >
      <button
        type="button"
        onClick={handlePromptToggle}
        className="mb-4 rounded-md bg-gray-300 p-2"
      >
        Toggle Prompt
      </button>
      {activePrompt === "initialPrompts" ? (
        <textarea
          name="initialPrompts"
          id="initial-prompts"
          className="w-full rounded-md border border-gray-300 p-2"
          placeholder="Initial prompts"
          value={formValues.systemPrompt}
          onChange={handleChange}
        />
      ) : (
        <textarea
          name="systemPrompt"
          id="system-prompt"
          className="w-full rounded-md border border-gray-300 p-2"
          placeholder="System prompt"
          value={formValues.systemPrompt}
          onChange={handleChange}
        />
      )}
      <textarea
        name="userPrompt"
        id="user-prompt"
        className="w-full rounded-md border border-gray-300 p-2"
        placeholder="User prompt"
        value={formValues.userPrompt}
        onChange={handleChange}
      />
      <textarea
        name="response"
        id="response"
        value={promptResponse.response}
        readOnly={true}
        className="w-full rounded-md border border-gray-300 bg-gray-200 p-2"
        placeholder="Response"
      />
      <label htmlFor="default-top-k" className="flex flex-col">
        Default Top K{" "}
        <input
          type="range"
          name="defaultTopK"
          id="default-top-k"
          min="1"
          max="10"
          value={formValues.defaultTopK}
          onChange={handleChange}
          className="mt-1"
        />
      </label>
      <label htmlFor="max-top-k" className="flex flex-col">
        Max Top K{" "}
        <input
          type="range"
          name="maxTopK"
          id="max-top-k"
          min="1"
          max="10"
          value={formValues.topK}
          onChange={handleChange}
          className="mt-1"
        />
      </label>
      <label htmlFor="temperature" className="flex flex-col">
        Temperature{" "}
        <input
          type="range"
          name="temperature"
          id="temperature"
          min="0"
          max="2"
          step="0.1"
          value={formValues.temperature}
          onChange={handleChange}
          className="mt-1"
        />
      </label>
      <button
        type="submit"
        id="generate"
        disabled={promptResponse.isGenerating}
        className="inline-block cursor-pointer rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"
      >
        Generate
      </button>
    </form>
  )
}
