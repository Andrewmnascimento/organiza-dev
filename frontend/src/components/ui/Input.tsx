import { cn } from "../../lib/cn"
import { type ComponentProps } from "react"

export const Input = ({ className, ...props }: ComponentProps<"input">) => {
  return (
    <input
      className={cn('bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950', className)}
      {...props}
    />    
  )
}