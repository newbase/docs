/**
 * Scenario React Query Hooks
 * 시나리오 관리 React Query 훅
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
	getScenarioListByUserId,
	getScenarioAdminList,
	getScenarioDetail,
	createScenario,
	getScenarioPlayRecords,
	type GetScenarioPlayRecordParams,
} from '../services/scenarioService';
import type {
	GetScenarioListByUserIdResponseDto,
	GetScenarioDetailResponseDto,
	CreateScenarioRequestDto,
	CreateScenarioResponseDto,
	GetScenarioAdminListResponseDto,
	GetScenarioPlayRecordResponseDto,
} from '../types/api/scenario';

// Query Keys
export const scenarioKeys = {
	all: ['scenarios'] as const,
	lists: () => [...scenarioKeys.all, 'list'] as const,
	byUserId: (params: { page: number; pageSize: number }) => [...scenarioKeys.lists(), 'userId', params] as const,
	adminList: (params: Record<string, any>) => [...scenarioKeys.lists(), 'admin', params] as const,
	playRecords: (params?: GetScenarioPlayRecordParams) =>
		[...scenarioKeys.all, 'playRecord', params ?? {}] as const,
	details: () => [...scenarioKeys.all, 'detail'] as const,
	detail: (scenarioId: number) => [...scenarioKeys.details(), scenarioId] as const,
};

/**
 * 본인이 생성한 시나리오 목록 조회
 * ⚠️ Admin 페이지에는 부적합 (본인 시나리오만 조회)
 */
export const useScenarioListByUserId = (
	params: {
		page: number;
		pageSize: number;
	},
	options?: Omit<UseQueryOptions<GetScenarioListByUserIdResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: scenarioKeys.byUserId(params),
		queryFn: () => getScenarioListByUserId(params),
		enabled: params.page > 0 && params.pageSize > 0,
		staleTime: 3 * 60 * 1000, // 3분
		...options,
	});
};

/**
 * Admin용 시나리오 목록 조회
 * Real API 사용 (GET /scenario/admin/list)
 */
export const useScenarioAdminList = (
	params: {
		page: number;
		pageSize: number;
		status?: string;
		category?: string;
		platform?: string;
		search?: string;
		startDate?: string;
		endDate?: string;
	},
	options?: Omit<UseQueryOptions<GetScenarioAdminListResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: scenarioKeys.adminList(params),
		queryFn: () => getScenarioAdminList(params),
		enabled: options?.enabled !== false, // 기본적으로 활성화, options에서 false로 설정 가능
		staleTime: 3 * 60 * 1000, // 3분
		retry: false, // 에러 발생 시 재시도하지 않음
		...options,
	});
};

/**
 * 시나리오 상세 조회
 * ✅ 사용 가능
 */
export const useScenarioDetail = (
	scenarioId: number,
	options?: Omit<UseQueryOptions<GetScenarioDetailResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: scenarioKeys.detail(scenarioId),
		queryFn: () => getScenarioDetail(scenarioId),
		enabled: !!scenarioId && (options?.enabled !== false),
		staleTime: 5 * 60 * 1000, // 5분
		...options,
	});
};

/**
 * 시나리오 생성
 * ✅ 사용 가능
 */
export const useCreateScenario = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateScenarioRequestDto) => createScenario(data),
		onSuccess: () => {
			// 시나리오 목록 캐시 무효화
			queryClient.invalidateQueries({ queryKey: scenarioKeys.lists() });
		},
	});
};

/**
 * 시나리오 플레이 기록 조회
 * Phase 11: GET /scenario-play-record
 */
export const useScenarioPlayRecords = (
	params?: GetScenarioPlayRecordParams,
	options?: Omit<
		UseQueryOptions<GetScenarioPlayRecordResponseDto>,
		'queryKey' | 'queryFn'
	>
) => {
	return useQuery({
		queryKey: scenarioKeys.playRecords(params),
		queryFn: () => getScenarioPlayRecords(params),
		staleTime: 2 * 60 * 1000, // 2분
		...options,
	});
};
