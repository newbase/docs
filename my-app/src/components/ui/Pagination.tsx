import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    itemsPerPage = 20
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                end = 4;
            }
            if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            if (start > 2) {
                pages.push('...');
            }
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            if (end < totalPages - 1) {
                pages.push('...');
            }
            pages.push(totalPages);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center items-center gap-2 mt-8 select-none">
            <button
                className="flex items-center justify-center gap-1 px-3 py-1.5 min-w-[32px] rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">이전</span>
            </button>

            <div className="flex items-center gap-1">
                {pageNumbers.map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            className={`min-w-[32px] h-8 px-3 rounded-md text-sm font-medium transition-colors ${currentPage === page
                                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                                    : 'text-gray-700 bg-white border border-transparent hover:bg-gray-100 text-gray-600'
                                }`}
                            onClick={() => onPageChange(Number(page))}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            <button
                className="flex items-center justify-center gap-1 px-3 py-1.5 min-w-[32px] rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <span className="hidden sm:inline">다음</span>
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
