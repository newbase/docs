/**
 * Curriculum API Types (Swagger 기반)
 * Phase 9: 커리큘럼 관리
 * @see my-app/docs/api/API.md
 */

export interface CreateCurriculumRequestDto {
	title: string;
	scenarioIdList: number[];
}

export interface CreateCurriculumResponseDto {
	curriculumId: number;
}

export interface CurriculumListItemDto {
	curriculumId: number;
	title: string;
	scenarioCount?: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface GetCurriculumListResponseDto {
	curriculumList: CurriculumListItemDto[];
	totalCount: number;
}

export interface GetCurriculumListByOrganizationParams {
	organizationId: number;
	page?: number;
	pageSize?: number;
}

/** 기관별 커리큘럼 리스트 응답은 license.d.ts GetCurriculumListByOrganizationResponseDto 사용 (중복 export 방지) */

export interface GetCurriculumDetailResponseDto {
	curriculumId: number;
	title: string;
	scenarioList: { scenarioId: number }[];
}

export interface UpdateCurriculumRequestDto {
	title: string;
	scenarioIdList: number[];
}

export interface UpdateCurriculumResponseDto {
	message: string;
}
