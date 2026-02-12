/**
 * 회원 탈퇴 확인 페이지
 * 
 * @description
 * 사용자가 회원 탈퇴를 최종 확인하고 실행하는 페이지
 * Phase 7에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
 * 
 * @phase Phase 7
 * 
 * @features
 * - 회원 탈퇴 최종 확인 메시지 표시
 * - 회원 탈퇴 실행 (Mock API 호출)
 * - 탈퇴 완료 후 완료 페이지로 이동
 * - AlertDialog 통합 (성공/실패 메시지)
 * - Mock 데이터 사용 (Feature Flag 적용)
 * 
 * @important
 * ⚠️ Mock 데이터만 사용하므로 실제로는 탈퇴하지 않습니다.
 * Phase 8에서 실제 API 연동 시 실제 탈퇴가 진행됩니다.
 * 
 * @mock Phase 7
 * - mockDeleteAccountResponse 사용 (1초 지연)
 * - 실제로는 탈퇴하지 않음 (Mock 데이터만 사용)
 * 
 * @api Phase 8
 * - DELETE /user/my-account
 * - 실제 회원 탈퇴 처리
 * 
 * @routes
 * - /account-deletion/confirm (현재 페이지)
 * - /account-deletion/complete (탈퇴 완료 후)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button, AlertDialog } from '@/components/shared/ui';
import { ROUTES } from '@/lib/constants/routes';
import { useUser } from '@/data/queries/useUser';
import { useAuth } from '@/contexts/AuthContext';
import type { DeleteMyAccountResponseDto } from '@/types/user';

export default function AccountDeletionConfirm(): React.ReactElement {
	// ========== API Hooks ==========
	/**
	 * User API Custom Hook
	 * Phase 8에서 실제 API 호출에 사용
	 */
	const { deleteAccount } = useUser();
	
	// ========== State 관리 ==========
	
	/**
	 * 회원 탈퇴 진행 중 상태
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
	const { logout } = useAuth();

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

	// ========== Event Handlers ==========
	
	/**
	 * 삭제하기 버튼 핸들러
	 * @description 회원 탈퇴를 실행하는 함수
	 * 
	 * @process
	 * 1. Mock/Real API 호출
	 * 2. 성공 시 AlertDialog 표시
	 * 3. 로그아웃 처리 (AuthContext 상태 초기화 + localStorage 정리)
	 * 4. 완료 페이지로 이동
	 * 
	 * @important
	 * ⚠️ Mock 데이터만 사용하므로 실제로는 탈퇴하지 않습니다.
	 */
	const handleDelete = async (): Promise<void> => {
		try {
			setIsLoading(true);

		// ========== Phase 8: useUser Hook을 통한 API 호출 ==========
		const response = await deleteAccount();
		
		// 성공 메시지 표시
		showAlert('회원 탈퇴가 완료되었습니다.\n그동안 이용해 주셔서 감사합니다.');
		
		// 로그아웃 처리 (AuthContext 상태 초기화 + localStorage 정리)
			logout();
			
			// 1.5초 후 완료 페이지로 이동
			setTimeout(() => {
				navigate(ROUTES.AUTH.ACCOUNT_DELETION_COMPLETE);
			}, 1500);
		} catch (error: any) {
			console.error('회원 탈퇴 오류:', error);
			showAlert(error.message || '회원 탈퇴 중 오류가 발생했습니다.');
		} finally {
			// 항상 실행: 로딩 상태 종료
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-8">
			<div className="w-full max-w-[520px] bg-white rounded-3xl p-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col items-center text-center">

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

				<h1 className="text-2xl font-semibold text-brand-500 mb-12">
					회원계정삭제 확인
				</h1>

				<div className="text-[#374151] text-lg leading-relaxed mb-12">
					<p className="mb-1">회원계정 삭제 시, 해당 계정정보가 즉시 삭제되며,</p>
					<p className="mb-6">그동안 쌓인 실습기록을 더이상 조회할 수 없게 됩니다.</p>
					<p className="font-bold text-gray-900">계속 진행하시겠습니까?</p>
				</div>

				{/* Actions */}
				<div className="flex gap-4 w-full max-w-[360px]">
					<Button
						onClick={handleDelete}
						className="flex-1 rounded-full text-lg shadow-lg shadow-blue-500/20 h-11 bg-[#0085FF] hover:bg-[#0077E6]"
						variant="primary"
						disabled={isLoading}
					>
						{isLoading ? '삭제 중...' : '삭제하기'}
					</Button>
					<Button
						onClick={() => navigate(-1)}
						className="flex-1 rounded-full text-lg h-11 text-[#0085FF] border-2 border-[#0085FF] hover:bg-gray-50"
						variant="secondary"
						disabled={isLoading}
					>
						취소
					</Button>
				</div>
			</div>

			{/* Footer */}
			<div className="mt-12 flex items-center gap-2">
				<span className="text-xs text-gray-400">Powered by</span>
				<span className="text-sm font-bold text-gray-800 tracking-tight">NEWBASE</span>
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
