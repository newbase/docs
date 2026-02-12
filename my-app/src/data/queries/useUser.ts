/**
 * User API Custom Hook
 * 
 * @description
 * User 관련 API를 호출하는 Custom Hook
 * Feature Flag (REACT_APP_USE_MOCK_DATA)로 Mock/Real API 전환 가능
 * 
 * @phase Phase 8 (API 연동)
 * 
 * @features
 * - 회원가입 (POST /user/signup)
 * - 로그인 ID 중복 확인 (POST /user/check-login-id)
 * - 이메일 중복 확인 (POST /user/check-email)
 * - 로그인 (POST /user/login)
 * - 프로필 조회 (GET /user/profile)
 * - 프로필 수정 (PATCH /user/profile)
 * - 회원 탈퇴 (DELETE /user/my-account)
 * 
 * @usage
 * const { signup, checkLoginId, login, getProfile, updateProfile, deleteAccount } = useUser();
 * 
 * @api
 * Base URL: process.env.REACT_APP_API_BASE_URL
 * 인증 필요: getProfile, updateProfile, deleteAccount
 */

import {
	SignupRequestDto,
	SignupResponseDto,
	CheckLoginIdRequestDto,
	CheckLoginIdResponseDto,
	CheckEmailRequestDto,
	CheckEmailResponseDto,
	LoginDto,
	LoginResponseDto,
	UserProfileResponseDto,
	UpdateUserProfileRequestDto,
	UpdateUserProfileResponseDto,
	DeleteMyAccountResponseDto,
} from '../../types/user';

import {
	mockSignupResponse,
	mockCheckLoginId,
	mockCheckEmail,
	mockLoginResponse,
	mockUserProfile,
	mockUpdateProfileResponse,
	mockDeleteAccountResponse,
} from '../mock/user';

// Feature Flag: Mock 데이터 사용 여부
// 임시: 환경 변수 로드 안 되는 이슈로 하드코딩 (Phase 9 테스트용)
const USE_MOCK_DATA = false; // process.env.REACT_APP_USE_MOCK_DATA !== 'false';

// API Base URL
const API_BASE_URL = 'https://api.scenario-studio-test.medicrew.me'; // process.env.REACT_APP_API_BASE_URL || '';

/**
 * User API Custom Hook
 * 
 * @returns User API 함수들
 */
export const useUser = () => {
	/**
	 * 회원가입 API
	 * 
	 * @description
	 * POST /user/signup
	 * 새로운 회원을 등록합니다.
	 * 
	 * @param data - 회원가입 요청 데이터
	 * @returns Promise<SignupResponseDto> - 생성된 유저 ID
	 * 
	 * @throws
	 * - 400: 필수 약관에 모두 동의해야 합니다.
	 * - 404: 존재하지 않는 약관이 포함되어 있습니다.
	 * - 409: 이미 사용중인 loginId입니다.
	 * 
	 * @example
	 * const result = await signup({
	 *   loginId: 'testuser',
	 *   pw: 'password123',
	 *   realName: '홍길동',
	 *   termsIdList: [1, 2]
	 * });
	 */
	const signup = async (data: SignupRequestDto): Promise<SignupResponseDto> => {
		if (USE_MOCK_DATA) {
			// ========== Mock 데이터 사용 ==========
			await new Promise(resolve => setTimeout(resolve, 1000));
			return mockSignupResponse;
		}

		// ========== 실제 API 호출 ==========
		const response = await fetch(`${API_BASE_URL}/user/signup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(errorText || `회원가입 실패: ${response.status}`);
		}

		return await response.json();
	};

	/**
	 * 로그인 ID 중복 확인 API
	 * 
	 * @description
	 * POST /user/check-login-id
	 * 로그인 ID가 사용 가능한지 확인합니다.
	 * 
	 * @param loginId - 확인할 로그인 ID
	 * @returns Promise<CheckLoginIdResponseDto> - { isAvailable: boolean }
	 * 
	 * @example
	 * const result = await checkLoginId('testuser');
	 * if (result.isAvailable) {
	 *   console.log('사용 가능한 아이디입니다.');
	 * }
	 */
	const checkLoginId = async (loginId: string): Promise<CheckLoginIdResponseDto> => {
		if (USE_MOCK_DATA) {
			// ========== Mock 데이터 사용 ==========
			return await mockCheckLoginId(loginId);
		}

		// ========== 실제 API 호출 ==========
		const response = await fetch(`${API_BASE_URL}/user/check-login-id`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ loginId } as CheckLoginIdRequestDto),
		});

		if (!response.ok) {
			throw new Error(`로그인 ID 중복 확인 실패: ${response.status}`);
		}

		return await response.json();
	};

	/**
	 * 이메일 중복 확인 API
	 * 
	 * @description
	 * POST /user/check-email
	 * 이메일이 사용 가능한지 확인합니다.
	 * 
	 * @param email - 확인할 이메일 주소
	 * @returns Promise<CheckEmailResponseDto> - { isAvailable: boolean }
	 * 
	 * @example
	 * const result = await checkEmail('user@example.com');
	 * if (result.isAvailable) {
	 *   console.log('사용 가능한 이메일입니다.');
	 * }
	 */
	const checkEmail = async (email: string): Promise<CheckEmailResponseDto> => {
		if (USE_MOCK_DATA) {
			// ========== Mock 데이터 사용 ==========
			return await mockCheckEmail(email);
		}

		// ========== 실제 API 호출 ==========
		const response = await fetch(`${API_BASE_URL}/user/check-email`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email } as CheckEmailRequestDto),
		});

		if (!response.ok) {
			throw new Error(`이메일 중복 확인 실패: ${response.status}`);
		}

		return await response.json();
	};

	/**
	 * 로그인 API
	 * 
	 * @description
	 * POST /user/login
	 * 사용자 인증 후 액세스 토큰을 발급합니다.
	 * 
	 * @param data - 로그인 요청 데이터 (loginId, password)
	 * @returns Promise<LoginResponseDto> - { accessToken, refreshToken }
	 * 
	 * @throws
	 * - 404: 유효하지 않는 계정정보입니다.
	 * - 409: 비활성 상태의 계정입니다.
	 * 
	 * @example
	 * const result = await login({ loginId: 'testuser', password: 'password123' });
	 * localStorage.setItem('accessToken', result.accessToken);
	 * localStorage.setItem('refreshToken', result.refreshToken);
	 */
	const login = async (data: LoginDto): Promise<LoginResponseDto> => {
		if (USE_MOCK_DATA) {
			// ========== Mock 데이터 사용 ==========
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Mock: test / 1234만 성공
			if (data.loginId === 'test' && data.password === '1234') {
				return mockLoginResponse;
			}
			
			throw new Error('유효하지 않는 계정정보입니다.');
		}

		// ========== 실제 API 호출 ==========
		const response = await fetch(`${API_BASE_URL}/user/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('유효하지 않는 계정정보입니다.');
			} else if (response.status === 409) {
				throw new Error('비활성 상태의 계정입니다.');
			}
			throw new Error(`로그인 실패: ${response.status}`);
		}

		return await response.json();
	};

	/**
	 * 유저 프로필 조회 API
	 * 
	 * @description
	 * GET /user/profile
	 * 현재 로그인한 사용자의 프로필 정보를 조회합니다.
	 * 
	 * @returns Promise<UserProfileResponseDto> - 유저 프로필 정보
	 * 
	 * @throws
	 * - 401: 인증이 필요합니다.
	 * - 404: 존재하지 않는 유저입니다.
	 * 
	 * @auth Bearer Token 필요
	 * 
	 * @example
	 * const profile = await getProfile();
	 * console.log(profile.realName); // "홍길동"
	 */
	const getProfile = async (): Promise<UserProfileResponseDto> => {
		if (USE_MOCK_DATA) {
			// ========== Mock 데이터 사용 ==========
			await new Promise(resolve => setTimeout(resolve, 500));
			return mockUserProfile;
		}

		// ========== 실제 API 호출 ==========
		// apiClient의 tokenStorage 사용 (토큰 저장 키 일치)
		const accessToken = localStorage.getItem('medicrew_access_token');
		
		if (!accessToken) {
			throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
		}

		const response = await fetch(`${API_BASE_URL}/user/profile`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
			} else if (response.status === 404) {
				throw new Error('존재하지 않는 유저입니다.');
			}
			throw new Error(`프로필 조회 실패: ${response.status}`);
		}

		return await response.json();
	};

	/**
	 * 유저 프로필 수정 API
	 * 
	 * @description
	 * PATCH /user/profile
	 * 현재 로그인한 사용자의 프로필 정보를 수정합니다.
	 * 
	 * @param data - 수정할 프로필 데이터 (realName, profileImageUrl)
	 * @returns Promise<UpdateUserProfileResponseDto> - { message: string }
	 * 
	 * @throws
	 * - 401: 인증이 필요합니다.
	 * - 404: 존재하지 않는 유저입니다.
	 * 
	 * @auth Bearer Token 필요
	 * 
	 * @example
	 * const result = await updateProfile({
	 *   realName: '김철수',
	 *   profileImageUrl: 'https://example.com/profile.jpg'
	 * });
	 */
	const updateProfile = async (data: UpdateUserProfileRequestDto): Promise<UpdateUserProfileResponseDto> => {
		if (USE_MOCK_DATA) {
			// ========== Mock 데이터 사용 ==========
			await new Promise(resolve => setTimeout(resolve, 1000));
			return mockUpdateProfileResponse;
		}

		// ========== 실제 API 호출 ==========
		// apiClient의 tokenStorage와 동일한 키 사용 ('medicrew_access_token')
		const accessToken = localStorage.getItem('medicrew_access_token');
		
		if (!accessToken) {
			throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
		}

		const response = await fetch(`${API_BASE_URL}/user/profile`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
			} else if (response.status === 404) {
				throw new Error('존재하지 않는 유저입니다.');
			}
			throw new Error(`프로필 수정 실패: ${response.status}`);
		}

		return await response.json();
	};

	/**
	 * 회원 탈퇴 API
	 * 
	 * @description
	 * DELETE /user/my-account
	 * 현재 로그인한 사용자의 계정을 삭제합니다.
	 * 
	 * @returns Promise<DeleteMyAccountResponseDto> - { message: string }
	 * 
	 * @throws
	 * - 401: 인증이 필요합니다.
	 * - 404: 존재하지 않는 유저입니다.
	 * 
	 * @auth Bearer Token 필요
	 * 
	 * @important
	 * ⚠️ 실제 계정 삭제가 진행됩니다. 주의해서 사용하세요.
	 * 
	 * @example
	 * const result = await deleteAccount();
	 * console.log(result.message); // "회원 탈퇴가 완료되었습니다."
	 * // LocalStorage 정리
	 * localStorage.removeItem('accessToken');
	 * localStorage.removeItem('refreshToken');
	 */
	const deleteAccount = async (): Promise<DeleteMyAccountResponseDto> => {
		if (USE_MOCK_DATA) {
			// ========== Mock 데이터 사용 ==========
			await new Promise(resolve => setTimeout(resolve, 1000));
			return mockDeleteAccountResponse;
		}

		// ========== 실제 API 호출 ==========
		// apiClient의 tokenStorage와 동일한 키 사용 ('medicrew_access_token')
		const accessToken = localStorage.getItem('medicrew_access_token');
		
		if (!accessToken) {
			throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
		}

		const response = await fetch(`${API_BASE_URL}/user/my-account`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
			} else if (response.status === 404) {
				throw new Error('존재하지 않는 유저입니다.');
			}
			throw new Error(`회원 탈퇴 실패: ${response.status}`);
		}

		return await response.json();
	};

	return {
		signup,
		checkLoginId,
		checkEmail,
		login,
		getProfile,
		updateProfile,
		deleteAccount,
	};
};
