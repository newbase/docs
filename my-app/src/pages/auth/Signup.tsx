import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, AlertDialog } from '@/components/shared/ui';
import { SignupRequestDto } from '@/types/user';
import { useUser } from '@/data/queries/useUser';
import { ROUTES } from '@/lib/constants/routes';
import { ArrowLeft } from 'lucide-react';

/**
 * Medicrew 로고 이미지 경로
 * public 폴더에 저장된 브랜드 로고
 */
const medicrewLogo = '/assets/images/brand/medicrew_blue_logo.png';

/**
 * 회원가입 페이지 컴포넌트
 * 
 * @description
 * 사용자가 회원가입을 할 수 있는 UI 제공
 * Phase 2에서는 Mock 데이터로 동작, Phase 8에서 실제 API 연동
 * 
 * @features
 * - 로그인 ID 중복 확인 (실시간, 디바운스 적용)
 * - 비밀번호 강도 평가 (영문자+숫자 최소 8자)
 * - 비밀번호 일치 확인
 * - 약관 동의 (기존 체크박스)
 * - 회원가입 완료 후 로그인 페이지 이동
 * 
 * @phase Phase 2 (Mock), Phase 8 (API 연동)
 * @route /signup
 */
export default function Signup(): React.ReactElement {
    const navigate = useNavigate();
    
    // ========== API Hooks ==========
    /**
     * User API Custom Hook
     * Phase 8에서 실제 API 호출에 사용
     */
    const { signup, checkLoginId } = useUser();
    
    /**
     * 실제 약관 ID 저장
     * @description 백엔드에서 조회한 실제 약관 ID 목록
     */
    const [actualTermsIds, setActualTermsIds] = useState<number[]>([]);

    // ========== 폼 데이터 상태 ==========
    /**
     * 회원가입 폼 데이터
     * SignupRequestDto 타입 사용 (API 요청 형식과 동일)
     */
    const [formData, setFormData] = useState<SignupRequestDto>({
        loginId: '',                 // 로그인 ID
        pw: '',                      // 비밀번호
        realName: '',                // 실명
        // phoneNumber: UI에 입력 필드가 없으므로 undefined (선택 사항)
        phoneNumber: undefined,
        profileImageUrl: undefined,  // 프로필 이미지 URL (선택)
        termsIdList: [],             // 동의한 약관 ID 목록 (기존 체크박스로 관리)
    });

    // ========== UI 상태 ==========
    /** 비밀번호 확인 입력값 */
    const [passwordConfirm, setPasswordConfirm] = useState<string>('');
    
    /** 비밀번호 강도 ('weak' | 'medium' | 'strong' | null) */
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
    
    /** 비밀번호 일치 여부 (true: 일치, false: 불일치, null: 미확인) */
    const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
    
    /** 아이디 에러 메시지 (중복 확인 실패 시 표시) */
    const [loginIdError, setLoginIdError] = useState<string>('');
    
    /** 아이디 중복 확인 중 여부 (로딩 표시용) */
    const [isCheckingLoginId, setIsCheckingLoginId] = useState<boolean>(false);
    
    /** 회원가입 제출 중 여부 (버튼 비활성화용) */
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    
	/** 약관 동의 여부 (기존 체크박스 상태) */
	const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
	
	/** 회원가입 성공 여부 (AlertDialog 닫을 때 로그인 페이지로 이동하기 위한 플래그) */
	const [isSignupSuccess, setIsSignupSuccess] = useState<boolean>(false);

	// ========== AlertDialog 상태 ==========
	/**
	 * AlertDialog 상태 관리
	 * - isOpen: 팝업 열림 여부
	 * - message: 표시할 메시지
	 */
	const [alertState, setAlertState] = useState<{
		isOpen: boolean;
		message: string;
	}>({
		isOpen: false,
		message: '',
	});

	/**
	 * AlertDialog 열기 함수
	 * 
	 * @param message - 표시할 메시지
	 */
	const showAlert = (message: string) => {
		setAlertState({ isOpen: true, message });
	};

	/**
	 * AlertDialog 닫기 함수
	 * @description 회원가입 성공 시 로그인 페이지로 이동
	 */
	const closeAlert = () => {
		setAlertState({ isOpen: false, message: '' });
		
		// 회원가입 성공 후 AlertDialog 닫으면 로그인 페이지로 이동
		if (isSignupSuccess) {
			setIsSignupSuccess(false);
			navigate(ROUTES.AUTH.LOGIN);
		}
	};

	// ========== 디바운스 타이머 ==========
	/**
	 * 로그인 ID 중복 확인 디바운스 타이머
	 * 사용자 입력 후 500ms 대기 후 중복 확인 API 호출
	 */
	const loginIdCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * 비밀번호 강도 평가 함수
     * 
     * @description
     * 사용자가 입력한 비밀번호의 강도를 평가합니다.
     * 
     * @param password - 평가할 비밀번호
     * @returns 'weak' | 'medium' | 'strong' | null
     * 
     * @rules
     * - 필수 조건: 영문자, 숫자, 최소 8자
     * - 필수 조건 미충족 시 'weak'
     * - 강도 평가 기준:
     *   1. 12자 이상 (+1점)
     *   2. 대소문자 혼용 (+1점)
     *   3. 특수문자 포함 (+1점)
     * - 0점: 'medium'
     * - 1점: 'medium'
     * - 2점 이상: 'strong'
     */
    const evaluatePasswordStrength = useCallback((password: string): 'weak' | 'medium' | 'strong' | null => {
        // 빈 문자열은 null 반환 (평가하지 않음)
        if (password.length === 0) return null;

        // 필수 조건 확인
        const hasLetter = /[a-zA-Z]/.test(password);  // 영문자 포함 여부
        const hasNumber = /\d/.test(password);         // 숫자 포함 여부
        const minLength = password.length >= 8;        // 최소 8자

        // 필수 조건: 영문자, 숫자, 최소 8자
        // 하나라도 충족하지 않으면 'weak'
        if (!hasLetter || !hasNumber || !minLength) return 'weak';

        // 강도 평가 (추가 점수 계산)
        let strength = 0;
        if (password.length >= 12) strength++;                              // 12자 이상 (+1)
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;  // 대소문자 혼용 (+1)
        if (/[^a-zA-Z\d]/.test(password)) strength++;                       // 특수문자 포함 (+1)

        // 점수에 따라 강도 반환
        if (strength === 0) return 'medium';     // 필수 조건만 충족
        if (strength <= 1) return 'medium';      // 추가 조건 1개 충족
        return 'strong';                          // 추가 조건 2개 이상 충족
    }, []);

    /**
     * 로그인 ID 중복 확인 함수
     * 
     * @description
     * 사용자가 입력한 로그인 ID가 이미 사용 중인지 확인합니다.
     * Phase 2에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
     * 
     * @param loginId - 확인할 로그인 ID
     * 
     * @mock Phase 2-7
     * - mockCheckLoginId 함수 호출
     * - 하드코딩된 ID 목록: ['admin', 'test', 'user123']
     * - 1초 지연으로 실제 API 시뮬레이션
     * 
     * @api Phase 8
     * - POST /user/check-login-id
     * - 실제 DB에서 중복 확인
     */
    const checkLoginIdAvailability = useCallback(async (loginId: string) => {
        // 최소 길이 체크: 3자 미만이면 중복 확인하지 않음
        if (!loginId || loginId.length < 3) {
            setLoginIdError('');
            return;
        }

        // 로딩 상태 시작
        setIsCheckingLoginId(true);
        setLoginIdError('');

        try {
            // ========== Phase 8: useUser Hook을 통한 API 호출 ==========
            const response = await checkLoginId(loginId);
            
            // 사용 불가능한 경우 에러 메시지 설정
            if (!response.isAvailable) {
                setLoginIdError('이미 사용중인 아이디입니다.');
            }
        } catch (error: any) {
            console.error('아이디 중복 체크 오류:', error);
            setLoginIdError('아이디 확인 중 오류가 발생했습니다.');
        } finally {
            // 항상 실행: 로딩 상태 종료
            setIsCheckingLoginId(false);
        }
    }, [checkLoginId]);

    // 로그인 ID 입력 변경 핸들러
    const handleLoginIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, loginId: value }));
        setLoginIdError('');

        // 디바운스: 500ms 후 중복 확인
        if (loginIdCheckTimerRef.current) {
            clearTimeout(loginIdCheckTimerRef.current);
        }
        loginIdCheckTimerRef.current = setTimeout(() => {
            checkLoginIdAvailability(value);
        }, 500);
    };

    // 비밀번호 입력 변경 핸들러
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, pw: value }));
        setPasswordStrength(evaluatePasswordStrength(value));
        if (passwordConfirm) {
            setPasswordMatch(value === passwordConfirm);
        }
    };

    // 비밀번호 확인 입력 변경 핸들러
    const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPasswordConfirm(value);
        setPasswordMatch(value === formData.pw);
    };

    // 약관 동의 체크박스 변경 (기존 방식 유지)
    const handleAgreeToTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setAgreeToTerms(checked);
        // 약관 동의 시 실제 약관 ID 사용
        if (checked) {
            setFormData((prev) => ({ ...prev, termsIdList: actualTermsIds }));
        } else {
            setFormData((prev) => ({ ...prev, termsIdList: [] }));
        }
    };
    
    // ========== 약관 리스트 조회 ==========
    /**
     * 페이지 로드 시 실제 약관 ID 조회
     * @description GET /terms/list API를 호출하여 실제 약관 ID를 가져옴
     */
    useEffect(() => {
        const fetchTermsList = async () => {
            try {
                const response = await fetch('https://api.scenario-studio-test.medicrew.me/terms/list');
                if (response.ok) {
                    const data = await response.json();
                    // 필수 약관만 필터링
                    const requiredTermsIds = data.termsList
                        .filter((term: any) => term.isRequired)
                        .map((term: any) => term.termsId);
                    setActualTermsIds(requiredTermsIds);
                }
            } catch (error) {
                console.error('약관 리스트 조회 오류:', error);
                // 실패 시 빈 배열 사용 (백엔드 개발자에게 확인 필요)
                setActualTermsIds([]);
            }
        };
        
        fetchTermsList();
    }, []);

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            if (loginIdCheckTimerRef.current) {
                clearTimeout(loginIdCheckTimerRef.current);
            }
        };
    }, []);

	/**
	 * 회원가입 폼 제출 핸들러
	 * 
	 * @description
	 * 회원가입 폼 유효성 검사 후 회원가입 API 호출
	 * Phase 2에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
	 * 
	 * @param e - 폼 제출 이벤트
	 * 
	 * @validation (필드별 개별 검증으로 구체적인 메시지 제공)
	 * 1. 아이디 입력 여부 확인 → "아이디를 입력해주세요."
	 * 2. 아이디 중복 확인 결과 확인 → "아이디를 확인해주세요."
	 * 3. 비밀번호 입력 여부 확인 → "비밀번호를 입력해주세요."
	 * 4. 비밀번호 확인 입력 여부 확인 → "비밀번호 확인을 입력해주세요."
	 * 5. 이름 입력 여부 확인 → "이름을 입력해주세요."
	 * 6. 비밀번호 일치 확인 → "비밀번호가 일치하지 않습니다."
	 * 7. 비밀번호 최소 길이 확인 (8자) → "비밀번호는 최소 8자 이상이어야 합니다."
	 * 8. 약관 동의 확인 → "개인정보 처리방침에 동의해주세요."
	 * 
	 * @mock Phase 2-7
	 * - 1초 지연으로 실제 API 시뮬레이션
	 * - mockSignupResponse 반환 ({ userId: 1 })
	 * - 성공 후 로그인 페이지로 이동
	 * 
	 * @api Phase 8
	 * - POST /user/signup
	 * - 실제 DB에 회원 정보 저장
	 * - 성공 후 로그인 페이지로 이동
	 */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

		// ========== 1단계: 유효성 검사 ==========
		
		// 필수 필드 개별 확인 (구체적인 메시지 표시)
		if (!formData.loginId) {
			showAlert('아이디를 입력해주세요.');
			return;
		}

		// 아이디 중복 체크 결과 확인
		if (loginIdError) {
			showAlert('아이디를 확인해주세요.');
			return;
		}

		if (!formData.pw) {
			showAlert('비밀번호를 입력해주세요.');
			return;
		}

		if (!passwordConfirm) {
			showAlert('비밀번호 확인을 입력해주세요.');
			return;
		}

		if (!formData.realName) {
			showAlert('이름을 입력해주세요.');
			return;
		}

		// ========== 2단계: 비밀번호 검증 ==========
		
		// 비밀번호 일치 확인
		if (formData.pw !== passwordConfirm) {
			showAlert('비밀번호가 일치하지 않습니다.');
			return;
		}

		// 비밀번호 최소 길이 확인 (API 요구사항: 최소 8자)
		if (formData.pw.length < 8) {
			showAlert('비밀번호는 최소 8자 이상이어야 합니다.');
			return;
		}

		// ========== 3단계: 약관 동의 확인 ==========
		
		// 필수 약관 동의 여부 확인
		if (!agreeToTerms) {
			showAlert('개인정보 처리방침에 동의해주세요.');
			return;
		}

        // ========== 4단계: 회원가입 API 호출 ==========
        
        // 제출 상태 시작 (버튼 비활성화)
        setIsSubmitting(true);

        try {
            // ========== Phase 8: useUser Hook을 통한 API 호출 ==========
            
            // 전화번호 정리: 빈 문자열이면 필드 제거
            const signupData: SignupRequestDto = {
                loginId: formData.loginId,
                pw: formData.pw,
                realName: formData.realName,
                termsIdList: formData.termsIdList,
                // phoneNumber: 값이 있고 11자리면 포함, 아니면 제외
                ...(formData.phoneNumber?.trim() && { phoneNumber: formData.phoneNumber.trim() }),
                // profileImageUrl: 값이 있으면 포함
                ...(formData.profileImageUrl && { profileImageUrl: formData.profileImageUrl }),
            };
            
            const response = await signup(signupData);
            
            // 회원가입 성공 플래그 설정
            setIsSignupSuccess(true);
            
            // 회원가입 성공 안내 메시지 표시
            showAlert(
                '회원가입이 완료되었습니다.\n\n' +
                '게스트 회원으로 등록되었습니다.\n' +
                '정회원이 되려면 이메일 인증을 완료해주세요.'
            );
            
            // AlertDialog 닫힌 후 로그인 페이지로 이동
            // (closeAlert 함수에서 isSignupSuccess 확인 후 자동 이동)
		} catch (error: any) {
			// 에러 처리
			console.error('회원가입 오류:', error);
			showAlert(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
		} finally {
            // 항상 실행: 제출 상태 초기화
            setIsSubmitting(false);
        }
    };

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 'weak': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'strong': return 'bg-green-500';
            default: return 'bg-gray-200';
        }
    };

    const getStrengthWidth = () => {
        switch (passwordStrength) {
            case 'weak': return 'w-1/3';
            case 'medium': return 'w-2/3';
            case 'strong': return 'w-full';
            default: return 'w-0';
        }
    };

    const getStrengthText = () => {
        switch (passwordStrength) {
            case 'weak': return '약함';
            case 'medium': return '보통';
            case 'strong': return '강함';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
            {/* Signup Card */}
            <div className="w-full max-w-[460px] bg-white rounded-3xl p-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100">
                {/* Header: Logo & Title */}
                <div className="text-center mb-12">
                    <Link to="/" className="inline-block mb-8">
                        <img src={medicrewLogo} alt="Medicrew" className="h-7 w-auto" />
                    </Link>
                    <h1 className="text-2xl font-semibold text-brand-500 mb-2">
                        회원가입
                    </h1>
                    <p className="text-gray-500 text-base">
                        새로운 계정을 만들고, 메디크루를 시작하세요
                    </p>
                </div>

				{/* Form */}
				<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                    {/* 아이디 */}
                    <div>
                        <label htmlFor="loginId" className="block mb-2 text-sm font-semibold text-gray-900">
                            아이디 *
                        </label>
                        <Input
                            type="text"
                            id="loginId"
                            name="loginId"
                            className={`bg-gray-50 focus:bg-white border-transparent focus:border-blue-500 rounded-xl ${loginIdError ? 'border-red-500 focus:border-red-500' : ''}`}
                            placeholder="아이디를 입력해주세요"
                            value={formData.loginId}
                            onChange={handleLoginIdChange}
                            required
                        />
                        {/* 아이디 확인 중 표시 */}
                        {isCheckingLoginId && (
                            <p className="mt-2 text-xs text-gray-500">
                                확인 중...
                            </p>
                        )}
                        {/* 아이디 에러 메시지 */}
                        {loginIdError && !isCheckingLoginId && (
                            <p className="mt-2 text-xs font-medium text-red-600">
                                ✗ {loginIdError}
                            </p>
                        )}
                        {/* 아이디 사용 가능 메시지 */}
                        {!loginIdError && !isCheckingLoginId && formData.loginId && formData.loginId.length >= 3 && (
                            <p className="mt-2 text-xs font-medium text-green-600">
                                ✓ 사용 가능한 아이디입니다.
                            </p>
                        )}
                    </div>

                    {/* 비밀번호 */}
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-900">
                            비밀번호 *
                        </label>
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            className="bg-gray-50 focus:bg-white border-transparent focus:border-blue-500 rounded-xl"
                            placeholder="비밀번호를 입력해주세요"
                            value={formData.pw}
                            onChange={handlePasswordChange}
                            required
                        />
                        {/* 비밀번호 강도 표시 */}
                        {formData.pw && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getStrengthColor()} ${getStrengthWidth()} transition-all duration-300`}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 min-w-[40px]">
                                        {getStrengthText()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    영문자, 숫자 포함 최소 8자 이상 (대소문자, 특수문자 혼용 시 더 강력함)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 비밀번호 확인 */}
                    <div>
                        <label htmlFor="passwordConfirm" className="block mb-2 text-sm font-semibold text-gray-900">
                            비밀번호 확인 *
                        </label>
                        <Input
                            type="password"
                            id="passwordConfirm"
                            name="passwordConfirm"
                            className="bg-gray-50 focus:bg-white border-transparent focus:border-blue-500 rounded-xl"
                            placeholder="비밀번호를 다시 입력해주세요"
                            value={passwordConfirm}
                            onChange={handlePasswordConfirmChange}
                            required
                        />
                        {/* 비밀번호 일치 여부 표시 */}
                        {passwordConfirm && passwordMatch !== null && (
                            <p className={`mt-2 text-xs font-medium ${passwordMatch ? 'text-green-600' : 'text-red-600'}`}>
                                {passwordMatch ? '✓ 비밀번호가 일치합니다' : '✗ 비밀번호가 일치하지 않습니다'}
                            </p>
                        )}
                    </div>

                    {/* 이름 */}
                    <div>
                        <label htmlFor="realName" className="block mb-2 text-sm font-semibold text-gray-900">
                            이름 *
                        </label>
                        <Input
                            type="text"
                            id="realName"
                            name="realName"
                            className="bg-gray-50 focus:bg-white border-transparent focus:border-blue-500 rounded-xl"
                            placeholder="이름을 입력해주세요"
                            value={formData.realName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, realName: e.target.value }))}
                            required
                        />
                    </div>

                    {/* 약관 동의 (기존 체크박스 유지) */}
                    <div className="flex items-start gap-3 mt-2">
                        <input
                            type="checkbox"
                            id="agreeToTerms"
                            name="agreeToTerms"
                            className="mt-1 w-4 h-4 text-brand-500 bg-gray-50 border-gray-300 rounded focus:ring-brand-500 focus:ring-2"
                            checked={agreeToTerms}
                            onChange={handleAgreeToTermsChange}
                            required
                        />
                        <label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-tight">
                            <span className="text-brand-500 font-medium">개인정보 처리방침</span> 및{' '}
                            <span className="text-brand-500 font-medium">개인정보보호법</span>에 동의합니다
                        </label>
                    </div>

                    {/* 회원가입 버튼 */}
                    <Button
                        type="submit"
                        className="w-full mt-4 rounded-full text-lg h-12"
                        variant="primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '처리 중...' : '회원가입'}
                    </Button>
                </form>

                {/* Login Link */}
                <div className="mt-8 text-center text-sm">
                    <span className="text-gray-500">이미 계정이 있으신가요?</span>{' '}
                    <Link to="/login" className="text-brand-500 font-semibold hover:text-brand-700 transition-colors">
                        로그인 하기
                    </Link>
                </div>
            </div>

			{/* Back Link */}
			<div className="w-full max-w-[460px] mt-4">
				<button
					onClick={() => navigate(-1)}
					className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
				>
					<ArrowLeft size={16} />
					<span>이전 화면으로</span>
				</button>
			</div>

			{/* Powered By */}
			<div className="mt-10 flex justify-center items-center gap-2">
				<span className="text-xs text-gray-400">Powered by</span>
				<span className="text-sm font-bold text-gray-500">NEWBASE</span>
			</div>

			{/* AlertDialog - 백색 배경 레이어 팝업 */}
			<AlertDialog
				isOpen={alertState.isOpen}
				onClose={closeAlert}
				message={alertState.message}
			/>
		</div>
	);
}
