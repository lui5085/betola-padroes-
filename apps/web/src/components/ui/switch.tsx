import * as React from "react"

import { cn } from "@/lib/utils"

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(
          "peer sr-only",
          className
        )}
        ref={ref}
        onChange={(e) => {
          if (onCheckedChange) onCheckedChange(e.target.checked)
          if (props.onChange) props.onChange(e)
        }}
        {...props}
      />
    )
  }
)
Switch.displayName = "Switch"

export { Switch }