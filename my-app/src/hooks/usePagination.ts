/**
 * usePagination Hook
 * 페이지네이션 로직을 관리하는 커스텀 훅
 * 
 * @description
 * 클라이언트 사이드 및 서버 사이드 페이지네이션을 지원하는 Hook
 */

import { useState, useMemo, useCallback } from 'react';

/**
 * usePagination Props
 */
export interface UsePaginationProps {
	/**
	 * 전체 항목 수
	 */
	totalItems: number;
	
	/**
	 * 페이지당 항목 수
	 */
	itemsPerPage: number;
	
	/**
	 * 초기 페이지 번호
	 */
	initialPage?: number;
	
	/**
	 * 페이지 변경 핸들러 (옵션)
	 */
	onPageChange?: (page: number) => void;
	
	/**
	 * 페이지당 항목 수 변경 핸들러 (옵션)
	 */
	onItemsPerPageChange?: (itemsPerPage: number) => void;
}

/**
 * usePagination 반환 타입
 */
export interface UsePaginationReturn {
	/**
	 * 현재 페이지 번호
	 */
	currentPage: number;
	
	/**
	 * 전체 페이지 수
	 */
	totalPages: number;
	
	/**
	 * 페이지당 항목 수
	 */
	itemsPerPage: number;
	
	/**
	 * 전체 항목 수
	 */
	totalItems: number;
	
	/**
	 * 현재 페이지의 시작 인덱스 (0-based)
	 */
	startIndex: number;
	
	/**
	 * 현재 페이지의 끝 인덱스 (0-based, exclusive)
	 */
	endIndex: number;
	
	/**
	 * 다음 페이지 존재 여부
	 */
	hasNextPage: boolean;
	
	/**
	 * 이전 페이지 존재 여부
	 */
	hasPrevPage: boolean;
	
	/**
	 * 특정 페이지로 이동
	 */
	goToPage: (page: number) => void;
	
	/**
	 * 다음 페이지로 이동
	 */
	goToNextPage: () => void;
	
	/**
	 * 이전 페이지로 이동
	 */
	goToPrevPage: () => void;
	
	/**
	 * 첫 페이지로 이동
	 */
	goToFirstPage: () => void;
	
	/**
	 * 마지막 페이지로 이동
	 */
	goToLastPage: () => void;
	
	/**
	 * 페이지당 항목 수 변경
	 */
	setItemsPerPage: (itemsPerPage: number) => void;
	
	/**
	 * 클라이언트 사이드 페이지네이션: 현재 페이지의 데이터 슬라이스
	 */
	getPaginatedData: <T>(data: T[]) => T[];
}

/**
 * usePagination Hook
 * 
 * @usage
 * ```tsx
 * const {
 *   currentPage,
 *   totalPages,
 *   goToPage,
 *   getPaginatedData
 * } = usePagination({
 *   totalItems: 100,
 *   itemsPerPage: 20,
 *   initialPage: 1,
 * });
 * 
 * // 클라이언트 사이드 페이지네이션
 * const paginatedData = getPaginatedData(allData);
 * 
 * // 서버 사이드 페이지네이션
 * const { data } = useQuery({
 *   queryKey: ['items', currentPage, itemsPerPage],
 *   queryFn: () => fetchItems({ page: currentPage, limit: itemsPerPage }),
 * });
 * ```
 */
export function usePagination({
	totalItems,
	itemsPerPage: initialItemsPerPage,
	initialPage = 1,
	onPageChange,
	onItemsPerPageChange,
}: UsePaginationProps): UsePaginationReturn {
	const [currentPage, setCurrentPage] = useState<number>(initialPage);
	const [itemsPerPage, setItemsPerPageState] = useState<number>(initialItemsPerPage);

	// 전체 페이지 수 계산
	const totalPages = useMemo(() => {
		return Math.max(1, Math.ceil(totalItems / itemsPerPage));
	}, [totalItems, itemsPerPage]);

	// 현재 페이지 유효성 검증 및 조정
	useMemo(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		} else if (currentPage < 1) {
			setCurrentPage(1);
		}
	}, [currentPage, totalPages]);

	// 현재 페이지의 시작/끝 인덱스
	const startIndex = useMemo(() => {
		return (currentPage - 1) * itemsPerPage;
	}, [currentPage, itemsPerPage]);

	const endIndex = useMemo(() => {
		return Math.min(startIndex + itemsPerPage, totalItems);
	}, [startIndex, itemsPerPage, totalItems]);

	// 페이지 네비게이션
	const hasNextPage = currentPage < totalPages;
	const hasPrevPage = currentPage > 1;

	const goToPage = useCallback((page: number) => {
		if (page < 1 || page > totalPages) return;
		
		const newPage = Math.max(1, Math.min(page, totalPages));
		setCurrentPage(newPage);
		onPageChange?.(newPage);
	}, [totalPages, onPageChange]);

	const goToNextPage = useCallback(() => {
		if (hasNextPage) {
			goToPage(currentPage + 1);
		}
	}, [currentPage, hasNextPage, goToPage]);

	const goToPrevPage = useCallback(() => {
		if (hasPrevPage) {
			goToPage(currentPage - 1);
		}
	}, [currentPage, hasPrevPage, goToPage]);

	const goToFirstPage = useCallback(() => {
		goToPage(1);
	}, [goToPage]);

	const goToLastPage = useCallback(() => {
		goToPage(totalPages);
	}, [totalPages, goToPage]);

	// 페이지당 항목 수 변경
	const setItemsPerPage = useCallback((newItemsPerPage: number) => {
		if (newItemsPerPage < 1) return;
		
		setItemsPerPageState(newItemsPerPage);
		onItemsPerPageChange?.(newItemsPerPage);
		
		// 페이지당 항목 수가 변경되면 현재 페이지가 유효한지 확인
		const newTotalPages = Math.max(1, Math.ceil(totalItems / newItemsPerPage));
		if (currentPage > newTotalPages) {
			goToPage(newTotalPages);
		}
	}, [totalItems, currentPage, onItemsPerPageChange, goToPage]);

	// 클라이언트 사이드 페이지네이션: 데이터 슬라이스
	const getPaginatedData = useCallback(<T,>(data: T[]): T[] => {
		return data.slice(startIndex, endIndex);
	}, [startIndex, endIndex]);

	return {
		currentPage,
		totalPages,
		itemsPerPage,
		totalItems,
		startIndex,
		endIndex,
		hasNextPage,
		hasPrevPage,
		goToPage,
		goToNextPage,
		goToPrevPage,
		goToFirstPage,
		goToLastPage,
		setItemsPerPage,
		getPaginatedData,
	};
}

/**
 * 페이지당 항목 수 옵션
 */
export const ITEMS_PER_PAGE_OPTIONS = [
	{ value: 10, label: '10개씩' },
	{ value: 20, label: '20개씩' },
	{ value: 50, label: '50개씩' },
	{ value: 100, label: '100개씩' },
] as const;
