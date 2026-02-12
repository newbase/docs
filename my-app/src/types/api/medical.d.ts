/**
 * 검사·증상·문진 API 타입 (Phase 3)
 * medical-test, patient-symptom, medical-question
 * @see my-app/docs/api/API.md
 */

/** GET /medical-test/category/list */
export interface MedicalTestCategoryDto {
	medicalTestCategoryId: number;
	name?: string;
	title?: string;
}

export interface MedicalTestCategoryListResponseDto {
	list?: MedicalTestCategoryDto[];
	medicalTestCategoryList?: MedicalTestCategoryDto[];
}

/** GET /medical-test/list?medicalTestCategoryId= */
export interface MedicalTestDto {
	medicalTestId: number;
	medicalTestCategoryId?: number;
	name?: string;
	title?: string;
}

export interface MedicalTestListResponseDto {
	list?: MedicalTestDto[];
	medicalTestList?: MedicalTestDto[];
}

/** GET /medical-test/item/list?medicalTestId= */
export interface MedicalTestItemDto {
	medicalTestItemId?: number;
	medicalTestId?: number;
	name?: string;
	title?: string;
}

export interface MedicalTestItemListResponseDto {
	list?: MedicalTestItemDto[];
	medicalTestItemList?: MedicalTestItemDto[];
}

/** GET /patient-symptom/medical-department/list */
export interface MedicalDepartmentDto {
	medicalDepartmentId: number;
	name?: string;
	title?: string;
}

export interface MedicalDepartmentListResponseDto {
	list?: MedicalDepartmentDto[];
	medicalDepartmentList?: MedicalDepartmentDto[];
}

/** GET /patient-symptom/list?medicalDepartmentId= */
export interface PatientSymptomDto {
	patientSymptomId: number;
	medicalDepartmentId?: number;
	name?: string;
	title?: string;
}

export interface PatientSymptomListResponseDto {
	list?: PatientSymptomDto[];
	patientSymptomList?: PatientSymptomDto[];
}

/** GET /patient-symptom/pattern/list?patientSymptomId= */
export interface PatientSymptomPatternDto {
	patientSymptomPatternId?: number;
	patientSymptomId?: number;
	name?: string;
	title?: string;
}

export interface PatientSymptomPatternListResponseDto {
	list?: PatientSymptomPatternDto[];
	patientSymptomPatternList?: PatientSymptomPatternDto[];
}

/** GET /medical-question/list */
export interface MedicalQuestionDto {
	medicalQuestionId: number;
	content?: string;
	title?: string;
	name?: string;
}

export interface MedicalQuestionListResponseDto {
	list?: MedicalQuestionDto[];
	medicalQuestionList?: MedicalQuestionDto[];
}
