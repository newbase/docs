import * as React from "react"

import { cn } from "@/lib/cn"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className, type, label, error, icon, suffix, multiline, rows, wrapperClassName, ...props }, ref) => {
    // Checkbox/Radio 타입 체크
    const isCheckboxOrRadio = type === 'checkbox' || type === 'radio';

    // 일반 input/textarea 스타일
    const commonClasses = cn(
      "flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background transition-all",
      "placeholder:text-muted-foreground",
      "hover:border-brand-500",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 focus-visible:ring-offset-0 focus-visible:border-brand-500",
      "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      error && "border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500",
      icon && "pl-10",
      suffix && "pr-6",
      type === 'number' && "[&::-webkit-inner-spin-button]:ml-1 [&::-webkit-outer-spin-button]:ml-1",
      className
    )

    // Checkbox/Radio 스타일
    const checkboxRadioClasses = cn(
      "h-4 w-4 rounded border-gray-300 text-blue-600 transition-colors",
      "focus:ring-2 focus:ring-blue-500 focus:ring-offset-0",
      "disabled:cursor-not-allowed disabled:opacity-50",
      type === 'checkbox' && "rounded",
      type === 'radio' && "rounded-full",
      error && "border-red-500 focus:ring-red-500",
      className
    )

    // Checkbox/Radio 레이아웃
    if (isCheckboxOrRadio) {
      return (
        <div className={cn("flex items-center", wrapperClassName)}>
          <input
            type={type}
            className={checkboxRadioClasses}
            ref={ref as React.Ref<HTMLInputElement>}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
          {label && (
            <label className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
              {label}
            </label>
          )}
          {error && (
            <p className="ml-2 text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}
        </div>
      )
    }

    // 일반 input/textarea 레이아웃
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
        className={cn("h-[38px]", commonClasses)}
        ref={ref as React.Ref<HTMLInputElement>}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    )

    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-600 ml-0.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          {inputElement}
          {suffix && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none transition-all",
              type === 'number' ? "right-3" : "right-3"
            )}>
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm font-medium text-red-500 ml-0.5 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
