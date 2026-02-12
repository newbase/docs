/**
 * Edit Curriculum Modal
 * Phase 9: 커리큘럼 수정 - 제목, 시나리오 선택 (상세 조회 후 수정)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Modal, AlertDialog } from '@/components/shared/ui';
import { useUpdateCurriculum, useCurriculumDetail } from '@/hooks/useCurriculum';
import { useScenarioAdminList } from '@/hooks/useScenario';
import type { CurriculumListItemDto, UpdateCurriculumRequestDto } from '@/types/api/curriculum';

interface EditCurriculumModalProps {
	isOpen: boolean;
	onClose: () => void;
	curriculum: CurriculumListItemDto;
	onSuccess?: () => void;
}

export default function EditCurriculumModal({
	isOpen,
	onClose,
	curriculum,
	onSuccess,
}: EditCurriculumModalProps): React.ReactElement {
	const [title, setTitle] = useState(curriculum.title);
	const [selectedScenarioIds, setSelectedScenarioIds] = useState<number[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [alertState, setAlertState] = useState<{
		isOpen: boolean;
		type: 'success' | 'error';
		message: string;
	}>({ isOpen: false, type: 'success', message: '' });

	const curriculumId = curriculum.curriculumId;
	const { data: detail, isLoading: detailLoading } = useCurriculumDetail(curriculumId, {
		enabled: isOpen && curriculumId > 0,
	});
	const updateMutation = useUpdateCurriculum();
	const { data: scenarioData, isLoading: scenariosLoading } = useScenarioAdminList(
		{ page: 1, pageSize: 500 },
		{ enabled: isOpen }
	);
	const scenarioList = useMemo(() => scenarioData?.scenarioList ?? [], [scenarioData]);

	useEffect(() => {
		if (detail) {
			setTitle(detail.title);
			setSelectedScenarioIds(
				(detail.scenarioList ?? []).map((s) => s.scenarioId)
			);
		} else if (isOpen && !detailLoading) {
			setTitle(curriculum.title);
			setSelectedScenarioIds([]);
		}
	}, [detail, isOpen, detailLoading, curriculum.title]);

	const validate = (): boolean => {
		const next: Record<string, string> = {};
		if (!title?.trim()) next.title = '커리큘럼명을 입력해주세요.';
		if (selectedScenarioIds.length === 0) next.scenarioIdList = '시나리오를 1개 이상 선택해주세요.';
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;
		const payload: UpdateCurriculumRequestDto = {
			title: title.trim(),
			scenarioIdList: selectedScenarioIds,
		};
		try {
			await updateMutation.mutateAsync({ curriculumId, data: payload });
			if (onSuccess) onSuccess();
			onClose();
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : '수정 중 오류가 발생했습니다.';
			setAlertState({ isOpen: true, type: 'error', message });
		}
	};

	const toggleScenario = (scenarioId: number) => {
		setSelectedScenarioIds((prev) =>
			prev.includes(scenarioId)
				? prev.filter((id) => id !== scenarioId)
				: [...prev, scenarioId]
		);
		if (errors.scenarioIdList) setErrors((e) => ({ ...e, scenarioIdList: '' }));
	};

	const footer = (
		<>
			<button
				type="button"
				className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
				onClick={onClose}
			>
				취소
			</button>
			<button
				type="submit"
				form="edit-curriculum-form"
				className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
				disabled={updateMutation.isPending || detailLoading}
			>
				{updateMutation.isPending ? '수정 중...' : '수정'}
			</button>
		</>
	);

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="커리큘럼 수정" footer={footer} size="large">
			{detailLoading ? (
				<div className="py-8 text-center text-gray-500">불러오는 중...</div>
			) : (
				<form id="edit-curriculum-form" onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							커리큘럼명 <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => {
								setTitle(e.target.value);
								if (errors.title) setErrors((e) => ({ ...e, title: '' }));
							}}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
							placeholder="커리큘럼명 입력"
						/>
						{errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							시나리오 선택 <span className="text-red-500">*</span>
						</label>
						{scenariosLoading ? (
							<p className="text-sm text-gray-500">시나리오 목록 불러오는 중...</p>
						) : (
							<div className="border border-gray-200 rounded-lg max-h-[280px] overflow-y-auto">
								{scenarioList.map((s) => (
									<label
										key={s.scenarioId}
										className="flex items-center p-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={selectedScenarioIds.includes(s.scenarioId)}
											onChange={() => toggleScenario(s.scenarioId)}
											className="mr-2 h-4 w-4 text-brand-600 rounded"
										/>
										<span className="text-sm">{s.title}</span>
									</label>
								))}
							</div>
						)}
						{errors.scenarioIdList && (
							<p className="mt-1 text-sm text-red-600">{errors.scenarioIdList}</p>
						)}
					</div>
				</form>
			)}
			<AlertDialog
				isOpen={alertState.isOpen}
				onClose={() => setAlertState((p) => ({ ...p, isOpen: false }))}
				title="오류"
				message={alertState.message}
			/>
		</Modal>
	);
}
