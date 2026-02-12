import React, { useState } from 'react';
import { Modal, AlertDialog, Button } from '@/components/shared/ui';
import { Building, User, Phone, Mail, FileText, Globe, Briefcase } from 'lucide-react';
import { useCreateOrganization, useCountries, useOrganizationTypes, useCountryCallingCodes } from '@/hooks/useOrganization';

// 기존 등록 기관 목록 (자동완성용)
const existingOrganizations: string[] = [
    '서울대학교병원',
    '연세대학교병원',
    '삼성서울병원',
    '서울아산병원',
    '강남세브란스병원',
    '분당서울대병원',
    '가톨릭대학교 서울성모병원',
    '고려대학교안암병원',
    '한양대학교병원',
    '경희대학교병원',
    '이화여자대학교의료원',
    '중앙대학교병원',
    '건국대학교병원',
    '인하대학교병원',
    '가천대학교 길병원',
    '순천향대학교 서울병원'
];

interface FormData {
    organizationName: string;
    countryId: number | null;
    organizationTypeId: number | null;
    businessNumber: string;
    contactPerson: string;
    department: string;
    countryCallingCodeId: number | null;
    phone: string;
    email: string;
}

interface FormErrors {
    organizationName?: string;
    countryId?: string;
    organizationTypeId?: string;
    contactPerson?: string;
    countryCallingCodeId?: string;
    phone?: string;
    email?: string;
    [key: string]: string | undefined;
}

interface AddOrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddOrganizationModal({ isOpen, onClose, onSuccess }: AddOrganizationModalProps): React.ReactElement {
    const [formData, setFormData] = useState<FormData>({
        organizationName: '',
        countryId: null,
        organizationTypeId: null,
        businessNumber: '',
        contactPerson: '',
        department: '',
        countryCallingCodeId: null,
        phone: '',
        email: ''
    });

    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string }>({
        isOpen: false,
        message: ''
    });

    // 🌐 Real API Hooks
    const createOrganizationMutation = useCreateOrganization();
    const { data: countriesData } = useCountries();
    const { data: organizationTypesData } = useOrganizationTypes();
    const { data: countryCallingCodesData } = useCountryCallingCodes();

    // API 데이터 변환
    const apiCountries = countriesData?.countryList || [];
    const apiOrganizationTypes = organizationTypesData?.organizationTypeList || [];
    const apiCountryCallingCodes = countryCallingCodesData?.countryCallingCodeList || [];

    // 기관명 입력 처리
    const handleOrganizationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, organizationName: value }));

        if (value.length > 0) {
            const filtered = existingOrganizations.filter(org =>
                org.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
        }
    };

    // 자동완성 선택
    const handleSuggestionClick = (suggestion: string) => {
        setFormData(prev => ({ ...prev, organizationName: suggestion }));
        setShowSuggestions(false);
    };

    // 폼 필드 변경
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // 에러 제거
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // 폼 검증
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.organizationName.trim()) {
            newErrors.organizationName = '기관명은 필수 입력 항목입니다.';
        }

        if (!formData.countryId) {
            newErrors.countryId = '국가는 필수 선택 항목입니다.';
        }

        if (!formData.organizationTypeId) {
            newErrors.organizationTypeId = '기관 유형은 필수 선택 항목입니다.';
        }

        if (!formData.contactPerson.trim()) {
            newErrors.contactPerson = '담당자명은 필수 입력 항목입니다.';
        }

        if (!formData.countryCallingCodeId) {
            newErrors.countryCallingCodeId = '전화번호 코드를 선택해주세요.';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = '연락처는 필수 입력 항목입니다.';
        }

        if (!formData.email.trim()) {
            newErrors.email = '이메일은 필수 입력 항목입니다.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식이 아닙니다.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 폼 제출
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // 🌐 Real API 호출
        try {
            // ✅ Swagger 스펙에 맞춰 데이터 변환
            const requestData = {
                title: formData.organizationName.trim(),
                countryId: formData.countryId!,
                organizationTypeId: formData.organizationTypeId!,
                businessRegistrationNumber: formData.businessNumber.trim() || undefined,
                managerName: formData.contactPerson.trim(),
                department: formData.department.trim() || undefined,
                countryCallingCodeId: formData.countryCallingCodeId!,
                phoneNumber: formData.phone.trim(),
                email: formData.email.trim(),
            };

            const response = await createOrganizationMutation.mutateAsync(requestData);
            
            // 응답이 있으면 성공 (CreateOrganizationResponseDto는 { message: string } 형태)
            if (response && typeof response === 'object') {
                let message = (response as any)?.message || '';
                // "success" 단어 제거 (대소문자 구분 없이)
                if (message) {
                    message = message.replace(/success/gi, '').trim();
                }
                // 빈 메시지이거나 "success"만 있었던 경우 기본 메시지 사용
                if (!message || message.length === 0) {
                    message = '기관 등록이 완료되었습니다.';
                }
                setAlertState({ isOpen: true, message });

                // Reset form
                handleReset();

                // Call success callback
                if (onSuccess) {
                    onSuccess();
                }

                // Close modal after alert
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                throw new Error('서버 응답을 받지 못했습니다.');
            }
        } catch (error: any) {
            const errorMessage = error?.message || error?.data?.message || '기관 등록에 실패했습니다.';
            setAlertState({ isOpen: true, message: errorMessage });
        }
    };

    // 폼 초기화
    const handleReset = () => {
        setFormData({
            organizationName: '',
            countryId: null,
            organizationTypeId: null,
            businessNumber: '',
            contactPerson: '',
            department: '',
            countryCallingCodeId: null,
            phone: '',
            email: ''
        });
        setErrors({});
    };

    // Modal 닫을 때 폼 초기화
    const handleClose = () => {
        handleReset();
        onClose();
    };

    const closeAlert = () => {
        setAlertState({ isOpen: false, message: '' });
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title="기관 등록"
                size="large"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={handleReset}
                        >
                            초기화
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                        >
                            등록하기
                        </Button>
                    </>
                }
            >
                <form 
                    onSubmit={handleSubmit}
                    onKeyDown={(e) => {
                        // 엄격하게: input 필드에서 Enter 키를 누르면 form submit 방지
                        // (Modal 컴포넌트의 Enter 키 핸들러와 충돌 방지)
                        if (e.key === 'Enter') {
                            const target = e.target as HTMLElement;
                            // input, textarea, select 필드에서 Enter를 누르면 form submit 방지
                            if (target instanceof HTMLInputElement || 
                                target instanceof HTMLTextAreaElement ||
                                target instanceof HTMLSelectElement) {
                                e.preventDefault();
                                e.stopPropagation();
                                // Enter 키를 눌러도 form submit이 발생하지 않도록 함
                                // 사용자는 "등록하기" 버튼을 클릭해야 함
                            }
                        }
                    }}
                >
                {/* 기관명 */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Building size={18} />
                        기관명 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            name="organizationName"
                            value={formData.organizationName}
                            onChange={handleOrganizationNameChange}
                            className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 transition-colors ${errors.organizationName
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                            placeholder="기관명을 입력하세요"
                        />
                        {showSuggestions && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredSuggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-900 transition-colors border-b border-gray-100 last:border-b-0"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {errors.organizationName && (
                        <span className="mt-2 text-sm text-red-500 block">{errors.organizationName}</span>
                    )}
                </div>

                {/* 국가 / 기관 유형 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Globe size={18} />
                            국가 <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="countryId"
                            value={formData.countryId || ''}
                            onChange={(e) => {
                                const countryId = Number(e.target.value);
                                setFormData(prev => ({ ...prev, countryId: countryId || null }));
                                // 국가 변경 시 전화번호 코드 자동 선택 (첫 번째 코드 선택)
                                // TODO: 국가와 전화번호 코드 매핑 로직 (백엔드 API 확인 필요)
                                if (countryId && apiCountryCallingCodes.length > 0) {
                                    const defaultCallingCode = apiCountryCallingCodes[0];
                                    if (defaultCallingCode) {
                                        setFormData(prev => ({ ...prev, countryCallingCodeId: defaultCallingCode.countryCallingCodeId }));
                                    }
                                }
                                if (errors.countryId) {
                                    setErrors(prev => ({ ...prev, countryId: '' }));
                                }
                            }}
                            className={`w-full px-4 py-3 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 transition-colors ${errors.countryId
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                        >
                            <option value="">선택하세요</option>
                            {apiCountries.map(country => (
                                <option key={country.countryId} value={country.countryId}>
                                    {country.title}
                                </option>
                            ))}
                        </select>
                        {errors.countryId && (
                            <span className="mt-2 text-sm text-red-500 block">{errors.countryId}</span>
                        )}
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Briefcase size={18} />
                            기관 유형 <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="organizationTypeId"
                            value={formData.organizationTypeId || ''}
                            onChange={(e) => {
                                const organizationTypeId = Number(e.target.value);
                                setFormData(prev => ({ ...prev, organizationTypeId: organizationTypeId || null }));
                                if (errors.organizationTypeId) {
                                    setErrors(prev => ({ ...prev, organizationTypeId: '' }));
                                }
                            }}
                            className={`w-full px-4 py-3 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 transition-colors ${errors.organizationTypeId
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                        >
                            <option value="">선택하세요</option>
                            {apiOrganizationTypes.map(type => (
                                <option key={type.organizationTypeId} value={type.organizationTypeId}>
                                    {type.title}
                                </option>
                            ))}
                        </select>
                        {errors.organizationTypeId && (
                            <span className="mt-2 text-sm text-red-500 block">{errors.organizationTypeId}</span>
                        )}
                    </div>
                </div>

                {/* 사업자등록번호 */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText size={18} />
                        사업자등록번호 <span className="text-sm text-gray-500 font-normal">(선택)</span>
                    </label>
                    <input
                        type="text"
                        name="businessNumber"
                        value={formData.businessNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="000-00-00000"
                    />
                </div>

                {/* 담당자 / 부서 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <User size={18} />
                            담당자명 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 transition-colors ${errors.contactPerson
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                            placeholder="담당자 이름"
                        />
                        {errors.contactPerson && (
                            <span className="mt-2 text-sm text-red-500 block">{errors.contactPerson}</span>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            부서명
                        </label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="부서명"
                        />
                    </div>
                </div>

                {/* 연락처 / 이메일 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Phone size={18} />
                            연락처 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <select
                                name="countryCallingCodeId"
                                value={formData.countryCallingCodeId || ''}
                                onChange={(e) => {
                                    const countryCallingCodeId = Number(e.target.value);
                                    setFormData(prev => ({ ...prev, countryCallingCodeId: countryCallingCodeId || null }));
                                    if (errors.countryCallingCodeId) {
                                        setErrors(prev => ({ ...prev, countryCallingCodeId: '' }));
                                    }
                                }}
                                className={`px-4 py-3 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 transition-colors ${errors.countryCallingCodeId
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                            >
                                <option value="">선택</option>
                                {apiCountryCallingCodes.map(ccc => (
                                    <option key={ccc.countryCallingCodeId} value={ccc.countryCallingCodeId}>
                                        {ccc.code}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`flex-1 px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 transition-colors ${errors.phone
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                placeholder="10-1234-5678"
                            />
                        </div>
                        {(errors.phone || errors.countryCallingCodeId) && (
                            <span className="mt-2 text-sm text-red-500 block">{errors.phone || errors.countryCallingCodeId}</span>
                        )}
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Mail size={18} />
                            이메일 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 transition-colors ${errors.email
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                            placeholder="example@hospital.com"
                        />
                        {errors.email && (
                            <span className="mt-2 text-sm text-red-500 block">{errors.email}</span>
                        )}
                    </div>
                </div>
            </form>
            </Modal>

            <AlertDialog
                isOpen={alertState.isOpen}
                onClose={closeAlert}
                message={alertState.message}
            />
        </>
    );
}
