import { cn } from "@/lib/utils"
import { Indicator, Root } from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { forwardRef } from "react"

const Checkbox = forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root>
>(({ className, ...props }, ref) => (
  <Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-zinc-900 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-zinc-50 dark:border-zinc-800 dark:border-zinc-50 dark:focus-visible:ring-zinc-300 dark:data-[state=checked]:bg-zinc-50 dark:data-[state=checked]:text-zinc-900",
      className
    )}
    {...props}
  >
    <Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </Indicator>
  </Root>
))
Checkbox.displayName = Root.displayName

export { Checkbox }
