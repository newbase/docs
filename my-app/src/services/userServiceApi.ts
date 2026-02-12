/**
 * User Service API
 * 사용자 관리 API 서비스 (기관 관리용)
 */

import { apiClient } from './apiClient';
import type {
	GetAllUserCountResponseDto,
	GetUserListWithFiltersResponseDto,
	GetOrganizationUserListResponseDto,
	GetUserListResponseDto,
	RegisterOrganizationMemberRequestDto,
	RegisterOrganizationMemberResponseDto,
	UpdateUserStatusRequestDto,
	UpdateUserStatusResponseDto,
	DeleteUserListRequestDto,
	DeleteUserListResponseDto,
	BulkCreateUsersRequestDto,
	BulkCreateUsersResponseDto,
	ExportUserListExcelRequestDto,
	ExportUserListExcelResponseDto,
	DownloadUserBulkUploadTemplateResponseDto,
	UpdateUserInfoRequestDto,
	UpdateUserInfoResponseDto,
} from '../types/api';

export interface GetUserListFilters {
	page: number;
	pageSize: number;
	search?: string;
	role?: 'STUDENT' | 'ORGANIZATION_ADMIN' | 'SALES_ADMIN' | 'SUPER_ADMIN';
	isActive?: boolean;
	type?: 'ASSOCIATE' | 'REGULAR';
}

export interface GetOrganizationUserListParams {
	organizationId: number;
	page: number;
	pageSize: number;
}

export interface GetRegularMemberListParams {
	page: number;
	pageSize: number;
	search?: string;
}

export interface UpdateUserRoleRequestDto {
	userId: number;
	role: number; // 0~5
}

export interface UpdateUserRoleResponseDto {
	message: string;
}

/**
 * 사용자 관리 서비스 (기관 관리용)
 */
export const userServiceApi = {
	/**
	 * 전체 유저 수 조회
	 */
	getAllCount: async (): Promise<GetAllUserCountResponseDto> => {
		return await apiClient.get<GetAllUserCountResponseDto>('/user/all/count');
	},

	/**
	 * 조건별 유저 리스트 조회
	 */
	getListWithFilters: async (params: GetUserListFilters): Promise<GetUserListWithFiltersResponseDto> => {
		return await apiClient.get<GetUserListWithFiltersResponseDto>('/user/option/list', {
			params,
		});
	},

	/**
	 * 기관별 유저 리스트 조회
	 */
	getOrganizationUserList: async (
		params: GetOrganizationUserListParams
	): Promise<GetOrganizationUserListResponseDto> => {
		return await apiClient.get<GetOrganizationUserListResponseDto>(
			`/user/organization/${params.organizationId}/list`,
			{
				params: {
					organizationId: params.organizationId,
					page: params.page,
					pageSize: params.pageSize,
				},
			}
		);
	},

	/**
	 * 기관이 없는 정회원 리스트 조회
	 */
	getRegularMemberList: async (params: GetRegularMemberListParams): Promise<GetUserListResponseDto> => {
		return await apiClient.get<GetUserListResponseDto>('/user/regular-member/list', {
			params,
		});
	},

	/**
	 * 기관별 정회원 등록
	 */
	registerOrganizationMembers: async (
		data: RegisterOrganizationMemberRequestDto
	): Promise<RegisterOrganizationMemberResponseDto> => {
		return await apiClient.post<RegisterOrganizationMemberResponseDto>(
			'/user/organization-member/list',
			data
		);
	},

	/**
	 * 유저 상태 전환 (활성/비활성)
	 */
	updateUserStatus: async (data: UpdateUserStatusRequestDto): Promise<UpdateUserStatusResponseDto> => {
		return await apiClient.post<UpdateUserStatusResponseDto>('/user/status/list', data);
	},

	/**
	 * 유저 삭제
	 * Swagger: DELETE /user/list, body: DeleteUserListRequestDto { userIdList }
	 */
	deleteUsers: async (data: DeleteUserListRequestDto): Promise<DeleteUserListResponseDto> => {
		return await apiClient.delete<DeleteUserListResponseDto>('/user/list', data);
	},

	/**
	 * 유저 일괄 등록 템플릿 다운로드
	 */
	downloadBulkUploadTemplate: async (): Promise<DownloadUserBulkUploadTemplateResponseDto> => {
		return await apiClient.get<DownloadUserBulkUploadTemplateResponseDto>(
			'/user/bulk-upload-template'
		);
	},

	/**
	 * 유저 일괄 생성
	 */
	bulkCreateUsers: async (data: BulkCreateUsersRequestDto): Promise<BulkCreateUsersResponseDto> => {
		const formData = new FormData();
		formData.append('organizationId', data.organizationId.toString());
		formData.append('file', data.file);
		// 엄격하게: 일괄 등록 시 준회원(ASSOCIATE)으로 등록 (이메일이 없기 때문)
		formData.append('type', 'ASSOCIATE');

		// 엄격하게: FormData를 전달할 때 Content-Type 헤더를 설정하지 않음
		// 브라우저가 자동으로 boundary를 포함한 Content-Type을 설정함
		// 수동으로 설정하면 "Multipart: Boundary not found" 에러 발생
		return await apiClient.post<BulkCreateUsersResponseDto>('/user/bulk-create', formData);
	},

	/**
	 * 유저 리스트 엑셀 추출
	 */
	exportUserListExcel: async (
		data: ExportUserListExcelRequestDto
	): Promise<ExportUserListExcelResponseDto> => {
		return await apiClient.post<ExportUserListExcelResponseDto>('/user/export-excel', data);
	},

	/**
	 * 사용자 정보 수정 (관리자용)
	 * ⚠️ Swagger: PATCH /user/{userId} 미정의. 현재 PATCH /user/profile은 본인 프로필만 수정.
	 * 백엔드에 관리자용 타유저 정보 수정 API 추가 시 경로/스키마 확인 필요.
	 */
	updateUserInfo: async (data: UpdateUserInfoRequestDto): Promise<UpdateUserInfoResponseDto> => {
		const { userId, ...updateData } = data;
		return await apiClient.patch<UpdateUserInfoResponseDto>(`/user/${userId}`, updateData);
	},

	/**
	 * 사용자 비밀번호 변경 (관리자용)
	 * Swagger: POST /user/change-password-admin, body: { userId, newPassword }
	 */
	updateUserPassword: async (userId: number, newPassword: string): Promise<UpdateUserInfoResponseDto> => {
		return await apiClient.post<UpdateUserInfoResponseDto>('/user/change-password-admin', {
			userId,
			newPassword,
		});
	},

	/**
	 * 슈퍼관리자용 유저 권한 변경
	 */
	updateUserRoleByAdmin: async (data: UpdateUserRoleRequestDto): Promise<UpdateUserRoleResponseDto> => {
		return await apiClient.patch<UpdateUserRoleResponseDto>('/user/role/admin', data);
	},

	/**
	 * 기관관리자용 유저 권한 변경
	 */
	updateUserRoleByOrganization: async (data: UpdateUserRoleRequestDto): Promise<UpdateUserRoleResponseDto> => {
		return await apiClient.patch<UpdateUserRoleResponseDto>('/user/role/organization', data);
	},
};
