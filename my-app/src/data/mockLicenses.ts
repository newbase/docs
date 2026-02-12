/**
 * Mock License Data (Backend DTO Format)
 * 백엔드 API 스펙에 맞춘 Mock 라이센스 데이터
 * 
 * @see LicenseDetailDto in types/api/license.d.ts
 */

import { LicenseDetailDto } from '@/types/api/license';

/**
 * Mock 라이센스 데이터
 * 백엔드 API 응답 형식에 맞춰 작성
 */
export const mockLicenses: LicenseDetailDto[] = [
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
		startAt: '2024-09-01T00:00:00.000Z',
		endAt: '2025-12-31T23:59:59.999Z',
		status: 'EXPIRING_SOON',
		createdAt: '2024-08-25T14:20:00.000Z',
		plan: 'BASIC',
		validityPeriod: 15,
		validityPeriodUnit: 'MONTH',
		curriculumIdList: [6, 7],
	},
	{
		organizationLicenseId: 5,
		scenarioTitle: '간호수행 시뮬레이션',
		type: 'USER',
		quantity: 80,
		startAt: '2024-07-01T00:00:00.000Z',
		endAt: '2025-06-30T23:59:59.999Z',
		status: 'ACTIVE',
		createdAt: '2024-06-25T09:45:00.000Z',
		plan: 'PRO',
		validityPeriod: 12,
		validityPeriodUnit: 'MONTH',
		curriculumIdList: [8, 9, 10],
	},
	{
		organizationLicenseId: 6,
		scenarioTitle: '심폐소생술 기본 과정',
		type: 'USER',
		quantity: 20,
		startAt: '2024-11-01T00:00:00.000Z',
		endAt: '2025-10-31T23:59:59.999Z',
		status: 'ACTIVE',
		createdAt: '2024-10-28T11:30:00.000Z',
		plan: 'BASIC',
		validityPeriod: 12,
		validityPeriodUnit: 'MONTH',
		curriculumIdList: [11],
	},
	{
		organizationLicenseId: 7,
		scenarioTitle: 'VR 의료 시뮬레이션',
		type: 'DEVICE',
		quantity: undefined,
		startAt: '2024-05-15T00:00:00.000Z',
		endAt: '2025-05-14T23:59:59.999Z',
		status: 'ACTIVE',
		createdAt: '2024-05-10T13:00:00.000Z',
		plan: 'PRO',
		validityPeriod: 12,
		validityPeriodUnit: 'MONTH',
		curriculumIdList: [12, 13, 14],
	},
	{
		organizationLicenseId: 8,
		scenarioTitle: '평생 라이센스 패키지',
		type: 'LIFETIME',
		quantity: undefined,
		startAt: '2023-01-01T00:00:00.000Z',
		endAt: undefined, // 평생 라이센스는 종료일 없음
		status: 'ACTIVE',
		createdAt: '2022-12-20T10:00:00.000Z',
		plan: 'PRO',
		validityPeriod: undefined,
		validityPeriodUnit: undefined,
		curriculumIdList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
	},
	{
		organizationLicenseId: 9,
		scenarioTitle: '데모 라이센스',
		type: 'DEMO',
		quantity: 5,
		startAt: '2024-12-01T00:00:00.000Z',
		endAt: '2024-12-31T23:59:59.999Z',
		status: 'EXPIRED',
		createdAt: '2024-11-28T15:00:00.000Z',
		plan: 'BASIC',
		validityPeriod: 1,
		validityPeriodUnit: 'MONTH',
		curriculumIdList: [1, 2],
	},
	{
		organizationLicenseId: 10,
		scenarioTitle: '중환자실 관리 시뮬레이션',
		type: 'USER',
		quantity: 40,
		startAt: '2024-08-15T00:00:00.000Z',
		endAt: '2025-08-14T23:59:59.999Z',
		status: 'ACTIVE',
		createdAt: '2024-08-10T16:30:00.000Z',
		plan: 'PRO',
		validityPeriod: 12,
		validityPeriodUnit: 'MONTH',
		curriculumIdList: [15, 16],
	},
];

/**
 * Mock API 함수: 라이센스 목록 조회
 * 실제 API처럼 느껴지도록 지연 추가
 * 
 * @returns 라이센스 목록
 */
export const mockFetchLicenseList = async (): Promise<LicenseDetailDto[]> => {
	// 실제 API처럼 느껴지도록 700-1200ms 지연
	await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 500));
	
	return [...mockLicenses];
};

/**
 * Mock API 함수: 특정 기관의 라이센스 목록 조회
 * 실제 API처럼 느껴지도록 지연 추가
 * 
 * @param organizationId - 기관 ID
 * @returns 해당 기관의 라이센스 목록
 */
export const mockFetchLicenseListByOrganization = async (
	organizationId: number
): Promise<LicenseDetailDto[]> => {
	// 실제 API처럼 느껴지도록 600-1000ms 지연
	await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
	
	const licenseIds = getMockLicenseIdsByOrganizationIdSync(organizationId);
	return mockLicenses.filter(license => licenseIds.includes(license.organizationLicenseId));
};

/**
 * 기관별 라이센스 ID 매핑 (동기, 상세 페이지 mock fallback용)
 */
export const getMockLicenseIdsByOrganizationIdSync = (organizationId: number): number[] => {
	const orgLicenseMap: Record<number, number[]> = {
		1: [1, 2],   // 서울대학교병원
		2: [3],      // 연세대학교병원
		3: [4, 5],   // 삼성서울병원
		4: [6],      // 서울아산병원
		5: [7],      // 강남세브란스병원
		6: [8],      // 고려대학교 의과대학
		7: [9],      // 서울대학교 간호대학
		8: [10],     // 대한적십자사
		9: [1, 5],   // 가톨릭대학교 의과대학
		10: [2, 6],  // 분당서울대병원
		11: [4],     // 경희대학교병원
		12: [3, 7],  // 한양대학교 간호대학
		13: [8],     // 국립중앙의료원
		14: [1, 10], // 차의과학대학교
		15: [2, 5],  // 인하대학교병원
	};
	return orgLicenseMap[organizationId] ?? [];
};

/**
 * 기관별 라이센스 목록 (동기) - 상세 페이지 mock fallback용
 */
export const getMockLicensesByOrganizationIdSync = (organizationId: number): LicenseDetailDto[] => {
	const ids = getMockLicenseIdsByOrganizationIdSync(organizationId);
	return mockLicenses.filter(l => ids.includes(l.organizationLicenseId));
};
