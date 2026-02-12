import React from 'react';

interface TimelineFeedProps {
    children: React.ReactNode;
    className?: string;
}

export const TimelineFeed = ({ children, className = '' }: TimelineFeedProps) => {
    return (
        <div className={`flex flex-col gap-6 relative pl-8 border-l-2 border-gray-100 ml-32 lg:ml-40 py-2 ${className}`}>
            {children}
        </div>
    );
};

interface TimelineItemProps {
    date?: string;
    label?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    index?: number;
    animate?: boolean;
}

export const TimelineItem = ({
    date,
    label,
    children,
    className = '',
    style = {},
    index,
    animate = true
}: TimelineItemProps) => {
    const animationStyle: React.CSSProperties = animate && index !== undefined ? {
        opacity: 0,
        animation: `fadeInUp 0.5s ease forwards ${index * 0.1}s`
    } as React.CSSProperties : {};

    const hasDate = date || label;

    return (
        <div
            className={`relative group ${className}`}
            style={{ ...animationStyle, ...style }}
        >
            {/* Timeline Dot */}
            <div className="absolute -left-[39px] top-6 w-5 h-5 rounded-full bg-white border-4 border-blue-100 group-hover:border-blue-500 transition-colors z-10" />

            {hasDate && (
                <div className="absolute -left-32 lg:-left-40 w-24 lg:w-32 top-6 pr-4 flex flex-col items-end justify-center gap-1">
                    <div className="text-sm font-bold text-gray-900 text-right leading-none">
                        {date}
                    </div>
                    {label && (
                        <div>
                            {label}
                        </div>
                    )}
                </div>
            )}
            <div className="">
                {children}
            </div>
        </div>
    );
};
