import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
}

export default function SearchBar({ value, onChange, placeholder = "Search...", className, style }: SearchBarProps) {
    return (
        <div
            className={`flex items-center max-w-sm h-[44px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${className || ''}`}
            style={style}
        >
            <Search size={16} className="text-gray-500 mr-2 shrink-0" />
            <input
                type="text"
                className="flex h-full w-full bg-transparent p-0 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
