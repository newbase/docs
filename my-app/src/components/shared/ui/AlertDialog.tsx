/**
 * AlertDialog 컴포넌트
 * 
 * @description
 * 간단한 확인 메시지를 백색 배경 레이어 팝업으로 표시하는 컴포넌트
 * 기존 Modal.tsx 스타일을 참고하여 일관성 유지
 * 
 * @usage
 * - 필수 항목 빈값 체크 메시지 (필드별 구체적 안내)
 * - 유효성 검사 실패 메시지
 * - 일반 알림 메시지
 * 
 * @features
 * - 백색 배경 중앙 레이어 팝업
 * - 최소 높이 200px 보장
 * - 메시지 중앙 정렬
 * - 반투명 배경 (backdrop)
 * - ESC 키로 닫기
 * - 확인 버튼 클릭으로 닫기
 * - 애니메이션 효과
 * 
 * @design
 * - 최소 높이: 200px (min-h-[200px])
 * - 패딩: 32px (px-8, py-8)
 * - 텍스트 크기: 18px (text-lg)
 * - 버튼 최소 너비: 140px
 * - 버튼 높이: 48px (h-12)
 * 
 * @phase Phase 2
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface AlertDialogProps {
	/** 팝업 열림 여부 */
	isOpen: boolean;
	
	/** 팝업 닫기 함수 */
	onClose: () => void;
	
	/** 제목 (선택, 없으면 제목 영역 미표시) */
	title?: string;
	
	/** 메시지 내용 */
	message: string;
	
	/** 확인 버튼 텍스트 (기본값: "확인") */
	confirmText?: string;
	
	/** 취소 버튼 텍스트 (선택, 있으면 두 개의 버튼 표시) */
	cancelText?: string;
	
	/** 취소 버튼 클릭 함수 (선택, 없으면 onClose 사용) */
	onCancel?: () => void;
}

/**
 * AlertDialog 컴포넌트
 * 
 * @example
 * const [alertState, setAlertState] = useState({ isOpen: false, message: '' });
 * 
 * const showAlert = (message: string) => {
 *   setAlertState({ isOpen: true, message });
 * };
 * 
 * const closeAlert = () => {
 *   setAlertState({ isOpen: false, message: '' });
 * };
 * 
 * <AlertDialog
 *   isOpen={alertState.isOpen}
 *   onClose={closeAlert}
 *   message={alertState.message}
 * />
 */
export default function AlertDialog({
	isOpen,
	onClose,
	title,
	message,
	confirmText = '확인',
	cancelText,
	onCancel
}: AlertDialogProps) {
	// ========== ESC 키 이벤트 처리 ==========
	/**
	 * ESC 키를 누르면 팝업 닫기
	 */
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	// ========== Body 스크롤 방지 ==========
	/**
	 * 팝업이 열려있을 때 배경 스크롤 방지
	 */
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	// 팝업이 닫혀있으면 렌더링하지 않음
	if (!isOpen) return null;

	return createPortal(
		// 배경 레이어 (반투명 검정, 클릭 시 닫기)
		<div
			className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity"
			onClick={onClose}
		>
			{/* 백색 배경 팝업 (클릭 시 이벤트 전파 중지) */}
			<div
				className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col min-h-[200px] animate-in fade-in zoom-in-95 duration-200"
				onClick={(e: React.MouseEvent) => e.stopPropagation()}
				role="alertdialog"
				aria-modal="true"
				aria-labelledby={title ? 'alert-dialog-title' : undefined}
				aria-describedby="alert-dialog-message"
			>
				{/* 제목 영역 (title이 있을 경우에만 표시) */}
				{title && (
					<div className="px-8 pt-8 pb-3">
						<h3
							id="alert-dialog-title"
							className="text-xl font-bold text-gray-900"
						>
							{title}
						</h3>
					</div>
				)}

				{/* 메시지 영역 */}
				<div className={`px-8 flex-1 flex items-center ${title ? 'py-5' : 'py-8'}`}>
					<p
						id="alert-dialog-message"
						className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap w-full text-center"
					>
						{message}
					</p>
				</div>

				{/* 버튼 영역 */}
				<div className={`flex px-8 pb-8 pt-4 ${cancelText ? 'justify-center gap-3' : 'justify-center'}`}>
					{/* 취소 버튼 (cancelText가 있을 경우에만 표시) */}
					{cancelText && (
						<Button
							onClick={onCancel || onClose}
							variant="secondary"
							className="min-w-[140px] h-12 rounded-full text-base"
						>
							{cancelText}
						</Button>
					)}
					
					{/* 확인 버튼 */}
					<Button
						onClick={onClose}
						variant="primary"
						className="min-w-[140px] h-12 rounded-full text-base"
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</div>,
		document.body
	);
}
