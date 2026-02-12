/**
 * Scenario Service
 * 시나리오 관련 API 호출을 담당하는 서비스
 */

import { apiClient, ApiError } from './apiClient';
import type {
	GetScenarioListByUserIdResponseDto,
	GetScenarioDetailResponseDto,
	CreateScenarioRequestDto,
	CreateScenarioResponseDto,
	GetScenarioAdminListResponseDto,
	GetScenarioListByClassIdResponseDto,
	GetScenarioPlayRecordResponseDto,
	GetScenarioTypeListResponseDto,
	GetScenarioThumbnailImageListByTypeResponseDto,
	GetScenarioListByLicenseResponseDto,
} from '../types/api/scenario';
import type {
	PatientClothingListResponseDto,
	PoseListResponseDto,
} from '../types/api/patient-clothing-pose';

/**
 * 클래스별 시나리오 리스트 조회
 * Swagger: GET /scenario/{classId}/class
 */
export const getScenarioListByClassId = async (
	classId: number
): Promise<GetScenarioListByClassIdResponseDto> => {
	try {
		const response = await apiClient.get<GetScenarioListByClassIdResponseDto>(
			`/scenario/${classId}/class`
		);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '클래스 시나리오 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 본인이 생성한 시나리오 목록 조회
 * Swagger: GET /scenario/list
 * 
 * ⚠️ 주의: Admin 페이지에는 부적합 (본인이 생성한 시나리오만 조회)
 */
export const getScenarioListByUserId = async (params: {
	page: number;
	pageSize: number;
}): Promise<GetScenarioListByUserIdResponseDto> => {
	try {
		const response = await apiClient.get<GetScenarioListByUserIdResponseDto>('/scenario/list', {
			params,
		});
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '시나리오 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * Admin용 시나리오 목록 조회
 * ⚠️ 백엔드 API 구현 대기 중 (GET /scenario/admin/list)
 *
 * Swagger JSON 확인 결과: 해당 엔드포인트가 존재하지 않음
 * 현재는 사용 불가. 백엔드 API 구현 후 활성화 예정.
 *
 * 대안: GET /scenario/list 사용 (본인이 생성한 시나리오만 조회)
 */
export const getScenarioAdminList = async (params: {
	page: number;
	pageSize: number;
	status?: string;
	category?: string;
	platform?: string;
	search?: string;
	startDate?: string;
	endDate?: string;
}): Promise<GetScenarioAdminListResponseDto> => {
	try {
		const response = await apiClient.get<GetScenarioAdminListResponseDto>('/scenario/admin/list', {
			params,
		});
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '시나리오 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 시나리오 상세 조회
 * Swagger: GET /scenario/{scenarioId}/detail
 * 
 * ✅ 사용 가능
 */
export const getScenarioDetail = async (scenarioId: number): Promise<GetScenarioDetailResponseDto> => {
	try {
		const response = await apiClient.get<GetScenarioDetailResponseDto>(`/scenario/${scenarioId}/detail`);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			if (error.status === 404) {
				throw new Error('시나리오를 찾을 수 없습니다.');
			}
			throw new Error(error.message || '시나리오 정보를 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 시나리오 카테고리 목록 조회
 * Swagger: GET /scenario-category/list
 */
export const getScenarioCategoryList = async (type?: string) => {
	try {
		const response = await apiClient.get<any>('/scenario-category/list', {
			params: type ? { type } : {},
		});
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '시나리오 카테고리 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 캐릭터 목록 조회
 * Swagger: GET /character/list
 */
export const getCharacterList = async (type?: string) => {
	try {
		const response = await apiClient.get<any>('/character/list', {
			params: type ? { type } : {},
		});
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '캐릭터 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 시나리오 타입 목록 조회
 * Swagger: GET /scenario-type/list
 */
export const getScenarioTypeList = async (): Promise<GetScenarioTypeListResponseDto> => {
	try {
		const response = await apiClient.get<GetScenarioTypeListResponseDto>('/scenario-type/list');
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '시나리오 타입 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 시나리오 타입별 썸네일 이미지 목록 조회
 * Swagger: GET /scenario-thumbnail-image/list?scenarioTypeId=
 */
export const getScenarioThumbnailImageList = async (
	scenarioTypeId: number
): Promise<GetScenarioThumbnailImageListByTypeResponseDto> => {
	try {
		const response = await apiClient.get<GetScenarioThumbnailImageListByTypeResponseDto>(
			'/scenario-thumbnail-image/list',
			{ params: { scenarioTypeId } }
		);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '썸네일 이미지 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 라이센스별 시나리오 리스트 조회
 * Swagger: GET /scenario/license
 */
export interface GetScenarioListByLicenseParams {
	organizationLicenseId: number;
	scenarioCategoryId?: number;
	searchKeyword?: string;
	page: number;
	pageSize: number;
}

export const getScenarioListByLicense = async (
	params: GetScenarioListByLicenseParams
): Promise<GetScenarioListByLicenseResponseDto> => {
	try {
		const response = await apiClient.get<GetScenarioListByLicenseResponseDto>('/scenario/license', {
			params,
		});
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '라이센스별 시나리오 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 장치 타입 목록 조회
 * Swagger: GET /device/type/list
 */
export const getDeviceTypeList = async () => {
	try {
		const response = await apiClient.get<any>('/device/type/list');
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '장치 타입 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 맵 아이템 목록 조회
 * Swagger: GET /item/list/option?type=MAP
 */
export const getMapItemList = async () => {
	try {
		const response = await apiClient.get<any>('/item/list/option', {
			params: { type: 'MAP' },
		});
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '맵 아이템 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 스킬·타입별 아이템 리스트 조회
 * Swagger: GET /item/list/option — type 필수 (MAP|CART|EQUIPMENT|CONSUMABLE|MEDICATION|EXPRESSION), skillId 선택
 */
export const getItemListByOption = async (params: {
	type: 'MAP' | 'CART' | 'EQUIPMENT' | 'CONSUMABLE' | 'MEDICATION' | 'EXPRESSION';
	skillId?: number;
}) => {
	try {
		const response = await apiClient.get<any>('/item/list/option', { params });
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '아이템 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 시나리오 플레이 기록 조회
 * Phase 11: GET /scenario-play-record — userId, classId, classUserId, scenarioId, page(기본 1), pageSize(기본 20)
 */
export interface GetScenarioPlayRecordParams {
	userId?: number;
	classId?: number;
	classUserId?: number;
	scenarioId?: number;
	page?: number;
	pageSize?: number;
}

export const getScenarioPlayRecords = async (
	params?: GetScenarioPlayRecordParams
): Promise<GetScenarioPlayRecordResponseDto> => {
	try {
		const query = params
			? {
					...(params.userId != null && { userId: params.userId }),
					...(params.classId != null && { classId: params.classId }),
					...(params.classUserId != null && { classUserId: params.classUserId }),
					...(params.scenarioId != null && { scenarioId: params.scenarioId }),
					page: params.page ?? 1,
					pageSize: params.pageSize ?? 20,
				}
			: { page: 1, pageSize: 20 };
		const response = await apiClient.get<GetScenarioPlayRecordResponseDto | Record<string, unknown>>(
			'/scenario-play-record',
			{ params: query }
		);
		// 백엔드 응답 키가 다를 수 있음: playRecordList | scenarioPlayRecordList | list
		const raw = response as Record<string, unknown>;
		const list = Array.isArray(raw.playRecordList)
			? raw.playRecordList
			: Array.isArray(raw.scenarioPlayRecordList)
				? raw.scenarioPlayRecordList
				: Array.isArray(raw.list)
					? raw.list
					: [];
		const totalCount = typeof raw.totalCount === 'number' ? raw.totalCount : list.length;
		return { playRecordList: list as GetScenarioPlayRecordResponseDto['playRecordList'], totalCount };
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '플레이 기록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 환자 의상 리스트 조회 (Phase 3)
 * Swagger: GET /patient-clothing/list?type= (TOP | BOTTOM)
 */
export const getPatientClothingList = async (
	type?: 'TOP' | 'BOTTOM'
): Promise<PatientClothingListResponseDto> => {
	try {
		const response = await apiClient.get<PatientClothingListResponseDto>(
			'/patient-clothing/list',
			{ params: type ? { type } : {} }
		);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '환자 의상 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 환자 포즈 리스트 조회 (Phase 3)
 * Swagger: GET /pose/list?page=&pageSize=
 */
export const getPoseList = async (params: {
	page: number;
	pageSize: number;
}): Promise<PoseListResponseDto> => {
	try {
		const response = await apiClient.get<PoseListResponseDto>('/pose/list', {
			params,
		});
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || '환자 포즈 목록을 불러오는데 실패했습니다.');
		}
		throw error;
	}
};

/**
 * 시나리오 생성
 * Swagger: POST /scenario
 * - 백엔드 기대: camelCase (snake_case 시 "property should not exist" 400)
 * - camelCase 전송 시 400이면 원인은 백엔드 검증/스펙(검증 상세 미반환). 프론트 요청 형식은 Swagger 기준 준수.
 */
export const createScenario = async (data: CreateScenarioRequestDto): Promise<CreateScenarioResponseDto> => {
	try {
		const response = await apiClient.post<CreateScenarioResponseDto>('/scenario', data);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			// 에러 응답 데이터에서 상세 메시지 추출
			const errorMessage = error.data?.message || error.data?.error || error.message;
			const errorDetails = error.data?.details || error.data?.errors;
			
			if (error.status === 400) {
				let message = '시나리오 생성 요청이 올바르지 않습니다.';
				if (errorMessage) {
					message += `\n${errorMessage}`;
				}
				if (errorDetails) {
					if (Array.isArray(errorDetails)) {
						message += `\n\n상세:\n${errorDetails.join('\n')}`;
					} else if (typeof errorDetails === 'object') {
						message += `\n\n상세:\n${JSON.stringify(errorDetails, null, 2)}`;
					} else {
						message += `\n\n상세: ${errorDetails}`;
					}
				}
				// 백엔드 응답 전체를 로그/메시지에 포함해 원인 파악 (프론트/백 구분용)
				const fullBody = typeof error.data === 'object' && error.data !== null
					? JSON.stringify(error.data, null, 2)
					: String(error.data);
				if (process.env.NODE_ENV === 'development') {
					console.error('시나리오 생성 400 에러 상세 (백엔드 응답):', error.data);
				}
				if (fullBody && fullBody !== '{}' && !message.includes(fullBody)) {
					message += `\n\n[백엔드 응답]\n${fullBody}`;
				}
				// 백엔드가 검증 상세를 주지 않을 때: 콘솔 payload를 백엔드 팀에 전달 요청
				if (!errorDetails && (errorMessage === 'Invalid Request Error' || !error.data?.errors)) {
					message += '\n\n원인 파악: 개발자 도구 콘솔에서 "시나리오 생성 요청 payload"를 확인해 백엔드 팀에 전달해 주세요.';
				}
				throw new Error(message);
			}
			if (error.status === 404) {
				throw new Error('아이템, 캐릭터 또는 카테고리를 찾을 수 없습니다.');
			}
			throw new Error(errorMessage || '시나리오 생성에 실패했습니다.');
		}
		throw error;
	}
};
