import React from 'react';

import { ResultStat } from '../../../types/admin';

interface ResultSummaryCardsProps {
    stats?: ResultStat[];
    mustNotViolations: number;
}

export const ResultSummaryCards: React.FC<ResultSummaryCardsProps> = ({ stats, mustNotViolations }) => {
    const defaultStats = [
        { label: '총점', value: '85', sub: '/ 100점', color: 'text-blue-600' },
        { label: '성공률', value: '92', sub: '%', color: 'text-green-600' },
        { label: 'Must-not', value: mustNotViolations.toString(), sub: '회 위반', color: 'text-red-600' },
        { label: '소요시간', value: '12:45', sub: '분', color: 'text-gray-600' },
    ];

    const displayStats = stats || defaultStats;

    return (
        <div className="grid grid-cols-4 gap-4">
            {displayStats.map((stat, i) => (
                <div key={i} className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className={`text-2xl font-black ${stat.color || 'text-gray-600'}`}>{stat.value}</span>
                        <span className="text-sm font-medium text-gray-400">{stat.sub || ''}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
