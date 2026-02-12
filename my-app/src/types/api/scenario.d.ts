// Scenario API Types
// Swagger 기반: https://api.scenario-studio-test.medicrew.me/swagger-json

/**
 * 시나리오 카테고리 DTO
 */
export interface GetScenarioListByUserIdCategoryDto {
	scenarioCategoryId: number;
	title: string;
}

/**
 * 본인이 생성한 시나리오 목록 DTO
 */
export interface GetScenarioListByUserIdDto {
	scenarioId: number;
	title: string;
	scenarioCategoryList: GetScenarioListByUserIdCategoryDto[];
	version: string;
	difficulty: number;
	createdAt: string; // ISO date-time
	thumbnailImageUrl: string;
	expectedPlayTimeSeconds: number;
}

/**
 * 본인이 생성한 시나리오 목록 응답
 */
export interface GetScenarioListByUserIdResponseDto {
	scenarioList: GetScenarioListByUserIdDto[];
	totalCount: number;
}

/**
 * 학습 목표 DTO
 */
export interface GetScenarioDetailLearningObjectiveDto {
	learningObjectiveId: number;
	title: string;
}

/**
 * 시나리오 카테고리 상세 DTO
 */
export interface GetScenarioDetailCategoryDto {
	scenarioCategoryId: number;
	type: string;
	title: string;
}

/**
 * 환자 정보 DTO (간소화)
 */
export interface GetScenarioDetailPatientDto {
	patientId: number;
	name: string;
	gender: string;
	ageValue: number;
	ageUnit: string;
	birthMonth: number;
	birthDay: number;
	medicalRecordNumber: number;
	bloodRhType: string;
	bloodAboType: string;
	height: number;
	weight: number;
	departmentName: string;
	departmentAbbreviation: string;
	diagnosisName: string;
	race: string;
	pregnancyWeek?: number;
}

/**
 * 플로우 스테이지 DTO (간소화)
 */
export interface GetScenarioDetailFlowStageDto {
	scenarioFlowStageId: number;
	title: string;
	type: string;
	depth: number;
	offsetDay?: number;
	time?: string;
	x: number;
	y: number;
}

/**
 * 플로우 스테이지 전환 DTO
 */
export interface GetScenarioDetailFlowStageTransitionDto {
	scenarioFlowStageTransitionId: number;
	type: string;
	toStageId: number;
	fromStageId: number;
}

/**
 * 카트 아이템 DTO
 */
export interface GetScenarioDetailCartItemDto {
	cartItemId: number;
	floor: number;
	itemId: number;
	itemImageUrl: string;
	x: number;
	y: number;
	rotation: number;
	customItemName: string;
}

/**
 * 시나리오 상세 응답 DTO
 */
export interface GetScenarioDetailResponseDto {
	scenarioId: number;
	title: string;
	scenarioTypeTitle: string;
	version: string;
	difficulty: number;
	handoverNote: string;
	thumbnailImageUrl: string;
	expectedPlayTimeSeconds: number;
	mapItemId: number;
	learningObjectiveList: GetScenarioDetailLearningObjectiveDto[];
	scenarioCategoryList: GetScenarioDetailCategoryDto[];
	patient: GetScenarioDetailPatientDto;
	flowStageList: GetScenarioDetailFlowStageDto[];
	scenarioFlowStageTransitionList: GetScenarioDetailFlowStageTransitionDto[];
	cartItemMapping: GetScenarioDetailCartItemDto[];
}

/**
 * 시나리오 생성 요청 DTO
 * Swagger: POST /scenario
 */
export interface CreateScenarioRequestDto {
	scenarioCategoryIdList: number[];
	version: string;
	scenarioTypeId: number;
	mapItemId: number;
	difficulty: number;
	title: string;
	handoverNote: string;
	thumbnailImageUrl: string;
	expectedPlayTimeSeconds: number;
	deviceTypeIdList: number[];
	learningObjectiveList: Array<{
		order: number;
		title: string;
	}>;
	patient: {
		characterId: number;
		name: string;
	};
}

/**
 * 시나리오 생성 응답 DTO
 */
export interface CreateScenarioResponseDto {
	message: string;
}

/**
 * Admin용 시나리오 목록 DTO (백엔드 구현 필요)
 */
export interface ScenarioAdminDto {
	scenarioId: number;
	title: string;
	scenarioCategoryList: Array<{
		scenarioCategoryId: number;
		type: string;
		title: string;
	}>;
	version: string;
	difficulty: number;
	createdAt: string; // ISO date-time
	thumbnailImageUrl: string;
	expectedPlayTimeSeconds: number;
	status?: 'active' | 'inactive';
	contributedBy?: string;
	views?: number;
	simulationCount?: number;
	userCount?: number;
	deviceTypeList?: Array<{
		deviceTypeId: number;
		title: string;
	}>;
}

/**
 * Admin용 시나리오 목록 응답 DTO (백엔드 구현 필요)
 */
export interface GetScenarioAdminListResponseDto {
	scenarioList: ScenarioAdminDto[];
	totalCount: number;
	stats: {
		total: number;
		active: number;
		inactive: number;
	};
}

/** 시나리오 타입 DTO (GET /scenario-type/list) */
export interface GetScenarioTypeDto {
	id: number;
	title: string;
}

export interface GetScenarioTypeListResponseDto {
	scenarioTypeList: GetScenarioTypeDto[];
}

/** 시나리오 썸네일 이미지 DTO (GET /scenario-thumbnail-image/list) */
export interface GetScenarioThumbnailImageByTypeDto {
	scenarioThumbnailImageId: number;
	description?: string;
	imageUrl: string;
}

export interface GetScenarioThumbnailImageListByTypeResponseDto {
	scenarioThumbnailImageList: GetScenarioThumbnailImageByTypeDto[];
}

/** 라이센스별 시나리오 리스트 (GET /scenario/license) — 항목 구조는 ScenarioItemDto 재사용 */
export interface GetScenarioListByLicenseResponseDto {
	scenarioList: ScenarioItemDto[];
	totalCount: number;
}

/** Swagger: 클래스별 시나리오 리스트 조회 GET /scenario/{classId}/class */
export interface PatientInfoDto {
	age: number;
	gender: string;
}

export interface ScenarioItemDto {
	scenarioId: number;
	title: string;
	patientList: PatientInfoDto[];
	mapItemName: string;
	expectedPlayTimeSeconds: number;
	playCount: number;
	updatedAt: string;
}

export interface GetScenarioListByClassIdResponseDto {
	scenarioList: ScenarioItemDto[];
}

/** Phase 11: 시나리오 플레이 기록 조회 GET /scenario-play-record */
export interface ScenarioPlayRecordItemDto {
	scenarioPlayRecordId?: number;
	userId: number;
	classId?: number;
	classUserId?: number;
	scenarioId: number;
	playedAt: string;
	score?: number;
	userName?: string;
	scenarioTitle?: string;
	className?: string;
}

export interface GetScenarioPlayRecordResponseDto {
	playRecordList: ScenarioPlayRecordItemDto[];
	totalCount: number;
}
