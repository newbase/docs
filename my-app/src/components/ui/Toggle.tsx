import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export const ToggleSwitch = ({ checked, onChange, disabled }: ToggleSwitchProps) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
            <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${checked ? 'bg-blue-600' : 'bg-gray-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
        </label>
    );
};

interface ToggleLabelProps {
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export const ToggleLabel = ({ label, checked, onChange, disabled }: ToggleLabelProps) => {
    return (
        <div className="flex items-center gap-3">
            <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
            <span
                className={`text-sm font-medium ${disabled
                        ? 'text-gray-400'
                        : (checked ? 'text-gray-900' : 'text-gray-500')
                    }`}
            >
                {label}
            </span>
        </div>
    );
};
