/**
 * 환자 의상·포즈 API 타입 (Phase 3)
 * GET /patient-clothing/list, GET /pose/list
 * @see my-app/docs/api/API.md
 */

export type PatientClothingType = 'TOP' | 'BOTTOM';

export interface PatientClothingDto {
	patientClothingId?: number;
	id?: number;
	type?: PatientClothingType;
	name?: string;
	title?: string;
}

export interface PatientClothingListResponseDto {
	list?: PatientClothingDto[];
	patientClothingList?: PatientClothingDto[];
}

export interface PoseDto {
	poseId?: number;
	id?: number;
	name?: string;
	title?: string;
}

export interface PoseListResponseDto {
	list?: PoseDto[];
	poseList?: PoseDto[];
	totalCount?: number;
}
