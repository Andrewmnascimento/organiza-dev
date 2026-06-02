import { cn } from "../../lib/cn"
import { type ComponentProps } from "react"

export const Button = ({ children, className, ...props }: ComponentProps<"button">) => {
  return (
    <button className={cn("bg-zinc-950 text-white font-medium py-3 px-4 rounded-2xl transition-all hover:bg-zinc-800 active:scale-[0.98] flex items-center justify-center gap-2", className)} {...props}>
      {children}
    </button>
  )
}