/**
 * 로그인 페이지
 * 
 * @description
 * 사용자가 로그인 ID와 비밀번호를 입력하여 로그인하는 페이지
 * Phase 3에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
 * 
 * @phase Phase 3
 * 
 * @features
 * - 로그인 ID, 비밀번호 입력
 * - 로그인 성공 시 accessToken, refreshToken LocalStorage 저장
 * - 로그인 실패 시 AlertDialog 표시
 * - Mock 데이터 사용 (Feature Flag 적용)
 * - 회원가입/비밀번호 찾기 링크
 * 
 * @mock Phase 3-7
 * - mockLoginResponse 사용 (1초 지연)
 * - 하드코딩된 테스트 계정: test / 1234
 * 
 * @api Phase 8
 * - POST /user/login
 * - 실제 인증 처리
 * 
 * @routes
 * - /login (현재 페이지)
 * - /signup (회원가입)
 * - /password-reset (비밀번호 찾기)
 */

import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, AlertDialog } from '@/components/shared/ui';
import { ROUTES } from '@/lib/constants/routes';
import { useUser } from '@/data/queries/useUser';
import { convertRoleNumberToString } from '@/utils/roleUtils';
import { isFeatureEnabled } from '@/config/featureFlags';
import type { LoginDto } from '@/types/user';

// Logo is now in public folder
const medicrewLogo = '/assets/images/brand/medicrew_blue_logo.png';

// Mock 사용자 데이터 (테스트용)
// 기본 계정을 master로 설정하여 MyOrganization 페이지 테스트 가능
const mockUserData = {
	id: 'test',
	name: '김메디',
	email: 'test@medicrew.com',
	isAuthenticated: true,
	currentAccount: {
		accountId: 'acc_002',
		organizationId: 'ORG001',
		organizationName: '서울대학교병원',
		role: 'master',
		license: 'pro_univ_master'
	},
	accounts: [
		{
			accountId: 'acc_001',
			organizationId: 'ORG001',
			organizationName: '서울대학교병원',
			role: 'student',
			license: 'pro_univ_student',
			isActive: false
		},
		{
			accountId: 'acc_002',
			organizationId: 'ORG001',
			organizationName: '서울대학교병원',
			role: 'master',
			license: 'pro_univ_master',
			isActive: true
		},
		{
			accountId: 'acc_003',
			organizationId: null,
			organizationName: '개인 사용자',
			role: 'guest',
			license: 'free',
			isActive: false
		},
		{
			accountId: 'acc_004',
			organizationId: 'ORG002',
			organizationName: '연세대학교병원',
			role: 'master',
			license: 'pro_univ_master',
			isActive: false
		},
		{
			accountId: 'acc_005',
			organizationId: 'ORG003',
			organizationName: '삼성서울병원',
			role: 'admin',
			license: 'admin',
			isActive: false
		}
	]
};

export default function Login(): React.ReactElement {
	// ========== API Hooks ==========
	/**
	 * User API Custom Hook
	 * Phase 8에서 실제 API 호출에 사용
	 */
	const { login: loginApi, getProfile } = useUser();

	// ========== State 관리 ==========

	/**
	 * 로그인 폼 데이터
	 * @field loginId - 로그인 ID
	 * @field password - 비밀번호
	 */
	const [formData, setFormData] = useState<LoginDto>({
		loginId: '',
		password: '',
	});

	/**
	 * 로그인 진행 중 상태
	 * @description 로그인 API 호출 중 버튼 비활성화
	 */
	const [isLoading, setIsLoading] = useState<boolean>(false);

	/**
	 * AlertDialog 상태
	 * @field isOpen - 팝업 열림 여부
	 * @field message - 표시할 메시지
	 */
	const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string; }>({
		isOpen: false,
		message: '',
	});

	// ========== Hooks ==========

	const navigate = useNavigate();
	const { login } = useAuth();

	// ========== Helper 함수 ==========

	/**
	 * AlertDialog 표시 함수
	 * @param message - 표시할 메시지
	 */
	const showAlert = useCallback((message: string) => {
		setAlertState({ isOpen: true, message });
	}, []);

	/**
	 * AlertDialog 닫기 함수
	 */
	const closeAlert = useCallback(() => {
		setAlertState({ isOpen: false, message: '' });
	}, []);

	// ========== 로그인 처리 ==========

	/**
	 * 로그인 폼 제출 핸들러
	 * 
	 * @description
	 * 로그인 ID와 비밀번호를 검증하고 로그인 API 호출
	 * Phase 3에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
	 * 
	 * @param e - 폼 제출 이벤트
	 * 
	 * @validation
	 * 1. 로그인 ID 입력 여부 확인 → "로그인 ID를 입력해주세요."
	 * 2. 비밀번호 입력 여부 확인 → "비밀번호를 입력해주세요."
	 * 
	 * @mock Phase 3-7
	 * - mockLoginResponse 반환 ({ accessToken, refreshToken })
	 * - 하드코딩된 테스트 계정: test / 1234
	 * - 1초 지연으로 실제 API 시뮬레이션
	 * - accessToken, refreshToken을 LocalStorage에 저장
	 * - 성공 후 메인 페이지로 이동
	 * 
	 * @api Phase 8
	 * - POST /user/login
	 * - 실제 인증 처리
	 * - 토큰 저장 및 페이지 이동
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// ========== 1단계: 유효성 검사 ==========

		// 로그인 ID 입력 여부 확인
		if (!formData.loginId) {
			showAlert('ID를 입력해주세요.');
			return;
		}

		// 비밀번호 입력 여부 확인
		if (!formData.password) {
			showAlert('비밀번호를 입력해주세요.');
			return;
		}

		// ========== 2단계: 최고 관리자 계정 특수 처리 (Mock) ==========

		/**
		 * 특수 계정 (test / 1234, sunny-master / sunny123, student / 1234) Mock 로그인
		 * 
		 * ⚠️ DISABLED: Mock 계정 로직 비활성화
		 * - 실제 API로만 로그인하도록 변경
		 * - Mock이 필요한 경우 아래 주석을 해제하고 USE_MOCK_DATA를 true로 설정
		 * 
		 * @reason
		 * - 특정 테스트 계정은 백엔드 DB에 없을 수 있음
		 * - 개발/테스트 환경에서 항상 접근 가능해야 함
		 * 
		 * @process
		 * 1. 특수 계정 입력 시 API 호출 없이 Mock 로그인
		 * 2. Mock 토큰 발급 및 저장
		 * 3. 해당 권한으로 AuthContext 설정
		 */
		// Mock 계정 비활성화: 실제 API로만 로그인
		const isSpecialAccount = false;
		
		/* Mock 계정 활성화하려면 아래 주석 해제
		const useMockData = process.env.REACT_APP_USE_MOCK_DATA === 'true';
		const isSpecialAccount = useMockData && (
			(formData.loginId === 'test' && formData.password === '1234') ||
			(formData.loginId === 'sunny-master' && formData.password === 'sunny123') ||
			(formData.loginId === 'student' && formData.password === '1234')
		);
		*/

		if (isSpecialAccount) {
			setIsLoading(true);

			try {
				const isSunnyMaster = formData.loginId === 'sunny-master';
				const isStudent = formData.loginId === 'student';

				// Mock 토큰 생성 (apiClient와 동일한 키 사용)
				const mockToken = `mock-${isStudent ? 'student' : 'admin'}-token-` + Date.now();
				localStorage.setItem('medicrew_access_token', mockToken);
				localStorage.setItem('medicrew_refresh_token', mockToken);

				// 유저 데이터 설정
				const specialUserData = {
					id: formData.loginId,
					name: isStudent ? '김학생' : (isSunnyMaster ? '써니 마스터' : '최고 관리자'),
					email: isStudent ? 'student@medicrew.me' : (isSunnyMaster ? 'sunny@medicrew.me' : 'admin@medicrew.me'),
					profileImageUrl: null,
					guestExpirationDate: null,
			isAuthenticated: true,
			currentAccount: {
				accountId: isStudent ? 'student-account' : (isSunnyMaster ? 'master-account' : 'admin-account'),
				organizationId: isStudent ? 'ORG001' : (isSunnyMaster ? 'ORG001' : 'medicrew'),
				organizationName: isStudent ? '서울대학교병원' : (isSunnyMaster ? '서울대학교병원' : '메디크루'),
				role: isStudent ? 'student' : (isSunnyMaster ? 'master' : 'admin'),
				license: isStudent ? 'pro_univ_student' : (isSunnyMaster ? 'pro_univ_master' : 'admin'),
			},
			accounts: [
				{
					accountId: isStudent ? 'student-account' : (isSunnyMaster ? 'master-account' : 'admin-account'),
					organizationId: isStudent ? 'ORG001' : (isSunnyMaster ? 'ORG001' : 'medicrew'),
					organizationName: isStudent ? '서울대학교병원' : (isSunnyMaster ? '서울대학교병원' : '메디크루'),
					role: isStudent ? 'student' : (isSunnyMaster ? 'master' : 'admin'),
					license: isStudent ? 'pro_univ_student' : (isSunnyMaster ? 'pro_univ_master' : 'admin'),
					isActive: true,
				}
			],
				};

				// AuthContext 로그인
				login(specialUserData);

				showAlert(`${isStudent ? '학생' : (isSunnyMaster ? '마스터' : '최고 관리자')}로 로그인되었습니다.`);

				const pendingToken = localStorage.getItem('pending_invite_token');
				if (pendingToken) {
					localStorage.removeItem('pending_invite_token');
					setTimeout(() => {
						navigate(`/class/invite/${pendingToken}`);
					}, 1000);
					return;
				}

				setTimeout(() => {
					navigate(ROUTES.HOME);
				}, 1000);

				return; // 실제 API 호출 스킵
			} catch (error: any) {
				console.error('Mock 로그인 오류:', error);
				showAlert('로그인에 실패했습니다.');
			} finally {
				setIsLoading(false);
			}
			return;
		}

		// ========== 3단계: 실제 API 로그인 ==========

		setIsLoading(true);

		try {
			// ========== Phase 8: useUser Hook을 통한 API 호출 ==========
			const { accessToken, refreshToken } = await loginApi(formData);

			// 토큰 저장 (apiClient와 동일한 키 사용)
			localStorage.setItem('medicrew_access_token', accessToken);
			localStorage.setItem('medicrew_refresh_token', refreshToken);

			// ========== 실제 프로필 조회하여 AuthContext 업데이트 ==========
			const userProfile = await getProfile();

			// ========== role 숫자를 문자열로 변환 ==========
			// convertRoleNumberToString: 0: guest, 1: student, 2: master, 5: admin
			const userRole = convertRoleNumberToString(userProfile.role);
			
			// ========== license 설정 (role에 따라) ==========
			let userLicense: string;
			if (userRole === 'guest') {
				userLicense = 'free';
			} else if (userRole === 'master') {
				userLicense = 'pro_univ_master';
			} else if (userRole === 'admin') {
				userLicense = 'admin';
			} else {
				// student
				userLicense = userProfile.organizationId ? 'pro_univ_student' : 'free';
			}

			// test1master 등 테스트 마스터 계정: API에 소속기관이 없으면 기본 소속기관 설정 (MyOrganization 등 화면용)
			const rawOrgId = userProfile.organizationId ? String(userProfile.organizationId) : null;
			const rawOrgName = userProfile.organizationName || '';
			const isTestMaster = formData.loginId === 'test1master' && userRole === 'master';
			const organizationId = (isTestMaster && !rawOrgId) ? 'ORG001' : rawOrgId;
			const organizationName = (isTestMaster && !rawOrgName) ? '서울대학교병원' : rawOrgName;

			// AuthContext 로그인 (실제 API 데이터 사용)
			const userData = {
				id: formData.loginId,
				name: userProfile.realName,
				email: userProfile.email || '',
				profileImageUrl: userProfile.profileImageUrl,
				guestExpirationDate: userRole === 'guest' ? '2026-12-31' : null, // TODO: API에서 받아오기
				isAuthenticated: true,
				currentAccount: {
					accountId: `acc_${userProfile.id}`,
					organizationId,
					organizationName,
					role: userRole,
					license: userLicense
				},
				accounts: [
					{
						accountId: `acc_${userProfile.id}`,
						organizationId,
						organizationName,
						role: userRole,
						license: userLicense,
						isActive: true
					}
				]
			};
			login(userData);

			// 보류 중인 초대 확인
			const pendingToken = localStorage.getItem('pending_invite_token');
			if (pendingToken) {
				localStorage.removeItem('pending_invite_token');
				navigate(`/class/invite/${pendingToken}`);
				return;
			}

			// 역할에 따라 페이지 이동
			if (userRole === 'master') {
				navigate('/master/dashboard');
			} else if (userRole === 'admin') {
				navigate('/admin/dashboard');
			} else {
				navigate('/dashboard');
			}
		} catch (error: any) {
			console.error('로그인 오류:', error);
			showAlert(error.message || '로그인 중 오류가 발생했습니다.');
		} finally {
			// 항상 실행: 로딩 상태 종료
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
			{/* Login Card */}
			<div className="w-full max-w-[460px] bg-white rounded-3xl p-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100">
				{/* Header: Logo & Title */}
				<div className="text-center mb-12">
					<Link to={ROUTES.HOME} className="inline-block mb-8">
						<img src={medicrewLogo} alt="Medicrew" className="h-7 w-auto" />
					</Link>
					<h1 className="text-2xl font-semibold text-brand-500 mb-2">
						로그인
					</h1>
					<p className="text-gray-500 text-base">
						메디크루 플랫폼에 오신 것을 환영합니다
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
					<div>
						<label htmlFor="loginId" className="block mb-2 text-sm font-semibold text-gray-900">
							ID
						</label>
						<Input
							type="text"
							id="loginId"
							className="bg-gray-50 focus:bg-white border-transparent focus:border-blue-500 rounded-xl"
							placeholder="아이디를 입력해주세요"
							value={formData.loginId}
							onChange={(e) => setFormData((prev) => ({ ...prev, loginId: e.target.value }))}
							required
						/>
					</div>

					<div>
						<div className="flex justify-between mb-2">
							<label htmlFor="password" className="text-sm font-semibold text-gray-900">
								Password
							</label>
						</div>
						<Input
							type="password"
							id="password"
							className="bg-gray-50 focus:bg-white border-transparent focus:border-blue-500 rounded-xl"
							placeholder="비밀번호를 입력해주세요"
							value={formData.password}
							onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
							required
						/>
					</div>

					<Button
						type="submit"
						className="w-full mt-4 rounded-full text-lg h-12"
						variant="primary"
						disabled={isLoading}
					>
						{isLoading ? '로그인 중...' : '로그인'}
					</Button>
				</form>

				{/* Links */}
				<div className="mt-8 flex justify-center gap-6 text-sm">
					<Link to={ROUTES.AUTH.SIGNUP} className="text-gray-500 hover:text-gray-900 transition-colors">
						회원가입
					</Link>
					<span className="text-gray-200">|</span>
					<Link to={ROUTES.AUTH.PASSWORD_RESET} className="text-gray-500 hover:text-gray-900 transition-colors">
						비밀번호 찾기
					</Link>
				</div>

			</div>

			{/* Powered By */}
			<div className="mt-10 flex justify-center items-center gap-2">
				<span className="text-xs text-gray-400">Powered by</span>
				<span className="text-sm font-bold text-gray-500">NEWBASE</span>
			</div>

			{/* Footer Rules Links - positioned absolutely relative to container? No, let's make it static below since it's cleaner on mobile */}
			<div className="w-full max-w-[460px] flex justify-between items-center text-xs text-gray-400 mt-8">
				{/* Left: Home Button */}
				<Link to={ROUTES.HOME} className="flex items-center gap-2 hover:text-gray-600 transition-colors font-medium">
					← 홈으로
				</Link>

				{/* Right: Terms & Privacy */}
				<div className="flex gap-6">
					<button type="button" className="bg-transparent border-none p-0 cursor-pointer hover:underline text-inherit">이용약관</button>
					<button type="button" className="bg-transparent border-none p-0 cursor-pointer hover:underline text-inherit">개인정보처리방침</button>
				</div>
			</div>

			{/* AlertDialog: 로그인 실패/오류 메시지 표시 */}
			<AlertDialog
				isOpen={alertState.isOpen}
				onClose={closeAlert}
				message={alertState.message}
			/>
		</div>
	);
}
