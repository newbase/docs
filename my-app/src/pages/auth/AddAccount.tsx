/**
 * 다른 계정 추가 페이지
 * 
 * @description
 * 사용자가 아이디와 비밀번호를 입력하여 다른 계정을 추가하고 기존 계정과 연결할 수 있는 페이지
 * Phase 4에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
 * 
 * @phase Phase 4
 * 
 * @features
 * - 1단계: ID 입력 및 존재 여부 확인
 * - 2단계: Password 입력 및 계정 연결
 * - 기존 계정과 연결
 * - 연결 완료 후 설정 페이지로 이동
 * 
 * @mock Phase 4-7
 * - ID 확인 Mock 처리 (1초 지연)
 * - 계정 연결 Mock 처리 (1초 지연)
 * 
 * @api Phase 8
 * - POST /user/check-login-id (ID 존재 여부 확인)
 * - POST /user/link-account (계정 연결)
 * 
 * @routes
 * - /settings/add-account (현재 페이지)
 * - /settings (설정 페이지로 돌아가기)
 * - /signup (회원가입)
 */

import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, AlertDialog, Input } from '@/components/shared/ui';
import { ROUTES } from '@/lib/constants/routes';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '@/data/queries/useUser';

// Logo is now in public folder
const medicrewLogo = '/assets/images/brand/medicrew_blue_logo.png';

export default function AddAccount(): React.ReactElement {
	// ========== Hooks ==========
	
	const navigate = useNavigate();
	const { user } = useAuth();
	const { checkLoginId } = useUser();

	// ========== State 관리 ==========
	
	/**
	 * 현재 단계 (1: ID 입력, 2: Password 입력)
	 */
	const [step, setStep] = useState<1 | 2>(1);

	/**
	 * 연결할 계정의 아이디 (1단계에서 입력, 2단계에서 사용)
	 */
	const [loginId, setLoginId] = useState<string>('');

	/**
	 * 계정 연결 폼 데이터
	 * @field password - 연결할 계정의 비밀번호
	 */
	const [formData, setFormData] = useState<{
		password: string;
	}>({
		password: '',
	});

	/**
	 * ID 확인 진행 중 상태
	 * @description ID 확인 API 호출 중 버튼 비활성화
	 */
	const [isCheckingId, setIsCheckingId] = useState<boolean>(false);

	/**
	 * 계정 연결 진행 중 상태
	 * @description 계정 연결 API 호출 중 버튼 비활성화
	 */
	const [isLoading, setIsLoading] = useState<boolean>(false);

	/**
	 * ID 에러 메시지
	 * @description ID가 존재하지 않을 때 표시
	 */
	const [idError, setIdError] = useState<string>('');

	/**
	 * AlertDialog 상태
	 * @field isOpen - 팝업 열림 여부
	 * @field message - 표시할 메시지
	 */
	const [alertState, setAlertState] = useState<{ 
		isOpen: boolean; 
		message: string; 
	}>({
		isOpen: false,
		message: '',
	});

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

	// ========== 1단계: ID 확인 처리 ==========
	
	/**
	 * ID 확인 핸들러
	 * 
	 * @description
	 * 입력한 ID가 존재하는지 확인
	 * 존재하면 2단계(Password 입력)로 이동
	 * 존재하지 않으면 에러 메시지 표시
	 * 
	 * @param e - 폼 제출 이벤트
	 * 
	 * @validation
	 * 1. 아이디 입력 여부 확인 → "아이디를 입력해주세요."
	 * 
	 * @mock Phase 4-7
	 * - 1초 지연으로 실제 API 시뮬레이션
	 * - Mock ID 확인 처리
	 * 
	 * @api Phase 8
	 * - POST /user/check-login-id
	 * - isAvailable: false → ID 존재 (다음 단계로)
	 * - isAvailable: true → ID 없음 (에러 메시지)
	 */
	const handleCheckId = async (e: React.FormEvent) => {
		e.preventDefault();

		// ========== 1단계: 유효성 검사 ==========
		
		// 아이디 입력 여부 확인
		if (!loginId || loginId.trim() === '') {
			showAlert('아이디를 입력해주세요.');
			return;
		}

		// ========== 2단계: ID 확인 API 호출 ==========
		
		setIsCheckingId(true);
		setIdError('');

		try {
			// ========== Phase 4-7: Mock 처리 ==========
			// 실제 구현 시:
			// 1. POST /user/check-login-id API 호출
			// 2. isAvailable 확인
			
			const response = await checkLoginId(loginId.trim());

			// isAvailable: false → ID가 이미 존재함 (계정이 있음)
			// isAvailable: true → ID가 존재하지 않음 (계정이 없음)
			if (!response.isAvailable) {
				// ID가 존재함 → 2단계로 이동
				setStep(2);
			} else {
				// ID가 존재하지 않음 → 에러 메시지 표시
				setIdError('존재하지 않는 아이디입니다.');
			}
		} catch (error: any) {
			console.error('ID 확인 오류:', error);
			showAlert('ID 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
		} finally {
			// 항상 실행: 로딩 상태 종료
			setIsCheckingId(false);
		}
	};

	// ========== 2단계: 계정 연결 처리 ==========
	
	/**
	 * 계정 연결 핸들러
	 * 
	 * @description
	 * 비밀번호를 입력하여 다른 계정을 추가하고 기존 계정과 연결
	 * Phase 4에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
	 * 
	 * @param e - 폼 제출 이벤트
	 * 
	 * @validation
	 * 1. 비밀번호 입력 여부 확인 → "비밀번호를 입력해주세요."
	 * 
	 * @mock Phase 4-7
	 * - 1초 지연으로 실제 API 시뮬레이션
	 * - Mock 계정 연결 처리
	 * - 성공 후 AlertDialog 표시
	 * 
	 * @api Phase 8
	 * - POST /user/link-account
	 * - 실제 계정 연결 처리
	 */
	const handleLinkAccount = async (e: React.FormEvent) => {
		e.preventDefault();

		// ========== 1단계: 유효성 검사 ==========
		
		// 비밀번호 입력 여부 확인
		if (!formData.password || formData.password.trim() === '') {
			showAlert('비밀번호를 입력해주세요.');
			return;
		}

		// ========== 2단계: 계정 연결 API 호출 ==========
		
		setIsLoading(true);

		try {
			// ========== Phase 4-7: Mock 처리 ==========
			// 실제 구현 시:
			// 1. POST /user/link-account API 호출
			// 2. 아이디와 비밀번호로 인증
			// 3. 기존 계정과 연결
			// 4. 응답에서 연결된 계정의 role 정보 받기
			
			// 1초 지연으로 실제 API 시뮬레이션
			await new Promise(resolve => setTimeout(resolve, 1000));

			// ========== Phase 8: 실제 API 응답에서 role 정보 사용 ==========
			// const response = await linkAccountApi({ loginId, password: formData.password });
			// const role = response.role; // 'master' | 'admin' | 'student' | 'guest'
			
			// Mock: 연결된 계정의 role (실제로는 API 응답에서 받아옴)
			// 일반적으로 student role로 가정
			const role = 'student' as 'master' | 'admin' | 'student' | 'guest'; // Mock 데이터

			// 성공 메시지 표시
			showAlert('계정이 성공적으로 연결되었습니다.');

			// 역할에 따라 해당 대시보드로 이동
			setTimeout(() => {
				if (role === 'master') {
					navigate('/master/dashboard');
				} else if (role === 'admin') {
					navigate('/admin/dashboard');
				} else {
					navigate('/dashboard');
				}
			}, 500);
		} catch (error: any) {
			console.error('계정 연결 오류:', error);
			showAlert(error.message || '계정 연결 중 오류가 발생했습니다. 다시 시도해주세요.');
		} finally {
			// 항상 실행: 로딩 상태 종료
			setIsLoading(false);
		}
	};

	/**
	 * 새 계정 만들기 핸들러
	 * @description 회원가입 페이지로 이동
	 */
	const handleCreateAccount = () => {
		navigate(ROUTES.AUTH.SIGNUP);
	};

	/**
	 * 취소 버튼 핸들러
	 * @description 2단계에서 1단계로 돌아가기
	 */
	const handleCancel = () => {
		// 2단계에서 취소 시 1단계로 돌아가기
		setStep(1);
		setFormData({ password: '' });
	};

	/**
	 * 이전 단계로 돌아가기
	 * @description 2단계에서 1단계로 돌아가기
	 */
	const handleBack = () => {
		setStep(1);
		setFormData({ password: '' });
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
			{/* Add Account Card */}
			<div className="w-full max-w-[460px] bg-white rounded-3xl p-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100">
				{/* Header: Logo & Title */}
				<div className="text-center mb-12">
					<Link to={ROUTES.HOME} className="inline-block mb-8">
						<img src="/assets/images/brand/medicrew_blue_logo.png" alt="Medicrew" className="h-7 object-contain mx-auto" />
					</Link>
					<h1 className="text-xl font-semibold text-brand-500 mb-2">
						다른 계정 추가
					</h1>
					<p className="text-gray-500 text-sm">
						{step === 1 
							? '연결할 계정의 아이디를 입력해주세요'
							: '연결할 계정의 비밀번호를 입력해주세요'
						}
					</p>
				</div>

				{/* Step 1: ID 입력 */}
				{step === 1 && (
					<form onSubmit={handleCheckId} noValidate className="flex flex-col gap-5">
						<div>
							<label htmlFor="loginId" className="block mb-2 text-sm font-semibold text-gray-900">
								ID
							</label>
							<Input
								type="text"
								id="loginId"
								className={`bg-gray-50 focus:bg-white border-transparent focus:border-blue-500 rounded-xl ${idError ? 'border-red-500 focus:border-red-500' : ''}`}
								placeholder="아이디를 입력해주세요"
								value={loginId}
								onChange={(e) => {
									setLoginId(e.target.value);
									setIdError('');
								}}
								required
							/>
							{/* ID 에러 메시지 */}
							{idError && (
								<div className="mt-2">
									<p className="text-sm text-red-600">{idError}</p>
								</div>
							)}
						</div>

					{/* Actions */}
					<div className="flex flex-col gap-3 mt-2">
						<Button
							type="submit"
							className="w-full rounded-full shadow-lg shadow-brand-100 active:scale-95"
							variant="primary"
							disabled={isCheckingId}
						>
							{isCheckingId ? '확인 중...' : '다음'}
						</Button>
						<div className="flex gap-3">
							<Button
								type="button"
								onClick={handleCreateAccount}
								className="flex-1 rounded-full active:scale-95"
								variant="secondary"
								disabled={isCheckingId}
							>
								새 계정 만들기
							</Button>
							<Button
								type="button"
								onClick={() => navigate(-1)}
								className="px-6 min-w-32 rounded-full active:scale-95"
								variant="secondary"
								disabled={isCheckingId}
							>
								취소
							</Button>
						</div>
					</div>
					</form>
				)}

				{/* Step 2: Password 입력 */}
				{step === 2 && (
					<form onSubmit={handleLinkAccount} noValidate className="flex flex-col gap-5">
						{/* ID 표시 */}
						<div>
							<p className="text-xs text-gray-600 mb-1">연결할 계정</p>
							<p className="text-sm font-semibold text-brand-500">{loginId}</p>
						</div>

						<div>
							<label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-900">
								Password
							</label>
							<Input
								type="password"
								id="password"
								className="bg-gray-50 focus:bg-white border-transparent focus:border-blue-500 rounded-xl"
								placeholder="비밀번호 입력"
								value={formData.password}
								onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
								required
							/>
						</div>

						{/* Actions */}
						<div className="flex gap-3 mt-2">
							<Button
								type="submit"
								className="px-6 min-w-40 rounded-full shadow-lg shadow-brand-100 active:scale-95"
								variant="primary"
								disabled={isLoading}
							>
								{isLoading ? '연결 중...' : '계정 연결'}
							</Button>
							<Button
								type="button"
								onClick={handleCancel}
								className="px-6 min-w-40 rounded-full active:scale-95"
								variant="secondary"
								disabled={isLoading}
							>
								취소
							</Button>
						</div>
					</form>
				)}
			</div>

			{/* Powered By */}
			<div className="mt-8 flex justify-center items-center gap-2">
				<span className="text-xs text-gray-800">Powered by</span>
				<span className="text-sm font-bold text-gray-800">NEWBASE</span>
			</div>

			{/* AlertDialog: 계정 연결 성공/실패 메시지 표시 */}
			<AlertDialog
				isOpen={alertState.isOpen}
				onClose={closeAlert}
				message={alertState.message}
			/>
		</div>
	);
}
