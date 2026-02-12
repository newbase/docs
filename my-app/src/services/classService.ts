/**
 * Class Service
 * 백엔드 API 변경: Course → Class (2026-02-02)
 * Swagger: /class/* (기존 /course/*)
 * @see my-app/docs/api/API.md
 */

import { apiClient, ApiError } from './apiClient';
import type {
	GetClassListByOrganizationResponseDto,
	ClassListItemDto,
	CreateClassRequestDto,
	CreateClassResponseDto,
	GetClassDetailResponseDto,
	UpdateClassRequestDto,
	UpdateClassResponseDto,
	DeleteClassRequestDto,
	DeleteClassResponseDto,
	EnrollClassResponseDto,
	UpdateClassPasswordRequestDto,
	UpdateClassPasswordResponseDto,
} from '../types/api/class';

export interface GetClassListByOrganizationParams {
	organizationId: number;
	page?: number;
	pageSize?: number;
	startDate?: string;
	endDate?: string;
	isActive?: boolean;
	title?: string;
}

/**
 * 기관별 클래스 리스트 조회
 * Swagger: GET /class/organization/list
 */
export const getClassListByOrganization = async (
	params: GetClassListByOrganizationParams
): Promise<GetClassListByOrganizationResponseDto> => {
	const { organizationId, page = 1, pageSize = 20, ...rest } = params;
	const response = await apiClient.get<GetClassListByOrganizationResponseDto>(
		'/class/organization/list',
		{ params: { organizationId, page, pageSize, ...rest } }
	);
	return response;
};

/**
 * 클래스 상세 조회
 * Swagger: GET /class/{classId}
 */
export const getClassDetail = async (
	classId: number
): Promise<GetClassDetailResponseDto> => {
	const response = await apiClient.get<GetClassDetailResponseDto>(
		`/class/${classId}`
	);
	return response;
};

/**
 * 클래스 생성
 * Swagger: POST /class
 */
export const createClass = async (
	data: CreateClassRequestDto
): Promise<CreateClassResponseDto> => {
	const response = await apiClient.post<CreateClassResponseDto>('/class', data);
	return response;
};

/**
 * 클래스 수정
 * Swagger: PUT /class/{classId}
 */
export const updateClass = async (
	classId: number,
	data: UpdateClassRequestDto
): Promise<UpdateClassResponseDto> => {
	const response = await apiClient.put<UpdateClassResponseDto>(
		`/class/${classId}`,
		data
	);
	return response;
};

/**
 * 클래스 삭제
 * Swagger: DELETE /class/{classId} (Request Body: DeleteClassRequestDto)
 */
export const deleteClass = async (
	classId: number,
	body?: DeleteClassRequestDto
): Promise<DeleteClassResponseDto> => {
	const response = await apiClient.delete<DeleteClassResponseDto>(
		`/class/${classId}`,
		body
	);
	return response;
};

/**
 * 클래스 수강신청
 * Swagger: POST /class/{classId}/enroll
 */
export const enrollClass = async (
	classId: number
): Promise<EnrollClassResponseDto> => {
	try {
		const response = await apiClient.post<EnrollClassResponseDto>(
			`/class/${classId}/enroll`
		);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			if (error.status === 409) throw new Error('이미 수강신청한 클래스입니다.');
			if (error.status === 403) throw new Error('수강신청 권한이 없습니다.');
			if (error.status === 404) throw new Error('존재하지 않는 클래스입니다.');
			if (error.status === 400) throw new Error('라이센스 이용자 수가 초과되었습니다.');
		}
		throw error;
	}
};

/**
 * 클래스 디바이스 등록
 * Swagger: POST /class/{classId}/device/{organizationDeviceId}
 */
export const registerClassDevice = async (
	classId: number,
	organizationDeviceId: number
): Promise<{ message: string }> => {
	return await apiClient.post<{ message: string }>(
		`/class/${classId}/device/${organizationDeviceId}`
	);
};

/**
 * 클래스 비밀번호 변경
 * Swagger: PUT /class/{classId}/password
 */
export const updateClassPassword = async (
	classId: number,
	pw: string
): Promise<UpdateClassPasswordResponseDto> => {
	const body: UpdateClassPasswordRequestDto = { pw };
	return await apiClient.put<UpdateClassPasswordResponseDto>(
		`/class/${classId}/password`,
		body
	);
};
