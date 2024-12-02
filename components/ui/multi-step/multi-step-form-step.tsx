import { Slot, Slottable } from "@radix-ui/react-slot"
import { type HTMLProps, forwardRef } from "react"

export const MultiStepFormStep = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<
    {
      asChild?: boolean
    } & HTMLProps<HTMLDivElement>
  >
>(function MultiStepFormStep({ children, asChild, ...props }, ref) {
  const Cmp = asChild ? Slot : "div"
  return (
    <Cmp ref={ref} {...props}>
      <Slottable>{children}</Slottable>
    </Cmp>
  )
})
