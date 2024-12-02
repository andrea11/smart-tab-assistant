import { Slot, Slottable } from "@radix-ui/react-slot"
import { forwardRef } from "react"

export const MultiStepFormFooter = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<
    {
      asChild?: boolean
    } & React.HTMLProps<HTMLDivElement>
  >
>(function MultiStepFormFooter({ children, asChild, ...props }, ref) {
  const Cmp = asChild ? Slot : "div"
  return (
    <Cmp ref={ref} {...props}>
      <Slottable>{children}</Slottable>
    </Cmp>
  )
})
