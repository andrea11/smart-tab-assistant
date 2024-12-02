import { Button } from "@/components/ui/button.tsx"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form.tsx"
import { Input } from "@/components/ui/input.tsx"
import { useMultiStepFormContext } from "@/components/ui/multi-step/context/multi-step-form-context.ts"
import { ScrollArea } from "@/components/ui/scroll-area.tsx"
import { Separator } from "@/components/ui/separator.tsx"
import { Textarea } from "@/components/ui/textarea.tsx"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx"
import { Info } from "lucide-react"
import { useEffect, useState } from "react"
import { useFieldArray } from "react-hook-form"
import { TabGroups } from "../../../../background/services/tabs/groups.ts"
import { logger } from "../../../../shared/logger/logger.ts"
import type { Category } from "../../../../shared/model/schemas/category.ts"
import {
  type FormSchema,
  formSchema,
} from "../../../../shared/model/schemas/form.ts"
import { getMaxLength } from "../../../../shared/types/zod/get-max-length.ts"

export default function CategoriesStep() {
  const { form } = useMultiStepFormContext<FormSchema>()
  const { fields, append, update, remove } = useFieldArray({
    name: "categories",
    control: form.control,
  })

  const [selectedIndex, setSelectedIndex] = useState<number>()

  useEffect(() => {
    const setupCategories = async () => {
      const tabGroups = await TabGroups.getTabGroupDetails()
      const existingCategories = form.getValues("categories")
      let categories: Category[] = []

      if (form.getValues("tabGroups.areManaged")) {
        const categoriesToCreate = tabGroups
          .filter((tabGroups) => !!tabGroups.title)
          .filter((tabGroup) => {
            return !existingCategories.some(
              (category) => category.name === tabGroup?.title
            )
          }) as Required<chrome.tabGroups.TabGroup>[]

        categories = [
          ...existingCategories,
          ...categoriesToCreate.map(({ title }) => ({
            name: title,
            description: "",
            isTabGroup: true,
          })),
        ]
      } else {
        categories = existingCategories
          .filter(
            (category) =>
              !tabGroups.some((tabGroup) => tabGroup.title === category.name)
          )
          .map((category) => ({
            ...category,
            isTabGroup: false,
          }))
      }

      form.setValue("categories", categories, { shouldValidate: true })
    }
    setupCategories().catch(logger.error)
  }, [form])

  const onAddCategory = () => {
    const indexNewCategory = getNewCategoryIndex()

    if (indexNewCategory !== -1) {
      setSelectedIndex(indexNewCategory)
      return
    }

    append({
      name: "New category",
      description: "",
    })

    setSelectedIndex(fields.length)
    form.reset({}, { keepValues: true, keepIsValid: true })
  }

  const onRemoveCategory = (index: number) => {
    logger.info("Removing category", { index })
    remove(index)
    form.reset({}, { keepValues: true, keepIsValid: true })
    setSelectedIndex(undefined)
  }

  const getNewCategoryIndex = () =>
    fields.findIndex((field) => field.name.trim() === "New category")

  return (
    <div className="flex justify-between">
      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Categories</h4>
          {fields.map((category, index, categories) => (
            <div key={category.name}>
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setSelectedIndex(index)
                  form.trigger(`categories.${index}`)
                }}
                onKeyUp={(e) => e.key === "Enter" && setSelectedIndex(index)}
                className={`text-sm ${selectedIndex === index ? "outline" : ""}`}
                tabIndex={0}
              >
                {category.name}
              </Button>
              {index !== categories.length && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </ScrollArea>
      <Separator orientation="vertical" className="h-auto" />
      <div className="flex flex-col gap-4">
        {selectedIndex !== undefined && (
          <Form {...form} key={selectedIndex}>
            <FormField
              name={`categories.${selectedIndex}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={form.getValues(
                        `categories.${selectedIndex}.isTabGroup`
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name={`categories.${selectedIndex}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      {...field}
                      maxLength={getMaxLength(
                        formSchema.shape.categories.element.shape.description
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-4 justify-between" key={selectedIndex}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild={true}>
                    <Button
                      className={`${fields.at(selectedIndex)?.isTabGroup ? "cursor-default opacity-70" : ""}`}
                      type="button"
                      aria-disabled={fields.at(selectedIndex)?.isTabGroup}
                      variant="destructive"
                      onClick={() => {
                        if (fields.at(selectedIndex)?.isTabGroup) {
                          return
                        }
                        onRemoveCategory(selectedIndex)
                      }}
                      // disabled={fields.at(selectedIndex)?.isTabGroup}
                    >
                      {fields.at(selectedIndex)?.isTabGroup && <Info />} Delete
                    </Button>
                  </TooltipTrigger>
                  {fields.at(selectedIndex)?.isTabGroup && (
                    <TooltipContent>
                      <p>
                        This category already exists as tab group and therefore
                        it cannot be deleted
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              {form.getFieldState(`categories.${selectedIndex}`).isDirty ? (
                <Button
                  type="button"
                  onClick={() => {
                    update(selectedIndex, {
                      ...fields[selectedIndex],
                      ...form.getValues(`categories.${selectedIndex}`),
                    })
                    form.reset({}, { keepValues: true, keepIsValid: true })
                    setSelectedIndex(undefined)
                  }}
                >
                  Save
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedIndex(undefined)
                    form.reset({}, { keepValues: true, keepIsValid: true })
                  }}
                >
                  Discard
                </Button>
              )}
            </div>
          </Form>
        )}
        {selectedIndex === undefined && (
          <div className="flex flex-col gap-4 items-center justify-center h-72 w-48">
            <p className="text-sm text-gray-600">Select a category to edit</p>
            <p className="text-sm text-gray-600">OR</p>
            <span className="relative inline-flex">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild={true}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onAddCategory}
                    >
                      {getNewCategoryIndex() === -1 ? "Create" : "Edit"} new
                      category
                    </Button>
                  </TooltipTrigger>
                  {fields.length === 0 && (
                    <TooltipContent>
                      <p>You need to create at least one category to proceed</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              {fields.length === 0 && (
                <span className="flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
