import React from 'react';

export const getGrade = (score: number | string | null | undefined): string | null => {
    if (score === null || score === undefined) return null;
    const numScore = Number(score);
    if (isNaN(numScore)) return null; // Handle non-numeric scores (e.g. '85점')

    if (numScore === 100) return 'Perfect';
    if (numScore >= 90) return 'Excellent';
    if (numScore >= 80) return 'Good';
    if (numScore >= 70) return 'Fair';
    if (numScore >= 60) return 'Needs Improvement';
    return 'Retry Required';
};

export const getGradeColorClasses = (grade: string | null): string => {
    switch (grade) {
        case 'Perfect': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        case 'Excellent': return 'bg-green-100 text-green-800 border-green-200';
        case 'Good': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Needs Improvement': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Retry Required': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

interface GradeBadgeProps {
    score: number | string | null | undefined;
    className?: string;
}

const GradeBadge: React.FC<GradeBadgeProps> = ({ score, className = '' }) => {
    // Remove '점' if present and convert to number for calculation
    const cleanScore = typeof score === 'string' ? score.replace('점', '') : score;
    const grade = getGrade(cleanScore);

    if (!grade) return null;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getGradeColorClasses(grade)} ${className}`}>
            {grade}
        </span>
    );
};

export default GradeBadge;