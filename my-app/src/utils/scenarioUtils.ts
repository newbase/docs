/**
 * Scenario Utility Functions
 * 시나리오 관련 유틸리티 함수
 */

import type {
	GetScenarioListByUserIdDto,
	GetScenarioDetailResponseDto,
	ScenarioAdminDto,
} from '@/types/api/scenario';
import { Scenario } from '@/types/admin';

/**
 * GetScenarioListByUserIdDto를 Scenario 타입으로 변환
 */
/** ISO 날짜 또는 YYYY-MM-DD → YYYY-MM-DD (엄격: 없거나 파싱 실패 시 빈 문자열) */
function toDateOnly(isoOrDateStr: string | undefined | null): string {
	if (isoOrDateStr == null || typeof isoOrDateStr !== 'string') return '';
	const trimmed = isoOrDateStr.trim();
	if (!trimmed) return '';
	const part = trimmed.split('T')[0];
	return /^\d{4}-\d{2}-\d{2}$/.test(part) ? part : (trimmed.slice(0, 10) || '');
}

export const convertScenarioListDtoToScenario = (dto: GetScenarioListByUserIdDto): Scenario => {
	const dateOnly = toDateOnly(dto.createdAt);
	return {
		id: dto.scenarioId,
		title: dto.title,
		classId: '', // classId는 DTO에 없으므로 빈 문자열
		category: dto.scenarioCategoryList?.map((c) => c.title).join(', ') ?? '',
		platform: 'VR', // deviceTypeList가 없으면 기본값 (실제로는 deviceTypeList 매핑 필요)
		status: 'active', // status 필드가 없으면 기본값
		createdDate: dateOnly,
		updatedDate: dateOnly,
		version: dto.version,
		averageDuration: `${Math.floor(dto.expectedPlayTimeSeconds / 60)}분`,
		views: 0, // views 필드 없음
		userCount: 0, // userCount 필드 없음
		simulationCount: 0, // simulationCount 필드 없음
		requiredPremium: false,
		ContributedBy: '',
		learningObjectives: [],
		duration: `${Math.floor(dto.expectedPlayTimeSeconds / 60)}분`,
		supportedDevices: [],
		videoUrl: '',
		thumbnail: dto.thumbnailImageUrl,
		handover: '',
		keyTasks: [],
		simulationExamples: [],
		isPublic: true,
		averageScore: 0,
	};
};

/**
 * GetScenarioDetailResponseDto를 Scenario 타입으로 변환
 */
export const convertScenarioDetailDtoToScenario = (dto: GetScenarioDetailResponseDto): Scenario => {
	return {
		id: dto.scenarioId,
		title: dto.title,
		classId: '', // classId는 DTO에 없으므로 빈 문자열
		category: (dto.scenarioCategoryList ?? []).map((c) => c.title).join(', '),
		platform: 'VR', // deviceTypeList 매핑 필요 (현재 응답에 없음)
		status: 'active', // status 필드가 없으면 기본값
		learningObjectives: (dto.learningObjectiveList ?? []).map((lo) => lo.title),
		duration: `${Math.floor(dto.expectedPlayTimeSeconds / 60)}분`,
		handover: dto.handoverNote,
		version: dto.version,
		createdDate: '', // createdAt 필드 없음 (추가 필요)
		updatedDate: '',
		views: 0,
		userCount: 0,
		simulationCount: 0,
		requiredPremium: false,
		ContributedBy: '',
		supportedDevices: [],
		videoUrl: '',
		thumbnail: dto.thumbnailImageUrl,
		keyTasks: [],
		simulationExamples: [],
		isPublic: true,
		averageDuration: `${Math.floor(dto.expectedPlayTimeSeconds / 60)}분`,
		averageScore: 0,
		patient: dto.patient?.name || '정보 없음',
		map: `맵 #${dto.mapItemId}`,
		mapId: String(dto.mapItemId),
	};
};

/**
 * ScenarioAdminDto를 Scenario 타입으로 변환
 * (백엔드 Admin API 구현 후 사용)
 */
export const convertScenarioAdminDtoToScenario = (dto: ScenarioAdminDto): Scenario => {
	return {
		id: dto.scenarioId,
		title: dto.title,
		classId: '', // classId는 DTO에 없으므로 빈 문자열
		category: (dto.scenarioCategoryList ?? []).map((c) => c.title).join(', '),
		platform: (dto.deviceTypeList?.map((d) => d.title).join(', ') || 'VR') as any,
		status: dto.status || 'active',
		createdDate: dto.createdAt.split('T')[0], // ISO → YYYY-MM-DD
		updatedDate: dto.createdAt.split('T')[0],
		version: dto.version,
		averageDuration: `${Math.floor(dto.expectedPlayTimeSeconds / 60)}분`,
		views: dto.views || 0,
		userCount: dto.userCount || 0,
		simulationCount: dto.simulationCount || 0,
		requiredPremium: false,
		ContributedBy: dto.contributedBy || '',
		learningObjectives: [],
		duration: `${Math.floor(dto.expectedPlayTimeSeconds / 60)}분`,
		supportedDevices: [],
		videoUrl: '',
		thumbnail: dto.thumbnailImageUrl,
		handover: '',
		keyTasks: [],
		simulationExamples: [],
		isPublic: dto.status === 'active',
		averageScore: 0,
	};
};

/**
 * 시나리오 상태 배지 정보 반환
 */
export const getScenarioStatusBadge = (status: string): {
	label: string;
	variant: 'default' | 'secondary' | 'destructive';
} => {
	const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
		active: { label: '발행완료', variant: 'default' },
		inactive: { label: '비공개', variant: 'secondary' },
		draft: { label: '작성중', variant: 'secondary' },
	};
	return badges[status] || badges.active;
};
