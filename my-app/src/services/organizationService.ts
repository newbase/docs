/**
 * Organization Service
 * 기관 관리 API 서비스
 */

import { apiClient } from './apiClient';
import type {
	GetOrganizationCountResponseDto,
	GetOrganizationListResponseDto,
	GetOrganizationDetailResponseDto,
	CreateOrganizationRequestDto,
	CreateOrganizationResponseDto,
	UpdateOrganizationBodyDto,
	UpdateOrganizationResponseDto,
	GetOrganizationTypeListResponseDto,
	GetCountryListResponseDto,
	GetCountryCallingCodeListResponseDto,
} from '../types/api';

export interface GetOrganizationListParams {
	page: number;
	pageSize: number;
	search?: string;
	licenseType?: 'USER' | 'DEVICE' | 'LIFETIME' | 'DEMO';
	licenseStatus?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXPIRING_SOON';
	countryId?: number;
	startDate?: string;
	endDate?: string;
}

/**
 * 기관 관리 서비스
 */
export const organizationService = {
	/**
	 * 기관 통계 조회
	 */
	getCount: async (): Promise<GetOrganizationCountResponseDto> => {
		return await apiClient.get<GetOrganizationCountResponseDto>('/organization/count');
	},

	/**
	 * 기관 리스트 조회 (필터링 지원)
	 */
	getList: async (params: GetOrganizationListParams): Promise<GetOrganizationListResponseDto> => {
		return await apiClient.get<GetOrganizationListResponseDto>('/organization/list', { params });
	},

	/**
	 * 기관 상세 조회
	 */
	getDetail: async (organizationId: number): Promise<GetOrganizationDetailResponseDto> => {
		return await apiClient.get<GetOrganizationDetailResponseDto>(
			`/organization/${organizationId}/detail`
		);
	},

	/**
	 * 기관 생성
	 */
	create: async (data: CreateOrganizationRequestDto): Promise<CreateOrganizationResponseDto> => {
		return await apiClient.post<CreateOrganizationResponseDto>('/organization', data);
	},

	/**
	 * 기관 수정
	 */
	update: async (
		organizationId: number,
		data: UpdateOrganizationBodyDto
	): Promise<UpdateOrganizationResponseDto> => {
		return await apiClient.put<UpdateOrganizationResponseDto>(
			`/organization/${organizationId}`,
			data
		);
	},

	/**
	 * 기관 삭제
	 * ⚠️ Swagger: DELETE /organization/{organizationId} 미정의. 백엔드 구현 여부 확인 필요.
	 */
	delete: async (organizationId: number): Promise<{ message: string }> => {
		// 엄격한 타입 및 값 검증
		if (typeof organizationId !== 'number' || isNaN(organizationId)) {
			throw new Error('기관 ID는 유효한 숫자여야 합니다.');
		}
		if (organizationId <= 0 || !Number.isInteger(organizationId)) {
			throw new Error('기관 ID는 양의 정수여야 합니다.');
		}
		
		return await apiClient.delete<{ message: string }>(
			`/organization/${organizationId}`
		);
	},

	/**
	 * 기관 유형 리스트 조회
	 */
	getOrganizationTypes: async (): Promise<GetOrganizationTypeListResponseDto> => {
		return await apiClient.get<GetOrganizationTypeListResponseDto>('/organization/type/list');
	},

	/**
	 * 국가 리스트 조회
	 */
	getCountries: async (): Promise<GetCountryListResponseDto> => {
		return await apiClient.get<GetCountryListResponseDto>('/country/list');
	},

	/**
	 * 국가 전화번호 코드 리스트 조회
	 */
	getCountryCallingCodes: async (): Promise<GetCountryCallingCodeListResponseDto> => {
		return await apiClient.get<GetCountryCallingCodeListResponseDto>(
			'/country/calling-code/list'
		);
	},
};
