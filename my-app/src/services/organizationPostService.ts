/**
 * 기관 게시글 API (Phase 4)
 * POST/GET/PUT/DELETE /organization-post
 * @see my-app/docs/api/API.md, FRONTEND_API_INTEGRATION_PHASES.md
 * 5대 규칙: mighty_development_rules.md 참고
 */

import { apiClient, ApiError } from './apiClient';
import type {
	GetOrganizationPostListParams,
	GetOrganizationPostListResponseDto,
	CreateOrganizationPostRequestDto,
	CreateOrganizationPostResponseDto,
	UpdateOrganizationPostRequestDto,
	UpdateOrganizationPostResponseDto,
} from '../types/api/organization-post';

/**
 * 기관별 게시글 리스트 조회
 * Swagger: GET /organization-post/list?organizationId=&page=&pageSize=
 */
export const getOrganizationPostList = async (
	params: GetOrganizationPostListParams
): Promise<GetOrganizationPostListResponseDto> => {
	try {
		const response = await apiClient.get<GetOrganizationPostListResponseDto>(
			'/organization-post/list',
			{ params }
		);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '게시글 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 기관 게시글 생성
 * Swagger: POST /organization-post
 */
export const createOrganizationPost = async (
	data: CreateOrganizationPostRequestDto
): Promise<CreateOrganizationPostResponseDto> => {
	try {
		const response = await apiClient.post<CreateOrganizationPostResponseDto>(
			'/organization-post',
			data
		);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '게시글 작성에 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 기관 게시글 수정
 * Swagger: PUT /organization-post/{organizationPostId}
 */
export const updateOrganizationPost = async (
	organizationPostId: number,
	data: UpdateOrganizationPostRequestDto
): Promise<UpdateOrganizationPostResponseDto> => {
	try {
		const response = await apiClient.put<UpdateOrganizationPostResponseDto>(
			`/organization-post/${organizationPostId}`,
			data
		);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '게시글 수정에 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 기관 게시글 삭제
 * Swagger: DELETE /organization-post/{organizationPostId}
 */
export const deleteOrganizationPost = async (
	organizationPostId: number
): Promise<void> => {
	try {
		await apiClient.delete(`/organization-post/${organizationPostId}`);
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '게시글 삭제에 실패했습니다.');
		}
		throw error;
	}
};
