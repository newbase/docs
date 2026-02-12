/**
 * License Service
 * 
 * 라이선스 관련 API 호출을 담당하는 서비스
 * - 라이선스 CRUD 작업
 * - 라이선스 수량 변경 시 사용자 비활성화 처리
 */

import apiClient, { ApiError } from './apiClient';
import { featureFlags } from '../config/featureFlags';
import { mockLicenses, mockFetchLicenseListByOrganization } from '../data/mockLicenses';
import type {
  GetLicenseListResponseDto,
  LicenseDetailDto,
  CreateLicenseRequestDto,
  CreateLicenseResponseDto,
  UpdateLicenseRequestDto,
  UpdateLicenseResponseDto
} from '../types/api/license';

export type UpdateLicenseRequest = UpdateLicenseRequestDto;
export type UpdateLicenseResponse = UpdateLicenseResponseDto;

/**
 * 조직의 라이선스 목록 조회
 * Swagger: GET /license/list
 */
export const getLicensesByOrganization = async (organizationId: number): Promise<GetLicenseListResponseDto> => {
  if (featureFlags.USE_MOCK_DATA) {
    const list = await mockFetchLicenseListByOrganization(organizationId);
    return {
      licenseList: list,
      totalCount: list.length
    };
  }

  try {
    return await apiClient.get<GetLicenseListResponseDto>(`/license/list`, {
      params: { organizationId }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || '라이선스 목록을 불러오는데 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 라이선스 상세 조회
 * Swagger: GET /license/{organizationLicenseId}
 */
export const getLicenseById = async (organizationLicenseId: number): Promise<LicenseDetailDto> => {
  if (featureFlags.USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const license = mockLicenses.find(l => l.organizationLicenseId === organizationLicenseId);
    if (!license) throw new Error('라이선스 정보를 찾을 수 없습니다.');
    return license;
  }

  try {
    return await apiClient.get<LicenseDetailDto>(`/license/${organizationLicenseId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || '라이선스 정보를 불러오는데 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 라이선스 생성
 * Swagger: POST /license
 */
export const createLicense = async (data: CreateLicenseRequestDto): Promise<CreateLicenseResponseDto> => {
  if (featureFlags.USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { message: '라이선스가 생성되었습니다.' };
  }

  try {
    return await apiClient.post<CreateLicenseResponseDto>(`/license`, data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || '라이선스 생성에 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 라이선스 업데이트
 * Swagger: PUT /license/{organizationLicenseId}
 */
export const updateLicense = async (
  organizationLicenseId: number,
  data: UpdateLicenseRequestDto
): Promise<UpdateLicenseResponseDto> => {
  if (featureFlags.USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { message: '라이선스 정보가 업데이트되었습니다.' };
  }

  try {
    return await apiClient.put<UpdateLicenseResponseDto>(
      `/license/${organizationLicenseId}`,
      data
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || '라이선스 업데이트에 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 라이선스 삭제
 */
export const deleteLicense = async (organizationLicenseId: number): Promise<void> => {
  if (featureFlags.USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }

  try {
    await apiClient.delete(`/license/${organizationLicenseId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || '라이선스 삭제에 실패했습니다.');
    }
    throw error;
  }
};
