import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    link?: string;
    to?: string; // Support 'to' for compatibility
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps): React.ReactElement {
    return (
        <nav className="flex items-center gap-2 mb-12 text-sm text-gray-400">
            <Link
                to="/"
                className="flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                aria-label="Home"
            >
                <Home size={16} />
            </Link>
            {items.map((item, index) => {
                const targetLink = item.link || item.to;
                return (
                    <React.Fragment key={index}>
                        <ChevronRight size={14} className="text-gray-300" />
                        {targetLink ? (
                            <Link
                                to={targetLink}
                                className="text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="font-medium text-gray-500">
                                {item.label}
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
