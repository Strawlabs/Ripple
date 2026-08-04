import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<typeof InputPrimitive> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <InputPrimitive
        type={type}
        className={cn(
          "appearance-none block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all text-gray-900 bg-white",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
