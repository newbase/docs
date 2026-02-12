/**
 * 스킬·액션 API (Phase 3)
 * GET /skill/category/list, GET /skill/list, GET /action/list
 * @see my-app/docs/api/API.md, FRONTEND_API_INTEGRATION_PHASES.md
 */

import { apiClient, ApiError } from './apiClient';
import type {
	SkillCategoryListResponseDto,
	SkillListResponseDto,
	ActionListResponseDto,
} from '../types/api/skill';

/**
 * 스킬 카테고리 리스트 조회
 * Swagger: GET /skill/category/list
 */
export const getSkillCategoryList = async (): Promise<SkillCategoryListResponseDto> => {
	try {
		const response = await apiClient.get<SkillCategoryListResponseDto>('/skill/category/list');
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '스킬 카테고리 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 스킬 리스트 조회
 * Swagger: GET /skill/list?skillCategoryId=
 */
export const getSkillList = async (
	skillCategoryId?: number
): Promise<SkillListResponseDto> => {
	try {
		const response = await apiClient.get<SkillListResponseDto>('/skill/list', {
			params: skillCategoryId != null ? { skillCategoryId } : {},
		});
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '스킬 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 스킬별 액션 리스트 조회
 * Swagger: GET /action/list?skillId=
 */
export const getActionList = async (skillId: number): Promise<ActionListResponseDto> => {
	try {
		const response = await apiClient.get<ActionListResponseDto>('/action/list', {
			params: { skillId },
		});
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '액션 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};
