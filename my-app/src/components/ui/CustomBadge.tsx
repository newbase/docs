import React from 'react';

export interface BadgeProps {
    children: React.ReactNode;
    color?: 'slate' | 'red' | 'bg-slate-100' | 'bg-brand-50' | 'bg-red-50' | 'bg-indigo-50' | string; // Flexible for now to accommodate our diverse color usage
    className?: string;
    onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'bg-slate-100', className = '', onClick }) => {
    // Determine if it's a specific recognized color class or a generic color name
    let colorClasses = color;

    if (color === 'bg-slate-100' || color === 'slate') {
        colorClasses = "bg-slate-100 text-slate-600 border-slate-200";
    } else if (color === 'bg-brand-50' || color === 'brand') {
        colorClasses = "bg-brand-50 text-brand-700 border-brand-200";
    } else if (color === 'bg-red-50' || color === 'red') {
        colorClasses = "bg-red-50 text-red-700 border-red-200";
    } else if (color === 'bg-indigo-50' || color === 'indigo') {
        colorClasses = "bg-indigo-50 text-indigo-700 border-indigo-200";
    }

    return (
        <span
            onClick={onClick}
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${colorClasses} ${className} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
        >
            {children}
        </span>
    );
};
