/**
 * Organization React Query Hooks
 * 기관 관리 React Query 훅
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { organizationService, GetOrganizationListParams } from '../services/organizationService';
import type {
	GetOrganizationCountResponseDto,
	GetOrganizationListResponseDto,
	GetOrganizationDetailResponseDto,
	CreateOrganizationRequestDto,
	UpdateOrganizationBodyDto,
} from '../types/api';

// Query Keys
export const organizationKeys = {
	all: ['organizations'] as const,
	lists: () => [...organizationKeys.all, 'list'] as const,
	list: (params: GetOrganizationListParams) => [...organizationKeys.lists(), params] as const,
	details: () => [...organizationKeys.all, 'detail'] as const,
	detail: (id: number) => [...organizationKeys.details(), id] as const,
	count: () => [...organizationKeys.all, 'count'] as const,
	organizationTypes: () => ['organizationTypes'] as const,
	countries: () => ['countries'] as const,
	countryCallingCodes: () => ['countryCallingCodes'] as const,
};

/**
 * 기관 통계 조회
 */
export const useOrganizationCount = (
	options?: Omit<UseQueryOptions<GetOrganizationCountResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: organizationKeys.count(),
		queryFn: organizationService.getCount,
		staleTime: 0, // 항상 최신 데이터 가져오기 (통계 갱신을 위해)
		refetchOnWindowFocus: true, // 창 포커스 시 자동 refetch
		refetchOnMount: true, // 컴포넌트 마운트 시 항상 refetch
		...options,
	});
};

/**
 * 기관 리스트 조회
 */
export const useOrganizations = (
	params: GetOrganizationListParams,
	options?: Omit<UseQueryOptions<GetOrganizationListResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: organizationKeys.list(params),
		queryFn: () => organizationService.getList(params),
		staleTime: 0, // 항상 최신 데이터 가져오기 (등록 후 즉시 반영)
		refetchOnWindowFocus: true, // 창 포커스 시 자동 refetch
		refetchOnMount: true, // 컴포넌트 마운트 시 항상 refetch
		...options,
	});
};

/**
 * 기관 상세 조회
 */
export const useOrganizationDetail = (
	organizationId: number,
	options?: Omit<UseQueryOptions<GetOrganizationDetailResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: organizationKeys.detail(organizationId),
		queryFn: () => organizationService.getDetail(organizationId),
		enabled: !!organizationId,
		staleTime: 5 * 60 * 1000, // 5분
		...options,
	});
};

/**
 * 기관 생성
 */
export const useCreateOrganization = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateOrganizationRequestDto) => organizationService.create(data),
		onSuccess: () => {
			// 기관 목록 및 통계 캐시 무효화 (모든 파라미터 조합 포함)
			queryClient.invalidateQueries({ 
				queryKey: organizationKeys.lists(),
				exact: false // 모든 하위 쿼리 무효화
			});
			queryClient.invalidateQueries({ 
				queryKey: organizationKeys.count() 
			});
			// 즉시 refetch 실행
			queryClient.refetchQueries({ 
				queryKey: organizationKeys.lists(),
				exact: false // 모든 하위 쿼리 refetch
			});
			queryClient.refetchQueries({ 
				queryKey: organizationKeys.count() 
			});
		},
	});
};

/**
 * 기관 수정
 */
export const useUpdateOrganization = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			organizationId,
			data,
		}: {
			organizationId: number;
			data: UpdateOrganizationBodyDto;
		}) => organizationService.update(organizationId, data),
		onSuccess: (_result, variables) => {
			// 수정된 기관의 상세 및 목록 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: organizationKeys.detail(variables.organizationId),
			});
			queryClient.invalidateQueries({ 
				queryKey: organizationKeys.lists(),
				exact: false
			});
			queryClient.invalidateQueries({ queryKey: organizationKeys.count() });
			queryClient.refetchQueries({ 
				queryKey: organizationKeys.lists(),
				exact: false
			});
			queryClient.refetchQueries({ queryKey: organizationKeys.count() });
		},
	});
};

/**
 * 기관 삭제
 */
export const useDeleteOrganization = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (organizationId: number) => {
			// 엄격한 타입 검증
			if (typeof organizationId !== 'number' || isNaN(organizationId)) {
				throw new Error('기관 ID는 유효한 숫자여야 합니다.');
			}
			if (organizationId <= 0 || !Number.isInteger(organizationId)) {
				throw new Error('기관 ID는 양의 정수여야 합니다.');
			}
			
			return organizationService.delete(organizationId);
		},
		onSuccess: () => {
			// 기관 목록 및 통계 캐시 무효화
			queryClient.invalidateQueries({ 
				queryKey: organizationKeys.lists(),
				exact: false
			});
			queryClient.invalidateQueries({ queryKey: organizationKeys.count() });
			queryClient.refetchQueries({ 
				queryKey: organizationKeys.lists(),
				exact: false
			});
			queryClient.refetchQueries({ queryKey: organizationKeys.count() });
		},
	});
};

/**
 * 기관 유형 리스트 조회
 */
export const useOrganizationTypes = () => {
	return useQuery({
		queryKey: organizationKeys.organizationTypes(),
		queryFn: organizationService.getOrganizationTypes,
		staleTime: Infinity, // 마스터 데이터는 거의 변경되지 않음
	});
};

/**
 * 국가 리스트 조회
 */
export const useCountries = () => {
	return useQuery({
		queryKey: organizationKeys.countries(),
		queryFn: organizationService.getCountries,
		staleTime: Infinity, // 마스터 데이터는 거의 변경되지 않음
	});
};

/**
 * 국가 전화번호 코드 리스트 조회
 */
export const useCountryCallingCodes = () => {
	return useQuery({
		queryKey: organizationKeys.countryCallingCodes(),
		queryFn: organizationService.getCountryCallingCodes,
		staleTime: Infinity, // 마스터 데이터는 거의 변경되지 않음
	});
};
