import { cn } from "@/lib/utils"
import { Fragment } from "react"

export interface Step {
  title: string
  description?: string
  order: number
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <Fragment key={step.order}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  currentStep === index
                    ? "border-primary bg-background"
                    : "border-muted-foreground/25 bg-background",
                  currentStep > index && "border-primary bg-primary"
                )}
              >
                {currentStep > index ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-background" />
                ) : (
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      currentStep === index
                        ? "bg-primary"
                        : "bg-muted-foreground/25"
                    )}
                  />
                )}
                {currentStep === index && (
                  <div className="absolute -inset-2 animate-pulse rounded-full border-2 border-primary" />
                )}
              </div>
              <div className="mt-4 flex flex-col items-center gap-1">
                <span className="text-xl font-semibold">{step.title}</span>
                {step.description && (
                  <span className="text-center text-sm text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] w-full max-w-[100px] transition-colors sm:max-w-[200px]",
                  currentStep > index ? "bg-primary" : "bg-muted-foreground/25"
                )}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
