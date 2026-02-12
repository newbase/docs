/**
 * Product List Page
 * Phase 10: 상품 관리 - 목록 조회, 페이지네이션, 생성/수정/삭제
 */

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import {
	PageHeader,
	ListHeader,
	Pagination,
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
	Badge,
} from '@/components/shared/ui';
import {
	useProductList,
	useDeleteProduct,
} from '@/hooks/useProduct';
import AddProductModal from './modals/AddProductModal';
import EditProductModal from './modals/EditProductModal';
import type { ProductListItemDto } from '@/types/api/product';
import AlertDialog from '@/components/shared/ui/AlertDialog';

const itemsPerPage = 20;

export default function ProductList(): React.ReactElement {
	const [currentPage, setCurrentPage] = useState(1);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<ProductListItemDto | null>(null);
	const [alertState, setAlertState] = useState<{
		isOpen: boolean;
		type: 'success' | 'error';
		title: string;
		message: string;
	}>({ isOpen: false, type: 'success', title: '', message: '' });

	const { data, isLoading, error, refetch } = useProductList({
		page: currentPage,
		pageSize: itemsPerPage,
	});
	const deleteProductMutation = useDeleteProduct();

	const productList = data?.productList ?? [];
	const totalCount = data?.totalCount ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

	const handleAddSuccess = () => {
		setIsAddModalOpen(false);
		refetch();
		setAlertState({
			isOpen: true,
			type: 'success',
			title: '상품 등록 완료',
			message: '상품이 등록되었습니다.',
		});
	};

	const handleEditClick = (row: ProductListItemDto) => {
		setSelectedProduct(row);
		setIsEditModalOpen(true);
	};

	const handleEditSuccess = () => {
		setIsEditModalOpen(false);
		setSelectedProduct(null);
		refetch();
		setAlertState({
			isOpen: true,
			type: 'success',
			title: '상품 수정 완료',
			message: '상품이 수정되었습니다.',
		});
	};

	const handleDeleteClick = async (row: ProductListItemDto) => {
		if (!window.confirm(`"${row.title}" 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
			return;
		}
		try {
			await deleteProductMutation.mutateAsync(row.productId);
			refetch();
			setAlertState({
				isOpen: true,
				type: 'success',
				title: '상품 삭제 완료',
				message: '상품이 삭제되었습니다.',
			});
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.';
			setAlertState({
				isOpen: true,
				type: 'error',
				title: '상품 삭제 실패',
				message,
			});
		}
	};

	return (
		<>
			<PageHeader
				title="상품 관리"
				breadcrumbs={[{ label: '상품 관리' }]}
				rightContent={
					<button
						type="button"
						onClick={() => setIsAddModalOpen(true)}
						className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
					>
						<Plus size={16} />
						상품 등록
					</button>
				}
			/>

			{isLoading && (
				<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-600">
					데이터를 불러오는 중...
				</div>
			)}
			{error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
					데이터를 불러오는 중 오류가 발생했습니다.
				</div>
			)}

			<ListHeader totalCount={totalCount} rightContent={null} />

			<div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="bg-gray-50/50">
							<TableHead>No.</TableHead>
							<TableHead>상품명</TableHead>
							<TableHead>시나리오 수</TableHead>
							<TableHead>상태</TableHead>
							<TableHead>등록일</TableHead>
							<TableHead>관리</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{productList.length > 0 ? (
							productList.map((row, index) => (
								<TableRow key={row.productId} className="hover:bg-gray-50">
									<TableCell>
										{(currentPage - 1) * itemsPerPage + index + 1}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Package size={16} className="text-gray-500" />
											{row.title}
										</div>
									</TableCell>
									<TableCell>{row.scenarioCount ?? '-'}</TableCell>
									<TableCell>
										<Badge variant={row.isActive ? 'default' : 'secondary'}>
											{row.isActive ? '활성' : '비활성'}
										</Badge>
									</TableCell>
									<TableCell>
										{row.createdAt
											? new Date(row.createdAt).toLocaleDateString('ko-KR')
											: '-'}
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => handleEditClick(row)}
												className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
												title="수정"
											>
												<Edit size={16} />
											</button>
											<button
												type="button"
												onClick={() => handleDeleteClick(row)}
												disabled={deleteProductMutation.isPending}
												className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
												title="삭제"
											>
												<Trash2 size={16} />
											</button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={6} className="text-center py-12 text-gray-500">
									등록된 상품이 없습니다.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				totalItems={totalCount}
				onPageChange={setCurrentPage}
				itemsPerPage={itemsPerPage}
			/>

			<AddProductModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onSuccess={handleAddSuccess}
			/>

			{selectedProduct && (
				<EditProductModal
					isOpen={isEditModalOpen}
					onClose={() => {
						setIsEditModalOpen(false);
						setSelectedProduct(null);
					}}
					product={selectedProduct}
					onSuccess={handleEditSuccess}
				/>
			)}

			<AlertDialog
				isOpen={alertState.isOpen}
				onClose={() => setAlertState((p) => ({ ...p, isOpen: false }))}
				title={alertState.title}
				message={alertState.message}
			/>
		</>
	);
}
