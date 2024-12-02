import { useMultiStepFormContext } from "@/components/ui/multi-step/context/multi-step-form-context.ts"
import type { FormSchema } from "../../../../shared/model/schemas/form.ts"
import { capitalize } from "../../../../shared/utils/string/capitalize.ts"

export default function ConfirmationStep() {
  const { form } = useMultiStepFormContext<FormSchema>()
  return (
    <div className="flex flex-col space-y-4">
      <p className="text-xl">
        Here is a summary of your configuration. Please review it before
        proceeding.
      </p>
      <p className="text-lg self-center">Profile</p>
      <div className="flex space-x-1">
        <p className="font-medium text-gray-800 dark:text-gray-200">
          {capitalize(form.getValues("profile.selected").name)}:
        </p>
        <p>{form.getValues("profile.selected").description}</p>
      </div>
      <p className="text-lg self-center">Categories</p>
      <ul className="list-disc list-inside space-y-2">
        {form.getValues("categories").map((category) => (
          <li
            key={category.name}
            className="font-medium text-gray-800 dark:text-gray-200"
          >
            {category.name} {category.isTabGroup && "(Managed Tab Group)"}
          </li>
        ))}
      </ul>
    </div>
  )
}
