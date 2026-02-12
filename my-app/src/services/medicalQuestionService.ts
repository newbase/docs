/**
 * 문진 API (Phase 3)
 * GET /medical-question/list
 * @see my-app/docs/api/API.md, FRONTEND_API_INTEGRATION_PHASES.md
 */

import { apiClient, ApiError } from './apiClient';
import type { MedicalQuestionListResponseDto } from '../types/api/medical';

/**
 * 문진 질문 리스트 조회
 * Swagger: GET /medical-question/list
 */
export const getMedicalQuestionList =
	async (): Promise<MedicalQuestionListResponseDto> => {
		try {
			const response = await apiClient.get<MedicalQuestionListResponseDto>(
				'/medical-question/list'
			);
			return response;
		} catch (error) {
			if (error instanceof ApiError) {
				throw new Error(error.message || '문진 질문 목록을 불러오는데 실패했습니다.');
			}
			throw error;
		}
	};
