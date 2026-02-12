/**
 * License List React Query Hook
 * 라이센스 목록 조회 훅
 * 
 * @description
 * 전체 라이센스 목록 조회
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { LicenseDetailDto, GetLicenseListResponseDto } from '@/types/api/license';
import { queryKeys } from '@/lib/queryClient';

/**
 * Query Keys (queryClient의 표준 키 사용)
 */
export const licenseKeys = queryKeys.license;

/**
 * Mock API 함수 (Real API 준비될 때까지 사용)
 */
const fetchLicenseList = async (): Promise<GetLicenseListResponseDto> => {
	// TODO: Real API 연동 시 교체
	// return apiClient.get<GetLicenseListResponseDto>('/admin/licenses');
	
	// Mock 데이터
	await new Promise(resolve => setTimeout(resolve, 800));
	
	// Mock license data
	const mockLicenses: LicenseDetailDto[] = [
		{
			organizationLicenseId: 1,
			scenarioTitle: '응급의학 시뮬레이션 패키지',
			type: 'USER',
			quantity: 50,
			startAt: '2024-01-15T00:00:00.000Z',
			endAt: '2025-01-14T23:59:59.999Z',
			status: 'ACTIVE',
			createdAt: '2024-01-10T05:30:00.000Z',
			plan: 'PRO',
			validityPeriod: 12,
			validityPeriodUnit: 'MONTH',
			curriculumIdList: [1, 2, 3],
		},
		{
			organizationLicenseId: 2,
			scenarioTitle: '기본 간호 실습 프로그램',
			type: 'DEVICE',
			quantity: undefined, // 기기 라이센스는 수량 무제한
			startAt: '2024-03-01T00:00:00.000Z',
			endAt: '2025-02-28T23:59:59.999Z',
			status: 'ACTIVE',
			createdAt: '2024-02-25T10:00:00.000Z',
			plan: 'BASIC',
			validityPeriod: 12,
			validityPeriodUnit: 'MONTH',
			curriculumIdList: [4, 5],
		},
		{
			organizationLicenseId: 3,
			scenarioTitle: '고급 시뮬레이션 풀패키지',
			type: 'USER',
			quantity: 100,
			startAt: '2023-06-01T00:00:00.000Z',
			endAt: '2024-05-31T23:59:59.999Z',
			status: 'EXPIRED',
			createdAt: '2023-05-28T08:15:00.000Z',
			plan: 'PRO',
			validityPeriod: 12,
			validityPeriodUnit: 'MONTH',
			curriculumIdList: [1, 2, 3, 4, 5],
		},
		{
			organizationLicenseId: 4,
			scenarioTitle: '수술실 시뮬레이션',
			type: 'USER',
			quantity: 30,
			startAt: '2024-12-01T00:00:00.000Z',
			endAt: '2025-02-28T23:59:59.999Z',
			status: 'EXPIRING_SOON',
			createdAt: '2024-11-28T14:20:00.000Z',
			plan: 'PRO',
			validityPeriod: 3,
			validityPeriodUnit: 'MONTH',
			curriculumIdList: [6, 7],
		},
		{
			organizationLicenseId: 5,
			scenarioTitle: 'DEMO 체험 라이센스',
			type: 'DEMO',
			quantity: 10,
			startAt: '2024-01-20T00:00:00.000Z',
			endAt: '2024-02-19T23:59:59.999Z',
			status: 'EXPIRED',
			createdAt: '2024-01-19T12:00:00.000Z',
			plan: 'BASIC',
			validityPeriod: 1,
			validityPeriodUnit: 'MONTH',
			curriculumIdList: [1],
		},
		{
			organizationLicenseId: 6,
			scenarioTitle: '평생 라이센스 - 교육기관',
			type: 'LIFETIME',
			quantity: undefined,
			startAt: '2023-01-01T00:00:00.000Z',
			endAt: undefined,
			status: 'ACTIVE',
			createdAt: '2022-12-20T09:00:00.000Z',
			plan: 'PRO',
			validityPeriod: undefined,
			validityPeriodUnit: undefined,
			curriculumIdList: [1, 2, 3, 4, 5, 6, 7, 8],
		},
		{
			organizationLicenseId: 7,
			scenarioTitle: '중환자실 케어 프로그램',
			type: 'USER',
			quantity: 25,
			startAt: '2024-09-01T00:00:00.000Z',
			endAt: '2025-08-31T23:59:59.999Z',
			status: 'ACTIVE',
			createdAt: '2024-08-28T11:30:00.000Z',
			plan: 'PRO',
			validityPeriod: 12,
			validityPeriodUnit: 'MONTH',
			curriculumIdList: [8, 9, 10],
		},
		{
			organizationLicenseId: 8,
			scenarioTitle: '기초 실습 패키지',
			type: 'DEVICE',
			quantity: undefined,
			startAt: '2024-11-01T00:00:00.000Z',
			endAt: '2025-10-31T23:59:59.999Z',
			status: 'ACTIVE',
			createdAt: '2024-10-28T15:45:00.000Z',
			plan: 'BASIC',
			validityPeriod: 12,
			validityPeriodUnit: 'MONTH',
			curriculumIdList: [1, 4],
		},
	];
	
	return {
		licenseList: mockLicenses,
		totalCount: mockLicenses.length,
	};
};

/**
 * 전체 라이센스 목록 조회 Hook
 * 
 * @usage
 * ```tsx
 * const { data, isLoading, error } = useLicenseList();
 * 
 * // 테이블에 표시
 * {data?.licenseList.map(license => (
 *   <tr key={license.organizationLicenseId}>
 *     <td>{license.scenarioTitle}</td>
 *     <td>{license.type}</td>
 *   </tr>
 * ))}
 * ```
 */
export const useLicenseList = (
	options?: Omit<UseQueryOptions<GetLicenseListResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: licenseKeys.list(),
		queryFn: fetchLicenseList,
		staleTime: 5 * 60 * 1000, // 5분
		...options,
	});
};
