import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ITEMS_PER_PAGE_OPTIONS } from '@/hooks/usePagination';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    showItemsPerPage?: boolean;
    showPageInfo?: boolean;
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    itemsPerPage = 20,
    onItemsPerPageChange,
    showItemsPerPage = false,
    showPageInfo = false,
    className = '',
}: PaginationProps) {
    if (totalPages <= 1 && !showItemsPerPage) return null;

    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;
    
    // 페이지 정보 계산
    const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : undefined;
    const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : undefined;

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
        <nav 
            className={`flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 select-none ${className}`}
            aria-label="페이지네이션"
        >
            {/* 좌측: 페이지 정보 및 항목 수 선택 */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* 페이지 정보 */}
                {showPageInfo && totalItems && startItem && endItem && (
                    <div className="text-sm text-gray-600" aria-live="polite">
                        <span className="sr-only">페이지 정보: </span>
                        {startItem}-{endItem} / 총 {totalItems}개
                    </div>
                )}

                {/* 페이지당 항목 수 선택 */}
                {showItemsPerPage && onItemsPerPageChange && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="items-per-page" className="text-sm text-gray-600">
                            표시:
                        </label>
                        <select
                            id="items-per-page"
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                            aria-label="페이지당 항목 수 선택"
                        >
                            {ITEMS_PER_PAGE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* 우측: 페이지 네비게이션 */}
            {totalPages > 1 && (
                <div className="flex items-center gap-2" role="group" aria-label="페이지 네비게이션">
                    {/* 이전 버튼 */}
                    <button
                        type="button"
                        className="flex items-center justify-center gap-1 px-3 py-1.5 min-w-[32px] rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        disabled={!hasPrevPage}
                        onClick={() => onPageChange(currentPage - 1)}
                        aria-label="이전 페이지"
                        aria-disabled={!hasPrevPage}
                    >
                        <ChevronLeft size={16} aria-hidden="true" />
                        <span className="hidden sm:inline">이전</span>
                    </button>

                    {/* 페이지 번호 */}
                    <div className="flex items-center gap-1" role="list">
                        {pageNumbers.map((page, index) => (
                            page === '...' ? (
                                <span 
                                    key={`ellipsis-${index}`} 
                                    className="px-2 text-gray-400"
                                    aria-hidden="true"
                                >
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    type="button"
                                    className={`min-w-[32px] h-8 px-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${currentPage === page
                                            ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                                            : 'text-gray-700 bg-white border border-transparent hover:bg-gray-100 text-gray-600'
                                        }`}
                                    onClick={() => onPageChange(Number(page))}
                                    aria-label={`${page}페이지로 이동`}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            )
                        ))}
                    </div>

                    {/* 다음 버튼 */}
                    <button
                        type="button"
                        className="flex items-center justify-center gap-1 px-3 py-1.5 min-w-[32px] rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        disabled={!hasNextPage}
                        onClick={() => onPageChange(currentPage + 1)}
                        aria-label="다음 페이지"
                        aria-disabled={!hasNextPage}
                    >
                        <span className="hidden sm:inline">다음</span>
                        <ChevronRight size={16} aria-hidden="true" />
                    </button>
                </div>
            )}
        </nav>
    );
}
