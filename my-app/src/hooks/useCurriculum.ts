/**
 * Curriculum React Query Hooks
 * Phase 9: 커리큘럼 관리
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
	getCurriculumList,
	getCurriculumListByOrganization,
	getCurriculumDetail,
	createCurriculum,
	updateCurriculum,
	GetCurriculumListParams,
	GetCurriculumListByOrganizationParams,
} from '../services/curriculumService';
import type {
	GetCurriculumListResponseDto,
	GetCurriculumDetailResponseDto,
	CreateCurriculumRequestDto,
	CreateCurriculumResponseDto,
	UpdateCurriculumRequestDto,
	UpdateCurriculumResponseDto,
} from '../types/api/curriculum';
import type { GetCurriculumListByOrganizationResponseDto } from '../types/api/license';

export const curriculumKeys = {
	all: ['curriculum'] as const,
	lists: () => [...curriculumKeys.all, 'list'] as const,
	list: (params: GetCurriculumListParams) => [...curriculumKeys.lists(), params] as const,
	listByOrganization: (params: GetCurriculumListByOrganizationParams) =>
		[...curriculumKeys.lists(), 'organization', params] as const,
	details: () => [...curriculumKeys.all, 'detail'] as const,
	detail: (id: number) => [...curriculumKeys.details(), id] as const,
};

/**
 * 커리큘럼 리스트 조회
 * GET /curriculum/list
 */
export const useCurriculumList = (
	params: GetCurriculumListParams,
	options?: Omit<UseQueryOptions<GetCurriculumListResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: curriculumKeys.list(params),
		queryFn: () => getCurriculumList(params),
		staleTime: 3 * 60 * 1000,
		...options,
	});
};

/**
 * 기관별 커리큘럼 리스트 조회
 * GET /curriculum/organization/list
 */
export const useCurriculumListByOrganization = (
	params: GetCurriculumListByOrganizationParams,
	options?: Omit<
		UseQueryOptions<GetCurriculumListByOrganizationResponseDto>,
		'queryKey' | 'queryFn'
	>
) => {
	return useQuery({
		queryKey: curriculumKeys.listByOrganization(params),
		queryFn: () => getCurriculumListByOrganization(params),
		enabled: !!params.organizationId,
		staleTime: 3 * 60 * 1000,
		...options,
	});
};

/**
 * 커리큘럼 상세 조회
 * GET /curriculum/{curriculumId}
 */
export const useCurriculumDetail = (
	curriculumId: number,
	options?: Omit<UseQueryOptions<GetCurriculumDetailResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: curriculumKeys.detail(curriculumId),
		queryFn: () => getCurriculumDetail(curriculumId),
		enabled: !!curriculumId && curriculumId > 0,
		staleTime: 5 * 60 * 1000,
		...options,
	});
};

/**
 * 커리큘럼 생성
 * POST /curriculum
 */
export const useCreateCurriculum = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCurriculumRequestDto) => createCurriculum(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: curriculumKeys.lists(), exact: false });
		},
	});
};

/**
 * 커리큘럼 수정
 * PUT /curriculum/{curriculumId}
 */
export const useUpdateCurriculum = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			curriculumId,
			data,
		}: {
			curriculumId: number;
			data: UpdateCurriculumRequestDto;
		}) => updateCurriculum(curriculumId, data),
		onSuccess: (_result, variables) => {
			queryClient.invalidateQueries({
				queryKey: curriculumKeys.detail(variables.curriculumId),
			});
			queryClient.invalidateQueries({ queryKey: curriculumKeys.lists(), exact: false });
		},
	});
};
