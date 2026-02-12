/**
 * Curriculum Service
 * Phase 9: 커리큘럼 관리
 * Swagger: POST /curriculum, GET /curriculum/list, GET /curriculum/organization/list, PUT /curriculum/{curriculumId}
 * @see my-app/docs/api/API.md
 */

import { apiClient, ApiError } from './apiClient';
import type {
	CreateCurriculumRequestDto,
	CreateCurriculumResponseDto,
	GetCurriculumListResponseDto,
	GetCurriculumDetailResponseDto,
	UpdateCurriculumRequestDto,
	UpdateCurriculumResponseDto,
} from '../types/api/curriculum';
import type { GetCurriculumListByOrganizationResponseDto } from '../types/api/license';

export interface GetCurriculumListParams {
	page: number;
	pageSize: number;
}

export interface GetCurriculumListByOrganizationParams {
	organizationId: number;
	page?: number;
	pageSize?: number;
}

/**
 * 커리큘럼 생성
 * POST /curriculum
 */
export const createCurriculum = async (
	data: CreateCurriculumRequestDto
): Promise<CreateCurriculumResponseDto> => {
	const res = await apiClient.post<CreateCurriculumResponseDto>('/curriculum', data);
	return res;
};

/**
 * 커리큘럼 리스트 조회
 * GET /curriculum/list
 */
export const getCurriculumList = async (
	params: GetCurriculumListParams
): Promise<GetCurriculumListResponseDto> => {
	const { page = 1, pageSize = 20 } = params;
	const res = await apiClient.get<GetCurriculumListResponseDto>('/curriculum/list', {
		params: { page, pageSize },
	});
	return res;
};

/**
 * 기관별 커리큘럼 리스트 조회
 * GET /curriculum/organization/list
 */
export const getCurriculumListByOrganization = async (
	params: GetCurriculumListByOrganizationParams
): Promise<GetCurriculumListByOrganizationResponseDto> => {
	const { organizationId, page = 1, pageSize = 20 } = params;
	const res = await apiClient.get<GetCurriculumListByOrganizationResponseDto>(
		'/curriculum/organization/list',
		{ params: { organizationId, page, pageSize } }
	);
	return res;
};

/**
 * 커리큘럼 상세 조회 (수정 모달용)
 * GET /curriculum/{curriculumId}
 * ⚠️ API 문서에 명시되지 않았을 수 있음. 백엔드 미구현 시 404 → EditCurriculumModal에서 처리.
 */
export const getCurriculumDetail = async (
	curriculumId: number
): Promise<GetCurriculumDetailResponseDto> => {
	try {
		const res = await apiClient.get<GetCurriculumDetailResponseDto>(
			`/curriculum/${curriculumId}`
		);
		return res;
	} catch (error) {
		if (error instanceof ApiError && error.status === 404) {
			throw new Error('존재하지 않는 커리큘럼입니다.');
		}
		throw error;
	}
};

/**
 * 커리큘럼 수정
 * PUT /curriculum/{curriculumId}
 */
export const updateCurriculum = async (
	curriculumId: number,
	data: UpdateCurriculumRequestDto
): Promise<UpdateCurriculumResponseDto> => {
	const res = await apiClient.put<UpdateCurriculumResponseDto>(
		`/curriculum/${curriculumId}`,
		data
	);
	return res;
};
