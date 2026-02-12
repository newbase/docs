/**
 * 검사 API (Phase 3)
 * GET /medical-test/category/list, GET /medical-test/list, GET /medical-test/item/list
 * @see my-app/docs/api/API.md, FRONTEND_API_INTEGRATION_PHASES.md
 */

import { apiClient, ApiError } from './apiClient';
import type {
	MedicalTestCategoryListResponseDto,
	MedicalTestListResponseDto,
	MedicalTestItemListResponseDto,
} from '../types/api/medical';

/**
 * 검사 카테고리 리스트 조회
 * Swagger: GET /medical-test/category/list
 */
export const getMedicalTestCategoryList =
	async (): Promise<MedicalTestCategoryListResponseDto> => {
		try {
			const response = await apiClient.get<MedicalTestCategoryListResponseDto>(
				'/medical-test/category/list'
			);
			return response;
		} catch (error) {
			if (error instanceof ApiError) {
				throw new Error(error.message || '검사 카테고리 목록을 불러오는데 실패했습니다.');
			}
			throw error;
		}
	};

/**
 * 검사 카테고리 ID로 검사 리스트 조회
 * Swagger: GET /medical-test/list?medicalTestCategoryId=
 */
export const getMedicalTestList = async (
	medicalTestCategoryId: number
): Promise<MedicalTestListResponseDto> => {
	try {
		const response = await apiClient.get<MedicalTestListResponseDto>(
			'/medical-test/list',
			{ params: { medicalTestCategoryId } }
		);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '검사 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 검사 ID로 검사 항목 리스트 조회
 * Swagger: GET /medical-test/item/list?medicalTestId=
 */
export const getMedicalTestItemList = async (
	medicalTestId: number
): Promise<MedicalTestItemListResponseDto> => {
	try {
		const response = await apiClient.get<MedicalTestItemListResponseDto>(
			'/medical-test/item/list',
			{ params: { medicalTestId } }
		);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '검사 항목 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};
