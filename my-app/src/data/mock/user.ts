/**
 * User 관련 Mock 데이터 및 Helper 함수
 * 
 * @description
 * Phase 2-7에서 실제 API 없이 UI/UX 개발을 가능하게 하는 Mock 데이터 모음
 * Feature Flag (REACT_APP_USE_MOCK_DATA)로 Mock/Real API 전환 가능
 * 
 * @usage
 * - Phase 2: 회원가입 폼에서 중복 확인 Mock (`mockCheckEmail`, `mockCheckLoginId`)
 * - Phase 3: 로그인 Mock (`mockLoginResponse`)
 * - Phase 4: 프로필 조회/수정 Mock (`mockUserProfile`, `mockUpdateProfileResponse`)
 * - Phase 5: 이메일 인증 Mock (`generateMockVerificationCode`)
 * - Phase 6: 비밀번호 재설정 Mock (`mockPasswordResetRequestResponse`)
 * - Phase 7: 회원 탈퇴 Mock (`generateMockDeletionCode`)
 * 
 * @phase Phase 2-7 (Mock 데이터 사용), Phase 8 (실제 API로 전환)
 * 
 * @replacement
 * Phase 8에서 실제 API 연동 시:
 * - `data/queries/useUser.ts` (User API Custom Hook)
 * - `data/queries/useAuth.ts` (Auth API Custom Hook)
 * 로 대체됨
 * 
 * @total Mock Response 데이터 15개, Helper 함수 4개
 */

import {
	UserProfileResponseDto,
	SignupResponseDto,
	LoginResponseDto,
	CheckEmailResponseDto,
	CheckLoginIdResponseDto,
	UpdateUserProfileResponseDto,
	ChangePasswordResponseDto,
	DeleteMyAccountResponseDto,
} from '../../types/user';

import {
	SendVerificationEmailResponseDto,
	VerifyVerificationCodeResponseDto,
	PasswordResetRequestResponseDto,
	SendDeletionCodeResponseDto,
	VerifyDeletionCodeResponseDto,
	CreateAccessTokenByRefreshTokenResponseDto,
} from '../../types/auth';

import { GetTermsListResponseDto } from '../../types/terms';

// ===== Mock User Profile =====

/**
 * Mock 유저 프로필 데이터
 * 
 * @description
 * GET /user/profile API 응답을 시뮬레이션하는 Mock 데이터
 * 
 * @usage Phase 4 프로필 조회 페이지에서 사용
 * @phase Phase 4, Phase 8
 * 
 * @mock 하드코딩된 샘플 유저 데이터
 */
export const mockUserProfile: UserProfileResponseDto = {
	id: 1,                                              // 유저 ID
	email: 'user@example.com',                          // 이메일 (인증 완료)
	realName: '홍길동',                                  // 실명
	phoneNumber: '010-1234-5678',                       // 전화번호
	profileImageUrl: 'https://via.placeholder.com/150', // 프로필 이미지 (Placeholder)
	role: 1,                                            // 권한 (1: 일반 사용자)
	createdAt: '2024-01-01T00:00:00.000Z',            // 계정 생성일
	lastSigninAt: '2024-01-20T10:30:00.000Z',         // 마지막 로그인
	signinCount: 42,                                    // 로그인 횟수
	organizationId: null,                               // 조직 미소속
	organizationName: null,                             // 조직명 없음
};

// ===== Mock Signup Response =====

/**
 * Mock 회원가입 응답 데이터
 * 
 * @description
 * POST /user/signup API 응답을 시뮬레이션하는 Mock 데이터
 * 
 * @usage Phase 2 회원가입 완료 시 반환되는 응답
 * @phase Phase 2, Phase 8
 * 
 * @mock 생성된 유저 ID를 1로 고정
 */
export const mockSignupResponse: SignupResponseDto = {
	userId: 1, // Mock: 생성된 유저 ID (실제로는 DB에서 auto-increment로 생성)
};

// ===== Mock Login Response =====

/**
 * Mock 로그인 응답 데이터
 * 
 * @description
 * POST /user/login API 응답을 시뮬레이션하는 Mock 데이터
 * 
 * @usage Phase 3 로그인 성공 시 반환되는 토큰
 * @phase Phase 3, Phase 8
 * 
 * @mock 하드코딩된 Mock 토큰 (실제로는 서버에서 JWT 생성)
 */
export const mockLoginResponse: LoginResponseDto = {
	accessToken: 'mock_access_token_123456789',   // Mock 액세스 토큰 (실제 JWT가 아님)
	refreshToken: 'mock_refresh_token_987654321', // Mock 리프레시 토큰 (실제 JWT가 아님)
};

// ===== Mock Check Email Response =====

export const mockCheckEmailResponseAvailable: CheckEmailResponseDto = {
	isAvailable: true,
};

export const mockCheckEmailResponseUnavailable: CheckEmailResponseDto = {
	isAvailable: false,
};

// ===== Mock Check Login ID Response =====

export const mockCheckLoginIdResponseAvailable: CheckLoginIdResponseDto = {
	isAvailable: true,
};

export const mockCheckLoginIdResponseUnavailable: CheckLoginIdResponseDto = {
	isAvailable: false,
};

// ===== Mock Update Profile Response =====

export const mockUpdateProfileResponse: UpdateUserProfileResponseDto = {
	message: '프로필이 성공적으로 업데이트되었습니다.',
};

// ===== Mock Change Password Response =====

export const mockChangePasswordResponse: ChangePasswordResponseDto = {
	message: '비밀번호가 성공적으로 변경되었습니다.',
};

// ===== Mock Delete Account Response =====

export const mockDeleteAccountResponse: DeleteMyAccountResponseDto = {
	message: '회원 탈퇴가 완료되었습니다.',
};

// ===== Mock Auth Responses =====

export const mockSendVerificationEmailResponse: SendVerificationEmailResponseDto = {
	message: '인증 메일이 발송되었습니다.',
};

export const mockVerifyVerificationCodeResponse: VerifyVerificationCodeResponseDto = {
	message: '이메일 인증이 완료되었습니다.',
};

export const mockPasswordResetRequestResponse: PasswordResetRequestResponseDto = {
	message: '비밀번호 재설정 메일이 발송되었습니다.',
};

export const mockSendDeletionCodeResponse: SendDeletionCodeResponseDto = {
	message: '계정 삭제 인증 코드가 발송되었습니다.',
};

export const mockVerifyDeletionCodeResponse: VerifyDeletionCodeResponseDto = {
	message: '인증 코드가 확인되었습니다.',
};

export const mockRefreshTokenResponse: CreateAccessTokenByRefreshTokenResponseDto = {
	accessToken: 'new_mock_access_token_123456789',
};

// ===== Mock Terms List =====

export const mockTermsListResponse: GetTermsListResponseDto = {
	termsList: [
		{
			termsId: 1,
			type: 'TERMS_OF_SERVICE',
			version: '1.0',
			title: '서비스 이용약관',
			content: '서비스 이용약관 내용입니다...',
			isRequired: true,
			createdAt: '2024-01-01T00:00:00.000Z',
		},
		{
			termsId: 2,
			type: 'PRIVACY_POLICY',
			version: '1.0',
			title: '개인정보 처리방침',
			content: '개인정보 처리방침 내용입니다...',
			isRequired: true,
			createdAt: '2024-01-01T00:00:00.000Z',
		},
		{
			termsId: 3,
			type: 'TERMS_OF_SERVICE',
			version: '1.1',
			title: '마케팅 정보 수신 동의',
			content: '마케팅 정보 수신 동의 내용입니다...',
			isRequired: false,
			createdAt: '2024-01-15T00:00:00.000Z',
		},
	],
};

// ===== Mock Helper Functions =====

/**
 * Mock 이메일 중복 확인 함수
 * 
 * @description
 * 이메일 중복 확인을 시뮬레이션합니다.
 * 실제 API: POST /user/check-email
 * 
 * @param email - 확인할 이메일 주소
 * @returns Promise<CheckEmailResponseDto> - { isAvailable: boolean }
 * 
 * @usage Phase 2 회원가입 페이지에서 이메일 입력 시 사용 (디바운스 적용)
 * @phase Phase 2, Phase 8
 * 
 * @mock
 * - 1초 지연으로 실제 API 호출 시뮬레이션
 * - 하드코딩된 이메일 목록: ['admin@example.com', 'test@example.com']
 * - 위 2개 이메일만 "사용 중"으로 표시, 나머지는 "사용 가능"
 * - Phase 8에서 실제 API로 전환 시 DB에서 실제 중복 확인
 * 
 * @example
 * const result = await mockCheckEmail('user@example.com');
 * if (result.isAvailable) {
 *   console.log('사용 가능한 이메일입니다.');
 * } else {
 *   console.log('이미 사용 중인 이메일입니다.');
 * }
 */
export const mockCheckEmail = async (email: string): Promise<CheckEmailResponseDto> => {
	// 실제 API 호출을 시뮬레이션하기 위한 1초 지연
	// 실제 네트워크 요청처럼 보이게 함
	await new Promise((resolve) => setTimeout(resolve, 1000));
	
	// Mock: 이미 사용 중인 이메일 목록 (하드코딩)
	// Phase 8에서는 실제 DB 조회로 변경됨
	const usedEmails = ['admin@example.com', 'test@example.com'];
	
	// 입력한 이메일이 사용 중인 목록에 포함되어 있는지 확인
	return {
		isAvailable: !usedEmails.includes(email),
	};
};

/**
 * Mock 로그인 ID 중복 확인 함수
 * 
 * @description
 * 로그인 ID 중복 확인을 시뮬레이션합니다.
 * 실제 API: POST /user/check-login-id
 * 
 * @param loginId - 확인할 로그인 ID (최소 3자 이상 권장)
 * @returns Promise<CheckLoginIdResponseDto> - { isAvailable: boolean }
 * 
 * @usage Phase 2 회원가입 페이지에서 아이디 입력 시 사용 (실시간 검증, 디바운스 적용)
 * @phase Phase 2, Phase 8
 * 
 * @mock
 * - 1초 지연으로 실제 API 호출 시뮬레이션
 * - 하드코딩된 로그인 ID 목록: ['admin', 'test', 'user123']
 * - 위 3개 ID만 "사용 중"으로 표시, 나머지는 "사용 가능"
 * - Phase 8에서 실제 API로 전환 시 DB에서 실제 중복 확인
 * 
 * @example
 * const result = await mockCheckLoginId('testuser');
 * if (result.isAvailable) {
 *   console.log('사용 가능한 아이디입니다.');
 * } else {
 *   console.log('이미 사용 중인 아이디입니다.');
 * }
 */
export const mockCheckLoginId = async (loginId: string): Promise<CheckLoginIdResponseDto> => {
	// 실제 API 호출을 시뮬레이션하기 위한 1초 지연
	// 실제 네트워크 요청처럼 보이게 함
	await new Promise((resolve) => setTimeout(resolve, 1000));
	
	// Mock: 이미 사용 중인 로그인 ID 목록 (하드코딩)
	// Phase 8에서는 실제 DB 조회로 변경됨
	const usedLoginIds = ['admin', 'test', 'user123'];
	
	// 입력한 로그인 ID가 사용 중인 목록에 포함되어 있는지 확인
	return {
		isAvailable: !usedLoginIds.includes(loginId),
	};
};

/**
 * Mock 이메일 인증 코드 생성 함수
 * 
 * @description
 * 이메일 인증에 사용할 6자리 랜덤 코드를 생성합니다.
 * 실제 API에서는 서버가 생성하여 이메일로 전송
 * 
 * @returns string - 6자리 숫자 문자열 (예: "123456")
 * 
 * @usage Phase 5 이메일 인증 페이지에서 Mock 코드 생성 시 사용
 * @phase Phase 5, Phase 8
 * 
 * @mock
 * - 클라이언트에서 랜덤 6자리 숫자 생성
 * - Phase 8에서는 서버가 생성한 코드를 이메일로 수신
 * 
 * @example
 * const code = generateMockVerificationCode();
 * console.log(code); // "743281"
 */
export const generateMockVerificationCode = (): string => {
	// 6자리 랜덤 숫자 생성 (100000 ~ 999999)
	// Math.random() * 900000 → 0 ~ 899999
	// + 100000 → 100000 ~ 999999
	return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Mock 계정 삭제 인증 코드 생성 함수
 * 
 * @description
 * 회원 탈퇴 시 본인 확인에 사용할 6자리 랜덤 코드를 생성합니다.
 * 실제 API에서는 서버가 생성하여 이메일로 전송
 * 
 * @returns string - 6자리 숫자 문자열 (예: "789012")
 * 
 * @usage Phase 7 회원 탈퇴 페이지에서 Mock 코드 생성 시 사용
 * @phase Phase 7, Phase 8
 * 
 * @mock
 * - 클라이언트에서 랜덤 6자리 숫자 생성
 * - Phase 8에서는 서버가 생성한 코드를 이메일로 수신
 * 
 * @example
 * const code = generateMockDeletionCode();
 * console.log(code); // "456789"
 */
export const generateMockDeletionCode = (): string => {
	// 6자리 랜덤 숫자 생성 (100000 ~ 999999)
	// Math.random() * 900000 → 0 ~ 899999
	// + 100000 → 100000 ~ 999999
	return Math.floor(100000 + Math.random() * 900000).toString();
};
