/**
 * Type Check 파일
 * 
 * Phase 1 타입 정의 검증용
 * 이 파일은 타입 체크만을 위한 것이며, 실제 코드에서는 사용되지 않습니다.
 */

// ===== User Types Import Test =====
import type {
	SignupRequestDto,
	SignupResponseDto,
	LoginDto,
	LoginResponseDto,
	UserProfileResponseDto,
	UpdateUserProfileRequestDto,
	UpdateUserProfileResponseDto,
	CheckEmailRequestDto,
	CheckEmailResponseDto,
	CheckLoginIdRequestDto,
	CheckLoginIdResponseDto,
	ChangePasswordRequestDto,
	ChangePasswordResponseDto,
	DeleteMyAccountResponseDto,
} from './user';

// ===== Auth Types Import Test =====
import type {
	CreateAccessTokenByRefreshTokenRequestDto,
	CreateAccessTokenByRefreshTokenResponseDto,
	SendVerificationEmailRequestDto,
	SendVerificationEmailResponseDto,
	VerifyVerificationCodeRequestDto,
	VerifyVerificationCodeResponseDto,
	PasswordResetRequestDto,
	PasswordResetRequestResponseDto,
	VerifyDeletionCodeRequestDto,
	VerifyDeletionCodeResponseDto,
	SendDeletionCodeResponseDto,
} from './auth';

// ===== Terms Types Import Test =====
import type {
	TermsType,
	TermsListItemDto,
	GetTermsListResponseDto,
} from './terms';

// ===== Type Validation =====
// 이 섹션은 타입이 제대로 정의되었는지 확인하기 위한 것입니다.

// User Types Validation
const _signupRequest: SignupRequestDto = {
	loginId: 'test',
	pw: 'password123',
	realName: '홍길동',
	termsIdList: [1, 2],
};

const _signupResponse: SignupResponseDto = {
	userId: 1,
};

const _loginRequest: LoginDto = {
	loginId: 'test',
	password: 'password123',
};

const _loginResponse: LoginResponseDto = {
	accessToken: 'token',
	refreshToken: 'refresh',
};

const _userProfile: UserProfileResponseDto = {
	id: 1,
	email: 'test@example.com',
	realName: '홍길동',
	phoneNumber: '010-1234-5678',
	profileImageUrl: null,
	role: 1,
	createdAt: '2024-01-01T00:00:00.000Z',
	lastSigninAt: '2024-01-01T00:00:00.000Z',
	signinCount: 0,
	organizationId: null,
	organizationName: null,
};

// Auth Types Validation
const _refreshTokenRequest: CreateAccessTokenByRefreshTokenRequestDto = {
	refreshToken: 'refresh_token',
};

const _refreshTokenResponse: CreateAccessTokenByRefreshTokenResponseDto = {
	accessToken: 'new_token',
};

// Terms Types Validation
const _termsList: GetTermsListResponseDto = {
	termsList: [
		{
			termsId: 1,
			type: 'TERMS_OF_SERVICE',
			version: '1.0',
			title: '서비스 이용약관',
			content: '내용',
			isRequired: true,
			createdAt: '2024-01-01T00:00:00.000Z',
		},
	],
};

// 모든 타입이 정상적으로 import되고 사용 가능함을 확인
export type TypeCheckComplete = true;
