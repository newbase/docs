import React from 'react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
            {icon && (
                <div className="mb-4 text-gray-400">
                    {icon}
                </div>
            )}
            <p className="text-gray-500 font-medium mb-2">{title}</p>
            {description && (
                <p className="text-gray-400 text-sm max-w-md">{description}</p>
            )}
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
};
