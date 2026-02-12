/**
 * Class API Types (Swagger 기반)
 * 백엔드 API 변경: Course → Class (2026-02-02)
 * @see my-app/docs/api/API.md
 */

/** 클래스 목록 항목 DTO (Swagger: 목록에는 scenarioList 없음, scenarioCount만 반환) */
export interface ClassListItemDto {
	classId: number;
	title: string;
	startDate: string;
	endDate?: string;
	isActive: boolean;
	participantCount?: number;
	/** 목록 API에서는 미반환, 상세 API에서만 사용. Swagger ClassListItemDto는 scenarioCount만 있음 */
	scenarioList?: ClassScenarioInfoDto[];
	/** Swagger 목록 응답 필드 (시나리오 개수) */
	scenarioCount?: number;
	thumbnailUrl?: string;
	description?: string;
}

/** 클래스-시나리오 연결 정보 */
export interface ClassScenarioInfoDto {
	scenarioId: number;
	order: number;
}

/** 기관별 클래스 리스트 응답 */
export interface GetClassListByOrganizationResponseDto {
	classList: ClassListItemDto[];
	totalCount: number;
	/** Swagger: 총 참가자 수 */
	totalParticipantCount?: number;
}

/** 클래스 생성 요청 (Swagger CreateClassRequestDto) */
export interface CreateClassRequestDto {
	organizationId: number;
	organizationLicenseIdList: number[];
	title: string;
	isPrivate: boolean;
	/** 비공개 클래스 비밀번호 (isPrivate=true일 때 필수) */
	pw?: string;
	/** 모든 시나리오 완료 필수 여부 */
	requireAllScenarioCompletion: boolean;
	/** 최소 완료 시나리오 수 (requireAllScenarioCompletion=false일 때 필수) */
	minScenarioCompletionCount?: number;
	/** 최소 합격 점수 (기본 70) */
	minPassingScore?: number;
	scenarioList: { scenarioId: number; order: number }[];
	/** 레거시 필드 (백엔드 미사용 시 제거 가능) */
	minPerfectCount?: number;
	minExcellentOrHigherCount?: number;
	minGoodOrHigherCount?: number;
	minPlayCount?: number;
	thumbnailUrl?: string;
	description?: string;
	videoList?: Array<{ title: string; url: string; order: number; duration: string }>;
}

export interface CreateClassResponseDto {
	classId: number;
	message?: string;
}

/** 클래스 상세 응답 (Swagger GetClassDetailResponseDto) */
export interface GetClassDetailResponseDto {
	classId: number;
	title: string;
	isPrivate: boolean;
	/** 비밀번호 설정 여부 */
	hasPassword?: boolean;
	/** 모든 시나리오 완료 필수 여부 */
	requireAllScenarioCompletion?: boolean;
	/** 최소 완료 시나리오 수 */
	minScenarioCompletionCount?: number | null;
	/** 최소 합격 점수 */
	minPassingScore?: number;
	scenarioList: ClassScenarioInfoDto[];
	minPerfectCount?: number;
	minExcellentOrHigherCount?: number;
	minGoodOrHigherCount?: number;
	minPlayCount?: number;
	startDate?: string;
	endDate?: string;
	isActive?: boolean;
	organizationId?: number;
	participantCount?: number;
	thumbnailUrl?: string;
	description?: string;
}

/** 클래스 수정 요청 (Swagger UpdateClassRequestDto) */
export interface UpdateClassRequestDto {
	title?: string;
	isPrivate?: boolean;
	/** 비공개 클래스 비밀번호 (isPrivate=true일 때 필수) */
	pw?: string;
	requireAllScenarioCompletion?: boolean;
	minScenarioCompletionCount?: number;
	minPassingScore?: number;
	scenarioList?: { scenarioId: number; order: number }[];
	startDate?: string;
	endDate?: string;
	isActive?: boolean;
	minPerfectCount?: number;
	minExcellentOrHigherCount?: number;
	minGoodOrHigherCount?: number;
	minPlayCount?: number;
}

export interface UpdateClassResponseDto {
	message: string;
}

/** 클래스 삭제 요청 (Swagger: body 있음) */
export interface DeleteClassRequestDto {
	classId: number;
}

export interface DeleteClassResponseDto {
	message: string;
}

/** 수강신청 응답 (Swagger: classUserMapping은 수강신청 ID, number) */
export interface EnrollClassResponseDto {
	classUserMapping: number;
}

/** 클래스 비밀번호 변경 요청 (Swagger: PUT /class/{classId}/password) */
export interface UpdateClassPasswordRequestDto {
	pw: string;
}

/** 클래스 비밀번호 변경 응답 */
export interface UpdateClassPasswordResponseDto {
	message: string;
}
