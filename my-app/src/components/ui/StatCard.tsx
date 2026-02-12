import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    sub?: string;
    icon?: LucideIcon;
    color?: string;
    isActive?: boolean;
    onClick?: () => void;
    trend?: string;
    trendUp?: boolean;
}

// Color mapping function to convert Tailwind color names to hex values
const getColorValue = (color?: string): string => {
    if (!color) return '#6b7280'; // default gray-500

    const colorMap: Record<string, string> = {
        'blue': '#0a84ff',
        'green': '#30d158',
        'orange': '#ff9f0a',
        'red': '#FF0000',
        'indigo': '#6366F1',
        'purple': '#BF5AF2',
    };

    return colorMap[color] || color; // Return mapped color or original if it's already a hex/rgb value
};

export default function StatCard({ label, value, sub, icon: Icon, color, isActive, onClick, trend, trendUp }: StatCardProps) {
    const colorValue = getColorValue(color);
    return (
        <div
            onClick={onClick}
            className={`bg-white p-5 rounded-2xl border border-slate-200 transition-all duration-200 ${isActive ? 'shadow-md -translate-y-1' : 'shadow-sm hover:shadow-md'
                }`}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                borderColor: isActive ? colorValue : 'var(--primary-blue)'
            }}
        >
            <div
                className="flex items-center gap-2 mb-2 text-base font-medium transition-colors"
                style={{ color: isActive ? colorValue : 'var(--primary-blue)' }}
            >
                {Icon && <Icon size={18} className="shrink-0" />}
                <span>{label}</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
                {value} <span className="text-base font-medium text-gray-500 ml-1">{sub}</span>
            </div>
            {trend && (
                <div className="flex items-center mt-4 text-sm font-medium text-gray-500">
                    {trendUp ? (
                        <span className="flex items-center text-red-500"><TrendingUp size={14} className="mr-1" /> {trend}</span>
                    ) : (
                        <span className="flex items-center text-blue-500"><TrendingDown size={14} className="mr-1" /> {trend}</span>
                    )}
                    <span className="ml-1.5">지난주 대비</span>
                </div>
            )}
        </div>
    );
}