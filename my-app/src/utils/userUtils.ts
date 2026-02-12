/**
 * User Utility Functions
 * 사용자 관련 유틸리티 함수
 * 
 * 백엔드 API DTO와 프론트엔드 타입 간 변환 함수
 */

import { UserInfoDto, OrganizationUserInfoDto } from '@/types/api/user';
import { User } from '@/types/admin';
import { convertRoleNumberToString, getRoleLabel } from './roleUtils';
import { formatDate } from './dateUtils';

/**
 * UserInfoDto를 User 타입으로 변환
 * (전체 사용자 목록 조회용)
 * 
 * @param dto - Backend API 응답 DTO
 * @returns User 타입 객체
 */
export const convertUserInfoDtoToUser = (dto: UserInfoDto): User => {
	return {
		id: dto.userId,
		name: dto.name,
		email: dto.email,
		type: dto.type === 'REGULAR' ? 'regular' : 'guest',
		accountType: dto.type === 'REGULAR' ? '정회원' : '게스트',
		customerType: dto.organizationName ? '기관고객' : '개인고객',
		organizationName: dto.organizationName,
		role: convertRoleNumberToString(dto.role),
		registeredDate: formatDate(dto.createdAt),
		lastLogin: dto.lastSigninAt ? formatDate(dto.lastSigninAt) : undefined,
		status: dto.status ? 'active' : 'inactive',
		// 추가 필드
		department: dto.department,
		position: dto.position,
		phoneNumber: dto.phoneNumber,
		loginId: dto.loginId, // 엄격하게: 아이디 필드 추가
	};
};

/**
 * OrganizationUserInfoDto를 User 타입으로 변환
 * (기관별 사용자 목록 조회용)
 * 
 * @param dto - Backend API 응답 DTO
 * @returns User 타입 객체
 */
export const convertOrganizationUserInfoDtoToUser = (dto: OrganizationUserInfoDto): User => {
	// Role 변환: 'ORGANIZATION_ADMIN' → 'Master', 'STUDENT' → 'Student'
	const getRole = (role: OrganizationUserInfoDto['role']): string => {
		const roleMap: Record<OrganizationUserInfoDto['role'], string> = {
			ORGANIZATION_ADMIN: 'Master',
			STUDENT: 'Student',
			SALES_ADMIN: 'Sales Admin',
			SUPER_ADMIN: 'Super Admin',
		};
		return roleMap[role] || role;
	};

	return {
		id: dto.userId.toString(),
		name: dto.name,
		email: dto.email,
		type: dto.accountType === 'REGULAR' ? 'regular' : 'guest',
		accountType: dto.accountType === 'REGULAR' ? '정회원' : '게스트',
		customerType: '기관고객',
		organizationName: undefined, // 기관별 조회이므로 이미 기관 컨텍스트 내
		role: getRole(dto.role),
		registeredDate: formatDate(dto.registeredAt),
		lastLogin: dto.lastSigninAt ? formatDate(dto.lastSigninAt) : undefined,
		status: 'active', // OrganizationUserInfoDto에는 status 필드 없음
		// 추가 필드
		department: dto.department,
		loginId: dto.loginId,
	};
};

/**
 * 사용자 계정 타입 변환
 * 
 * @param accountType - 백엔드 계정 타입
 * @returns 프론트엔드 계정 타입
 */
export const convertAccountType = (
	accountType: 'REGULAR' | 'ASSOCIATE'
): 'regular' | 'guest' => {
	return accountType === 'REGULAR' ? 'regular' : 'guest';
};

/**
 * 사용자 계정 타입 표시명 변환
 * 
 * @param accountType - 백엔드 계정 타입
 * @returns 표시명
 */
export const convertAccountTypeToDisplay = (
	accountType: 'REGULAR' | 'ASSOCIATE'
): string => {
	const displayMap: Record<'REGULAR' | 'ASSOCIATE', string> = {
		REGULAR: '정회원',
		ASSOCIATE: '게스트',
	};
	return displayMap[accountType] || accountType;
};
