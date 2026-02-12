/**
 * FilterBar Component
 * 공통 필터 바 컴포넌트
 * 
 * @description
 * 검색, 필터링, 정렬 등을 위한 공통 컴포넌트
 */

import React, { ReactNode } from 'react';
import { Search, X, Filter } from 'lucide-react';

/**
 * Filter 정의
 */
export interface FilterOption {
	value: string;
	label: string;
}

export interface FilterConfig {
	key: string;
	label: string;
	type: 'select' | 'multiselect' | 'date' | 'daterange' | 'custom';
	options?: FilterOption[];
	placeholder?: string;
	customRender?: (value: any, onChange: (value: any) => void) => ReactNode;
}

/**
 * FilterBar Props
 */
export interface FilterBarProps {
	/**
	 * 검색어
	 */
	searchQuery?: string;
	
	/**
	 * 검색어 변경 핸들러
	 */
	onSearchChange?: (query: string) => void;
	
	/**
	 * 검색 플레이스홀더
	 */
	searchPlaceholder?: string;
	
	/**
	 * 필터 설정
	 */
	filters?: FilterConfig[];
	
	/**
	 * 필터 값
	 */
	filterValues?: Record<string, any>;
	
	/**
	 * 필터 변경 핸들러
	 */
	onFilterChange?: (key: string, value: any) => void;
	
	/**
	 * 초기화 핸들러
	 */
	onReset?: () => void;
	
	/**
	 * 추가 액션 버튼 (우측)
	 */
	actions?: ReactNode;
	
	/**
	 * 컴팩트 모드
	 */
	compact?: boolean;
}

/**
 * FilterBar Component
 * 
 * @usage
 * ```tsx
 * const filters: FilterConfig[] = [
 *   {
 *     key: 'status',
 *     label: '상태',
 *     type: 'select',
 *     options: [
 *       { value: 'all', label: '전체' },
 *       { value: 'active', label: '활성' },
 *       { value: 'inactive', label: '비활성' },
 *     ],
 *   },
 * ];
 * 
 * <FilterBar
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   filters={filters}
 *   filterValues={filterValues}
 *   onFilterChange={handleFilterChange}
 *   onReset={handleReset}
 * />
 * ```
 */
export function FilterBar({
	searchQuery = '',
	onSearchChange,
	searchPlaceholder = '검색',
	filters = [],
	filterValues = {},
	onFilterChange,
	onReset,
	actions,
	compact = false,
}: FilterBarProps) {
	const hasActiveFilters = Object.values(filterValues).some(
		(value) => value !== '' && value !== undefined && value !== null && value !== 'all'
	);

	const handleResetClick = () => {
		if (onReset) {
			onReset();
		}
	};

	const renderFilter = (filter: FilterConfig) => {
		const value = filterValues[filter.key];

		switch (filter.type) {
			case 'select':
				return (
					<select
						key={filter.key}
						id={`filter-${filter.key}`}
						value={value || ''}
						onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
						aria-label={filter.label}
					>
						<option value="">{filter.placeholder || `${filter.label} 선택`}</option>
						{filter.options?.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				);

			case 'multiselect':
				// TODO: Implement multiselect
				return null;

			case 'date':
				return (
					<input
						key={filter.key}
						id={`filter-${filter.key}`}
						type="date"
						value={value || ''}
						onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
						aria-label={filter.label}
					/>
				);

			case 'daterange':
				// TODO: Implement daterange
				return null;

			case 'custom':
				return filter.customRender?.(value, (newValue) => onFilterChange?.(filter.key, newValue));

			default:
				return null;
		}
	};

	return (
		<div 
			className={`bg-white border border-gray-200 rounded-lg ${compact ? 'p-3' : 'p-4'} mb-4`}
			role="search"
			aria-label="필터 및 검색"
		>
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				{/* 좌측: 검색 + 필터 */}
				<div className="flex flex-col gap-2 md:flex-row md:items-center md:flex-1">
					{/* 검색 */}
					{onSearchChange && (
						<div className="relative flex-1 max-w-md">
							<Search 
								size={18} 
								className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
								aria-hidden="true"
							/>
							<input
								type="search"
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								placeholder={searchPlaceholder}
								className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
								aria-label="검색"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => onSearchChange('')}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
									aria-label="검색어 지우기"
								>
									<X size={16} aria-hidden="true" />
								</button>
							)}
						</div>
					)}

					{/* 필터 */}
					{filters.length > 0 && (
						<div className="flex flex-wrap items-center gap-2" role="group" aria-label="필터 옵션">
							<div className="flex items-center gap-1.5 text-sm text-gray-600">
								<Filter size={16} aria-hidden="true" />
								<span className="font-medium">필터:</span>
							</div>
							{filters.map(renderFilter)}
						</div>
					)}

					{/* 초기화 버튼 */}
					{(hasActiveFilters || searchQuery) && onReset && (
						<button
							type="button"
							onClick={handleResetClick}
							className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							aria-label="필터 초기화"
						>
							초기화
						</button>
					)}
				</div>

				{/* 우측: 액션 버튼 */}
				{actions && <div className="flex items-center gap-2">{actions}</div>}
			</div>
		</div>
	);
}

/**
 * FilterBar with Stats
 * 통계 정보가 포함된 FilterBar
 */
export interface FilterBarWithStatsProps extends FilterBarProps {
	/**
	 * 통계 정보 (좌측 상단)
	 */
	stats?: ReactNode;
}

export function FilterBarWithStats({
	stats,
	...filterBarProps
}: FilterBarWithStatsProps) {
	return (
		<>
			{stats && (
				<div className="mb-4">
					{stats}
				</div>
			)}
			<FilterBar {...filterBarProps} />
		</>
	);
}
