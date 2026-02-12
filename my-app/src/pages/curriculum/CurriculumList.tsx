/**
 * Curriculum List Page
 * Phase 9: 커리큘럼 관리 - 목록 조회, 페이지네이션, 생성/수정 모달
 */

import React, { useState } from 'react';
import { Plus, Edit, FileText } from 'lucide-react';
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
} from '@/components/shared/ui';
import { useCurriculumList } from '@/hooks/useCurriculum';
import AddCurriculumModal from './modals/AddCurriculumModal';
import EditCurriculumModal from './modals/EditCurriculumModal';
import type { CurriculumListItemDto } from '@/types/api/curriculum';
import AlertDialog from '@/components/shared/ui/AlertDialog';

const itemsPerPage = 20;

export default function CurriculumList(): React.ReactElement {
	const [currentPage, setCurrentPage] = useState(1);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumListItemDto | null>(null);
	const [alertState, setAlertState] = useState<{
		isOpen: boolean;
		type: 'success' | 'error';
		title: string;
		message: string;
	}>({ isOpen: false, type: 'success', title: '', message: '' });

	const { data, isLoading, error, refetch } = useCurriculumList({
		page: currentPage,
		pageSize: itemsPerPage,
	});

	const curriculumList = data?.curriculumList ?? [];
	const totalCount = data?.totalCount ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

	const handleAddSuccess = () => {
		setIsAddModalOpen(false);
		refetch();
		setAlertState({
			isOpen: true,
			type: 'success',
			title: '커리큘럼 등록 완료',
			message: '커리큘럼이 등록되었습니다.',
		});
	};

	const handleEditClick = (row: CurriculumListItemDto) => {
		setSelectedCurriculum(row);
		setIsEditModalOpen(true);
	};

	const handleEditSuccess = () => {
		setIsEditModalOpen(false);
		setSelectedCurriculum(null);
		refetch();
		setAlertState({
			isOpen: true,
			type: 'success',
			title: '커리큘럼 수정 완료',
			message: '커리큘럼이 수정되었습니다.',
		});
	};

	return (
		<>
			<PageHeader
				title="커리큘럼 관리"
				breadcrumbs={[{ label: '커리큘럼 관리' }]}
				rightContent={
					<button
						type="button"
						onClick={() => setIsAddModalOpen(true)}
						className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
					>
						<Plus size={16} />
						커리큘럼 등록
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

			<ListHeader
				totalCount={totalCount}
				rightContent={null}
			/>

			<div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="bg-gray-50/50">
							<TableHead>No.</TableHead>
							<TableHead>커리큘럼명</TableHead>
							<TableHead>시나리오 수</TableHead>
							<TableHead>등록일</TableHead>
							<TableHead>관리</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{curriculumList.length > 0 ? (
							curriculumList.map((row, index) => (
								<TableRow key={row.curriculumId} className="hover:bg-gray-50">
									<TableCell>
										{(currentPage - 1) * itemsPerPage + index + 1}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<FileText size={16} className="text-gray-500" />
											{row.title}
										</div>
									</TableCell>
									<TableCell>{row.scenarioCount ?? '-'}</TableCell>
									<TableCell>
										{row.createdAt
											? new Date(row.createdAt).toLocaleDateString('ko-KR')
											: '-'}
									</TableCell>
									<TableCell>
										<button
											type="button"
											onClick={() => handleEditClick(row)}
											className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
											title="수정"
										>
											<Edit size={16} />
										</button>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={5} className="text-center py-12 text-gray-500">
									등록된 커리큘럼이 없습니다.
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

			<AddCurriculumModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onSuccess={handleAddSuccess}
			/>

			{selectedCurriculum && (
				<EditCurriculumModal
					isOpen={isEditModalOpen}
					onClose={() => {
						setIsEditModalOpen(false);
						setSelectedCurriculum(null);
					}}
					curriculum={selectedCurriculum}
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
