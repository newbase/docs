/**
 * Auth Service
 * Swagger: /auth/* (토큰 재발급, 인증 메일, 비밀번호 재설정, 회원 탈퇴 인증 코드 등)
 * apiClient 401 시 토큰 재발급에 사용. apiClient를 import하지 않아 순환 의존성 방지.
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
const ACCESS_TOKEN_KEY = 'medicrew_access_token';
const REFRESH_TOKEN_KEY = 'medicrew_refresh_token';

export interface CreateAccessTokenByRefreshTokenRequestDto {
	refreshToken: string;
}

export interface CreateAccessTokenByRefreshTokenResponseDto {
	accessToken: string;
}

/**
 * 리프레시 토큰으로 액세스 토큰 재발급
 * POST /auth/access-token
 * apiClient 401 시 setTokenRefreshFn으로 등록하여 사용.
 */
export const refreshAccessToken = async (): Promise<{
	accessToken: string;
	refreshToken?: string;
} | null> => {
	const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
	if (!refreshToken) return null;

	try {
		const res = await fetch(`${API_BASE_URL}/auth/access-token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refreshToken }),
		});
		if (!res.ok) {
			if (res.status === 401 || res.status === 404) return null;
			throw new Error(res.statusText);
		}
		const data: CreateAccessTokenByRefreshTokenResponseDto = await res.json();
		localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
		return { accessToken: data.accessToken, refreshToken };
	} catch {
		return null;
	}
};

export interface SendVerificationEmailRequestDto {
	email: string;
}

export interface SendVerificationEmailResponseDto {
	message: string;
}

/** POST /auth/send-verification-email */
export const sendVerificationEmail = async (
	data: SendVerificationEmailRequestDto
): Promise<SendVerificationEmailResponseDto> => {
	const res = await fetch(`${API_BASE_URL}/auth/send-verification-email`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_KEY)}` },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error(await res.text() || res.statusText);
	return res.json();
};

export interface VerifyVerificationCodeRequestDto {
	email: string;
	verificationCode: string;
}

export interface VerifyVerificationCodeResponseDto {
	message: string;
}

/** POST /auth/verify-verification-code */
export const verifyVerificationCode = async (
	data: VerifyVerificationCodeRequestDto
): Promise<VerifyVerificationCodeResponseDto> => {
	const res = await fetch(`${API_BASE_URL}/auth/verify-verification-code`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_KEY)}` },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error(await res.text() || res.statusText);
	return res.json();
};

export interface PasswordResetRequestDto {
	email: string;
}

export interface PasswordResetRequestResponseDto {
	message: string;
}

/** POST /auth/password-reset */
export const requestPasswordReset = async (
	data: PasswordResetRequestDto
): Promise<PasswordResetRequestResponseDto> => {
	const res = await fetch(`${API_BASE_URL}/auth/password-reset`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error(await res.text() || res.statusText);
	return res.json();
};

export interface SendDeletionCodeResponseDto {
	message: string;
}

/** POST /auth/send-deletion-code (회원 탈퇴 인증 코드 메일 발송) */
export const sendDeletionCode = async (): Promise<SendDeletionCodeResponseDto> => {
	const res = await fetch(`${API_BASE_URL}/auth/send-deletion-code`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_KEY)}` },
	});
	if (!res.ok) throw new Error(await res.text() || res.statusText);
	return res.json();
};

export interface VerifyDeletionCodeRequestDto {
	deletionCode: string;
}

export interface VerifyDeletionCodeResponseDto {
	message: string;
}

/** POST /auth/verify-deletion-code */
export const verifyDeletionCode = async (
	data: VerifyDeletionCodeRequestDto
): Promise<VerifyDeletionCodeResponseDto> => {
	const res = await fetch(`${API_BASE_URL}/auth/verify-deletion-code`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_KEY)}` },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error(await res.text() || res.statusText);
	return res.json();
};

export interface ChangePasswordRequestDto {
	resetToken: string;
	newPassword: string;
}

export interface ChangePasswordResponseDto {
	message: string;
}

/** POST /user/change-password (본인, 비밀번호 재설정 토큰 사용) */
export const changePasswordByResetToken = async (
	data: ChangePasswordRequestDto
): Promise<ChangePasswordResponseDto> => {
	const res = await fetch(`${API_BASE_URL}/user/change-password`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error(await res.text() || res.statusText);
	return res.json();
};
