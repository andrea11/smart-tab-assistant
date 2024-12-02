import { Checkbox } from "@/components/ui/checkbox.tsx"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form.tsx"
import { useMultiStepFormContext } from "@/components/ui/multi-step/context/multi-step-form-context.ts"
import type { FormSchema } from "../../../../shared/model/schemas/form.ts"

export default function TabGroupManagementStep() {
  const { form } = useMultiStepFormContext<FormSchema>()

  const onCheckedChange = (checked: boolean) => {
    form.setValue("tabGroups.areManaged", checked)
  }
  return (
    <Form {...form}>
      <FormField
        name="tabGroups.areManaged"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-2">
              <FormControl>
                <Checkbox
                  {...field}
                  checked={field.value}
                  onCheckedChange={onCheckedChange}
                  className="self-start"
                />
              </FormControl>
              <div>
                <FormLabel>Manage all browser tab groups</FormLabel>
                <FormDescription>
                  The extension will manage also the already existing tab
                  groups. If not enabled, only tab groups created by the
                  extension will be managed.
                </FormDescription>
              </div>
            </div>
          </FormItem>
        )}
      />
    </Form>
  )
}
