/**
 * Class ↔ ClassItem 매핑 (Swagger Class API ↔ 기존 UI ClassItem)
 * 백엔드 API 변경: Course → Class (2026-02-02)
 * @see my-app/docs/api/API.md
 */

import type { ClassListItemDto, GetClassDetailResponseDto } from '@/types/api/class';
import type { ClassItem, CurriculumItem } from '@/data/classes';

/**
 * ClassListItemDto → ClassItem (목록/기존 UI 호환)
 * - classId(number) → id(string)
 * - participantCount → currentParticipants
 * - startDate/endDate → participationPeriod
 * - scenarioList → curriculum (간소화)
 */
export function classListItemDtoToClassItem(
	dto: ClassListItemDto,
	options?: { organizationId?: number; organizationName?: string }
): ClassItem {
	const curriculum: CurriculumItem[] = (dto.scenarioList ?? []).map((s) => ({
		id: s.scenarioId,
		code: `sc-${s.scenarioId}`,
		name: `시나리오 ${s.scenarioId}`,
		duration: '-',
		platform: 'both',
		type: 'scenario',
	}));

	return {
		id: String(dto.classId),
		type: 'course',
		title: dto.title,
		subtitle: dto.description ?? '',
		description: dto.description ?? '',
		thumbnail: dto.thumbnailUrl,
		curriculum,
		participationPeriod: {
			startDate: dto.startDate,
			endDate: dto.endDate ?? dto.startDate,
		},
		currentParticipants: dto.participantCount ?? 0,
		createdDate: dto.startDate?.slice(0, 10),
		organizationId: options?.organizationId,
		organizationName: options?.organizationName,
	};
}

/**
 * GetClassDetailResponseDto → ClassItem (상세 화면용)
 */
export function classDetailDtoToClassItem(
	dto: GetClassDetailResponseDto,
	options?: { organizationId?: number; organizationName?: string }
): ClassItem {
	const curriculum: CurriculumItem[] = (dto.scenarioList ?? []).map((s) => ({
		id: s.scenarioId,
		code: `sc-${s.scenarioId}`,
		name: `시나리오 ${s.scenarioId}`,
		duration: '-',
		platform: 'both',
		type: 'scenario',
	}));

	return {
		id: String(dto.classId),
		type: 'course',
		title: dto.title,
		subtitle: dto.description ?? '',
		description: dto.description ?? '',
		thumbnail: dto.thumbnailUrl,
		curriculum,
		participationPeriod: {
			startDate: dto.startDate ?? '',
			endDate: dto.endDate ?? dto.startDate ?? '',
		},
		completionRequirements: {
			minScenarios: dto.minPlayCount ?? 0,
			minPassingScore: 0,
			requireAllScenarios: false,
		},
		currentParticipants: dto.participantCount ?? 0,
		createdDate: dto.startDate?.slice(0, 10) ?? '',
		organizationId: options?.organizationId ?? dto.organizationId,
		organizationName: options?.organizationName,
	};
}
