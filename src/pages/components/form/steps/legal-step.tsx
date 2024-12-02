import { Button } from "@/components/ui/button.tsx"
import { Checkbox } from "@/components/ui/checkbox.tsx"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form.tsx"
import { useMultiStepFormContext } from "@/components/ui/multi-step/context/multi-step-form-context.ts"
import type { FormSchema } from "../../../../shared/model/schemas/form.ts"

export default function LegalStep() {
  const { form, nextStep, isStepValid } = useMultiStepFormContext<FormSchema>()
  return (
    <Form {...form}>
      <h1 className="text-3xl font-bold">Smart Tab Assistant</h1>
      <p className="text-xl">Your intelligent companion for tab management</p>
      <p className="text-gray-600">
        Thank you for trusting us with your tab organization. We need some
        initial configuration to get started. Rest assured, all processing
        happens locally, and no data is sent to any server.
      </p>
      <div className={"flex flex-col gap-4"}>
        <FormField
          name="legal.accept"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Checkbox {...field} className="hidden" />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button
            onClick={(e) => {
              form.setValue("legal.accepted", true)
              nextStep(e)
            }}
            disabled={!isStepValid()}
          >
            Let's get started
          </Button>
        </div>
      </div>
    </Form>
  )
}
