/**
 * 회원 탈퇴 요청 페이지
 * 
 * @description
 * 사용자가 회원 탈퇴를 요청하는 첫 번째 페이지
 * 피드백을 입력하고, 정회원/게스트에 따라 다음 단계로 이동
 * Phase 7에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
 * 
 * @phase Phase 7
 * 
 * @features
 * - 피드백 입력 (optional, 저장하지 않음)
 * - 정회원/게스트 구분
 * - 정회원: 이메일 인증 페이지로 이동 (EmailVerification.tsx 재사용)
 * - 게스트: 회원 탈퇴 확인 페이지로 직접 이동
 * 
 * @mock Phase 7
 * - 피드백은 저장하지 않음 (optional)
 * - 이메일 인증은 EmailVerification.tsx에서 처리 (mode=deletion)
 * 
 * @api Phase 8
 * - 피드백 저장 API (optional, 구현 여부 미정)
 * 
 * @routes
 * - /account-deletion/request (현재 페이지)
 * - /verify-email?mode=deletion (정회원인 경우)
 * - /account-deletion/confirm (게스트인 경우)
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Star } from 'lucide-react';
import { Button, AlertDialog } from '@/components/shared/ui';
import { ROUTES } from '@/lib/constants/routes';

export default function AccountDeletionRequest(): React.ReactElement {
	// ========== State 관리 ==========
	
	/**
	 * 피드백 입력값
	 * @description 사용자가 입력한 피드백 (optional, 저장하지 않음)
	 */
	const [feedback, setFeedback] = useState<string>('');
	
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

	// ========== Hooks ==========
	
	const { getCurrentRole } = useAuth();
	const navigate = useNavigate();
	
	/**
	 * 정회원 여부 확인
	 * @description 게스트가 아닌 경우 정회원으로 간주
	 */
	const isFullMember = getCurrentRole() !== 'guest';

	// ========== Event Handlers ==========
	
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
	 * AlertDialog 닫기 (작성하기)
	 * @description AlertDialog를 닫고 피드백 입력란으로 돌아감
	 */
	const closeAlert = (): void => {
		setAlertState({
			isOpen: false,
			message: '',
		});
	};
	
	/**
	 * 다음 단계로 이동
	 * @description 정회원/게스트에 따라 다음 단계로 이동
	 */
	const proceedToNextStep = (): void => {
		if (isFullMember) {
			// 정회원인 경우: 이메일 인증 페이지로 이동 (EmailVerification.tsx 재사용)
			navigate(`${ROUTES.AUTH.EMAIL_VERIFICATION}?mode=deletion`);
		} else {
			// 게스트인 경우: 회원 탈퇴 확인 페이지로 직접 이동
			navigate(ROUTES.AUTH.ACCOUNT_DELETION_CONFIRM);
		}
	};
	
	/**
	 * 확인 버튼 핸들러
	 * @description 피드백 입력 여부에 따라 확인 메시지 표시 또는 다음 단계로 이동
	 * 
	 * @process
	 * 1. 피드백이 비어있는 경우: 확인 메시지 표시 ("작성하기" / "넘어가기" 버튼)
	 * 2. 피드백이 있는 경우: 바로 다음 단계로 이동
	 * 3. 정회원: 이메일 인증 페이지로 이동 (EmailVerification.tsx 재사용, mode=deletion)
	 * 4. 게스트: 회원 탈퇴 확인 페이지로 직접 이동
	 * 
	 * @note
	 * 피드백은 optional이며 저장하지 않음 (Phase 8에서 저장 API 구현 가능)
	 */
	const handleConfirm = (): void => {
		// 피드백이 비어있는 경우: 확인 메시지 표시
		if (!feedback.trim()) {
			showAlert('피드백 없이 진행하시겠습니까?');
			return;
		}
		
		// 피드백이 있는 경우: 바로 다음 단계로 이동
		proceedToNextStep();
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-8">
			<div className="w-full max-w-[460px] bg-white rounded-3xl p-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col items-center text-center">

				{/* Icon */}
				<div className="mb-8 relative">
					<div className="absolute -top-1 -right-1">
						<Star size={32} className="text-blue-500 fill-blue-500" strokeWidth={1.5} />
					</div>
					<div className="rotate-[-15deg] translate-x-[-10px] translate-y-[10px]">
						<div className="flex flex-col gap-1 items-end">
							<div className="w-6 h-0.5 bg-blue-400 rounded-full opacity-40"></div>
							<div className="w-8 h-0.5 bg-blue-500 rounded-full opacity-70"></div>
							<div className="w-10 h-0.5 bg-blue-600 rounded-full"></div>
						</div>
					</div>
				</div>

				<h1 className="text-2xl font-semibold text-brand-500 mb-10">
					회원계정삭제
				</h1>

				<p className="text-[#4B5563] text-lg leading-relaxed mb-12">
					그동안 메디크루가 어떤 부분에서 도움이 되셨나요?
				</p>

				{/* Feedback Input */}
				<div className="w-full mb-12">
					<textarea
						value={feedback}
						onChange={(e) => setFeedback(e.target.value)}
						placeholder="피드백 입력"
						className="w-full h-32 px-5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none text-[#111827] placeholder:text-[#9CA3AF]"
					/>
				</div>

				{/* Actions */}
				<div className="flex gap-4 w-full">
					<Button
						onClick={handleConfirm}
						className="flex-1 rounded-full text-lg shadow-lg shadow-blue-500/20 h-11 bg-[#0085FF] hover:bg-[#0077E6]"
						variant="primary"
					>
						확인
					</Button>
					<Button
						onClick={() => navigate(-1)}
						className="flex-1 rounded-full text-lg h-11 text-[#4B5563] border-2 border-[#E5E7EB] hover:bg-gray-50"
						variant="secondary"
					>
						취소
					</Button>
				</div>
			</div>

			{/* Footer */}
			<div className="w-full max-w-[460px] flex flex-col items-center mt-12 gap-8">
				<div className="flex items-center gap-2">
					<span className="text-xs text-gray-400">Powered by</span>
					<span className="text-sm font-bold text-gray-800 tracking-tight">NEWBASE</span>
				</div>

				<div className="flex gap-6 text-xs font-semibold text-gray-600">
					<Link to="#" className="hover:text-gray-900">Contact</Link>
					<Link to="#" className="hover:text-gray-900">Terms</Link>
					<Link to="#" className="hover:text-gray-900">Privacy</Link>
				</div>
			</div>
			
			{/* AlertDialog */}
			<AlertDialog
				isOpen={alertState.isOpen}
				onClose={proceedToNextStep}
				message={alertState.message}
				confirmText="넘어가기"
				cancelText="작성하기"
				onCancel={closeAlert}
			/>
		</div>
	);
}
