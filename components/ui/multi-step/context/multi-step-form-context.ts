import { createContext, useContext } from "react"
import type { z } from "zod"
import type { useMultiStepForm } from "../../../../src/pages/hooks/use-multi-step-form.ts"

type MultiStepFormContextType<Schema extends z.ZodType> = ReturnType<
  typeof useMultiStepForm<Schema>
> | null

export const MultiStepFormContext = createContext<ReturnType<
  typeof useMultiStepForm
> | null>(null)

export function useMultiStepFormContext<Schema extends z.ZodType>() {
  const context: MultiStepFormContextType<Schema> =
    useContext(MultiStepFormContext)
  if (!context) {
    throw new Error(
      "useMultiStepFormContext must be used within a MultiStepForm"
    )
  }
  return context
}

export function MultiStepFormContextProvider(props: {
  children: (context: ReturnType<typeof useMultiStepForm>) => React.ReactNode
}) {
  const ctx = useMultiStepFormContext()
  if (Array.isArray(props.children)) {
    const [child] = props.children
    return (
      child as (context: ReturnType<typeof useMultiStepForm>) => React.ReactNode
    )(ctx)
  }
  return props.children(ctx)
}
