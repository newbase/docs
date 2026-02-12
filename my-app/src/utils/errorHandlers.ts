/**
 * 에러 핸들링 유틸리티
 * Error Handling Utilities
 * 
 * API 에러, 네트워크 에러 등을 일관되게 처리하는 함수들
 */

import { ApiError } from '../services/apiClient';

/**
 * 에러 메시지 타입
 */
export interface ErrorMessage {
	title: string;
	message: string;
	type: 'error' | 'warning' | 'info';
}

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 * @param error 에러 객체
 * @param defaultMessage 기본 메시지 (선택사항)
 * @returns 에러 메시지 객체
 */
export const handleApiError = (
	error: unknown, 
	defaultMessage: string = '오류가 발생했습니다.'
): ErrorMessage => {
	// ApiError 타입 (백엔드 API 에러)
	if (error instanceof ApiError) {
		const statusCode = error.status;
		
		switch (statusCode) {
			case 400:
				return {
					title: '잘못된 요청',
					message: error.message || '입력하신 정보를 확인해주세요.',
					type: 'error'
				};
			
			case 401:
				return {
					title: '인증 필요',
					message: '로그인이 필요합니다. 다시 로그인해주세요.',
					type: 'warning'
				};
			
			case 403:
				return {
					title: '권한 없음',
					message: '이 작업을 수행할 권한이 없습니다.',
					type: 'error'
				};
			
			case 404:
				return {
					title: '데이터 없음',
					message: '요청한 데이터를 찾을 수 없습니다.',
					type: 'error'
				};
			
			case 409:
				return {
					title: '충돌 오류',
					message: error.message || '이미 존재하는 데이터입니다.',
					type: 'error'
				};
			
			case 422:
				return {
					title: '유효성 검증 실패',
					message: error.message || '입력하신 정보가 올바르지 않습니다.',
					type: 'error'
				};
			
			case 429:
				return {
					title: '요청 제한 초과',
					message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
					type: 'warning'
				};
			
			case 500:
			case 502:
			case 503:
				return {
					title: '서버 오류',
					message: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
					type: 'error'
				};
			
			case 504:
				return {
					title: '응답 시간 초과',
					message: '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
					type: 'warning'
				};
			
			default:
				return {
					title: `오류 (${statusCode})`,
					message: error.message || defaultMessage,
					type: 'error'
				};
		}
	}
	
	// 일반 Error 객체 (네트워크 에러 등)
	if (error instanceof Error) {
		// 네트워크 에러
		if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
			return {
				title: '네트워크 오류',
				message: '인터넷 연결을 확인해주세요.',
				type: 'error'
			};
		}
		
		// 타임아웃 에러
		if (error.message.includes('timeout') || error.message.includes('Timeout')) {
			return {
				title: '응답 시간 초과',
				message: '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
				type: 'warning'
			};
		}
		
		return {
			title: '오류',
			message: error.message || defaultMessage,
			type: 'error'
		};
	}
	
	// 알 수 없는 에러
	return {
		title: '알 수 없는 오류',
		message: defaultMessage,
		type: 'error'
	};
};

/**
 * API 에러를 간단한 문자열 메시지로 변환
 * @param error 에러 객체
 * @param defaultMessage 기본 메시지
 * @returns 에러 메시지 문자열
 */
export const getErrorMessage = (
	error: unknown, 
	defaultMessage: string = '오류가 발생했습니다.'
): string => {
	const errorMsg = handleApiError(error, defaultMessage);
	return `${errorMsg.title}: ${errorMsg.message}`;
};

/**
 * 유효성 검증 에러 메시지 생성
 * @param field 필드명
 * @param rule 규칙명
 * @returns 에러 메시지
 */
export const getValidationError = (field: string, rule: string): string => {
	const fieldNames: Record<string, string> = {
		email: '이메일',
		password: '비밀번호',
		name: '이름',
		phone: '전화번호',
		organizationName: '기관명',
		businessNumber: '사업자번호',
		contactPerson: '담당자명',
		department: '부서',
		position: '직위',
	};
	
	const ruleMessages: Record<string, string> = {
		required: '필수 항목입니다.',
		email: '올바른 이메일 형식이 아닙니다.',
		minLength: '최소 길이를 충족하지 않습니다.',
		maxLength: '최대 길이를 초과했습니다.',
		pattern: '형식이 올바르지 않습니다.',
		numeric: '숫자만 입력 가능합니다.',
		alphanumeric: '영문자와 숫자만 입력 가능합니다.',
	};
	
	const fieldName = fieldNames[field] || field;
	const ruleMessage = ruleMessages[rule] || '유효하지 않습니다.';
	
	return `${fieldName}이(가) ${ruleMessage}`;
};

/**
 * 파일 업로드 에러 처리
 * @param error 에러 객체
 * @param fileName 파일명
 * @returns 에러 메시지 객체
 */
export const handleFileUploadError = (error: unknown, fileName?: string): ErrorMessage => {
	const fileInfo = fileName ? ` (${fileName})` : '';
	
	if (error instanceof ApiError) {
		if (error.status === 413) {
			return {
				title: '파일 크기 초과',
				message: `파일${fileInfo}이(가) 너무 큽니다. 파일 크기를 확인해주세요.`,
				type: 'error'
			};
		}
		
		if (error.status === 415) {
			return {
				title: '지원하지 않는 파일 형식',
				message: `파일${fileInfo}의 형식이 지원되지 않습니다.`,
				type: 'error'
			};
		}
	}
	
	return {
		title: '파일 업로드 실패',
		message: `파일${fileInfo} 업로드 중 오류가 발생했습니다.`,
		type: 'error'
	};
};

/**
 * React Query 에러 핸들러
 * @param error 에러 객체
 * @param context 컨텍스트 (쿼리 키 등)
 */
export const handleQueryError = (error: unknown, context?: string): void => {
	const errorMsg = handleApiError(error);
	
	console.error('[Query Error]', {
		context,
		error: errorMsg,
		original: error
	});
	
	// TODO: 글로벌 에러 토스트 메시지 표시
	// toast.error(`${errorMsg.title}: ${errorMsg.message}`);
};

/**
 * React Query Mutation 에러 핸들러
 * @param error 에러 객체
 * @param context 컨텍스트 (mutation 이름 등)
 */
export const handleMutationError = (error: unknown, context?: string): void => {
	const errorMsg = handleApiError(error);
	
	console.error('[Mutation Error]', {
		context,
		error: errorMsg,
		original: error
	});
	
	// TODO: 글로벌 에러 토스트 메시지 표시
	// toast.error(`${errorMsg.title}: ${errorMsg.message}`);
};

/**
 * 401 Unauthorized 에러 처리 (자동 로그아웃)
 * @param navigate React Router navigate 함수
 */
export const handle401Error = (navigate: (path: string) => void): void => {
	// 토큰 제거
	localStorage.removeItem('authToken');
	sessionStorage.removeItem('authToken');
	
	// 로그인 페이지로 리다이렉트
	navigate('/login?redirect=true&reason=unauthorized');
};

/**
 * 에러 로깅 (개발 환경에서만)
 * @param error 에러 객체
 * @param context 컨텍스트
 */
export const logError = (error: unknown, context?: string): void => {
	if (process.env.NODE_ENV === 'development') {
		console.error(`[Error] ${context || 'Unknown context'}`, error);
	}
	
	// TODO: 프로덕션 환경에서는 에러 모니터링 서비스로 전송
	// Sentry.captureException(error, { tags: { context } });
};

/**
 * 에러를 사용자에게 알림창으로 표시
 * @param error 에러 객체
 * @param defaultMessage 기본 메시지
 */
export const showErrorAlert = (error: unknown, defaultMessage?: string): void => {
	const errorMsg = handleApiError(error, defaultMessage);
	alert(`${errorMsg.title}\n\n${errorMsg.message}`);
};

/**
 * 에러를 콘솔에만 로깅 (사용자에게 표시하지 않음)
 * @param error 에러 객체
 * @param context 컨텍스트
 */
export const silentError = (error: unknown, context?: string): void => {
	if (process.env.NODE_ENV === 'development') {
		console.warn(`[Silent Error] ${context || 'Unknown'}`, error);
	}
};
