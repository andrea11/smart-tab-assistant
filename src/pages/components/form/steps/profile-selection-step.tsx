import { Card, CardContent } from "@/components/ui/card.tsx"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel.tsx"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form.tsx"
import { useMultiStepFormContext } from "@/components/ui/multi-step/context/multi-step-form-context.ts"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { useEffect, useRef, useState } from "react"

import type { FormSchema } from "../../../../shared/model/schemas/form.ts"
import type { Profile } from "../../../../shared/model/schemas/profile.ts"
import { capitalize } from "../../../../shared/utils/string/capitalize.ts"

interface ProfileSelectionStepProps {
  readonly profiles: readonly Profile[]
}

export default function ProfileSelectionStep({
  profiles,
}: Readonly<ProfileSelectionStepProps>) {
  const { form } = useMultiStepFormContext<FormSchema>()
  const [api, setApi] = useState<CarouselApi>()
  const startIndex = useRef(
    profiles.findIndex(
      (profile) => profile.name === form.getValues("profile.selected")?.name
    ) ?? 0
  ).current

  useEffect(() => {
    if (!api) {
      return
    }

    api.on("select", () => {
      form.setValue("profile.selected", profiles[api.selectedScrollSnap()], {
        shouldValidate: true,
      })
    })
  }, [api, profiles, form.setValue])

  return (
    <Form {...form}>
      {/* <h2 className="text-center text-2xl font-bold">
          Choose Your Assistant Profile
        </h2> */}
      <FormField
        name="profile.selected"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Carousel
                opts={{
                  loop: false,
                  skipSnaps: true,
                  startIndex,
                }}
                plugins={[WheelGesturesPlugin()]}
                className="mx-auto w-full max-w-xs"
                setApi={setApi}
              >
                <CarouselContent>
                  {profiles.map((profile) => (
                    <CarouselItem key={profile.name}>
                      <Card
                        className={`cursor-pointer ${
                          field.value?.name === profile.name
                            ? "border-2 border-amber-500"
                            : ""
                        }`}
                      >
                        <CardContent className="flex flex-col items-center p-6">
                          <img
                            src={profile.image}
                            alt={profile.name}
                            width={200}
                            className="mb-4 h-[200px] w-[200px] rounded-full"
                          />
                          <h3 className="mb-2 text-xl font-semibold">
                            {capitalize(profile.name)}
                          </h3>
                          <p className="text-center text-sm text-gray-600">
                            {capitalize(profile.description)}
                          </p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious type="button" />
                <CarouselNext type="button" />
              </Carousel>
            </FormControl>
          </FormItem>
        )}
      />
    </Form>
  )
}
