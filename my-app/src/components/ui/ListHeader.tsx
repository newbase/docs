import React from 'react';

interface ListHeaderProps {
    title?: string;
    totalCount?: number;
    children?: React.ReactNode;
    rightContent?: React.ReactNode;
}

export default function ListHeader({
    title,
    totalCount,
    children,
    rightContent
}: ListHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8 mb-6">
            <div className="flex items-center gap-4">
                {title && <h2 className="text-xl font-bold text-gray-900 m-0">{title}</h2>}
                {
                    totalCount !== undefined && (
                        <span className="text-base text-gray-500 relative top-1">
                            Total: <strong className="text-gray-900">{totalCount}</strong>
                        </span>
                    )
                }
            </div >
            <div className="flex items-center gap-3">
                {rightContent || children}
            </div>
        </div >
    );
}
