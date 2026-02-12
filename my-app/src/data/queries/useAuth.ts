/**
 * Auth API Custom Hook
 * 
 * @description
 * Auth 및 Terms 관련 API를 호출하는 Custom Hook
 * Feature Flag (REACT_APP_USE_MOCK_DATA)로 Mock/Real API 전환 가능
 * 
 * @phase Phase 8 (API 연동)
 * 
 * @features
 * - 토큰 재발급 (POST /auth/access-token)
 * - 이메일 인증 코드 발송 (POST /auth/send-verification-email)
 * - 이메일 인증 코드 검증 (POST /auth/verify-verification-code)
 * - 비밀번호 재설정 요청 (POST /auth/password-reset)
 * - 비밀번호 변경 (POST /user/change-password)
 * - 계정 삭제 인증 코드 발송 (POST /auth/send-deletion-code)
 * - 계정 삭제 인증 코드 검증 (POST /auth/verify-deletion-code)
 * - 이용약관 리스트 조회 (GET /terms/list)
 * 
 * @usage
 * const { refreshAccessToken, sendVerificationEmail, verifyVerificationCode, ... } = useAuth();
 * 
 * @api
 * Base URL: process.env.REACT_APP_API_BASE_URL
 * 인증 필요: sendVerificationEmail, verifyVerificationCode, sendDeletionCode, verifyDeletionCode
 */

import {
	CreateAccessTokenByRefreshTokenRequestDto,
	CreateAccessTokenByRefreshTokenResponseDto,
	SendVerificationEmailRequestDto,
	SendVerificationEmailResponseDto,
	VerifyVerificationCodeRequestDto,
	VerifyVerificationCodeResponseDto,
	PasswordResetRequestDto,
	PasswordResetRequestResponseDto,
	SendDeletionCodeResponseDto,
	VerifyDeletionCodeRequestDto,
	VerifyDeletionCodeResponseDto,
} from '../../types/auth';

import { ChangePasswordRequestDto, ChangePasswordResponseDto } from '../../types/user';
import { GetTermsListResponseDto } from '../../types/terms';

import {
	mockRefreshTokenResponse,
	mockSendVerificationEmailResponse,
	mockVerifyVerificationCodeResponse,
	mockPasswordResetRequestResponse,
	mockChangePasswordResponse,
	mockSendDeletionCodeResponse,
	mockVerifyDeletionCodeResponse,
	mockTermsListResponse,
	generateMockVerificationCode,
	generateMockDeletionCode,
} from '../mock/user';

// Feature Flag: Mock 데이터 사용 여부
// 임시: 환경 변수 로드 안 되는 이슈로 하드코딩 (Phase 9 테스트용)
const USE_MOCK_DATA = false; // process.env.REACT_APP_USE_MOCK_DATA !== 'false';

// API Base URL
const API_BASE_URL = 'https://api.scenario-studio-test.medicrew.me'; // process.env.REACT_APP_API_BASE_URL || '';

/**
 * Auth API Custom Hook
 * 
 * @returns Auth API 함수들
 */
export const useAuth = () => {
	/**
	 * 리프레시 토큰으로 액세스 토큰 재발급 API
	 * 
	 * @description
	 * POST /auth/access-token
	 * 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.
	 * 
	 * @param refreshToken - 리프레시 토큰
	 * @returns Promise<CreateAccessTokenByRefreshTokenResponseDto> - { accessToken: string }
	 * 
	 * @throws
	 * - 401: 유효하지 않은 리프레시 토큰입니다.
	 * - 404: 존재하지 않는 유저입니다.
	 * 
	 * @example
	 * const result = await refreshAccessToken('refresh_token_here');
	 * localStorage.setItem('accessToken', result.accessToken);
	 */
	const refreshAccessToken = async (refreshToken: string): Promise<CreateAccessTokenByRefreshTokenResponseDto> => {
		if (USE_MOCK_DATA) {
			// ========== Mock 데이터 사용 ==========
			await new Promise(resolve => setTimeout(resolve, 500));
			return mockRefreshTokenResponse;
		}

		// ========== 실제 API 호출 ==========
		const response = await fetch(`${API_BASE_URL}/auth/access-token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ refreshToken } as CreateAccessTokenByRefreshTokenRequestDto),
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error('유효하지 않은 리프레시 토큰입니다.');
			} else if (response.status === 404) {
				throw new Error('존재하지 않는 유저입니다.');
			}
			throw new Error(`토큰 재발급 실패: ${response.status}`);
		}

		return await response.json();
	};

	/**
	 * 이메일 인증 코드 발송 API
	 * 
	 * @description
	 * POST /auth/send-verification-email
	 * 이메일 인증을 위한 6자리 코드를 발송합니다.
	 * 
	 * @param email - 이메일 주소
	 * @returns Promise<SendVerificationEmailResponseDto> - { message: string }
	 * 
	 * @auth Bearer Token 필요
	 * 
	 * @example
	 * const result = await sendVerificationEmail('user@example.com');
	 * console.log(result.message); // "인증 메일이 발송되었습니다."
	 */
	const sendVerificationEmail = async (email: string): Promise<SendVerificationEmailResponseDto> => {
		if (USE_MOCK_DATA) {
		// ========== Mock 데이터 사용 ==========
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		// Mock 코드 생성 (실제로는 서버에서 생성하여 이메일로 전송)
		generateMockVerificationCode();
		
		return mockSendVerificationEmailResponse;
		}

		// ========== 실제 API 호출 ==========
		// apiClient의 tokenStorage와 동일한 키 사용 ('medicrew_access_token')
		const accessToken = localStorage.getItem('medicrew_access_token');
		
		if (!accessToken) {
			throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
		}

		const response = await fetch(`${API_BASE_URL}/auth/send-verification-email`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			body: JSON.stringify({ email } as SendVerificationEmailRequestDto),
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
			}
			throw new Error(`인증 메일 발송 실패: ${response.status}`);
		}

		return await response.json();
	};

	/**
	 * 이메일 인증 코드 검증 API
	 * 
	 * @description
	 * POST /auth/verify-verification-code
	 * 이메일로 받은 6자리 코드를 검증합니다.
	 * 
	 * @param email - 이메일 주소
	 * @param verificationCode - 6자리 인증 코드
	 * @returns Promise<VerifyVerificationCodeResponseDto> - { message: string }
	 * 
	 * @throws
	 * - 400: 인증 코드가 일치하지 않거나 만료되었습니다.
	 * - 401: 유효하지 않은 토큰입니다.
	 * 
	 * @auth Bearer Token 필요
	 * 
	 * @example
	 * const result = await verifyVerificationCode('user@example.com', '123456');
	 * console.log(result.message); // "이메일 인증이 완료되었습니다."
	 */
	const verifyVerificationCode = async (email: string, verificationCode: string): Promise<VerifyVerificationCodeResponseDto> => {
		if (USE_MOCK_DATA) {
			// ========== Mock 데이터 사용 ==========
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Mock: 모든 6자리 코드 허용 (실제로는 서버에서 검증)
			if (verificationCode.length === 6) {
				return mockVerifyVerificationCodeResponse;
			}
			
			throw new Error('인증 코드가 일치하지 않거나 만료되었습니다.');
		}

		// ========== 실제 API 호출 ==========
		// apiClient의 tokenStorage와 동일한 키 사용 ('medicrew_access_token')
		const accessToken = localStorage.getItem('medicrew_access_token');
		
		if (!accessToken) {
			throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
		}

		const response = await fetch(`${API_BASE_URL}/auth/verify-verification-code`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			body: JSON.stringify({ email, verificationCode } as VerifyVerificationCodeRequestDto),
		});

		if (!response.ok) {
			if (response.status === 400) {
				throw new Error('인증 코드가 일치하지 않거나 만료되었습니다.');
			} else if (response.status === 401) {
				throw new Error('유효하지 않은 토큰입니다.');
			}
			throw new Error(`인증 코드 검증 실패: ${response.status}`);
		}

		return await response.json();
	};

	/**
	 * 비밀번호 재설정 요청 API
	 * 
	 * @description
	 * POST /auth/password-reset
	 * 비밀번호 재설정을 위한 resetToken을 이메일로 발송합니다.
	 * 
	 * @param email - 이메일 주소
	 * @returns Promise<PasswordResetRequestResponseDto> - { message: string }
	 * 
	 * @throws
	 * - 404: 존재하지 않는 사용자입니다.
	 * 
	 * @example
	 * const result = await requestPasswordReset('user@example.com');
	 * console.log(result.message); // "비밀번호 재설정 메일이 발송되었습니다."
	 */
	const requestPasswordReset = async (email: string): Promise<PasswordResetRequestResponseDto> => {
		if (USE_MOCK_DATA) {
	// ========== Mock 데이터 사용 ==========
	await new Promise(resolve => setTimeout(resolve, 1000));
	
	return mockPasswordResetRequestResponse;
		}

		// ========== 실제 API 호출 ==========
		const response = await fetch(`${API_BASE_URL}/auth/password-reset`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email } as PasswordResetRequestDto),
		});

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('존재하지 않는 사용자입니다.');
			}
			throw new Error(`비밀번호 재설정 요청 실패: ${response.status}`);
		}

		return await response.json();
	};

	/**
	 * 비밀번호 변경 API
	 * 
	 * @description
	 * POST /user/change-password
	 * resetToken을 사용하여 새로운 비밀번호로 변경합니다.
	 * 
	 * @param resetToken - 리셋 토큰 (이메일로 받은 토큰)
	 * @param newPassword - 새 비밀번호 (최소 8자)
	 * @returns Promise<ChangePasswordResponseDto> - { message: string }
	 * 
	 * @throws
	 * - 400: 유효하지 않거나 만료된 리셋 토큰입니다.
	 * - 404: 사용자를 찾을 수 없습니다.
	 * 
	 * @example
	 * const result = await changePassword('reset_token_here', 'newPassword123');
	 * console.log(result.message); // "비밀번호가 성공적으로 변경되었습니다."
	 */
	const changePassword = async (resetToken: string, newPassword: string): Promise<ChangePasswordResponseDto> => {
		if (USE_MOCK_DATA) {
			// ========== Mock 데이터 사용 ==========
			await new Promise(resolve => setTimeout(resolve, 1000));
			return mockChangePasswordResponse;
		}

		// ========== 실제 API 호출 ==========
		const response = await fetch(`${API_BASE_URL}/user/change-password`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ resetToken, newPassword } as ChangePasswordRequestDto),
		});

		if (!response.ok) {
			if (response.status === 400) {
				throw new Error('유효하지 않거나 만료된 리셋 토큰입니다.');
			} else if (response.status === 404) {
				throw new Error('사용자를 찾을 수 없습니다.');
			}
			throw new Error(`비밀번호 변경 실패: ${response.status}`);
		}

		return await response.json();
	};

	/**
	 * 계정 삭제 인증 코드 발송 API
	 * 
	 * @description
	 * POST /auth/send-deletion-code
	 * 계정 삭제를 위한 6자리 인증 코드를 이메일로 발송합니다.
	 * 
	 * @returns Promise<SendDeletionCodeResponseDto> - { message: string }
	 * 
	 * @throws
	 * - 400: 이메일이 등록되어 있지 않습니다.
	 * - 401: 유효하지 않은 토큰입니다.
	 * - 404: 존재하지 않는 사용자입니다.
	 * 
	 * @auth Bearer Token 필요
	 * 
	 * @example
	 * const result = await sendDeletionCode();
	 * console.log(result.message); // "계정 삭제 인증 코드가 발송되었습니다."
	 */
	const sendDeletionCode = async (): Promise<SendDeletionCodeResponseDto> => {
		if (USE_MOCK_DATA) {
		// ========== Mock 데이터 사용 ==========
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		// Mock 코드 생성 (실제로는 서버에서 생성하여 이메일로 전송)
		generateMockDeletionCode();
		
		return mockSendDeletionCodeResponse;
		}

		// ========== 실제 API 호출 ==========
		// apiClient의 tokenStorage와 동일한 키 사용 ('medicrew_access_token')
		const accessToken = localStorage.getItem('medicrew_access_token');
		
		if (!accessToken) {
			throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
		}

		const response = await fetch(`${API_BASE_URL}/auth/send-deletion-code`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			if (response.status === 400) {
				throw new Error('이메일이 등록되어 있지 않습니다.');
			} else if (response.status === 401) {
				throw new Error('유효하지 않은 토큰입니다.');
			} else if (response.status === 404) {
				throw new Error('존재하지 않는 사용자입니다.');
			}
			throw new Error(`인증 코드 발송 실패: ${response.status}`);
		}

		return await response.json();
	};

	/**
	 * 계정 삭제 인증 코드 검증 API
	 * 
	 * @description
	 * POST /auth/verify-deletion-code
	 * 이메일로 받은 계정 삭제 인증 코드를 검증합니다.
	 * 
	 * @param deletionCode - 6자리 인증 코드
	 * @returns Promise<VerifyDeletionCodeResponseDto> - { message: string }
	 * 
	 * @throws
	 * - 400: 인증 코드가 일치하지 않거나 만료되었습니다.
	 * - 401: 유효하지 않은 토큰입니다.
	 * 
	 * @auth Bearer Token 필요
	 * 
	 * @example
	 * const result = await verifyDeletionCode('123456');
	 * console.log(result.message); // "인증 코드가 확인되었습니다."
	 */
	const verifyDeletionCode = async (deletionCode: string): Promise<VerifyDeletionCodeResponseDto> => {
		if (USE_MOCK_DATA) {
			// ========== Mock 데이터 사용 ==========
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Mock: 모든 6자리 코드 허용 (실제로는 서버에서 검증)
			if (deletionCode.length === 6) {
				return mockVerifyDeletionCodeResponse;
			}
			
			throw new Error('인증 코드가 일치하지 않거나 만료되었습니다.');
		}

		// ========== 실제 API 호출 ==========
		// apiClient의 tokenStorage와 동일한 키 사용 ('medicrew_access_token')
		const accessToken = localStorage.getItem('medicrew_access_token');
		
		if (!accessToken) {
			throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
		}

		const response = await fetch(`${API_BASE_URL}/auth/verify-deletion-code`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			body: JSON.stringify({ deletionCode } as VerifyDeletionCodeRequestDto),
		});

		if (!response.ok) {
			if (response.status === 400) {
				throw new Error('인증 코드가 일치하지 않거나 만료되었습니다.');
			} else if (response.status === 401) {
				throw new Error('유효하지 않은 토큰입니다.');
			}
			throw new Error(`인증 코드 검증 실패: ${response.status}`);
		}

		return await response.json();
	};

	/**
	 * 이용약관 리스트 조회 API
	 * 
	 * @description
	 * GET /terms/list
	 * 서비스 이용약관 및 개인정보 처리방침 리스트를 조회합니다.
	 * 
	 * @returns Promise<GetTermsListResponseDto> - { termsList: TermsListItemDto[] }
	 * 
	 * @example
	 * const result = await getTermsList();
	 * console.log(result.termsList); // [{ termsId: 1, title: "서비스 이용약관", ... }, ...]
	 */
	const getTermsList = async (): Promise<GetTermsListResponseDto> => {
		if (USE_MOCK_DATA) {
			// ========== Mock 데이터 사용 ==========
			await new Promise(resolve => setTimeout(resolve, 500));
			return mockTermsListResponse;
		}

		// ========== 실제 API 호출 ==========
		const response = await fetch(`${API_BASE_URL}/terms/list`, {
			method: 'GET',
		});

		if (!response.ok) {
			throw new Error(`이용약관 조회 실패: ${response.status}`);
		}

		return await response.json();
	};

	return {
		refreshAccessToken,
		sendVerificationEmail,
		verifyVerificationCode,
		requestPasswordReset,
		changePassword,
		sendDeletionCode,
		verifyDeletionCode,
		getTermsList,
	};
};
