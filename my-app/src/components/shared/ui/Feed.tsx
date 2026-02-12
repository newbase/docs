import React from 'react';

interface FeedProps {
    children: React.ReactNode;
    className?: string;
}

export const Feed: React.FC<FeedProps> = ({ children, className = '' }) => {
    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            {children}
        </div>
    );
};

interface FeedItemProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    index?: number;
    animate?: boolean;
}

export const FeedItem: React.FC<FeedItemProps> = ({
    children,
    className = '',
    style = {},
    index,
    animate = true
}) => {
    // Note: Tailwind animation classes or inline style for staged animation
    const animationStyle = animate && index !== undefined ? {
        opacity: 0,
        animation: `fadeInUp 0.5s ease forwards ${index * 0.1}s`
    } : {};

    return (
        <div
            className={`bg-white rounded-xl border border-gray-100 transition-all hover:shadow-md ${className}`}
            style={{ ...animationStyle, ...style }}
        >
            <div className="p-5">
                {children}
            </div>
        </div>
    );
};
