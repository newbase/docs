import React from 'react';
import { cn } from '@/lib/cn';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const ToggleSwitch = ({ checked, onChange, disabled, size = 'md' }: ToggleSwitchProps) => {
    const sizeClasses = {
        sm: {
            container: 'w-8 h-4',
            ball: 'after:h-3 after:w-3 peer-checked:after:translate-x-4 after:top-0.5 after:left-[2px]',
        },
        md: {
            container: 'w-11 h-6',
            ball: 'after:h-5 after:w-5 peer-checked:after:translate-x-5 after:top-0.5 after:left-[2px]',
        },
        lg: {
            container: 'w-14 h-8',
            ball: 'after:h-7 after:w-7 peer-checked:after:translate-x-6 after:top-0.5 after:left-[0.125rem]',
        }
    };

    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
            <div className={cn(
                "relative rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:border-white after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border after:rounded-full after:transition-all",
                sizeClasses[size].container,
                sizeClasses[size].ball,
                checked ? 'bg-blue-600' : 'bg-gray-200',
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            )}></div>
        </label>
    );
};

interface ToggleLabelProps {
    label?: string;
    onLabel?: string;
    offLabel?: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const ToggleLabel = ({ label, onLabel, offLabel, checked, onChange, disabled, size = 'md' }: ToggleLabelProps) => {
    const displayLabel = label || (checked ? onLabel : offLabel);

    return (
        <div className="flex items-center gap-3">
            <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} size={size} />
            {displayLabel && (
                <span
                    className={cn(
                        "font-medium",
                        size === 'lg' ? "text-base" : "text-sm",
                        disabled ? 'text-gray-400' : (checked ? 'text-gray-800' : 'text-gray-500')
                    )}
                >
                    {displayLabel}
                </span>
            )}
        </div>
    );
};
