import React from 'react';
import StatCard from './StatCard';

interface StatsGridProps {
    items: any[];
    columns?: 3 | 4 | 5;
}

const StatsGrid: React.FC<StatsGridProps> = ({ items, columns }) => {
    const getGridClassName = () => {
        const baseClasses = 'grid grid-cols-1 gap-5 mb-8';

        // Automatically determine columns based on item count if not explicitly set
        const effectiveColumns = columns ?? (items.length >= 5 ? 5 : 4);

        switch (effectiveColumns) {
            case 3:
                return `${baseClasses} md:grid-cols-2 lg:grid-cols-3`;
            case 4:
                return `${baseClasses} md:grid-cols-2 lg:grid-cols-4`;
            case 5:
                return `${baseClasses} md:grid-cols-3 lg:grid-cols-5`;
            default:
                return `${baseClasses} md:grid-cols-2 lg:grid-cols-4`;
        }
    };

    return (
        <div className={getGridClassName()}>
            {items.map((item, index) => (
                <StatCard
                    key={index}
                    {...item}
                />
            ))}
        </div>
    );
};

export default StatsGrid;
