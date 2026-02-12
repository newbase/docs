import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/cn"

const Checkbox = React.forwardRef<
    HTMLInputElement,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'checked'> & {
        checked?: boolean | "indeterminate";
        onCheckedChange?: (checked: boolean | "indeterminate") => void;
    }
>(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onCheckedChange?.(event.target.checked)
    }

    return (
        <div className="relative flex items-center">
            <input
                type="checkbox"
                className={cn(
                    "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-white checked:bg-blue-600 checked:border-blue-600",
                    className
                )}
                ref={ref}
                checked={checked === true}
                onChange={handleChange}
                disabled={disabled}
                {...props}
            />
            <Check
                className={cn(
                    "pointer-events-none absolute left-0 top-0 h-4 w-4 text-white opacity-0 peer-checked:opacity-100",
                    "h-full w-full p-0.5"
                )}
            />
        </div>
    )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
