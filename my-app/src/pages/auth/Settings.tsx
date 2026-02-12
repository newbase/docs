/**
 * 설정 페이지 (프로필 관리)
 * 
 * @description
 * 사용자가 프로필 정보를 조회하고 수정할 수 있는 페이지
 * Phase 4에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
 * 
 * @phase Phase 4
 * 
 * @features
 * - 프로필 정보 조회 (기존 AuthContext의 user 데이터 사용)
 * - 프로필 수정 (이름, 프로필 이미지)
 * - 프로필 이미지 변경 (직접 선택 + 추천 아바타)
 * - 이메일 인증/변경 링크 (Phase 5, 6에서 기능 구현)
 * - 언어 선택
 * - 계정 삭제 링크 (Phase 7에서 기능 구현)
 * 
 * @data-source
 * - 프로필 조회: AuthContext의 user 데이터 사용 (기존 데이터 소스 우선 사용 규칙)
 * - 프로필 수정: Mock API 호출 (mockUpdateProfileResponse)
 * 
 * @mock Phase 4-7
 * - mockUpdateProfileResponse 사용 (1초 지연)
 * - 프로필 이미지 업로드 Mock (1초 지연)
 * 
 * @api Phase 8
 * - GET /user/profile (프로필 조회)
 * - PATCH /user/profile (프로필 수정)
 * 
 * @routes
 * - /settings (현재 페이지)
 * - /verify-email (이메일 인증)
 * - /email-change (이메일 변경)
 * - /account-deletion/request (회원 탈퇴)
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronRight, Pencil, User as UserIcon, X, Check, Phone, Trash2, Building } from 'lucide-react';
import { Button, Input, AlertDialog, PageHeader } from '@/components/shared/ui';
import { useUser } from '@/data/queries/useUser';
import type { UpdateUserProfileRequestDto } from '@/types/user';
import { convertRoleNumberToString, getRoleLabel, getLicenseBadgeClasses } from '@/utils/roleUtils';
// Import avatars
import avatar1 from '../../assets/img/avatars/avatar_1.png';
import avatar2 from '../../assets/img/avatars/avatar_2.png';
import avatar3 from '../../assets/img/avatars/avatar_3.png';
import avatar4 from '../../assets/img/avatars/avatar_4.png';
import avatar5 from '../../assets/img/avatars/avatar_5.png';

const PRESET_AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5];

export default function Settings(): React.ReactElement {
	// ========== API Hooks ==========
	/**
	 * User API Custom Hook
	 * Phase 8에서 실제 API 호출에 사용
	 */
	const { updateProfile: updateProfileApi, getProfile } = useUser();
	
	// ========== Hooks ==========
	
    const { user, getCurrentRole, updateUserProfile } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

	// ========== State 관리 ==========
	
	/**
	 * 사용자 이름
	 * @description 실제 API로 조회한 프로필 데이터 사용
	 */
    const [name, setName] = useState(user?.name || '');
	
	/**
	 * 사용자 이메일
	 * @description 실제 API로 조회한 이메일 (인증 여부 확인용)
	 */
	const [email, setEmail] = useState<string | null>(null);
	
	/**
	 * 휴대폰번호
	 */
	const [phoneNumber, setPhoneNumber] = useState<string>(() => {
		return localStorage.getItem('userPhoneNumber') || '';
	});
	
	/**
	 * 소속기관
	 */
	const [organization, setOrganization] = useState<string>(() => {
		return localStorage.getItem('userOrganization') || '';
	});

	/**
	 * 직책
	 */
	const [position, setPosition] = useState<string>(() => {
		return localStorage.getItem('userPosition') || '';
	});
	
	/**
	 * 직무
	 */
	const [jobRole, setJobRole] = useState<string>(() => {
		return localStorage.getItem('userJobRole') || '';
	});
	
	/**
	 * 직무 직접입력
	 */
	const [customJobRole, setCustomJobRole] = useState<string>(() => {
		return localStorage.getItem('userCustomJobRole') || '';
	});
	
	/**
	 * 프로필 로딩 중 상태
	 */
	const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
	
	/**
	 * 언어 설정
	 * @description localStorage에 저장/로드 (백엔드 API 없음)
	 */
    const [language, setLanguage] = useState(() => {
		return localStorage.getItem('userLanguage') || 'English';
	});
	
	/**
	 * 프로필 이미지 (선택된 이미지의 Data URL 또는 아바타 경로)
	 */
    const [profileImage, setProfileImage] = useState<string | null>(null);
	
	/**
	 * 초기 프로필 이미지 (변경 감지용)
	 */
	const [initialProfileImage, setInitialProfileImage] = useState<string | null>(null);
	
	/**
	 * 선택된 추천 아바타 인덱스
	 */
    const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number | null>(null);
	
	/**
	 * 프로필 수정 진행 중 상태
	 * @description 프로필 수정 API 호출 중 버튼 비활성화
	 */
	const [isLoading, setIsLoading] = useState<boolean>(false);
	
	/**
	 * AlertDialog 상태
	 * @field isOpen - 팝업 열림 여부
	 * @field message - 표시할 메시지
	 * @field shouldNavigate - 닫을 때 이전 화면으로 이동할지 여부
	 */
	const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string; shouldNavigate?: boolean }>({
		isOpen: false,
		message: '',
		shouldNavigate: false,
	});

	// ========== 계산된 값 ==========
	
    const userRole = getCurrentRole();
    /**
     * 게스트 회원 여부
     * @description 이메일이 null이면 게스트 (이메일 인증 전)
     */
    const isGuest = email === null;

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
	 * @description shouldNavigate가 true이면 이전 화면으로 이동
	 */
	const closeAlert = useCallback(() => {
		const shouldNavigate = alertState.shouldNavigate;
		setAlertState({ isOpen: false, message: '', shouldNavigate: false });
		if (shouldNavigate) {
			navigate(-1);
		}
	}, [alertState.shouldNavigate, navigate]);

	// ========== 프로필 조회 (페이지 로드 시) ==========
	
	/**
	 * 실제 프로필 데이터 조회
	 * @description Phase 8에서 추가 - GET /user/profile API 호출하여 실제 데이터 사용
	 * @note 의존성 배열을 빈 배열로 설정하여 컴포넌트 마운트 시 한 번만 실행
	 */
	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setIsProfileLoading(true);
				const profile = await getProfile();
				
		// 실제 API 데이터로 state 업데이트
		setName(profile.realName);
		setEmail(profile.email);
		
		// 초기 프로필 이미지 저장 (변경 감지용)
		// 빈 문자열도 null로 처리
		if (profile.profileImageUrl && profile.profileImageUrl.trim() !== '') {
			setProfileImage(profile.profileImageUrl);
			setInitialProfileImage(profile.profileImageUrl);
		} else {
			setProfileImage(null);
			setInitialProfileImage(null);
		}
		
	// ========== AuthContext 업데이트 (최초 로드 시 동기화) ==========
	// 백엔드 role 숫자를 프론트엔드 role 문자열로 변환
	const userRole = convertRoleNumberToString(profile.role);
	
	// License 설정 (임시: role에 따라 자동 할당, 추후 백엔드에서 제공 시 수정)
	let userLicense = 'pro_univ_student'; // 기본값
	if (userRole === 'guest') {
		userLicense = 'guest';
	} else if (userRole === 'master') {
		userLicense = 'pro_univ_master';
	}
	
	updateUserProfile({
		name: profile.realName,
		email: profile.email || undefined,
		profileImageUrl: profile.profileImageUrl,
		role: userRole,
		license: userLicense,
	});
			} catch (error: any) {
				console.error('프로필 조회 오류:', error);
				// 프로필 조회 실패 시 기본값 사용
				setName('');
				setEmail(null);
			} finally {
				setIsProfileLoading(false);
			}
		};
		
		fetchProfile();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ========== 프로필 수정 처리 ==========
	
	/**
	 * 프로필 수정 핸들러
	 * 
	 * @description
	 * 사용자가 입력한 이름과 프로필 이미지를 수정하는 함수
	 * Phase 4에서는 Mock 데이터 사용, Phase 8에서 실제 API 호출
	 * 
	 * @validation
	 * 1. 이름 입력 여부 확인 → "이름을 입력해주세요."
	 * 
	 * @mock Phase 4-7
	 * - mockUpdateProfileResponse 반환 ({ message })
	 * - 1초 지연으로 실제 API 시뮬레이션
	 * - 프로필 이미지 업로드 Mock (1초 지연)
	 * - 성공 후 AlertDialog 표시
	 * 
	 * @api Phase 8
	 * - PATCH /user/profile
	 * - 실제 프로필 수정 처리
	 * - 성공 후 프로필 정보 갱신
	 */
    const handleConfirm = async () => {
		// ========== 1단계: 유효성 검사 ==========
		
		// 이름 입력 여부 확인
		if (!name || name.trim() === '') {
			showAlert('이름을 입력해주세요.');
			return;
		}

		// ========== 2단계: 프로필 수정 API 호출 ==========
		
		setIsLoading(true);

		try {
			// ========== Phase 8: useUser Hook을 통한 API 호출 ==========
			
			// 프로필 이미지 처리
			let profileImageUrl: string | undefined = undefined;
			
			if (profileImage && profileImage !== initialProfileImage) {
				// 아바타 이미지는 이미 프론트엔드에서 서빙되는 실제 URL
				// 예: /static/media/avatar_1.abc123.png
				// Data URL (직접 업로드)인 경우만 체크
				if (profileImage.startsWith('data:')) {
					showAlert(
						'직접 이미지 업로드 기능은 현재 개발 중입니다.\n' +
						'백엔드 작업 완료 후 사용 가능합니다.\n\n' +
						'추천 아바타는 선택 가능합니다.'
					);
					setIsLoading(false);
					return;
				}
				
				// 아바타 또는 기타 URL은 그대로 전송
				profileImageUrl = profileImage;
			}

			// 프로필 수정 요청 데이터
			const updateData: UpdateUserProfileRequestDto = {
				realName: name.trim(),
				...(profileImageUrl && { profileImageUrl }),
			};

		// useUser Hook을 통한 API 호출
		const response = await updateProfileApi(updateData);

		// 성공 메시지 표시 (닫을 때 이전 화면으로 이동)
		setAlertState({ isOpen: true, message: '프로필이 수정되었습니다.', shouldNavigate: true });
		
		// 프로필 데이터 다시 조회하여 변경사항 반영
		try {
			const updatedProfile = await getProfile();
			setName(updatedProfile.realName);
			setEmail(updatedProfile.email);
			
			// 프로필 이미지 업데이트 (빈 문자열도 null로 처리)
			if (updatedProfile.profileImageUrl && updatedProfile.profileImageUrl.trim() !== '') {
				setProfileImage(updatedProfile.profileImageUrl);
				setInitialProfileImage(updatedProfile.profileImageUrl);
			} else {
				setProfileImage(null);
				setInitialProfileImage(null);
			}
			
	// ========== AuthContext 업데이트 (헤더 사용자 메뉴 동기화) ==========
	// 백엔드 role 숫자를 프론트엔드 role 문자열로 변환
	const updatedRole = convertRoleNumberToString(updatedProfile.role);
	
	// License 설정 (임시: role에 따라 자동 할당, 추후 백엔드에서 제공 시 수정)
	let updatedLicense = 'pro_univ_student'; // 기본값
	if (updatedRole === 'guest') {
		updatedLicense = 'guest';
	} else if (updatedRole === 'master') {
		updatedLicense = 'pro_univ_master';
	}
	
	updateUserProfile({
		name: updatedProfile.realName,
		email: updatedProfile.email || undefined,
		profileImageUrl: updatedProfile.profileImageUrl,
		role: updatedRole,
		license: updatedLicense,
	});
		} catch (refetchError) {
			console.error('프로필 재조회 오류:', refetchError);
			// 재조회 실패해도 수정은 성공했으므로 무시
		}
		} catch (error: any) {
			console.error('프로필 수정 오류:', error);
			showAlert('프로필 수정 중 오류가 발생했습니다.');
		} finally {
			// 항상 실행: 로딩 상태 종료
			setIsLoading(false);
		}
    };

	/**
	 * 취소 버튼 핸들러
	 * @description 이전 페이지로 이동
	 */
    const handleCancel = () => {
        navigate(-1);
    };

	/**
	 * 이메일 인증 버튼 핸들러
	 * @description 이메일 인증 페이지로 이동 (Phase 5에서 기능 구현)
	 */
    const handleVerifyEmail = () => {
        navigate('/verify-email');
    };

	/**
	 * 이메일 변경 버튼 핸들러
	 * @description 이메일 변경 기능은 현재 구현되지 않음 (Mock UI만 존재)
	 * @note User Management Phase 범위 외 기능 - 별도 개발 필요
	 */
    const handleEmailChange = () => {
        showAlert('이메일 변경 기능은 현재 준비 중입니다.\n추후 제공될 예정입니다.');
    };

	/**
	 * 추천 아바타 선택 핸들러
	 * @param index - 선택한 아바타 인덱스
	 * @description 추천 아바타 중 하나를 선택하면 프로필 이미지로 설정
	 * @note 실제 import된 이미지 URL을 그대로 사용 (백엔드에 파일 배치 불필요)
	 */
    const handleAvatarSelect = (index: number) => {
        // 실제 import된 이미지 URL을 그대로 저장
        // 예: /static/media/avatar_1.abc123.png
        setProfileImage(PRESET_AVATARS[index]);
        setSelectedAvatarIndex(index);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

	/**
	 * 이미지 선택 버튼 핸들러
	 * @description 파일 선택 input을 트리거하여 이미지 파일 선택 대화상자 열기
	 */
    const handleImageSelect = () => {
        fileInputRef.current?.click();
    };

	/**
	 * 이미지 파일 변경 핸들러
	 * @param e - 파일 input 변경 이벤트
	 * @description 선택한 이미지 파일을 Data URL로 변환하여 미리보기 표시
	 */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
                setSelectedAvatarIndex(null); // Clear preset selection when file is chosen
            };
            reader.readAsDataURL(file);
        }
    };

	/**
	 * 이미지 리셋 핸들러
	 * @description 선택한 프로필 이미지를 초기화
	 */
    const handleImageReset = () => {
        setProfileImage(null);
        setSelectedAvatarIndex(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

	/**
	 * 계정 삭제 버튼 핸들러
	 * @description 회원 탈퇴 페이지로 이동 (Phase 7에서 기능 구현)
	 */
    const handleDeleteAccount = () => {
        navigate('/account-deletion/request');
    };

    return (
        <>
            {/* 프로필 로딩 중 */}
            {isProfileLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                    <p className="text-gray-500">프로필 정보를 불러오는 중...</p>
                </div>
            ) : (
            <div className="max-w-xl mx-auto px-4 py-8">
                {/* 페이지 타이틀 */}
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">설정</h1>
                
                <div className="bg-white rounded-xl border border-gray-400 p-8">
                    {/* 소속기관 및 권한/라이선스 정보 */}
                    {user?.currentAccount && (
                        <div className="flex items-center justify-between pb-6 mb-6">
                            <div className="flex items-center gap-2">
                                <Building size={20} className="text-gray-500" />
                                <span className="text-lg font-semibold text-gray-700">{user.currentAccount.organizationName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-1 text-semibold border border-blue-500 text-blue-500 rounded-lg">
                                    <span className="text-base font-semibold text-blue-700">{getRoleLabel(user.currentAccount.role)}</span>
                                </div>
                                <div className="px-4 py-1 text-semibold border border-green-500 text-green-500 rounded-lg">
                                    {getLicenseBadgeClasses(user.currentAccount.license).label}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 기본 정보 섹션 */}
                    <div className="space-y-6">
                    {/* Name Field */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                            이름 <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border-gray-200 rounded-xl text-gray-900"
                            placeholder="이름을 입력해주세요"
                        />
                    </div>

                    {/* ID Field (Read-only) */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                            아이디
                        </label>
                        <div className="w-full px-5 py-2.5 bg-gray-50 rounded-2xl">
                            <span className="text-gray-900 font-medium text-base">{user?.id || '-'}</span>
                        </div>
                    </div>

                    {/* Email Field (Conditional) */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                            이메일
                        </label>
                        {isGuest ? (
                            <button
                                onClick={handleVerifyEmail}
                                className="w-full flex items-center justify-between px-5 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group"
                            >
                                <span className="text-gray-900 font-medium text-base">정회원 인증하기</span>
                                <div className="p-1.5 bg-gray-200 rounded-lg group-hover:bg-gray-300 transition-colors">
                                    <ChevronRight size={18} className="text-gray-600" />
                                </div>
                            </button>
                        ) : (
                            <div className="w-full flex items-center justify-between px-5 py-2.5 bg-gray-50 rounded-2xl">
                                <span className="text-gray-900 font-medium text-base">{email || '이메일 없음'}</span>
                                <button
                                    onClick={handleEmailChange}
                                    className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                >
                                    <Pencil size={18} className="text-gray-600" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 휴대폰번호 */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                            휴대폰번호
                        </label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
                            <Input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setPhoneNumber(value);
                                    localStorage.setItem('userPhoneNumber', value);
                                }}
                                placeholder="010-0000-0000"
                                className="pl-11 border-gray-200 rounded-xl text-gray-900"
                            />
                        </div>
                    </div>

                    {/* 소속기관 */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                            소속기관
                        </label>
                        <Input
                            type="text"
                            value={organization}
                            onChange={(e) => {
                                const value = e.target.value;
                                setOrganization(value);
                                localStorage.setItem('userOrganization', value);
                            }}
                            placeholder="소속 기관명을 입력해주세요"
                            className="border-gray-200 rounded-xl text-gray-900"
                        />
                    </div>

                    {/* 직책 */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                            직책
                        </label>
                        <Input
                            type="text"
                            value={position}
                            onChange={(e) => {
                                const value = e.target.value;
                                setPosition(value);
                                localStorage.setItem('userPosition', value);
                            }}
                            placeholder="예: 수간호사, 팀장 등"
                            className="border-gray-200 rounded-xl text-gray-900"
                        />
                    </div>

                    {/* 직무 */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                            직무
                        </label>
                        <select
                            value={jobRole}
                            onChange={(e) => {
                                const value = e.target.value;
                                setJobRole(value);
                                localStorage.setItem('userJobRole', value);
                                if (value !== '직접입력') {
                                    setCustomJobRole('');
                                    localStorage.setItem('userCustomJobRole', '');
                                }
                            }}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all appearance-none cursor-pointer text-gray-900"
                        >
                            <option value="">선택하세요</option>
                            <option value="의사">의사</option>
                            <option value="간호사">간호사</option>
                            <option value="간호조무사">간호조무사</option>
                            <option value="응급구조사">응급구조사</option>
                            <option value="교육자">교육자</option>
                            <option value="학생">학생</option>
                            <option value="연구원">연구원</option>
                            <option value="직접입력">직접입력</option>
                        </select>
                    </div>

                    {/* 직무 직접입력 */}
                    {jobRole === '직접입력' && (
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">
                                직무 입력
                            </label>
                            <Input
                                type="text"
                                value={customJobRole}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setCustomJobRole(value);
                                    localStorage.setItem('userCustomJobRole', value);
                                }}
                                placeholder="직무를 입력하세요"
                                className="border-gray-200 rounded-xl text-gray-900"
                            />
                        </div>
                    )}

                    {/* Language Field */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-900">
                            언어
                        </label>
                        <div className="relative">
                            <select
                                value={language}
                                onChange={(e) => {
									const newLanguage = e.target.value;
									setLanguage(newLanguage);
									localStorage.setItem('userLanguage', newLanguage);
									showAlert('언어 설정이 변경되었습니다.');
								}}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all appearance-none cursor-pointer"
                            >
                                <option>English</option>
                                <option>한국어</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronRight size={18} className="text-gray-400 rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* Profile Image Field */}
                    <div>
                        <label className="block mb-3 text-sm font-medium text-gray-900">
                            프로필 이미지
                        </label>
                        <div className="flex items-start gap-4">
                            <div className="relative group">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 cursor-pointer">
                                    {profileImage && profileImage.trim() !== '' ? (
                                        <img 
                                            src={profileImage} 
                                            alt="프로필" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const parent = e.currentTarget.parentElement;
                                                if (parent) {
                                                    const icon = document.createElement('div');
                                                    icon.innerHTML = '<svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                                                    parent.appendChild(icon);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <UserIcon size={40} className="text-gray-300" />
                                    )}
                                    
                                    {/* Hover Overlay */}
                                    <div 
                                        onClick={handleImageSelect}
                                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Pencil size={20} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex gap-2">
                                    {PRESET_AVATARS.map((avatar, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAvatarSelect(index)}
                                            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                                                selectedAvatarIndex === index
                                                    ? 'border-brand-500 ring-2 ring-brand-100'
                                                    : 'border-transparent hover:border-gray-200'
                                            }`}
                                        >
                                            <img
                                                src={avatar}
                                                alt={`Avatar ${index + 1}`}
                                                className="w-full h-full object-cover origin-top scale-[1.8]"
                                            />
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                    {/* 버튼 */}
                    <div className="flex gap-3 mt-12">
                        <Button
                            onClick={handleConfirm}
                            variant="lightdark"
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {isLoading ? '저장 중...' : '저장'}
                        </Button>
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="flex-1"
                            disabled={isLoading}
                        >
                            취소
                        </Button>
                    </div>
                </div>

                {/* 계정 삭제 */}
                <div className="mt-4 flex justify-end">
                    <Button
                        onClick={handleDeleteAccount}
                        variant="ghost"
                        className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        계정 삭제
                    </Button>
                </div>
            </div>
            )}

            <AlertDialog
                isOpen={alertState.isOpen}
                onClose={closeAlert}
                message={alertState.message}
            />
        </>
    );
}
