/**
 * 증상(진료과·증상·증상양상) API (Phase 3)
 * GET /patient-symptom/medical-department/list, /patient-symptom/list, /patient-symptom/pattern/list
 * @see my-app/docs/api/API.md, FRONTEND_API_INTEGRATION_PHASES.md
 */

import { apiClient, ApiError } from './apiClient';
import type {
	MedicalDepartmentListResponseDto,
	PatientSymptomListResponseDto,
	PatientSymptomPatternListResponseDto,
} from '../types/api/medical';

/**
 * 진료과 리스트 조회
 * Swagger: GET /patient-symptom/medical-department/list
 */
export const getMedicalDepartmentList =
	async (): Promise<MedicalDepartmentListResponseDto> => {
		try {
			const response = await apiClient.get<MedicalDepartmentListResponseDto>(
				'/patient-symptom/medical-department/list'
			);
			return response;
		} catch (error) {
			if (error instanceof ApiError) {
				throw new Error(error.message || '진료과 목록을 불러오는데 실패했습니다.');
			}
			throw error;
		}
	};

/**
 * 진료과별 증상 리스트 조회
 * Swagger: GET /patient-symptom/list?medicalDepartmentId=
 */
export const getPatientSymptomList = async (
	medicalDepartmentId: number
): Promise<PatientSymptomListResponseDto> => {
	try {
		const response = await apiClient.get<PatientSymptomListResponseDto>(
			'/patient-symptom/list',
			{ params: { medicalDepartmentId } }
		);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '증상 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 증상별 증상양상 리스트 조회
 * Swagger: GET /patient-symptom/pattern/list?patientSymptomId=
 */
export const getPatientSymptomPatternList = async (
	patientSymptomId: number
): Promise<PatientSymptomPatternListResponseDto> => {
	try {
		const response = await apiClient.get<PatientSymptomPatternListResponseDto>(
			'/patient-symptom/pattern/list',
			{ params: { patientSymptomId } }
		);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '증상양상 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};
