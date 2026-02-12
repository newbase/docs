import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
    value?: string;
    onValueChange?: (value: string) => void;
}

const TabsContext = createContext<TabsContextType>({});

interface TabsProps {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className = '' }: TabsProps) {
    const [localValue, setLocalValue] = useState(defaultValue);
    const currentValue = value !== undefined ? value : localValue;

    const handleValueChange = (newValue: string) => {
        if (onValueChange) {
            onValueChange(newValue);
        }
        if (value === undefined) {
            setLocalValue(newValue);
        }
    };

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div className={`flex flex-col w-full ${className}`}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
    return (
        <div className={`inline-flex items-center border-b border-gray-200 ${className}`}>
            {children}
        </div>
    );
}

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export function TabsTrigger({ value, children, className = '', disabled = false }: TabsTriggerProps) {
    const context = useContext(TabsContext);
    const isActive = context.value === value;

    return (
        <button
            className={`relative inline-flex items-center justify-center whitespace-nowrap px-4 py-3 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border-b-2 ${isActive
                ? 'text-brand-500 border-brand-500'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                } ${className}`}
            onClick={() => !disabled && context.onValueChange && context.onValueChange(value)}
            disabled={disabled}
            type="button"
            data-state={isActive ? 'active' : 'inactive'}
        >
            {children}
        </button>
    );
}

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
    const context = useContext(TabsContext);

    if (context.value !== value) return null;

    return (
        <div className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 w-full ${className}`}>
            {children}
        </div>
    );
}
