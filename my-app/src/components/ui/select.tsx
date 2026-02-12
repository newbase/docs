import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "../../utils/studioUtils"

const Select = ({
  label,
  labelPlacement = "top",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root> & {
  label?: string;
  labelPlacement?: "top" | "left" | "hidden";
}) => (
  <div className={cn(
    "flex",
    labelPlacement === "top" ? "flex-col space-y-2" : "flex-row items-center gap-3"
  )}>
    {label && labelPlacement !== "hidden" && (
      <label className={cn(
        "text-sm font-semibold text-gray-700 ml-0.5 whitespace-nowrap",
        labelPlacement === "left" ? "mb-0" : ""
      )}>
        {label}
      </label>
    )}
    <SelectPrimitive.Root {...props} />
  </div>
)

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-base ring-offset-background data-[placeholder]:text-muted-foreground hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-80" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-[1100] max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-white text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
        position === "popper" &&
        "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
          "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-2 pl-8 pr-2 text-sm font-medium text-gray-400 uppercase", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center hover:text-blue-500 rounded-sm py-2 pl-8 pr-2 text-base outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-5 w-5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-white", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

interface SelectComboProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

function SelectCombo({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  triggerClassName,
  label,
  labelPlacement = "top"
}: SelectComboProps & { label?: string; labelPlacement?: "top" | "left" | "hidden" }) {
  return (
    <div className={className}>
      <Select
        value={value}
        onValueChange={onValueChange}
        label={label}
        labelPlacement={labelPlacement}
      >
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.filter(opt => opt.value !== '').map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface ComboBoxProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  label?: string;
  labelPlacement?: "top" | "left" | "hidden";
}

function ComboBox({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  triggerClassName,
  label,
  labelPlacement = "top"
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Update search term when value changes from outside (e.g. initial load or reset)
  React.useEffect(() => {
    const selectedOption = options.find(opt => opt.value === value);
    setSearchTerm(selectedOption ? selectedOption.label : value);
  }, [value, options]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn(
      "flex",
      labelPlacement === "top" ? "flex-col space-y-2" : "flex-row items-center gap-3",
      className
    )}>
      {label && labelPlacement !== "hidden" && (
        <label className={cn(
          "text-sm font-semibold text-gray-700 ml-0.5 whitespace-nowrap",
          labelPlacement === "left" ? "mb-0" : ""
        )}>
          {label}
        </label>
      )}
      <div className="relative w-full">
        <div className="relative">
          <input
            type="text"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              triggerClassName
            )}
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onValueChange(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              // Delay closing to allow clicking on an option
              setTimeout(() => setIsOpen(false), 200);
            }}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </div>

        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-[1100] mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative cursor-default select-none py-2 pl-3 pr-9 text-base transition-colors hover:bg-blue-50 hover:text-blue-600",
                  value === option.value ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-900"
                )}
                onMouseDown={(e) => {
                  // Use onMouseDown to prevent blur from closing before click
                  e.preventDefault();
                  onValueChange(option.value);
                  setSearchTerm(option.label);
                  setIsOpen(false);
                }}
              >
                <span className="block truncate">{option.label}</span>
                {value === option.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectCombo,
  ComboBox,
}
