/**
 * 새 비밀번호 입력 페이지
 * 
 * @description
 * 비밀번호 재설정 요청 후 resetToken을 받아 새 비밀번호를 입력하는 페이지
 * Phase 6에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
 * 
 * @phase Phase 6
 * 
 * @features
 * - resetToken 받기 (URL 파라미터)
 * - 새 비밀번호 입력 및 확인
 * - 비밀번호 유효성 검사 (최소 8자, 영문자+숫자 포함)
 * - 비밀번호 변경 완료 후 로그인 페이지로 이동
 * - AlertDialog 통합 (성공/실패 메시지)
 * - Mock 데이터 사용 (Feature Flag 적용)
 * 
 * @mock Phase 6-7
 * - mockChangePasswordResponse 사용 (1초 지연)
 * - resetToken은 URL 파라미터로 받음
 * 
 * @api Phase 8
 * - POST /user/change-password
 * - resetToken과 newPassword로 비밀번호 변경
 * 
 * @routes
 * - /password-reset/new?token=... (현재 페이지)
 * - /login (비밀번호 변경 완료 후)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, AlertDialog } from '@/components/shared/ui';
import { ROUTES } from '@/lib/constants/routes';
import { useAuth } from '@/data/queries/useAuth';
import type { ChangePasswordRequestDto } from '@/types/user';

export default function PasswordResetNew(): React.ReactElement {
	// ========== API Hooks ==========
	/**
	 * Auth API Custom Hook
	 * Phase 8에서 실제 API 호출에 사용
	 */
	const { changePassword } = useAuth();
	
	// ========== State 관리 ==========
	
	/**
	 * 새 비밀번호 입력값
	 */
	const [password, setPassword] = useState<string>('');
	
	/**
	 * 비밀번호 확인 입력값
	 */
	const [confirmPassword, setConfirmPassword] = useState<string>('');
	
	/**
	 * 비밀번호 변경 진행 중 상태
	 * @description API 호출 중 버튼 비활성화
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
	const [searchParams] = useSearchParams();

	// ========== useEffect ==========
	
	/**
	 * resetToken 확인
	 * @description URL 파라미터에서 resetToken을 확인하고 없으면 이전 페이지로 이동
	 */
	useEffect(() => {
		const token = searchParams.get('token');
		if (!token) {
			showAlert('유효하지 않은 링크입니다. 비밀번호 재설정을 다시 요청해주세요.');
			setTimeout(() => {
				navigate(ROUTES.AUTH.PASSWORD_RESET);
			}, 2000);
		}
	}, [searchParams, navigate]);

	// ========== Helper 함수 ==========
	
	/**
	 * AlertDialog 표시
	 * @param message - 표시할 메시지
	 * @description AlertDialog를 열고 메시지를 설정
	 */
	const showAlert = (message: string): void => {
		setAlertState({
			isOpen: true,
			message,
		});
	};

	/**
	 * AlertDialog 닫기
	 * @description AlertDialog를 닫음
	 */
	const closeAlert = (): void => {
		setAlertState({
			isOpen: false,
			message: '',
		});
	};

	/**
	 * 비밀번호 유효성 검사
	 * @param pw - 검사할 비밀번호
	 * @returns 유효성 검사 결과 (true: 유효, false: 무효)
	 * @description 최소 8자 이상, 영문자와 숫자 포함 여부 확인
	 */
	const validatePassword = (pw: string): boolean => {
		if (pw.length < 8) {
			return false;
		}
		// 영문자와 숫자 포함 여부 확인
		const hasLetter = /[a-zA-Z]/.test(pw);
		const hasNumber = /[0-9]/.test(pw);
		return hasLetter && hasNumber;
	};

	// ========== Event Handlers ==========
	
	/**
	 * 폼 제출 핸들러
	 * @param e - 폼 제출 이벤트
	 * @description 새 비밀번호 입력 후 비밀번호 변경 처리
	 * 
	 * @process
	 * 1. resetToken 확인
	 * 2. 비밀번호 입력 여부 확인
	 * 3. 비밀번호 확인 입력 여부 확인
	 * 4. 비밀번호 일치 확인
	 * 5. 비밀번호 유효성 검사 (최소 8자, 영문자+숫자)
	 * 6. Mock/Real API 호출
	 * 7. 성공 시 로그인 페이지로 이동
	 */
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();

		// resetToken 확인
		const resetToken = searchParams.get('token');
		if (!resetToken) {
			showAlert('유효하지 않은 링크입니다. 비밀번호 재설정을 다시 요청해주세요.');
			return;
		}

		// 비밀번호 입력 여부 확인
		if (!password.trim()) {
			showAlert('비밀번호를 입력해주세요.');
			return;
		}

		// 비밀번호 확인 입력 여부 확인
		if (!confirmPassword.trim()) {
			showAlert('비밀번호 확인을 입력해주세요.');
			return;
		}

		// 비밀번호 일치 확인
		if (password !== confirmPassword) {
			showAlert('비밀번호가 일치하지 않습니다.');
			return;
		}

		// 비밀번호 유효성 검사 (최소 8자, 영문자+숫자 포함)
		if (!validatePassword(password)) {
			showAlert('비밀번호는 최소 8자 이상이며, 영문자와 숫자를 포함해야 합니다.');
			return;
		}

		try {
			setIsLoading(true);

		// ========== Phase 8: useAuth Hook을 통한 API 호출 ==========
		const response = await changePassword(resetToken, password.trim());
		
		// 성공 메시지 표시
		showAlert('비밀번호가 변경되었습니다.\n새 비밀번호로 로그인해주세요.');
		
		// 1.5초 후 로그인 페이지로 이동
			setTimeout(() => {
				navigate(ROUTES.AUTH.LOGIN);
			}, 1500);
		} catch (error: any) {
			console.error('비밀번호 변경 오류:', error);
			showAlert(error.message || '비밀번호 변경 중 오류가 발생했습니다.');
		} finally {
			// 항상 실행: 로딩 상태 종료
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
			<div className="w-full max-w-[460px] bg-white rounded-3xl p-10 pb-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100">
				{/* Header */}
				<div className="text-center mb-10">
					<div className="mb-6 flex justify-center">
						<img
							src="/assets/images/brand/medicrew_mini_logo.png"
							alt="medicrew"
							className="w-16 h-16 object-contain"
						/>
					</div>
					<h1 className="text-2xl font-semibold text-brand-500 mb-6">
						새 비밀번호 등록
					</h1>
					<p className="text-gray-600 text-base leading-relaxed mb-6">
						새로운 비밀번호로 변경해주세요.
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
					<div>
						<label className="block mb-1 text-sm font-semibold text-gray-900 flex items-center gap-1">
							비밀번호 <span className="text-red-500">*</span>
						</label>
						<p className="text-xs text-gray-400 mb-2">영문자, 숫자포함 최소 8자 이상</p>
						<Input
							type="password"
							className="border-gray-200 rounded-xl"
							placeholder="비밀번호를 입력해주세요"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={isLoading}
						/>
					</div>

					<div>
						<label className="block mb-2 text-sm font-semibold text-gray-900">
							비밀번호 확인 <span className="text-red-500">*</span>
						</label>
						<Input
							type="password"
							className="border-gray-200 rounded-xl"
							placeholder="비밀번호를 다시 입력해주세요"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={isLoading}
						/>
					</div>

					<div className="flex gap-3 mt-4">
						<Button
							type="submit"
							className="flex-1 rounded-full text-lg active:scale-95 h-11"
							variant="primary"
							disabled={isLoading}
						>
							{isLoading ? '변경 중...' : '확인'}
						</Button>
						<Button
							type="button"
							onClick={() => navigate(ROUTES.AUTH.LOGIN)}
							className="flex-1 rounded-full text-lg active:scale-95 h-11"
							variant="secondary"
							disabled={isLoading}
						>
							다음에 변경하기
						</Button>
					</div>
				</form>
			</div>

			{/* Powered By */}
			<div className="mt-8 flex justify-center items-center gap-2">
				<span className="text-xs text-gray-800">Powered by</span>
				<span className="text-sm font-bold text-gray-800">NEWBASE</span>
			</div>

			{/* AlertDialog */}
			<AlertDialog
				isOpen={alertState.isOpen}
				onClose={closeAlert}
				message={alertState.message}
			/>
		</div>
	);
}
