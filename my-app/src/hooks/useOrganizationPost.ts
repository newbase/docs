/**
 * 기관 게시글 React Query Hooks (Phase 4)
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
	getOrganizationPostList,
	createOrganizationPost,
	updateOrganizationPost,
	deleteOrganizationPost,
} from '../services/organizationPostService';
import type {
	GetOrganizationPostListResponseDto,
	CreateOrganizationPostRequestDto,
	UpdateOrganizationPostRequestDto,
} from '../types/api/organization-post';

export const organizationPostKeys = {
	all: ['organizationPosts'] as const,
	lists: () => [...organizationPostKeys.all, 'list'] as const,
	list: (organizationId: number, page: number, pageSize: number) =>
		[...organizationPostKeys.lists(), organizationId, page, pageSize] as const,
};

const POSTS_PER_PAGE = 10;

/**
 * 기관별 게시글 목록 조회
 */
export function useOrganizationPostList(
	organizationId: number,
	page: number = 1,
	pageSize: number = POSTS_PER_PAGE,
	options?: Omit<
		UseQueryOptions<GetOrganizationPostListResponseDto>,
		'queryKey' | 'queryFn'
	>
) {
	return useQuery({
		queryKey: organizationPostKeys.list(organizationId, page, pageSize),
		queryFn: () =>
			getOrganizationPostList({ organizationId, page, pageSize }),
		enabled: organizationId > 0,
		staleTime: 2 * 60 * 1000,
		...options,
	});
}

/**
 * 기관 게시글 생성
 */
export function useCreateOrganizationPost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateOrganizationPostRequestDto) =>
			createOrganizationPost(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: organizationPostKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: organizationPostKeys.list(variables.organizationId, 1, POSTS_PER_PAGE),
			});
		},
	});
}

/**
 * 기관 게시글 수정
 */
export function useUpdateOrganizationPost(organizationId: number) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			organizationPostId,
			data,
		}: {
			organizationPostId: number;
			data: UpdateOrganizationPostRequestDto;
		}) => updateOrganizationPost(organizationPostId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: organizationPostKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: organizationPostKeys.list(organizationId, 1, POSTS_PER_PAGE),
			});
		},
	});
}

/**
 * 기관 게시글 삭제
 */
export function useDeleteOrganizationPost(organizationId: number) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (organizationPostId: number) =>
			deleteOrganizationPost(organizationPostId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: organizationPostKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: organizationPostKeys.list(organizationId, 1, POSTS_PER_PAGE),
			});
		},
	});
}
