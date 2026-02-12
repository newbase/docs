/**
 * DataTable Component
 * 공통 테이블 컴포넌트
 * 
 * @description
 * UserList, LicenseList, OrganizationList 등에서 재사용 가능한
 * 제네릭 테이블 컴포넌트
 */

import React, { ReactNode } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/shared/ui';

/**
 * Column 정의
 */
export interface DataTableColumn<T> {
	/**
	 * 컬럼 고유 키
	 */
	key: string;
	
	/**
	 * 컬럼 헤더 텍스트
	 */
	header: string;
	
	/**
	 * 컬럼 렌더링 함수
	 * @param item - 현재 행 데이터
	 * @param index - 현재 행 인덱스
	 * @returns 렌더링할 React 노드
	 */
	render: (item: T, index: number) => ReactNode;
	
	/**
	 * 컬럼 너비 (옵션)
	 */
	width?: string;
	
	/**
	 * 컬럼 정렬 (옵션)
	 */
	align?: 'left' | 'center' | 'right';
	
	/**
	 * 헤더 클래스 (옵션)
	 */
	headerClassName?: string;
	
	/**
	 * 셀 클래스 (옵션)
	 */
	cellClassName?: string;
}

/**
 * DataTable Props
 */
export interface DataTableProps<T> {
	/**
	 * 테이블 데이터
	 */
	data: T[];
	
	/**
	 * 컬럼 정의
	 */
	columns: DataTableColumn<T>[];
	
	/**
	 * 로딩 상태
	 */
	loading?: boolean;
	
	/**
	 * 빈 상태 메시지
	 */
	emptyMessage?: string | ReactNode;
	
	/**
	 * 행 클릭 핸들러 (옵션)
	 */
	onRowClick?: (item: T, index: number) => void;
	
	/**
	 * 행 클래스 (옵션)
	 */
	rowClassName?: string | ((item: T, index: number) => string);
	
	/**
	 * 테이블 헤더 스타일 (옵션)
	 */
	headerClassName?: string;
	
	/**
	 * 로딩 스켈레톤 행 개수
	 */
	loadingRows?: number;
	
	/**
	 * 고유 키 추출 함수
	 */
	getRowKey?: (item: T, index: number) => string | number;
}

/**
 * DataTable Component
 * 
 * @usage
 * ```tsx
 * const columns: DataTableColumn<User>[] = [
 *   {
 *     key: 'name',
 *     header: '이름',
 *     render: (user) => <span>{user.name}</span>
 *   },
 *   {
 *     key: 'email',
 *     header: '이메일',
 *     render: (user) => <span>{user.email}</span>
 *   },
 * ];
 * 
 * <DataTable
 *   data={users}
 *   columns={columns}
 *   loading={isLoading}
 *   emptyMessage="등록된 사용자가 없습니다."
 * />
 * ```
 */
export function DataTable<T>({
	data,
	columns,
	loading = false,
	emptyMessage = '데이터가 없습니다.',
	onRowClick,
	rowClassName,
	headerClassName = 'bg-gray-50/50',
	loadingRows = 5,
	getRowKey,
}: DataTableProps<T>) {
	/**
	 * 행 클래스 계산
	 */
	const getRowClass = (item: T, index: number): string => {
		const baseClass = 'hover:bg-gray-50/50 transition-colors';
		const clickableClass = onRowClick ? 'cursor-pointer' : '';
		const customClass = typeof rowClassName === 'function' 
			? rowClassName(item, index) 
			: rowClassName || '';
		
		return `${baseClass} ${clickableClass} ${customClass}`.trim();
	};

	/**
	 * 행 키 추출
	 */
	const extractRowKey = (item: T, index: number): string | number => {
		if (getRowKey) {
			return getRowKey(item, index);
		}
		
		// 기본: item.id 또는 index 사용
		if (item && typeof item === 'object' && 'id' in item) {
			return String((item as any).id);
		}
		
		return index;
	};

	/**
	 * 로딩 스켈레톤 렌더링
	 */
	const renderLoadingSkeleton = () => {
		return Array.from({ length: loadingRows }).map((_, rowIndex) => (
			<TableRow key={`skeleton-${rowIndex}`}>
				{columns.map((column) => (
					<TableCell key={`skeleton-${rowIndex}-${column.key}`} className={column.cellClassName}>
						<div 
							className="h-4 bg-gray-200 rounded animate-pulse"
							style={{ width: column.width || '100%' }}
						/>
					</TableCell>
				))}
			</TableRow>
		));
	};

	/**
	 * 빈 상태 렌더링
	 */
	const renderEmptyState = () => {
		return (
			<TableRow>
				<TableCell colSpan={columns.length} className="py-16 text-center">
					{typeof emptyMessage === 'string' ? (
						<div className="text-gray-500">{emptyMessage}</div>
					) : (
						emptyMessage
					)}
				</TableCell>
			</TableRow>
		);
	};

	/**
	 * 데이터 행 렌더링
	 */
	const renderDataRows = () => {
		return data.map((item, index) => {
			const rowKey = extractRowKey(item, index);
			const rowClass = getRowClass(item, index);
			
			return (
				<TableRow
					key={rowKey}
					className={rowClass}
					onClick={() => onRowClick?.(item, index)}
					onKeyDown={(e) => {
						if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
							e.preventDefault();
							onRowClick(item, index);
						}
					}}
					tabIndex={onRowClick ? 0 : undefined}
					role={onRowClick ? 'button' : 'row'}
					aria-label={onRowClick ? `행 ${index + 1} 클릭하여 상세 보기` : undefined}
				>
					{columns.map((column) => {
						const alignClass = column.align === 'center' 
							? 'text-center' 
							: column.align === 'right' 
								? 'text-right' 
								: '';
						
						return (
							<TableCell
								key={`${rowKey}-${column.key}`}
								className={`${column.cellClassName || ''} ${alignClass}`.trim()}
								style={{ width: column.width }}
							>
								{column.render(item, index)}
							</TableCell>
						);
					})}
				</TableRow>
			);
		});
	};

	return (
		<div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
			<div role="region" aria-label="데이터 테이블" aria-busy={loading}>
				<Table>
					<TableHeader>
						<TableRow className={headerClassName}>
							{columns.map((column) => {
								const alignClass = column.align === 'center' 
									? 'text-center' 
									: column.align === 'right' 
										? 'text-right' 
										: '';
								
								return (
									<TableHead
										key={column.key}
										className={`${column.headerClassName || ''} ${alignClass}`.trim()}
										style={{ width: column.width }}
										scope="col"
									>
										{column.header}
									</TableHead>
								);
							})}
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? renderLoadingSkeleton() : data.length === 0 ? renderEmptyState() : renderDataRows()}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

/**
 * DataTable with Pagination
 * 페이지네이션이 포함된 DataTable
 */
export interface DataTableWithPaginationProps<T> extends DataTableProps<T> {
	/**
	 * 페이지네이션 컴포넌트
	 */
	pagination?: ReactNode;
}

export function DataTableWithPagination<T>({
	pagination,
	...tableProps
}: DataTableWithPaginationProps<T>) {
	return (
		<>
			<DataTable {...tableProps} />
			{pagination && <div className="mt-4">{pagination}</div>}
		</>
	);
}
