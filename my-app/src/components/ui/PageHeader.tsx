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
    title?: string;
    breadcrumbs?: { label: string; link?: string }[];
    actions?: React.ReactNode;
    rightContent?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export default function PageHeader({
    title,
    breadcrumbs = [],
    actions,
    rightContent,
    className = '',
    style = {}
}: PageHeaderProps) {
    return (
        <div className={`w-full ${className}`} style={style}>
            {breadcrumbs.length > 0 && (
                <div className="mb-4">
                    <Breadcrumbs items={breadcrumbs} />
                </div>
            )}

            <div className="pb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {title && (
                        <div className="flex items-center gap-4">
                            <h1 className="font-bold text-gray-900 text-2xl">
                                {title}
                            </h1>
                        </div>
                    )}
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
                </div>
            </div>
        </div>
    );
}
