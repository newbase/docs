/**
 * Auth 관련 TypeScript 타입 정의
 * 
 * Swagger API 문서 기반으로 정의됨
 * 출처: https://api.scenario-studio-test.medicrew.me/swagger
 * 
 * @see my-app/docs/api/API.md
 */

// ===== Request Types =====

/**
 * 리프레시 토큰으로 액세스 토큰 재발급 요청
 * POST /auth/access-token
 */
export interface CreateAccessTokenByRefreshTokenRequestDto {
	refreshToken: string; // 리프레시 토큰
}

/**
 * 이메일 인증 코드 발송 요청
 * POST /auth/send-verification-email
 */
export interface SendVerificationEmailRequestDto {
	email: string; // 이메일 주소
}

/**
 * 이메일 인증 코드 검증 요청
 * POST /auth/verify-verification-code
 */
export interface VerifyVerificationCodeRequestDto {
	email: string;             // 이메일 주소
	verificationCode: string;  // 6자리 인증 코드
}

/**
 * 비밀번호 재설정 요청
 * POST /auth/password-reset
 */
export interface PasswordResetRequestDto {
	email: string; // 이메일
}

/**
 * 계정 삭제 인증 코드 검증 요청
 * POST /auth/verify-deletion-code
 */
export interface VerifyDeletionCodeRequestDto {
	deletionCode: string; // 6자리 인증 코드
}

// ===== Response Types =====

/**
 * 리프레시 토큰으로 액세스 토큰 재발급 응답
 * POST /auth/access-token
 */
export interface CreateAccessTokenByRefreshTokenResponseDto {
	accessToken: string; // 새로 발급된 액세스 토큰
}

/**
 * 이메일 인증 코드 발송 응답
 * POST /auth/send-verification-email
 */
export interface SendVerificationEmailResponseDto {
	message: string;
}

/**
 * 이메일 인증 코드 검증 응답
 * POST /auth/verify-verification-code
 */
export interface VerifyVerificationCodeResponseDto {
	message: string;
}

/**
 * 비밀번호 재설정 요청 응답
 * POST /auth/password-reset
 */
export interface PasswordResetRequestResponseDto {
	message: string;
}

/**
 * 계정 삭제 인증 코드 발송 응답
 * POST /auth/send-deletion-code
 */
export interface SendDeletionCodeResponseDto {
	message: string;
}

/**
 * 계정 삭제 인증 코드 검증 응답
 * POST /auth/verify-deletion-code
 */
export interface VerifyDeletionCodeResponseDto {
	message: string;
}
