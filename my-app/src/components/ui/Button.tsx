import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/studioUtils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:ring-1 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-brand-500 border border-brand-500 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-sm',
        dark: 'bg-brand-700 border border-brand-700 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-sm',
        secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500 shadow-sm',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
        lightdark: 'bg-brand-600 border border-brand-600 text-white hover:bg-brand-700 hover:border-brand-700 hover:text-white focus:ring-brand-50',
        outline: 'bg-transparent border border-slate-300 text-brand-600 hover:bg-brand-600 hover:text-white focus:ring-brand-50',
      },
      size: {
        sm: 'px-2 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  size,
  icon,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {icon && <span className="mr-2 -ml-1 h-4 w-4">{icon}</span>}
      {children}
    </button>
  );
};

// Export buttonVariants for reuse in other components
export { buttonVariants };

// ViewModeToggle Component
interface ViewModeOption<T extends string> {
  value: T;
  icon: React.ReactNode;
  label: string;
}

interface ViewModeToggleProps<T extends string> {
  value: T;
  options: ViewModeOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export function ViewModeToggle<T extends string>({
  value,
  options,
  onChange,
  className = ''
}: ViewModeToggleProps<T>) {
  return (
    <div className={cn('flex bg-gray-100 rounded-lg p-1', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'p-2 rounded-md transition-colors',
            value === option.value
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-900'
          )}
          title={option.label}
          type="button"
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}