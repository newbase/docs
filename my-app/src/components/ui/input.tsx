import * as React from "react"

import { cn } from "../../utils/studioUtils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
}

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className, type, label, error, icon, multiline, rows, ...props }, ref) => {
    const commonClasses = cn(
      "flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background transition-all",
      "placeholder:text-muted-foreground",
      "hover:border-brand-500",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 focus-visible:ring-offset-0 focus-visible:border-brand-500",
      "disabled:cursor-not-allowed disabled:opacity-50 md:text-base",
      error && "border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500",
      icon && "pl-10",
      className
    )

    const inputElement = multiline ? (
      <textarea
        className={cn("min-h-20", commonClasses)}
        ref={ref as React.Ref<HTMLTextAreaElement>}
        rows={rows}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    ) : (
      <input
        type={type}
        className={cn("h-10", commonClasses)}
        ref={ref as React.Ref<HTMLInputElement>}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    )

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          {inputElement}
        </div>
        {error && (
          <p className="mt-1.5 text-sm font-medium text-red-500 ml-0.5 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
