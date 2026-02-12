// User API Types

export interface GetAllUserCountResponseDto {
	allUserCount: number;
	regularMemberCount: number;
	associateMemberCount: number;
	activeUserCount: number;
}

export interface UserInfoDto {
	userId: number;
	type: 'ASSOCIATE' | 'REGULAR';
	name: string;
	loginId?: string;
	email?: string;
	organizationName?: string;
	role: 0 | 1 | 2 | 4 | 5;
	status: boolean;
	lastSigninAt: string;
	createdAt: string;
	phoneNumber?: string;
	position?: string;
	department?: string;
	activeClassCount: number;
}

export interface GetUserListWithFiltersResponseDto {
	userList: UserInfoDto[];
	totalCount: number;
	associateMemberCount: number;
	regularMemberCount: number;
}

export interface OrganizationUserInfoDto {
	userId: number;
	name: string;
	loginId?: string;
	email?: string;
	department?: string;
	role: 'STUDENT' | 'ORGANIZATION_ADMIN' | 'SALES_ADMIN' | 'SUPER_ADMIN';
	accountType: 'REGULAR' | 'ASSOCIATE';
	registeredAt: string;
	lastSigninAt?: string;
}

export interface GetOrganizationUserListResponseDto {
	userList: OrganizationUserInfoDto[];
	totalCount: number;
	adminCount: number;
	studentCount: number;
}

export interface RegularMemberInfoDto {
	userId: number;
	loginId?: string;
	email?: string;
	realName: string;
}

export interface GetUserListResponseDto {
	userList: RegularMemberInfoDto[];
	totalCount: number;
}

export interface RegisterOrganizationMemberRequestDto {
	organizationId: number;
	userIdList: number[];
}

export interface RegisterOrganizationMemberResponseDto {
	message: string;
}

export interface UpdateUserStatusRequestDto {
	userIdList: number[];
}

export interface UpdateUserStatusResponseDto {
	message: string;
}

export interface DeleteUserListRequestDto {
	userIdList: number[];
}

export interface DeleteUserListResponseDto {
	message: string;
}

export interface BulkCreateUsersRequestDto {
	organizationId: number;
	file: File;
}

export interface BulkCreateUsersResponseDto {
	createdCount: number;
	duplicateLoginIds: string[];
}

export interface ExportUserListExcelRequestDto {
	search?: string;
	role?: 'STUDENT' | 'ORGANIZATION_ADMIN' | 'SALES_ADMIN' | 'SUPER_ADMIN';
	type?: 'ASSOCIATE' | 'REGULAR';
	isActive?: boolean;
	organizationId?: number;
}

export interface ExportUserListExcelResponseDto {
	downloadUrl: string;
	totalCount: number;
}

export interface DownloadUserBulkUploadTemplateResponseDto {
	downloadUrl: string;
}

export interface UpdateUserInfoRequestDto {
	userId: number;
	name?: string;
	email?: string;
	phoneNumber?: string;
	department?: string;
	position?: string;
	password?: string; // 선택적: 비밀번호 변경
}

export interface UpdateUserInfoResponseDto {
	message: string;
	updatedUser?: UserInfoDto;
}
