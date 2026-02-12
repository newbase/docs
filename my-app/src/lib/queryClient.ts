/**
 * React Query Client Configuration
 * React Query 전역 설정 및 에러 핸들링
 */

import { QueryClient, QueryClientConfig } from '@tanstack/react-query';
import { handleApiError } from '@/utils/errorHandlers';

/**
 * React Query 기본 설정
 */
const defaultQueryClientConfig: QueryClientConfig = {
	defaultOptions: {
		queries: {
			// 재시도 설정
			retry: (failureCount, error: any) => {
				// 특정 에러 코드는 재시도하지 않음
				const noRetryStatuses = [400, 401, 403, 404, 422];
				
				if (error?.status && noRetryStatuses.includes(error.status)) {
					return false;
				}
				
				// 최대 1번만 재시도
				return failureCount < 1;
			},
			
			// 재시도 지연 시간 (지수 백오프)
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
			
			// 창 포커스 시 자동 리페치 비활성화
			refetchOnWindowFocus: false,
			
			// 마운트 시 자동 리페치 비활성화 (필요시 개별 설정)
			refetchOnMount: false,
			
			// 네트워크 재연결 시 자동 리페치
			refetchOnReconnect: true,
			
			// 기본 staleTime: 30초
			staleTime: 30 * 1000,
			
			// 기본 gcTime: 5분 (React Query v5에서 cacheTime → gcTime으로 변경)
			gcTime: 5 * 60 * 1000,
		},
		
		mutations: {
			// 재시도 설정 (Mutation은 기본적으로 재시도하지 않음)
			retry: false,
		},
	},
};

/**
 * React Query Client 인스턴스
 * 
 * @usage
 * ```tsx
 * import { QueryClientProvider } from '@tanstack/react-query';
 * import { queryClient } from '@/lib/queryClient';
 * 
 * function App() {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <YourApp />
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 */
export const queryClient = new QueryClient(defaultQueryClientConfig);

/**
 * 전역 에러 핸들링 설정 (React Query v5 방식)
 * queryCache와 mutationCache에 이벤트 리스너 추가
 */
queryClient.getQueryCache().subscribe((event) => {
	// Query가 업데이트되었을 때 에러 상태 확인
	if (event?.type === 'updated' && event.query.state.status === 'error') {
		const error = event.query.state.error;
		
		// 개발 환경에서만 콘솔 로그
		if (process.env.NODE_ENV === 'development') {
			console.error('[React Query - Query Error]', error);
		}
		
		// 401 에러 (토큰 만료 또는 세션 없음) 처리
		if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
			// 토큰 제거 및 로그인 페이지로 리다이렉트
			if (typeof window !== 'undefined') {
				const currentPath = window.location.pathname + window.location.search;
				window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=token_expired`;
			}
			return;
		}
		
		// 에러 메시지 추출 (사용자에게 보여주기 위해)
		const errorInfo = handleApiError(error);
		
		// 여기서 Toast나 전역 에러 상태로 처리 가능
		// 예: toast.error(errorInfo.message);
		// 현재는 컴포넌트 레벨에서 처리하도록 로그만 남김
	}
});

queryClient.getMutationCache().subscribe((event) => {
	// Mutation이 업데이트되었을 때 에러 상태 확인
	if (event?.type === 'updated' && event.mutation.state.status === 'error') {
		const error = event.mutation.state.error;
		
		// 개발 환경에서만 콘솔 로그
		if (process.env.NODE_ENV === 'development') {
			console.error('[React Query - Mutation Error]', error);
		}
		
		// 401 에러 (토큰 만료 또는 세션 없음) 처리
		if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
			// 토큰 제거 및 로그인 페이지로 리다이렉트
			if (typeof window !== 'undefined') {
				const currentPath = window.location.pathname + window.location.search;
				window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=token_expired`;
			}
			return;
		}
		
		// 에러 메시지 추출
		const errorInfo = handleApiError(error);
		
		// 여기서 Toast나 전역 에러 상태로 처리 가능
		// 예: toast.error(errorInfo.message);
	} else if (event?.type === 'updated' && event.mutation.state.status === 'success') {
		// 개발 환경에서만 콘솔 로그
		if (process.env.NODE_ENV === 'development') {
			console.log('[React Query - Mutation Success]');
		}
	}
});

/**
 * Query Key Factory
 * 일관된 Query Key 생성을 위한 헬퍼
 * 
 * @usage
 * ```tsx
 * const { data } = useQuery({
 *   queryKey: queryKeys.user.detail(userId),
 *   queryFn: () => fetchUser(userId),
 * });
 * ```
 */
export const queryKeys = {
	// User 관련
	user: {
		all: ['users'] as const,
		lists: () => [...queryKeys.user.all, 'list'] as const,
		list: (filters?: Record<string, any>) => [...queryKeys.user.lists(), filters] as const,
		details: () => [...queryKeys.user.all, 'detail'] as const,
		detail: (id: string | number) => [...queryKeys.user.details(), id] as const,
	},
	
	// Organization 관련
	organization: {
		all: ['organizations'] as const,
		lists: () => [...queryKeys.organization.all, 'list'] as const,
		list: (filters?: Record<string, any>) => [...queryKeys.organization.lists(), filters] as const,
		details: () => [...queryKeys.organization.all, 'detail'] as const,
		detail: (id: string | number) => [...queryKeys.organization.details(), id] as const,
		simple: () => [...queryKeys.organization.all, 'simple'] as const,
	},
	
	// License 관련
	license: {
		all: ['licenses'] as const,
		lists: () => [...queryKeys.license.all, 'list'] as const,
		list: (filters?: Record<string, any>) => [...queryKeys.license.lists(), filters] as const,
		details: () => [...queryKeys.license.all, 'detail'] as const,
		detail: (id: string | number) => [...queryKeys.license.details(), id] as const,
	},
	
	// Scenario 관련
	scenario: {
		all: ['scenarios'] as const,
		lists: () => [...queryKeys.scenario.all, 'list'] as const,
		list: (filters?: Record<string, any>) => [...queryKeys.scenario.lists(), filters] as const,
		details: () => [...queryKeys.scenario.all, 'detail'] as const,
		detail: (id: string | number) => [...queryKeys.scenario.details(), id] as const,
	},
	
	// 필요한 다른 엔티티 추가...
} as const;

/**
 * Query Cache 무효화 헬퍼
 * 
 * @usage
 * ```tsx
 * // 특정 사용자 데이터 무효화
 * invalidateQueries.user.detail(userId);
 * 
 * // 모든 사용자 목록 무효화
 * invalidateQueries.user.lists();
 * ```
 */
export const invalidateQueries = {
	user: {
		all: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.all }),
		lists: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.lists() }),
		detail: (id: string | number) => queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(id) }),
	},
	organization: {
		all: () => queryClient.invalidateQueries({ queryKey: queryKeys.organization.all }),
		lists: () => queryClient.invalidateQueries({ queryKey: queryKeys.organization.lists() }),
		detail: (id: string | number) => queryClient.invalidateQueries({ queryKey: queryKeys.organization.detail(id) }),
	},
	license: {
		all: () => queryClient.invalidateQueries({ queryKey: queryKeys.license.all }),
		lists: () => queryClient.invalidateQueries({ queryKey: queryKeys.license.lists() }),
		detail: (id: string | number) => queryClient.invalidateQueries({ queryKey: queryKeys.license.detail(id) }),
	},
	scenario: {
		all: () => queryClient.invalidateQueries({ queryKey: queryKeys.scenario.all }),
		lists: () => queryClient.invalidateQueries({ queryKey: queryKeys.scenario.lists() }),
		detail: (id: string | number) => queryClient.invalidateQueries({ queryKey: queryKeys.scenario.detail(id) }),
	},
} as const;

/**
 * Prefetch 헬퍼
 * 
 * @usage
 * ```tsx
 * // 사용자 상세 데이터 미리 로드
 * await prefetchQuery.user.detail(userId, () => fetchUser(userId));
 * ```
 */
export const prefetchQuery = {
	user: {
		detail: async (id: string | number, queryFn: () => Promise<any>) => {
			await queryClient.prefetchQuery({
				queryKey: queryKeys.user.detail(id),
				queryFn,
			});
		},
	},
	organization: {
		detail: async (id: string | number, queryFn: () => Promise<any>) => {
			await queryClient.prefetchQuery({
				queryKey: queryKeys.organization.detail(id),
				queryFn,
			});
		},
	},
	license: {
		detail: async (id: string | number, queryFn: () => Promise<any>) => {
			await queryClient.prefetchQuery({
				queryKey: queryKeys.license.detail(id),
				queryFn,
			});
		},
	},
} as const;
