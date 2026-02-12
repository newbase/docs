/**
 * 이메일 인증 페이지
 * 
 * @description
 * 사용자가 이메일 인증 코드를 발송받고 입력하여 이메일을 인증하는 페이지
 * Phase 5에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
 * 
 * @phase Phase 5
 * 
 * @features
 * - 이메일 인증 코드 발송 (Mock API)
 * - 6자리 인증 코드 입력
 * - 인증 코드 검증 (Mock API)
 * - 재발송 기능 (1분 대기)
 * - 인증 완료 후 완료 페이지로 이동
 * 
 * @data-source
 * - 이메일: AuthContext의 user.email 사용 (기존 데이터 소스 우선 사용 규칙)
 * - 인증 코드 발송: Mock API 호출 (mockSendVerificationEmailResponse)
 * - 인증 코드 검증: Mock API 호출 (mockVerifyVerificationCodeResponse)
 * 
 * @mock Phase 5-7
 * - mockSendVerificationEmailResponse 사용 (1초 지연)
 * - mockVerifyVerificationCodeResponse 사용 (1초 지연)
 * - generateMockVerificationCode()로 6자리 랜덤 코드 생성
 * - 생성된 코드를 state에 저장하여 검증 시 비교
 * 
 * @api Phase 8
 * - POST /auth/send-verification-email (이메일 인증 코드 발송)
 * - POST /auth/verify-verification-code (이메일 인증 코드 검증)
 * 
 * @routes
 * - /verify-email (현재 페이지)
 * - /verify-email/complete (인증 완료 페이지)
 * - /account-deletion/confirm (회원 탈퇴 모드일 경우)
 */

import React, { useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, AlertDialog } from '@/components/shared/ui';
import { ROUTES } from '@/lib/constants/routes';
import { useAuth as useAuthApi } from '@/data/queries/useAuth';
import type { 
	SendVerificationEmailRequestDto, 
	VerifyVerificationCodeRequestDto,
	VerifyDeletionCodeRequestDto
} from '@/types/auth';

// Logo is now in public folder
const medicrewLogo = '/assets/images/brand/medicrew_blue_logo.png';

export default function EmailVerification(): React.ReactElement {
	// ========== API Hooks ==========
	/**
	 * Auth API Custom Hook
	 * Phase 8에서 실제 API 호출에 사용
	 */
	const { sendVerificationEmail, verifyVerificationCode, sendDeletionCode, verifyDeletionCode } = useAuthApi();
	
	// ========== Hooks ==========
	
    const { user } = useAuth();
    const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	// ========== State 관리 ==========
	
	/**
	 * 이메일 주소
	 * @description 기존 AuthContext의 user.email을 초기값으로 사용 (기존 데이터 소스 우선 사용 규칙)
	 */
    const [email, setEmail] = useState<string>(user?.email || '');
	
	/**
	 * 인증 코드 (6자리)
	 */
    const [code, setCode] = useState<string>('');
	
	/**
	 * 생성된 Mock 인증 코드 (검증 시 비교용)
	 * @description generateMockVerificationCode()로 생성된 코드를 저장
	 */
	const [generatedCode, setGeneratedCode] = useState<string | null>(null);
	
	/**
	 * 인증 코드 발송 진행 중 상태
	 * @description 인증 코드 발송 API 호출 중 버튼 비활성화
	 */
	const [isSending, setIsSending] = useState<boolean>(false);
	
	/**
	 * 인증 코드 검증 진행 중 상태
	 * @description 인증 코드 검증 API 호출 중 버튼 비활성화
	 */
	const [isVerifying, setIsVerifying] = useState<boolean>(false);
	
	/**
	 * 재발송 대기 시간 (초)
	 * @description 재발송 버튼 비활성화 시간 (1분 = 60초)
	 */
	const [resendCooldown, setResendCooldown] = useState<number>(0);
	
	/**
	 * AlertDialog 상태
	 * @field isOpen - 팝업 열림 여부
	 * @field message - 표시할 메시지
	 */
	const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string; }>({
		isOpen: false,
		message: '',
	});

	// ========== Refs ==========
	
	/**
	 * 재발송 타이머 ref
	 * @description 컴포넌트 언마운트 시 타이머 정리
	 */
	const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

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

	/**
	 * 재발송 대기 시간 설정
	 * @description 1분(60초) 대기 시간을 설정하고 카운트다운 시작
	 */
	const startResendCooldown = useCallback(() => {
		setResendCooldown(60);
		
		// 기존 타이머 정리
		if (resendTimerRef.current) {
			clearInterval(resendTimerRef.current);
		}
		
		// 1초마다 카운트다운
		resendTimerRef.current = setInterval(() => {
			setResendCooldown((prev) => {
				if (prev <= 1) {
					if (resendTimerRef.current) {
						clearInterval(resendTimerRef.current);
						resendTimerRef.current = null;
					}
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, []);

	// ========== 이메일 인증 코드 발송 ==========
	
	/**
	 * 이메일 인증 코드 발송 핸들러
	 * 
	 * @description
	 * 사용자가 입력한 이메일로 인증 코드를 발송하는 함수
	 * Phase 5에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
	 * 
	 * @validation
	 * 1. 이메일 입력 여부 확인 → "이메일을 입력해주세요."
	 * 2. 이메일 형식 확인 → "올바른 이메일 형식을 입력해주세요."
	 * 
	 * @mock Phase 5-7
	 * - mockSendVerificationEmailResponse 반환 ({ message })
	 * - generateMockVerificationCode()로 6자리 랜덤 코드 생성
	 * - 생성된 코드를 state에 저장 (검증 시 비교용)
	 * - 1초 지연으로 실제 API 시뮬레이션
	 * - 재발송 대기 시간 1분 설정
	 * - 성공 시 AlertDialog 표시
	 * 
	 * @api Phase 8
	 * - POST /auth/send-verification-email
	 * - 실제 이메일 발송
	 * - 서버에서 생성한 코드를 이메일로 전송
	 */
	const handleSendCode = async () => {
		// ========== 1단계: 유효성 검사 ==========
		
		// 이메일 입력 여부 확인
		if (!email || email.trim() === '') {
			showAlert('이메일을 입력해주세요.');
			return;
		}

		// 이메일 형식 확인 (간단한 정규식)
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email.trim())) {
			showAlert('올바른 이메일 형식을 입력해주세요.');
			return;
		}

		// ========== 2단계: 인증 코드 발송 API 호출 ==========
		
		setIsSending(true);

		try {
			// mode 파라미터 확인
			const mode = searchParams.get('mode');
			const isDeletionMode = mode === 'deletion';

			// ========== Phase 8: useAuth Hook을 통한 API 호출 ==========
			let response;
			if (isDeletionMode) {
				// 회원 탈퇴 인증 코드 발송
				response = await sendDeletionCode();
			} else {
				// 이메일 인증 코드 발송
				response = await sendVerificationEmail(email.trim());
			}

		// 성공 메시지 표시
		showAlert('인증 코드가 발송되었습니다.\n이메일을 확인해주세요.');
		
		// 재발송 대기 시간 설정 (1분)
		startResendCooldown();
		} catch (error: any) {
			console.error('인증 코드 발송 오류:', error);
			showAlert(error.message || '인증 코드 발송 중 오류가 발생했습니다.');
		} finally {
			// 항상 실행: 로딩 상태 종료
			setIsSending(false);
		}
	};

	// ========== 이메일 인증 코드 검증 ==========
	
	/**
	 * 이메일 인증 코드 검증 핸들러
	 * 
	 * @description
	 * 사용자가 입력한 인증 코드를 검증하는 함수
	 * Phase 5에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
	 * 
	 * @param e - 폼 제출 이벤트
	 * 
	 * @validation
	 * 1. 이메일 입력 여부 확인 → "이메일을 입력해주세요."
	 * 2. 인증 코드 입력 여부 확인 → "인증 코드를 입력해주세요."
	 * 3. 인증 코드 길이 확인 (6자리) → "인증 코드는 6자리입니다."
	 * 
	 * @mock Phase 5-7
	 * - mockVerifyVerificationCodeResponse 반환 ({ message })
	 * - 생성된 Mock 코드와 입력한 코드 비교
	 * - 일치하면 성공, 불일치하면 실패
	 * - 1초 지연으로 실제 API 시뮬레이션
	 * - 성공 시 완료 페이지로 이동
	 * 
	 * @api Phase 8
	 * - POST /auth/verify-verification-code
	 * - 실제 서버에서 코드 검증
	 * - 성공 시 완료 페이지로 이동
	 */
	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault();

		// ========== 1단계: 유효성 검사 ==========
		
		// 이메일 입력 여부 확인
		if (!email || email.trim() === '') {
			showAlert('이메일을 입력해주세요.');
			return;
		}

		// 인증 코드 입력 여부 확인
		if (!code || code.trim() === '') {
			showAlert('인증 코드를 입력해주세요.');
			return;
		}

		// 인증 코드 길이 확인 (6자리)
		if (code.trim().length !== 6) {
			showAlert('인증 코드는 6자리입니다.');
			return;
		}

		// ========== 2단계: 인증 코드 검증 API 호출 ==========
		
		setIsVerifying(true);

		try {
			// mode 파라미터 확인
			const mode = searchParams.get('mode');
			const isDeletionMode = mode === 'deletion';

			// ========== Phase 8: useAuth Hook을 통한 API 호출 ==========
			let response;
			if (isDeletionMode) {
				// 회원 탈퇴 인증 코드 검증
				response = await verifyDeletionCode(code.trim());
			} else {
				// 이메일 인증 코드 검증
				response = await verifyVerificationCode(email.trim(), code.trim());
			}

	// 성공 메시지 표시
	const successMessage = isDeletionMode 
		? '인증이 완료되었습니다.' 
		: '이메일 인증이 완료되었습니다.\n\n정회원으로 전환되었습니다.';
	showAlert(successMessage);
	
	// 잠시 후 완료 페이지로 이동
	setTimeout(() => {
		if (isDeletionMode) {
			navigate(ROUTES.AUTH.ACCOUNT_DELETION_CONFIRM);
		} else {
			// 이메일 인증 완료 후 Settings 페이지로 이동 (프로필 자동 갱신)
			navigate(ROUTES.AUTH.SETTINGS);
		}
	}, 1500);
		} catch (error: any) {
			console.error('인증 코드 검증 오류:', error);
			showAlert('인증 코드 검증 중 오류가 발생했습니다.');
		} finally {
			// 항상 실행: 로딩 상태 종료
			setIsVerifying(false);
		}
	};

	// ========== Cleanup ==========
	
	/**
	 * 컴포넌트 언마운트 시 타이머 정리
	 */
	React.useEffect(() => {
		return () => {
			if (resendTimerRef.current) {
				clearInterval(resendTimerRef.current);
			}
		};
	}, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
            {/* Verification Card */}
            <div className="w-full max-w-[460px] bg-white rounded-3xl p-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block">
                        <img src={medicrewLogo} alt="Medicrew" className="h-7 w-auto" />
                    </Link>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-semibold text-brand-500 text-center mb-10">
                    이메일 인증
                </h1>

                {/* Form */}
                <form onSubmit={handleVerify} className="flex flex-col gap-6">
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-900">
                            이메일
                        </label>
                        <Input
                            type="email"
                            id="email"
                            className="bg-gray-50 focus:bg-white border-transparent focus:border-brand-500 rounded-xl"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="code" className="block mb-2 text-sm font-semibold text-gray-900">
                            인증번호
                        </label>
                        <div className="flex gap-3">
                            <Input
                                type="text"
                                id="code"
                                className="flex-1 bg-gray-50 focus:bg-white border-transparent focus:border-brand-500 rounded-xl"
                                placeholder="숫자 6자리"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                            <Button
                                type="button"
                                onClick={handleSendCode}
                                variant="secondary"
                                className="shrink-0 px-6 border-2 border-brand-500 text-brand-500 rounded-xl h-10"
								disabled={isSending || resendCooldown > 0}
                            >
                                {isSending 
									? '전송 중...' 
									: resendCooldown > 0 
										? `재발송 (${resendCooldown}초)` 
										: '인증번호 전송'
								}
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 mt-2">
                        <Button
                            type="submit"
                            className="w-full rounded-full text-lg h-12 shadow-md"
                            variant="primary"
							disabled={isVerifying}
                        >
                            {isVerifying ? '인증 중...' : '확인'}
                        </Button>
                    </div>
                </form>

                {/* Help Section */}
                <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
                    <h2 className="text-sm font-bold text-gray-900 mb-4">
                        이메일 수신에 어려움이 있으신가요?
                    </h2>
                    <ul className="text-xs text-gray-500 space-y-2 list-none p-0">
                        <li className="relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-gray-400">
                            이메일 수신에 <span className="font-bold">2~3분</span> 정도 소요될 수 있습니다.
                        </li>
                        <li className="relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-gray-400">
                            <span className="font-bold">스팸 메일함</span>을 확인해주세요.
                        </li>
                        <li className="relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-gray-400">
                            방화벽 차단 가능성이 있다면, 스마트폰이나 다른 장소에서 다시 시도해주세요.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full max-w-[460px] flex justify-between items-center text-xs text-gray-400 mt-8">
                <Link to={ROUTES.AUTH.LOGIN} className="flex items-center gap-2 hover:text-gray-600 transition-colors font-medium">
                    ← 로그인으로 돌아가기
                </Link>
                <div className="flex gap-4">
                    <button type="button" className="hover:underline">이용약관</button>
                    <button type="button" className="hover:underline">개인정보처리방침</button>
                </div>
            </div>

			{/* AlertDialog: 인증 코드 발송/검증 성공/실패 메시지 표시 */}
			<AlertDialog
				isOpen={alertState.isOpen}
				onClose={closeAlert}
				message={alertState.message}
			/>
        </div>
    );
}
