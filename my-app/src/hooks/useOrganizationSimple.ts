/**
 * Organization Simple List React Query Hook
 * 간소화된 기관 목록 조회 훅
 * 
 * @description
 * 드롭다운, 필터 등에서 사용하는 간소화된 기관 목록 (id, name만)
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';

/**
 * 간소화된 기관 정보 타입
 */
export interface OrganizationSimple {
	id: number;
	name: string;
}

/**
 * API 응답 타입
 */
export interface GetOrganizationSimpleListResponseDto {
	organizations: OrganizationSimple[];
}

/**
 * Query Keys (queryClient의 표준 키 사용)
 */
export const organizationSimpleKeys = queryKeys.organization;

/**
 * Mock API 함수 (Real API 준비될 때까지 사용)
 */
const fetchOrganizationSimpleList = async (): Promise<GetOrganizationSimpleListResponseDto> => {
	// TODO: Real API 연동 시 교체
	// return apiClient.get<GetOrganizationSimpleListResponseDto>('/organizations/simple');
	
	// Mock 데이터
	const { organizationSimpleList } = await import('../data/organizationSimple');
	
	// API 응답 시뮬레이션 (0.5초 지연)
	await new Promise(resolve => setTimeout(resolve, 500));
	
	return {
		organizations: organizationSimpleList
	};
};

/**
 * 간소화된 기관 목록 조회 Hook
 * 
 * @usage
 * ```tsx
 * const { data, isLoading, error } = useOrganizationSimpleList();
 * 
 * // 드롭다운에 사용
 * <select>
 *   {data?.organizations.map(org => (
 *     <option key={org.id} value={org.id}>{org.name}</option>
 *   ))}
 * </select>
 * ```
 */
export const useOrganizationSimpleList = (
	options?: Omit<UseQueryOptions<GetOrganizationSimpleListResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: organizationSimpleKeys.simple(),
		queryFn: fetchOrganizationSimpleList,
		staleTime: 10 * 60 * 1000, // 10분 (기관 목록은 자주 변경되지 않음)
		...options,
	});
};
