/**
 * User Management React Query Hooks
 * 회원 관리 React Query 훅
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
	userServiceApi,
	GetUserListFilters,
	GetOrganizationUserListParams,
	GetRegularMemberListParams,
} from '../services/userServiceApi';
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

// Query Keys
export const userManagementKeys = {
	all: ['userManagement'] as const,
	allCount: () => [...userManagementKeys.all, 'allCount'] as const,
	lists: () => [...userManagementKeys.all, 'list'] as const,
	listWithFilters: (params: GetUserListFilters) => [...userManagementKeys.lists(), 'filters', params] as const,
	organizationUserList: (params: GetOrganizationUserListParams) => [...userManagementKeys.lists(), 'organization', params] as const,
	regularMemberList: (params: GetRegularMemberListParams) => [...userManagementKeys.lists(), 'regularMembers', params] as const,
};

/**
 * 전체 유저 수 조회
 */
export const useAllUserCount = (
	options?: Omit<UseQueryOptions<GetAllUserCountResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: userManagementKeys.allCount(),
		queryFn: userServiceApi.getAllCount,
		staleTime: 5 * 60 * 1000, // 5분
		...options,
	});
};

/**
 * 조건별 유저 리스트 조회
 */
export const useUserListWithFilters = (
	params: GetUserListFilters,
	options?: Omit<UseQueryOptions<GetUserListWithFiltersResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: userManagementKeys.listWithFilters(params),
		queryFn: () => userServiceApi.getListWithFilters(params),
		staleTime: 3 * 60 * 1000, // 3분
		...options,
	});
};

/**
 * 기관별 유저 리스트 조회
 */
export const useOrganizationUserList = (
	params: GetOrganizationUserListParams,
	options?: Omit<UseQueryOptions<GetOrganizationUserListResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: userManagementKeys.organizationUserList(params),
		queryFn: () => userServiceApi.getOrganizationUserList(params),
		enabled: !!params.organizationId,
		staleTime: 3 * 60 * 1000, // 3분
		...options,
	});
};

/**
 * 기관이 없는 정회원 리스트 조회
 */
export const useRegularMemberList = (
	params: GetRegularMemberListParams,
	options?: Omit<UseQueryOptions<GetUserListResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: userManagementKeys.regularMemberList(params),
		queryFn: () => userServiceApi.getRegularMemberList(params),
		staleTime: 3 * 60 * 1000, // 3분
		...options,
	});
};

/**
 * 기관별 정회원 등록
 */
export const useRegisterOrganizationMembers = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: RegisterOrganizationMemberRequestDto) => 
			userServiceApi.registerOrganizationMembers(data),
		onSuccess: () => {
			// 해당 조직의 사용자 목록 캐시 무효화
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.lists() 
			});
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.allCount() 
			});
		},
	});
};

/**
 * 유저 상태 전환 (활성/비활성)
 */
export const useUpdateUserStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateUserStatusRequestDto) => 
			userServiceApi.updateUserStatus(data),
		onSuccess: () => {
			// 모든 사용자 관련 캐시 무효화
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.lists() 
			});
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.allCount() 
			});
		},
	});
};

/**
 * 유저 삭제
 */
export const useDeleteUsers = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: DeleteUserListRequestDto) => 
			userServiceApi.deleteUsers(data),
		onSuccess: () => {
			// 모든 사용자 관련 캐시 무효화
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.lists() 
			});
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.allCount() 
			});
		},
	});
};

/**
 * 유저 일괄 생성
 */
export const useBulkCreateUsers = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: BulkCreateUsersRequestDto) => 
			userServiceApi.bulkCreateUsers(data),
		onSuccess: () => {
			// 모든 사용자 관련 캐시 무효화
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.lists() 
			});
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.allCount() 
			});
		},
	});
};

/**
 * 유저 일괄 등록 템플릿 다운로드
 */
export const useDownloadBulkUploadTemplate = () => {
	return useMutation({
		mutationFn: () => userServiceApi.downloadBulkUploadTemplate(),
	});
};

/**
 * 유저 리스트 엑셀 추출
 */
export const useExportUserListExcel = () => {
	return useMutation({
		mutationFn: (data: ExportUserListExcelRequestDto) => 
			userServiceApi.exportUserListExcel(data),
	});
};

/**
 * 사용자 정보 수정 (관리자용)
 */
export const useUpdateUserInfo = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateUserInfoRequestDto) => 
			userServiceApi.updateUserInfo(data),
		onSuccess: () => {
			// 모든 사용자 관련 캐시 무효화
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.lists() 
			});
		},
	});
};

/**
 * 사용자 비밀번호 변경 (관리자용)
 */
export const useUpdateUserPassword = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId, password }: { userId: number; password: string }) => 
			userServiceApi.updateUserPassword(userId, password),
		onSuccess: () => {
			// 사용자 목록 캐시 무효화
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.lists() 
			});
		},
	});
};

/**
 * 슈퍼관리자용 유저 권한 변경
 */
export const useUpdateUserRoleByAdmin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: { userId: number; role: number }) =>
			userServiceApi.updateUserRoleByAdmin(data),
		onSuccess: () => {
			// 모든 사용자 관련 캐시 무효화
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.lists() 
			});
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.allCount() 
			});
		},
	});
};

/**
 * 기관관리자용 유저 권한 변경
 */
export const useUpdateUserRoleByOrganization = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: { userId: number; role: number }) =>
			userServiceApi.updateUserRoleByOrganization(data),
		onSuccess: () => {
			// 모든 사용자 관련 캐시 무효화
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.lists() 
			});
			queryClient.invalidateQueries({ 
				queryKey: userManagementKeys.allCount() 
			});
		},
	});
};
