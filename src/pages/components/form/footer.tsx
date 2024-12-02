import { Button } from "@/components/ui/button"
import { useMultiStepFormContext } from "@/components/ui/multi-step/context/multi-step-form-context"

export default function Footer() {
  const { isFirstStep, isLastStep, prevStep, nextStep, isStepValid } =
    useMultiStepFormContext()

  if (isFirstStep) {
    return
  }

  if (isLastStep) {
    return (
      <footer className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Previous
        </Button>
        <Button type="submit" disabled={!isStepValid()}>
          Confirm
        </Button>
      </footer>
    )
  }

  return (
    <footer className="flex justify-between">
      <Button variant="outline" onClick={prevStep}>
        Previous
      </Button>
      <Button onClick={nextStep} disabled={!isStepValid()}>
        Next
      </Button>
    </footer>
  )
}
