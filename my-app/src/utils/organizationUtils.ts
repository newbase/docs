/**
 * Organization Utility Functions
 * 기관 관련 유틸리티 함수
 * 
 * 백엔드 API DTO와 프론트엔드 타입 간 변환 함수
 */

import { GetOrganizationDetailResponseDto, OrganizationInfoDto } from '@/types/api/organization';
import { Organization } from '@/types/admin';
import { formatDate } from './dateUtils';

/**
 * GetOrganizationDetailResponseDto를 Organization 타입으로 변환
 * 
 * @param dto - Backend API 응답 DTO
 * @returns Organization 타입 객체
 */
export const convertOrganizationDetailDtoToOrganization = (
	dto: GetOrganizationDetailResponseDto
): Organization => {
	return {
		id: String(dto.organizationId),
		name: dto.title,
		country: dto.country.title,
		type: dto.organizationType.title,
		businessNumber: dto.businessRegistrationNumber || '',
		contactPerson: dto.managerName || '',
		department: dto.department || '',
		position: '', // DTO에 position 필드 없음
		phone: dto.phoneNumber || '',
		email: dto.email || '',
		registeredDate: formatDate(dto.createdAt),
		status: dto.licenseStatus === 'ACTIVE' ? 'active' : 'inactive',
		// 추가 필드 (DTO에 없지만 프론트엔드에서 사용)
		licenseType: '', // 별도 API 호출 필요
		licenseCount: 0, // 별도 API 호출 필요
		deviceCount: 0, // 별도 API 호출 필요
		userCount: 0, // 별도 API 호출 필요
		expiryDate: '', // 별도 API 호출 필요
	};
};

/**
 * OrganizationInfoDto를 Organization 타입으로 변환
 * (목록 조회용 - 상세 정보보다 적은 필드)
 * 
 * @param dto - Backend API 응답 DTO (목록용)
 * @returns Organization 타입 객체
 */
export const convertOrganizationInfoDtoToOrganization = (dto: OrganizationInfoDto): Organization => {
	// 라이센스 타입 변환
	const getLicenseType = (type?: string): string => {
		if (!type) return '';
		const typeMap: Record<string, string> = {
			USER: '사용자구독',
			DEVICE: '기기구독',
			LIFETIME: '평생구독',
			DEMO: '데모',
		};
		return typeMap[type] || '';
	};

	return {
		id: String(dto.organizationId),
		name: dto.title,
		country: dto.countryName,
		type: dto.organizationTypeTitle,
		businessNumber: '', // 목록 API에 없음
		contactPerson: '', // 목록 API에 없음
		department: '', // 목록 API에 없음
		position: '', // 목록 API에 없음
		phone: '', // 목록 API에 없음
		email: '', // 목록 API에 없음
		registeredDate: dto.createdAt ? formatDate(dto.createdAt) : '',
		status: dto.licenseStatus === 'ACTIVE' ? 'active' : 'inactive',
		licenseType: getLicenseType(dto.licenseType),
		licenseCount: dto.licenseType === 'USER' ? dto.userCount : 0,
		deviceCount: dto.deviceCount,
		userCount: dto.userCount,
		expiryDate: dto.licenseExpiryDate ? formatDate(dto.licenseExpiryDate) : '',
	};
};

/**
 * 라이센스 상태 변환
 * 
 * @param status - 백엔드 라이센스 상태
 * @returns 프론트엔드 상태
 */
export const convertLicenseStatus = (
	status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXPIRING_SOON'
): 'active' | 'inactive' => {
	const statusMap: Record<string, 'active' | 'inactive'> = {
		ACTIVE: 'active',
		INACTIVE: 'inactive',
		EXPIRED: 'inactive',
		EXPIRING_SOON: 'active',
	};
	return statusMap[status] || 'inactive';
};
