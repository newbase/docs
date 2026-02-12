/**
 * Enum 리스트 API (GET /enum)
 * 나이단위, 혈액형, 캐릭터타입 등 공통 옵션 조회
 * @see my-app/docs/api/API.md
 */

import { apiClient, ApiError } from './apiClient';
import type { GetEnumListResponseDto } from '../types/api/enum';

/**
 * Enum 리스트 조회
 * Swagger: GET /enum
 */
export const getEnumList = async (): Promise<GetEnumListResponseDto> => {
	try {
		const response = await apiClient.get<GetEnumListResponseDto>('/enum');
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || 'Enum 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};
