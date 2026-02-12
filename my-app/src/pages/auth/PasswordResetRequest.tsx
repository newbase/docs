/**
 * 비밀번호 재설정 요청 페이지
 * 
 * @description
 * 사용자가 이메일을 입력하여 비밀번호 재설정 요청을 보내는 페이지
 * Phase 6에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
 * 
 * @phase Phase 6
 * 
 * @features
 * - 이메일 입력 및 재설정 요청
 * - Mock resetToken 생성 및 URL 파라미터로 전달
 * - 비밀번호 재설정 완료 후 새 비밀번호 입력 페이지로 이동
 * - AlertDialog 통합 (성공/실패 메시지)
 * - Mock 데이터 사용 (Feature Flag 적용)
 * 
 * @mock Phase 6-7
 * - mockPasswordResetRequestResponse 사용 (1초 지연)
 * - Mock resetToken 생성 (예: 'mock_reset_token_123456')
 * 
 * @api Phase 8
 * - POST /auth/password-reset
 * - 실제 이메일 발송 및 resetToken 생성
 * 
 * @routes
 * - /password-reset (현재 페이지)
 * - /password-reset/new?token=... (새 비밀번호 입력)
 * - /login (로그인 페이지)
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, AlertDialog } from '@/components/shared/ui';
import { ROUTES } from '@/lib/constants/routes';
import { useAuth } from '@/data/queries/useAuth';
import type { PasswordResetRequestDto } from '@/types/auth';

export default function PasswordResetRequest(): React.ReactElement {
	// ========== API Hooks ==========
	/**
	 * Auth API Custom Hook
	 * Phase 8에서 실제 API 호출에 사용
	 */
	const { requestPasswordReset } = useAuth();
	
	// ========== State 관리 ==========
	
	/**
	 * 이메일 입력값
	 */
	const [email, setEmail] = useState<string>('');
	
	/**
	 * 비밀번호 재설정 요청 진행 중 상태
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
	 * Mock resetToken 생성
	 * @returns 생성된 Mock resetToken
	 * @description Phase 6-7에서 사용하는 Mock resetToken 생성 함수
	 * 실제 API에서는 서버에서 생성하여 이메일로 전송됨
	 */
	const generateMockResetToken = (): string => {
		const timestamp = Date.now();
		const random = Math.floor(Math.random() * 1000000);
		return `mock_reset_token_${timestamp}_${random}`;
	};

	// ========== Event Handlers ==========
	
	/**
	 * 폼 제출 핸들러
	 * @param e - 폼 제출 이벤트
	 * @description 이메일 입력 후 비밀번호 재설정 요청 처리
	 * 
	 * @process
	 * 1. 이메일 입력 여부 확인
	 * 2. 이메일 형식 확인
	 * 3. Mock/Real API 호출
	 * 4. Mock resetToken 생성 (Mock인 경우)
	 * 5. 새 비밀번호 입력 페이지로 이동 (resetToken 전달)
	 */
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();

		// 이메일 입력 여부 확인
		if (!email.trim()) {
			showAlert('이메일을 입력해주세요.');
			return;
		}

		// 이메일 형식 확인 (간단한 검증)
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email.trim())) {
			showAlert('올바른 이메일 형식을 입력해주세요.');
			return;
		}

		try {
			setIsLoading(true);

		// ========== Phase 8: useAuth Hook을 통한 API 호출 ==========
		const response = await requestPasswordReset(email.trim());
		
		// 성공 메시지 표시
		showAlert('비밀번호 재설정 링크가 이메일로 전송되었습니다.\n\n이메일에서 링크를 확인해주세요.');
			
			// 1.5초 후 로그인 페이지로 이동
			// 참고: 실제 API에서는 resetToken이 이메일로 전송되며,
			// 사용자는 이메일의 링크를 클릭하여 비밀번호 재설정 페이지로 이동합니다.
			setTimeout(() => {
				navigate(ROUTES.AUTH.LOGIN);
			}, 2000);
		} catch (error: any) {
			console.error('비밀번호 재설정 요청 오류:', error);
			showAlert(error.message || '비밀번호 재설정 요청 중 오류가 발생했습니다.');
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
					<div className="mb-12 flex justify-center items-center">
					<Link to={ROUTES.HOME} className="inline-block">
						<img src="/assets/images/brand/medicrew_blue_logo.png" alt="Medicrew" className="h-7 object-contain mx-auto" />
					</Link>
					</div>
					<h1 className="text-xl font-bold text-brand-500 mb-2">
						비밀번호 변경
					</h1>
					<div className="text-gray-600 text-sm leading-relaxed mb-6">
						<p>가입하신 이메일로 비밀번호 변경	링크를 보내드립니다.</p>
					</div>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
					<div>
						<label htmlFor="email" className="block mb-3 text-sm font-semibold text-gray-900">
							이메일
						</label>
						<Input
							type="email"
							id="email"
							className="border rounded-xl border-gray-200"
							placeholder="example@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isLoading}
						/>
					</div>

				<div className="flex justify-center items-center gap-4">
					<Button
						type="submit"
						className="px-6 min-w-40 rounded-full shadow-lg shadow-brand-100 active:scale-95"
						variant="primary"
						disabled={isLoading}
					>
						{isLoading ? '전송 중...' : '이메일 전송'}
					</Button>
					<Button
						type="button"
						className="px-6 min-w-40 rounded-full active:scale-95"
						variant="secondary"
						onClick={() => navigate(-1)}
						disabled={isLoading}
					>
						취소
					</Button>
				</div>
				</form>

				{/* Help Section */}
				<div className="mt-14">
					<h3 className="text-sm font-bold text-gray-800 mb-2">
						이메일 수신에 어려움이 있으신가요?
					</h3>
					<div className="text-sm text-gray-500 p-0 leading-relaxed">
						<p><span>- 이메일 수신에 <span className="font-bold text-gray-800 underline underline-offset-2">2~3분</span> 정도 소요될 수 있습니다.</span></p>
						<p><span>- <span className="font-bold text-gray-800 underline underline-offset-2">스팸 메일함</span>을 확인해주세요.</span></p>
						<p><span>- <span className="font-bold text-gray-800 underline underline-offset-2">방화벽 차단</span> 가능성이 있다면, 스마트폰이나 다른 장소에서 다시 시도해주세요.</span></p>
					</div>
				</div>
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
