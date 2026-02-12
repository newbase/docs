/**
 * Mock User Data (Backend DTO Format)
 * 백엔드 API 스펙에 맞춘 Mock 사용자 데이터
 * 
 * @see OrganizationUserInfoDto in types/api/user.d.ts
 */

import { OrganizationUserInfoDto } from '@/types/api/user';

/**
 * Mock 기관별 사용자 데이터
 * 백엔드 API 응답 형식에 맞춰 작성
 */
export const mockOrganizationUsers: Record<number, OrganizationUserInfoDto[]> = {
	1: [
		// Master (기관 관리자)
		{
			userId: 101,
			name: '김의사',
			loginId: 'kim.doctor',
			email: 'kim.doctor@snuh.org',
			department: '의료정보팀',
			role: 'ORGANIZATION_ADMIN',
			accountType: 'REGULAR',
			registeredAt: '2025-01-20T08:00:00.000Z',
			lastSigninAt: '2025-12-10T14:30:00.000Z',
		},
		// Students (정회원)
		{
			userId: 102,
			name: '이간호사',
			loginId: 'lee.nurse',
			email: 'lee.nurse@snuh.org',
			department: '간호부',
			role: 'STUDENT',
			accountType: 'REGULAR',
			registeredAt: '2025-01-25T09:00:00.000Z',
			lastSigninAt: '2025-12-09T15:20:00.000Z',
		},
		{
			userId: 103,
			name: '박레지던트',
			loginId: 'park.resident',
			email: 'park.resident@snuh.org',
			department: '응급의학과',
			role: 'STUDENT',
			accountType: 'REGULAR',
			registeredAt: '2025-01-28T10:00:00.000Z',
			lastSigninAt: '2025-12-11T16:10:00.000Z',
		},
		{
			userId: 104,
			name: '정인턴',
			loginId: 'jung.intern',
			email: 'jung.intern@snuh.org',
			department: '내과',
			role: 'STUDENT',
			accountType: 'REGULAR',
			registeredAt: '2025-02-05T11:00:00.000Z',
			lastSigninAt: '2025-12-08T13:45:00.000Z',
		},
		{
			userId: 105,
			name: '최간호사',
			loginId: 'choi.nurse',
			email: 'choi.nurse@snuh.org',
			department: '간호부',
			role: 'STUDENT',
			accountType: 'REGULAR',
			registeredAt: '2025-02-10T12:00:00.000Z',
			lastSigninAt: '2025-12-07T14:00:00.000Z',
		},
		{
			userId: 106,
			name: '강의학생',
			loginId: 'kang.student',
			email: 'kang.student@snuh.org',
			department: '의과대학',
			role: 'STUDENT',
			accountType: 'REGULAR',
			registeredAt: '2025-02-15T13:00:00.000Z',
			lastSigninAt: undefined, // 로그인 이력 없음
		},
		// Guest accounts (게스트)
		{
			userId: 201,
			name: 'Guest1',
			loginId: undefined,
			email: undefined,
			department: undefined,
			role: 'STUDENT',
			accountType: 'ASSOCIATE',
			registeredAt: '2025-02-01T14:00:00.000Z',
			lastSigninAt: '2025-11-30T10:00:00.000Z',
		},
		{
			userId: 202,
			name: 'Guest2',
			loginId: undefined,
			email: undefined,
			department: undefined,
			role: 'STUDENT',
			accountType: 'ASSOCIATE',
			registeredAt: '2025-02-01T15:00:00.000Z',
			lastSigninAt: '2025-12-05T11:00:00.000Z',
		},
		{
			userId: 203,
			name: 'Guest3',
			loginId: undefined,
			email: undefined,
			department: undefined,
			role: 'STUDENT',
			accountType: 'ASSOCIATE',
			registeredAt: '2025-02-01T16:00:00.000Z',
			lastSigninAt: undefined,
		},
	],
	2: [
		// Master (기관 관리자)
		{
			userId: 301,
			name: '박교수',
			loginId: 'prof.park',
			email: 'prof.park@yuhs.ac',
			department: '교육연수팀',
			role: 'ORGANIZATION_ADMIN',
			accountType: 'REGULAR',
			registeredAt: '2025-02-25T08:00:00.000Z',
			lastSigninAt: '2025-12-11T15:30:00.000Z',
		},
		// Students (정회원)
		{
			userId: 302,
			name: '윤조교',
			loginId: 'yoon.assistant',
			email: 'yoon.assistant@yuhs.ac',
			department: '의과대학',
			role: 'STUDENT',
			accountType: 'REGULAR',
			registeredAt: '2025-02-28T09:00:00.000Z',
			lastSigninAt: '2025-12-10T14:20:00.000Z',
		},
		{
			userId: 303,
			name: '임학생',
			loginId: 'lim.student',
			email: 'lim.student@yuhs.ac',
			department: '의과대학',
			role: 'STUDENT',
			accountType: 'REGULAR',
			registeredAt: '2025-03-01T10:00:00.000Z',
			lastSigninAt: '2025-12-09T13:10:00.000Z',
		},
		{
			userId: 304,
			name: '한연구원',
			loginId: 'han.researcher',
			email: 'han.researcher@yuhs.ac',
			department: '의학연구소',
			role: 'STUDENT',
			accountType: 'REGULAR',
			registeredAt: '2025-03-05T11:00:00.000Z',
			lastSigninAt: '2025-12-11T16:00:00.000Z',
		},
		// Guest accounts (게스트)
		{
			userId: 401,
			name: 'Guest1',
			loginId: undefined,
			email: undefined,
			department: undefined,
			role: 'STUDENT',
			accountType: 'ASSOCIATE',
			registeredAt: '2025-03-10T12:00:00.000Z',
			lastSigninAt: '2025-12-08T10:00:00.000Z',
		},
		{
			userId: 402,
			name: 'Guest2',
			loginId: undefined,
			email: undefined,
			department: undefined,
			role: 'STUDENT',
			accountType: 'ASSOCIATE',
			registeredAt: '2025-03-10T13:00:00.000Z',
			lastSigninAt: undefined,
		},
	],
	3: [
		// Master (기관 관리자)
		{
			userId: 501,
			name: '최원장',
			loginId: 'director.choi',
			email: 'director.choi@samsung.hospital',
			department: '시뮬레이션센터',
			role: 'ORGANIZATION_ADMIN',
			accountType: 'REGULAR',
			registeredAt: '2025-03-15T08:00:00.000Z',
			lastSigninAt: '2025-12-10T14:30:00.000Z',
		},
		// Students (정회원)
		{
			userId: 502,
			name: '송과장',
			loginId: 'song.manager',
			email: 'song.manager@samsung.hospital',
			department: '의료정보과',
			role: 'STUDENT',
			accountType: 'REGULAR',
			registeredAt: '2025-03-18T09:00:00.000Z',
			lastSigninAt: '2025-12-11T15:20:00.000Z',
		},
		{
			userId: 503,
			name: '오의사',
			loginId: 'oh.doctor',
			email: 'oh.doctor@samsung.hospital',
			department: '외과',
			role: 'STUDENT',
			accountType: 'REGULAR',
			registeredAt: '2025-03-20T10:00:00.000Z',
			lastSigninAt: '2025-12-09T16:10:00.000Z',
		},
		{
			userId: 504,
			name: '서간호사',
			loginId: 'seo.nurse',
			email: 'seo.nurse@samsung.hospital',
			department: '간호부',
			role: 'STUDENT',
			accountType: 'REGULAR',
			registeredAt: '2025-03-22T11:00:00.000Z',
			lastSigninAt: '2025-12-10T13:45:00.000Z',
		},
		{
			userId: 505,
			name: '권기사',
			loginId: 'kwon.tech',
			email: 'kwon.tech@samsung.hospital',
			department: '의료정보과',
			role: 'STUDENT',
			accountType: 'REGULAR',
			registeredAt: '2025-03-25T12:00:00.000Z',
			lastSigninAt: undefined,
		},
		// Guest accounts (게스트)
		{
			userId: 601,
			name: 'Guest1',
			loginId: undefined,
			email: undefined,
			department: undefined,
			role: 'STUDENT',
			accountType: 'ASSOCIATE',
			registeredAt: '2025-03-28T13:00:00.000Z',
			lastSigninAt: '2025-12-07T14:00:00.000Z',
		},
		{
			userId: 602,
			name: 'Guest2',
			loginId: undefined,
			email: undefined,
			department: undefined,
			role: 'STUDENT',
			accountType: 'ASSOCIATE',
			registeredAt: '2025-03-28T14:00:00.000Z',
			lastSigninAt: '2025-12-05T11:00:00.000Z',
		},
	],
};

/**
 * Mock API 함수: 기관별 사용자 목록 조회
 * 실제 API처럼 느껴지도록 지연 추가
 * 
 * @param organizationId - 기관 ID
 * @returns 해당 기관의 사용자 목록
 */
export const mockFetchOrganizationUserList = async (
	organizationId: number
): Promise<OrganizationUserInfoDto[]> => {
	// 실제 API처럼 느껴지도록 500-900ms 지연
	await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 400));
	
	return mockOrganizationUsers[organizationId] || [];
};
