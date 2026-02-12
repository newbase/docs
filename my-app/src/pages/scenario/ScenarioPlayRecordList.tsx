/**
 * Scenario Play Record List Page
 * Phase 11: 시나리오 플레이 기록 조회 - userId, classId, scenarioId 필터, 페이지네이션
 */

import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
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
import { useScenarioPlayRecords } from '@/hooks/useScenario';
import type { ScenarioPlayRecordItemDto } from '@/types/api/scenario';

const itemsPerPage = 20;

export default function ScenarioPlayRecordList(): React.ReactElement {
	const [currentPage, setCurrentPage] = useState(1);
	const [filterUserId, setFilterUserId] = useState<string>('');
	const [filterClassId, setFilterClassId] = useState<string>('');
	const [filterScenarioId, setFilterScenarioId] = useState<string>('');

	const params = useMemo(() => {
		const p: { page: number; pageSize: number; userId?: number; classId?: number; scenarioId?: number } = {
			page: currentPage,
			pageSize: itemsPerPage,
		};
		const uid = filterUserId.trim() ? parseInt(filterUserId, 10) : undefined;
		const cid = filterClassId.trim() ? parseInt(filterClassId, 10) : undefined;
		const sid = filterScenarioId.trim() ? parseInt(filterScenarioId, 10) : undefined;
		if (uid != null && !isNaN(uid)) p.userId = uid;
		if (cid != null && !isNaN(cid)) p.classId = cid;
		if (sid != null && !isNaN(sid)) p.scenarioId = sid;
		return p;
	}, [currentPage, filterUserId, filterClassId, filterScenarioId]);

	const { data, isLoading, error } = useScenarioPlayRecords(params);

	const playRecordList = data?.playRecordList ?? [];
	const totalCount = data?.totalCount ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

	const formatDateTime = (iso?: string) =>
		iso ? new Date(iso).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' }) : '-';

	return (
		<>
			<PageHeader
				title="시나리오 플레이 기록"
				breadcrumbs={[{ label: '시나리오 플레이 기록' }]}
				rightContent={null}
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

			<div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
				<div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
					<Filter size={16} />
					필터
				</div>
				<div className="flex flex-wrap gap-4">
					<div>
						<label className="block text-xs text-gray-500 mb-1">사용자 ID</label>
						<input
							type="number"
							placeholder="userId"
							value={filterUserId}
							onChange={(e) => {
								setFilterUserId(e.target.value);
								setCurrentPage(1);
							}}
							className="w-32 px-2 py-1.5 border border-gray-300 rounded text-sm"
						/>
					</div>
					<div>
						<label className="block text-xs text-gray-500 mb-1">클래스 ID</label>
						<input
							type="number"
							placeholder="classId"
							value={filterClassId}
							onChange={(e) => {
								setFilterClassId(e.target.value);
								setCurrentPage(1);
							}}
							className="w-32 px-2 py-1.5 border border-gray-300 rounded text-sm"
						/>
					</div>
					<div>
						<label className="block text-xs text-gray-500 mb-1">시나리오 ID</label>
						<input
							type="number"
							placeholder="scenarioId"
							value={filterScenarioId}
							onChange={(e) => {
								setFilterScenarioId(e.target.value);
								setCurrentPage(1);
							}}
							className="w-32 px-2 py-1.5 border border-gray-300 rounded text-sm"
						/>
					</div>
				</div>
			</div>

			<ListHeader totalCount={totalCount} rightContent={null} />

			<div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="bg-gray-50/50">
							<TableHead>No.</TableHead>
							<TableHead>사용자</TableHead>
							<TableHead>클래스</TableHead>
							<TableHead>시나리오</TableHead>
							<TableHead>플레이 일시</TableHead>
							<TableHead>점수</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{playRecordList.length > 0 ? (
							playRecordList.map((row: ScenarioPlayRecordItemDto, index: number) => (
								<TableRow key={row.scenarioPlayRecordId ?? index} className="hover:bg-gray-50">
									<TableCell>
										{(currentPage - 1) * itemsPerPage + index + 1}
									</TableCell>
									<TableCell>
										{row.userName != null ? row.userName : `userId: ${row.userId}`}
									</TableCell>
									<TableCell>
										{row.className != null ? row.className : row.classId ?? '-'}
									</TableCell>
									<TableCell>
										{row.scenarioTitle != null ? row.scenarioTitle : row.scenarioId}
									</TableCell>
									<TableCell>{formatDateTime(row.playedAt)}</TableCell>
									<TableCell>{row.score != null ? row.score : '-'}</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={6} className="text-center py-12 text-gray-500">
									플레이 기록이 없습니다.
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
		</>
	);
}
