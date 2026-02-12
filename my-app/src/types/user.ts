/**
 * User 관련 TypeScript 타입 정의
 * 
 * @description
 * 회원가입, 로그인, 프로필 관리, 비밀번호 변경, 회원 탈퇴 등
 * User 기능의 타입 안전성을 보장하기 위한 타입 정의
 * 
 * @swagger Swagger API 문서 기반으로 정의됨
 * @source https://api.scenario-studio-test.medicrew.me/swagger
 * @see my-app/docs/api/API.md
 * 
 * @usage
 * - Phase 2-7: UI 컴포넌트에서 폼 데이터 타입 지정
 * - Phase 8: API 연동 시 Request/Response 타입 검증
 * 
 * @total 13개 타입 (Request 6개, Response 7개)
 */

// ===== Request Types =====

/**
 * 회원가입 요청 DTO
 * 
 * @description
 * POST /user/signup API 호출 시 사용되는 Request DTO
 * 
 * @usage Phase 2 회원가입 페이지에서 사용
 * @phase Phase 2, Phase 8
 */
export interface SignupRequestDto {
	/** 로그인 ID (중복 확인 필수, 영문자/숫자/특수문자 가능) */
	loginId: string;
	
	/** 비밀번호 (최소 8자, 영문자+숫자 포함 필수) */
	pw: string;
	
	/** 사용자 실명 (필수) */
	realName: string;
	
	/** 전화번호 (선택 사항, 형식: 010-xxxx-xxxx) */
	phoneNumber?: string;
	
	/** 프로필 이미지 URL (Pre-signed URL로 업로드 후 받은 URL, 선택 사항, 없을 시 기본 이미지 사용) */
	profileImageUrl?: string;
	
	/** 동의한 약관 ID 목록 (필수 약관은 반드시 포함되어야 함) */
	termsIdList: number[];
}

/**
 * 로그인 요청 DTO
 * 
 * @description
 * POST /user/login API 호출 시 사용되는 Request DTO
 * 
 * @usage Phase 3 로그인 페이지에서 사용
 * @phase Phase 3, Phase 8
 * 
 * @note 백엔드 API 스펙 확인 중 - pw/password 중 하나 사용
 */
export interface LoginDto {
	/** 사용자 로그인 ID (회원가입 시 등록한 ID) */
	loginId: string;
	
	/** 사용자 비밀번호 (최소 8자) */
	password: string;
}

/**
 * 프로필 수정 요청 DTO
 * 
 * @description
 * PATCH /user/profile API 호출 시 사용되는 Request DTO
 * 
 * @usage Phase 4 프로필 수정 페이지에서 사용
 * @phase Phase 4, Phase 8
 */
export interface UpdateUserProfileRequestDto {
	/** 사용자 실명 (필수, 변경할 이름) */
	realName: string;
	
	/** 프로필 이미지 URL (Pre-signed URL로 업로드 후 받은 URL, 선택 사항) */
	profileImageUrl?: string;
}

/**
 * 이메일 중복 확인 요청 DTO
 * 
 * @description
 * POST /user/check-email API 호출 시 사용되는 Request DTO
 * 회원가입 시 이메일 중복 확인에 사용
 * 
 * @usage Phase 2 회원가입 페이지에서 이메일 입력 시 사용 (선택 기능)
 * @phase Phase 2, Phase 8
 */
export interface CheckEmailRequestDto {
	/** 중복 확인할 이메일 주소 (이메일 형식 검증 필요) */
	email: string;
}

/**
 * 로그인 ID 중복 확인 요청 DTO
 * 
 * @description
 * POST /user/check-login-id API 호출 시 사용되는 Request DTO
 * 회원가입 시 로그인 ID 중복 확인에 사용
 * 
 * @usage Phase 2 회원가입 페이지에서 아이디 입력 시 사용 (실시간 검증)
 * @phase Phase 2, Phase 8
 */
export interface CheckLoginIdRequestDto {
	/** 중복 확인할 로그인 ID (최소 3자 이상 권장) */
	loginId: string;
}

/**
 * 비밀번호 변경 요청 DTO
 * 
 * @description
 * POST /user/change-password API 호출 시 사용되는 Request DTO
 * 비밀번호 찾기 후 새 비밀번호 설정 시 사용
 * 
 * @usage Phase 6 비밀번호 재설정 페이지에서 사용
 * @phase Phase 6, Phase 8
 */
export interface ChangePasswordRequestDto {
	/** 비밀번호 재설정 토큰 (이메일로 전송된 resetToken) */
	resetToken: string;
	
	/** 새 비밀번호 (최소 8자, 영문자+숫자 포함 필수) */
	newPassword: string;
}

// ===== Response Types =====

/**
 * 회원가입 응답 DTO
 * 
 * @description
 * POST /user/signup API 응답 DTO
 * 
 * @usage Phase 2 회원가입 완료 후 받는 응답
 * @phase Phase 2, Phase 8
 */
export interface SignupResponseDto {
	/** 생성된 유저 ID (DB에서 자동 생성된 primary key) */
	userId: number;
}

/**
 * 로그인 응답 DTO
 * 
 * @description
 * POST /user/login API 응답 DTO
 * 
 * @usage
 * - Phase 3: 로그인 성공 후 토큰 저장 (LocalStorage)
 * - Phase 8: 실제 API 연동 시 토큰 관리
 * 
 * @phase Phase 3, Phase 8
 */
export interface LoginResponseDto {
	/** 액세스 토큰 (API 호출 시 Authorization 헤더에 포함, 짧은 유효기간) */
	accessToken: string;
	
	/** 리프레시 토큰 (액세스 토큰 갱신 시 사용, 긴 유효기간) */
	refreshToken: string;
}

/**
 * 유저 프로필 응답 DTO
 * 
 * @description
 * GET /user/profile API 응답 DTO
 * 현재 로그인한 사용자의 프로필 정보
 * 
 * @usage
 * - Phase 4: 프로필 조회 페이지에서 사용
 * - Phase 8: 실제 API 연동 시 프로필 데이터 표시
 * 
 * @phase Phase 4, Phase 8
 */
export interface UserProfileResponseDto {
	/** 사용자 ID */
	id: number;
	
	/** 이메일 주소 (이메일 인증 완료 시에만 값 존재) */
	email: string | null;
	
	/** 사용자 실명 */
	realName: string;
	
	/** 전화번호 (입력하지 않았을 경우 null) */
	phoneNumber: string | null;
	
	/** 프로필 이미지 URL (업로드하지 않았을 경우 null 또는 기본 이미지 URL) */
	profileImageUrl: string | null;
	
	/** 사용자 권한 (1: 일반 사용자, 2: 관리자 등) */
	role: number;
	
	/** 계정 생성일 (ISO 8601 형식, 예: "2024-01-01T00:00:00.000Z") */
	createdAt: string;
	
	/** 마지막 로그인 일시 (ISO 8601 형식) */
	lastSigninAt: string;
	
	/** 총 로그인 횟수 */
	signinCount: number;
	
	/** 소속 조직 ID (조직에 소속되지 않았을 경우 null) */
	organizationId: number | null;
	
	/** 소속 조직명 (조직에 소속되지 않았을 경우 null) */
	organizationName: string | null;
}

/**
 * 프로필 수정 응답 DTO
 * 
 * @description
 * PATCH /user/profile API 응답 DTO
 * 
 * @usage Phase 4 프로필 수정 완료 후 받는 응답
 * @phase Phase 4, Phase 8
 */
export interface UpdateUserProfileResponseDto {
	/** 성공 메시지 (예: "프로필이 성공적으로 업데이트되었습니다.") */
	message: string;
}

/**
 * 이메일 중복 확인 응답 DTO
 * 
 * @description
 * POST /user/check-email API 응답 DTO
 * 
 * @usage Phase 2 회원가입 페이지에서 이메일 중복 확인 결과 표시
 * @phase Phase 2, Phase 8
 */
export interface CheckEmailResponseDto {
	/** 이메일 사용 가능 여부 (true: 사용 가능, false: 이미 사용 중) */
	isAvailable: boolean;
}

/**
 * 로그인 ID 중복 확인 응답 DTO
 * 
 * @description
 * POST /user/check-login-id API 응답 DTO
 * 
 * @usage Phase 2 회원가입 페이지에서 아이디 중복 확인 결과 표시 (실시간 검증)
 * @phase Phase 2, Phase 8
 */
export interface CheckLoginIdResponseDto {
	/** 로그인 ID 사용 가능 여부 (true: 사용 가능, false: 이미 사용 중) */
	isAvailable: boolean;
}

/**
 * 비밀번호 변경 응답 DTO
 * 
 * @description
 * POST /user/change-password API 응답 DTO
 * 
 * @usage Phase 6 비밀번호 재설정 완료 후 받는 응답
 * @phase Phase 6, Phase 8
 */
export interface ChangePasswordResponseDto {
	/** 성공 메시지 (예: "비밀번호가 성공적으로 변경되었습니다.") */
	message: string;
}

/**
 * 회원 탈퇴 응답 DTO
 * 
 * @description
 * DELETE /user/my-account API 응답 DTO
 * 
 * @usage Phase 7 회원 탈퇴 완료 후 받는 응답
 * @phase Phase 7, Phase 8
 */
export interface DeleteMyAccountResponseDto {
	/** 성공 메시지 (예: "회원 탈퇴가 완료되었습니다.") */
	message: string;
}
