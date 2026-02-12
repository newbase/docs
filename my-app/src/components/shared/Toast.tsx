/**
 * Toast Notification Component
 * 간단한 Toast 알림 시스템
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: string;
	type: ToastType;
	title?: string;
	message: string;
	duration?: number;
}

interface ToastContextType {
	toasts: Toast[];
	addToast: (toast: Omit<Toast, 'id'>) => void;
	removeToast: (id: string) => void;
	success: (message: string, title?: string, duration?: number) => void;
	error: (message: string, title?: string, duration?: number) => void;
	warning: (message: string, title?: string, duration?: number) => void;
	info: (message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider
 * 앱 최상위에서 감싸서 사용
 * 
 * @usage
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const addToast = useCallback(({ type, title, message, duration = 5000 }: Omit<Toast, 'id'>) => {
		const id = `toast-${Date.now()}-${Math.random()}`;
		const newToast: Toast = { id, type, title, message, duration };
		
		setToasts((prev) => [...prev, newToast]);

		// 자동 제거 (duration이 0이면 자동 제거하지 않음)
		if (duration > 0) {
			setTimeout(() => {
				removeToast(id);
			}, duration);
		}
	}, [removeToast]);

	const success = useCallback((message: string, title?: string, duration?: number) => {
		addToast({ type: 'success', title, message, duration });
	}, [addToast]);

	const error = useCallback((message: string, title?: string, duration?: number) => {
		addToast({ type: 'error', title, message, duration });
	}, [addToast]);

	const warning = useCallback((message: string, title?: string, duration?: number) => {
		addToast({ type: 'warning', title, message, duration });
	}, [addToast]);

	const info = useCallback((message: string, title?: string, duration?: number) => {
		addToast({ type: 'info', title, message, duration });
	}, [addToast]);

	return (
		<ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
			{children}
			<ToastContainer toasts={toasts} onRemove={removeToast} />
		</ToastContext.Provider>
	);
}

/**
 * useToast Hook
 * Toast 알림을 사용하기 위한 훅
 * 
 * @usage
 * ```tsx
 * const toast = useToast();
 * 
 * // 성공 알림
 * toast.success('저장되었습니다.');
 * 
 * // 에러 알림
 * toast.error('오류가 발생했습니다.', '저장 실패');
 * ```
 */
export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error('useToast must be used within ToastProvider');
	}
	return context;
}

/**
 * Toast Container
 * Toast 목록을 화면에 표시
 */
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
	if (toasts.length === 0) return null;

	return (
		<div 
			className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-96 max-w-[calc(100vw-2rem)]"
			role="region"
			aria-label="알림"
			aria-live="polite"
			aria-atomic="false"
		>
			{toasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
			))}
		</div>
	);
}

/**
 * Toast Item
 * 개별 Toast 알림
 */
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
	const [isExiting, setIsExiting] = useState(false);

	const handleRemove = () => {
		setIsExiting(true);
		setTimeout(() => {
			onRemove(toast.id);
		}, 300); // 애니메이션 시간과 동일
	};

	useEffect(() => {
		// 진입 애니메이션
		const timer = setTimeout(() => {
			// 애니메이션 트리거용
		}, 10);
		return () => clearTimeout(timer);
	}, []);

	const getIcon = () => {
		switch (toast.type) {
			case 'success':
				return <CheckCircle size={20} className="text-green-600 flex-shrink-0" />;
			case 'error':
				return <XCircle size={20} className="text-red-600 flex-shrink-0" />;
			case 'warning':
				return <AlertCircle size={20} className="text-orange-600 flex-shrink-0" />;
			case 'info':
				return <Info size={20} className="text-blue-600 flex-shrink-0" />;
		}
	};

	const getStyle = () => {
		switch (toast.type) {
			case 'success':
				return 'bg-green-50 border-green-200';
			case 'error':
				return 'bg-red-50 border-red-200';
			case 'warning':
				return 'bg-orange-50 border-orange-200';
			case 'info':
				return 'bg-blue-50 border-blue-200';
		}
	};

	return (
		<div
			role="alert"
			aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
			aria-atomic="true"
			className={`
				${getStyle()}
				border rounded-lg shadow-lg p-4
				transition-all duration-300 ease-out
				${isExiting 
					? 'opacity-0 translate-x-full' 
					: 'opacity-100 translate-x-0'
				}
			`}
		>
			<div className="flex items-start gap-3">
				{getIcon()}
				<div className="flex-1 min-w-0">
					{toast.title && (
						<h4 className="text-sm font-semibold text-gray-900 mb-1">
							{toast.title}
						</h4>
					)}
					<p className="text-sm text-gray-700 break-words">
						{toast.message}
					</p>
				</div>
				<button
					type="button"
					onClick={handleRemove}
					className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
					aria-label="알림 닫기"
				>
					<X size={18} aria-hidden="true" />
				</button>
			</div>
		</div>
	);
}
