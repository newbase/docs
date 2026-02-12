/**
 * Mock Organization Data (Backend DTO Format)
 * 백엔드 API 스펙에 맞춘 Mock 기관 데이터
 * 
 * @see GetOrganizationDetailResponseDto in types/api/organization.d.ts
 */

import { GetOrganizationDetailResponseDto } from '@/types/api/organization';

/**
 * Mock 기관 상세 데이터
 * 백엔드 API 응답 형식에 맞춰 작성
 */
export const mockOrganizations: GetOrganizationDetailResponseDto[] = [
	{
		organizationId: 1,
		title: '서울대학교병원',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 1,
			title: '종합병원',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00001',
		managerName: '김원장',
		department: '의료정보팀',
		phoneNumber: '010-1234-5678',
		email: 'director.kim@snuh.org',
		createdAt: '2025-01-15T09:00:00.000Z',
		licenseStatus: 'ACTIVE',
	},
	{
		organizationId: 2,
		title: '연세대학교병원',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 1,
			title: '종합병원',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00002',
		managerName: '이교수',
		department: '교육연수팀',
		phoneNumber: '010-2345-6789',
		email: 'prof.lee@yuhs.ac',
		createdAt: '2025-02-20T10:00:00.000Z',
		licenseStatus: 'ACTIVE',
	},
	{
		organizationId: 3,
		title: '삼성서울병원',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 1,
			title: '종합병원',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00003',
		managerName: '박원장',
		department: '시뮬레이션센터',
		phoneNumber: '010-3456-7890',
		email: 'director.park@samsung.hospital',
		createdAt: '2025-03-10T11:00:00.000Z',
		licenseStatus: 'ACTIVE',
	},
	{
		organizationId: 4,
		title: '서울아산병원',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 1,
			title: '종합병원',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00004',
		managerName: '최교수',
		department: '응급의학과',
		phoneNumber: '010-4567-8901',
		email: 'prof.choi@amc.seoul.kr',
		createdAt: '2025-04-05T12:00:00.000Z',
		licenseStatus: 'ACTIVE',
	},
	{
		organizationId: 5,
		title: '강남세브란스병원',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 1,
			title: '종합병원',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00005',
		managerName: '정간호사',
		department: '간호교육팀',
		phoneNumber: '010-5678-9012',
		email: 'nurse.jung@yuhs.ac',
		createdAt: '2024-05-12T13:00:00.000Z',
		licenseStatus: 'ACTIVE',
	},
	{
		organizationId: 6,
		title: '고려대학교 의과대학',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 2,
			title: '의과대학',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00006',
		managerName: '송교수',
		department: '의학교육학과',
		phoneNumber: '010-6789-0123',
		email: 'prof.song@korea.ac.kr',
		createdAt: '2025-06-18T14:00:00.000Z',
		licenseStatus: 'EXPIRING_SOON',
	},
	{
		organizationId: 7,
		title: '서울대학교 간호대학',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 3,
			title: '간호대학',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00007',
		managerName: '한교수',
		department: '간호학과',
		phoneNumber: '010-7890-1234',
		email: 'prof.han@snu.ac.kr',
		createdAt: '2025-07-22T15:00:00.000Z',
		licenseStatus: 'ACTIVE',
	},
	{
		organizationId: 8,
		title: '대한적십자사',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 4,
			title: '공공기관',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00008',
		managerName: '윤팀장',
		department: '교육사업팀',
		phoneNumber: '010-8901-2345',
		email: 'yoon@redcross.or.kr',
		createdAt: '2025-08-30T16:00:00.000Z',
		licenseStatus: 'EXPIRING_SOON',
	},
	{
		organizationId: 9,
		title: '가톨릭대학교 의과대학',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 2,
			title: '의과대학',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00009',
		managerName: '김교수',
		department: '의학교육실',
		phoneNumber: '010-9012-3456',
		email: 'prof.kim@catholic.ac.kr',
		createdAt: '2025-09-15T17:00:00.000Z',
		licenseStatus: 'ACTIVE',
	},
	{
		organizationId: 10,
		title: '분당서울대병원',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 1,
			title: '종합병원',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00010',
		managerName: '박센터장',
		department: '시뮬레이션센터',
		phoneNumber: '010-0123-4567',
		email: 'center.park@snubh.org',
		createdAt: '2025-10-01T18:00:00.000Z',
		licenseStatus: 'ACTIVE',
	},
	{
		organizationId: 11,
		title: '경희대학교병원',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 1,
			title: '종합병원',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00011',
		managerName: '이과장',
		department: '의료정보과',
		phoneNumber: '010-1234-5670',
		email: 'manager.lee@khmc.or.kr',
		createdAt: '2024-11-10T19:00:00.000Z',
		licenseStatus: 'EXPIRED',
	},
	{
		organizationId: 12,
		title: '한양대학교 간호대학',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 3,
			title: '간호대학',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00012',
		managerName: '최교수',
		department: '간호학부',
		phoneNumber: '010-2345-6701',
		email: 'prof.choi@hanyang.ac.kr',
		createdAt: '2025-12-05T20:00:00.000Z',
		licenseStatus: 'ACTIVE',
	},
	{
		organizationId: 13,
		title: '국립중앙의료원',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 4,
			title: '공공기관',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00013',
		managerName: '정부장',
		department: '교육연수부',
		phoneNumber: '010-3456-7012',
		email: 'director.jung@nmc.or.kr',
		createdAt: '2024-01-20T21:00:00.000Z',
		licenseStatus: 'INACTIVE',
	},
	{
		organizationId: 14,
		title: '차의과학대학교',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 2,
			title: '의과대학',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00014',
		managerName: '송교수',
		department: '의학교육학교실',
		phoneNumber: '010-4567-8023',
		email: 'prof.song@cha.ac.kr',
		createdAt: '2025-02-28T22:00:00.000Z',
		licenseStatus: 'ACTIVE',
	},
	{
		organizationId: 15,
		title: '인하대학교병원',
		country: {
			id: 1,
			title: '대한민국',
		},
		organizationType: {
			id: 1,
			title: '종합병원',
		},
		countryCallingCode: {
			id: 1,
			code: '+82',
			title: '대한민국',
		},
		businessRegistrationNumber: '211-82-00015',
		managerName: '한팀장',
		department: '간호부',
		phoneNumber: '010-5678-9034',
		email: 'team.han@inha.com',
		createdAt: '2025-03-15T23:00:00.000Z',
		licenseStatus: 'ACTIVE',
	},
];

/**
 * Mock API 함수: 기관 상세 조회
 * 실제 API처럼 느껴지도록 지연 추가
 * 
 * @param organizationId - 기관 ID
 * @returns 기관 상세 정보
 */
export const mockFetchOrganizationDetail = async (
	organizationId: number
): Promise<GetOrganizationDetailResponseDto> => {
	// 실제 API처럼 느껴지도록 500-800ms 지연
	await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));
	
	const organization = mockOrganizations.find(org => org.organizationId === organizationId);
	
	if (!organization) {
		throw new Error(`Organization with ID ${organizationId} not found`);
	}
	
	return organization;
};

/**
 * Mock API 함수: 기관 목록 조회
 * 실제 API처럼 느껴지도록 지연 추가
 * 
 * @returns 기관 목록
 */
export const mockFetchOrganizationList = async (): Promise<GetOrganizationDetailResponseDto[]> => {
	// 실제 API처럼 느껴지도록 600-1000ms 지연
	await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
	
	return [...mockOrganizations];
};
