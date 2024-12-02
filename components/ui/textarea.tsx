import { cn } from "@/lib/utils"
import { type ChangeEvent, forwardRef, useEffect, useState } from "react"
import { useController, useFormContext } from "react-hook-form"

interface TextareaProps extends React.ComponentProps<"textarea"> {
  maxLength?: number
  name: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxLength, name, ...props }, _ref) => {
    const { control } = useFormContext()
    const { field } = useController({ name, control })
    const [charCount, setCharCount] = useState(field.value?.length || 0)

    useEffect(() => {
      setCharCount(field.value?.length || 0)
    }, [field.value])

    const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      field.onChange(e)
    }

    return (
      <div>
        <textarea
          className={cn(
            "flex min-h-[60px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
            className
          )}
          // {...field}
          maxLength={maxLength}
          onChange={handleTextareaChange}
          {...props}
        />
        {maxLength !== undefined && (
          <div
            className={
              "flex items-center justify-end text-sm text-muted-foreground"
            }
          >
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
