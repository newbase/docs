import React from 'react';
import Breadcrumbs from '../layout/Breadcrumbs';

/**
 * PageHeader Component
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {Array} props.breadcrumbs - Breadcrumb items [{ label, link }]
 * @param {React.ReactNode} props.actions - Action buttons (optional)
 * @param {React.ReactNode} props.rightContent - Content to display on the right
 */
interface PageHeaderProps {
    title?: React.ReactNode;
    description?: string;
    breadcrumbs?: { label: string; link?: string }[];
    actions?: React.ReactNode;
    rightContent?: React.ReactNode;
    align?: 'left' | 'center';
    withBackground?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export default function PageHeader({
    title,
    description,
    breadcrumbs = [],
    actions,
    rightContent,
    align = 'left',
    withBackground = false,
    className = '',
    style = {}
}: PageHeaderProps) {
    const isCentered = align === 'center';

    // Background style classes
    const backgroundClasses = withBackground
        ? '-mx-4 bg-white border-b border-gray-100 mb-8 py-10 px-4'
        : 'pb-8';

    return (
        <div className={`w-full ${className}`} style={style}>
            {breadcrumbs.length > 0 && (
                <div className="mb-4">
                    <Breadcrumbs items={breadcrumbs} />
                </div>
            )}

            <div className={`${backgroundClasses} ${isCentered ? 'flex flex-col items-center text-center' : ''}`}>
                <div className={`flex flex-col md:flex-row gap-4 w-full ${isCentered ? 'items-center justify-center' : 'md:items-center md:justify-between'}`}>
                    {title && (
                        <div className={`flex items-center gap-4 ${isCentered ? 'justify-center' : ''}`}>
                            <h1 className="font-bold text-gray-900 text-2xl">
                                {title}
                            </h1>
                        </div>
                    )}

                    {!isCentered && (actions || rightContent) && (
                        <div className="flex items-center gap-4">
                            {actions && (
                                <div className="flex items-center gap-2">
                                    {actions}
                                </div>
                            )}
                            {rightContent && (
                                <div className="flex-shrink-0">
                                    {rightContent}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {description && (
                    <p className={`mt-2 text-gray-600 max-w-3xl ${isCentered ? 'mx-auto' : ''}`}>
                        {description}
                    </p>
                )}

                {isCentered && (actions || rightContent) && (
                    <div className="flex items-center gap-4 mt-6">
                        {actions}
                        {rightContent}
                    </div>
                )}
            </div>
        </div>
    );
}
