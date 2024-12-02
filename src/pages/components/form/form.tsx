import { MultiStepForm } from "@/components/ui/multi-step/multi-step-form"
import { MultiStepFormFooter } from "@/components/ui/multi-step/multi-step-form-footer"
import { MultiStepFormHeader } from "@/components/ui/multi-step/multi-step-form-header"
import { MultiStepFormStep } from "@/components/ui/multi-step/multi-step-form-step"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { MultiStepFormContextProvider } from "../../../../components/ui/multi-step/context/multi-step-form-context.ts"
import { profiles } from "../../../shared/model/prompts/profile.ts"
import {
  type FormSchema,
  formSchema,
} from "../../../shared/model/schemas/form.ts"
import { storage } from "../../../shared/storage/storage.ts"
import Footer from "./footer.tsx"
import CategoriesStep from "./steps/categories-step.tsx"
import ConfirmationStep from "./steps/confirmation-step.tsx"
import LegalStep from "./steps/legal-step.tsx"
import ProfileSelectionStep from "./steps/profile-selection-step.tsx"
import TabGroupManagementStep from "./steps/tab-group-management-step.tsx"

export default function Form() {
  const form = useForm<z.infer<FormSchema>>({
    defaultValues: {
      legal: {
        accepted: false,
      },
      profile: { selected: profiles[0] },
      categories: [],
      tabGroups: {
        areManaged: true,
      },
    },
    resolver: zodResolver(formSchema),
    reValidateMode: "onBlur",
    mode: "onBlur",
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await storage.set({
      options: {
        categories: data.categories,
        profile: data.profile.selected.name,
        tabGroups: data.tabGroups,
      },
    })
    window.close()
  }

  return (
    <MultiStepForm
      className={"space-y-4 p-8 rounded-xl"}
      schema={formSchema}
      form={form}
      onSubmit={onSubmit}
    >
      <MultiStepFormHeader
        className={"flex w-full flex-col justify-center space-y-6"}
      >
        <MultiStepFormContextProvider>
          {({ currentStepIndex }) => {
            if (currentStepIndex === 0) {
              return (
                <h1 className="text-2xl font-semibold">Let's get started</h1>
              )
            }
            if (currentStepIndex === 1) {
              return (
                <h1 className="text-2xl font-semibold">
                  Select your assistant profile
                </h1>
              )
            }
            if (currentStepIndex === 2) {
              return (
                <h1 className="text-2xl font-semibold">
                  Should your assistant manage your tab groups?
                </h1>
              )
            }
            if (currentStepIndex === 3) {
              return (
                <h1 className="text-2xl font-semibold">
                  Choose your preferred categories
                </h1>
              )
            }
            if (currentStepIndex === 4) {
              return (
                <h1 className="text-2xl font-semibold">
                  Confirm your settings
                </h1>
              )
            }
          }}
        </MultiStepFormContextProvider>
      </MultiStepFormHeader>
      <MultiStepFormStep name="legal">
        <LegalStep />
      </MultiStepFormStep>
      <MultiStepFormStep name="profile">
        <ProfileSelectionStep profiles={profiles} />
      </MultiStepFormStep>
      <MultiStepFormStep name="category">
        <TabGroupManagementStep />
      </MultiStepFormStep>
      <MultiStepFormStep name="categories">
        <CategoriesStep />
      </MultiStepFormStep>
      <MultiStepFormStep name="confirmation">
        <ConfirmationStep />
      </MultiStepFormStep>

      <MultiStepFormFooter>
        <Footer />
      </MultiStepFormFooter>
    </MultiStepForm>
  )
}
