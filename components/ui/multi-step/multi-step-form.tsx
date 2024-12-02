import { cn } from "@/lib/utils"
import { Children, isValidElement, useMemo } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import { useMultiStepForm } from "../../../src/pages/hooks/use-multi-step-form.ts"
import AnimatedStep from "./animated-step.tsx"
import { MultiStepFormContext } from "./context/multi-step-form-context.ts"
import { MultiStepFormFooter } from "./multi-step-form-footer.tsx"
import { MultiStepFormHeader } from "./multi-step-form-header.tsx"
import { MultiStepFormStep } from "./multi-step-form-step.tsx"

interface MultiStepFormProps<T extends z.ZodType> {
  schema: T
  form: UseFormReturn<z.infer<T>>
  onSubmit: (data: z.infer<T>) => void
  useStepTransition?: boolean
  className?: string
}

type StepProps = React.PropsWithChildren<
  {
    name: string
    asChild?: boolean
  } & React.HTMLProps<HTMLDivElement>
>

export function MultiStepForm<T extends z.ZodType>({
  schema,
  form,
  onSubmit,
  children,
  className,
}: React.PropsWithChildren<MultiStepFormProps<T>>) {
  const steps = useMemo(
    () =>
      Children.toArray(children).filter(
        (child): child is React.ReactElement<StepProps> =>
          isValidElement(child) && child.type === MultiStepFormStep
      ),
    [children]
  )
  const header = useMemo(() => {
    return Children.toArray(children).find(
      (child) => isValidElement(child) && child.type === MultiStepFormHeader
    )
  }, [children])
  const footer = useMemo(() => {
    return Children.toArray(children).find(
      (child) => isValidElement(child) && child.type === MultiStepFormFooter
    )
  }, [children])
  const stepNames = steps.map((step) => step.props.name)
  const multiStepForm = useMultiStepForm(schema, form, stepNames)
  return (
    <MultiStepFormContext.Provider value={multiStepForm}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(className, "flex size-full flex-col overflow-hidden")}
      >
        {header}
        <div className="relative transition-transform duration-500">
          {steps.map((step, index) => {
            const isActive = index === multiStepForm.currentStepIndex
            return (
              <AnimatedStep
                key={step.props.name}
                direction={multiStepForm.direction}
                isActive={isActive}
                index={index}
                currentIndex={multiStepForm.currentStepIndex}
              >
                {step}
              </AnimatedStep>
            )
          })}
        </div>
        {footer}
      </form>
    </MultiStepFormContext.Provider>
  )
}
