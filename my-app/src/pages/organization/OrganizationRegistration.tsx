import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, AlertDialog } from '@/components/shared/ui';
import { Building, User, Phone, Mail, FileText, Globe, Briefcase } from 'lucide-react';
import { 
	useCreateOrganization, 
	useOrganizationTypes, 
	useCountries, 
	useCountryCallingCodes 
} from '@/hooks/useOrganization';

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
    isCustomName: boolean;
    countryId: number | null;
    organizationTypeId: number | null;
    businessNumber: string;
    contactPerson: string;
    department: string;
    position: string;
    countryCallingCodeId: number | null;
    phone: string;
    email: string;
}

interface FormErrors {
    organizationName?: string;
    countryId?: string;
    organizationTypeId?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    [key: string]: string | undefined;
}

export default function OrganizationRegistration(): React.ReactElement {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState<FormData>({
        organizationName: '',
        isCustomName: false,
        countryId: null,
        organizationTypeId: null,
        businessNumber: '',
        contactPerson: '',
        department: '',
        position: '',
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
    const { data: organizationTypesData } = useOrganizationTypes();
    const { data: countriesData } = useCountries();
    const { data: countryCallingCodesData } = useCountryCallingCodes();

    // API 데이터 변환
    const organizationTypes = useMemo(() => {
        return organizationTypesData?.organizationTypeList || [];
    }, [organizationTypesData]);

    const countries = useMemo(() => {
        return countriesData?.countryList || [];
    }, [countriesData]);

    const countryCallingCodes = useMemo(() => {
        return countryCallingCodesData?.countryCallingCodeList || [];
    }, [countryCallingCodesData]);

    // 선택된 국가의 전화번호 코드 찾기
    const selectedCountryCallingCode = useMemo(() => {
        if (!formData.countryId || !formData.countryCallingCodeId) {
            // 기본값: 대한민국 (+82)
            return countryCallingCodes.find(ccc => ccc.code === '+82') || countryCallingCodes[0];
        }
        return countryCallingCodes.find(ccc => ccc.countryCallingCodeId === formData.countryCallingCodeId);
    }, [formData.countryId, formData.countryCallingCodeId, countryCallingCodes]);

    const phoneCode = selectedCountryCallingCode?.code || '+82';

    // 기관명 입력 처리
    const handleOrganizationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, organizationName: value }));

        if (value.length > 0 && !formData.isCustomName) {
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
        setFormData(prev => ({ ...prev, organizationName: suggestion, isCustomName: false }));
        setShowSuggestions(false);
    };

    // 직접 입력 토글
    const handleCustomNameToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, isCustomName: e.target.checked }));
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
            newErrors.phone = '전화번호 코드를 선택해주세요.';
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

            try {
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
                    
                    // 성공 후 목록 페이지로 이동
                    setTimeout(() => {
                        navigate('/admin/organizations');
                    }, 1500);
                } else {
                    throw new Error('서버 응답을 받지 못했습니다.');
                }
            } catch (mutationError: any) {
                throw mutationError;
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
            isCustomName: false,
            countryId: null,
            organizationTypeId: null,
            businessNumber: '',
            contactPerson: '',
            department: '',
            position: '',
            countryCallingCodeId: null,
            phone: '',
            email: ''
        });
        setErrors({});
    };

    // AlertDialog 닫기
    const closeAlert = () => {
        setAlertState({ isOpen: false, message: '' });
    };

    return (
        <section className="section-py">
            <PageHeader
                title="기관 등록"
                breadcrumbs={[
                    { label: '기관관리', link: '/admin/organizations' },
                    { label: '기관 등록' }
                ]}
            />

            <div className="container mx-auto px-4 max-w-7xl">
                {/* Loading/Error 상태 표시 */}
                {createOrganizationMutation.isPending && (
                    <div className="max-w-3xl mx-auto mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-700 text-sm">기관을 등록하는 중...</p>
                    </div>
                )}
                {createOrganizationMutation.isError && (
                    <div className="max-w-3xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 text-sm">오류가 발생했습니다: {createOrganizationMutation.error?.message || '알 수 없는 오류'}</p>
                    </div>
                )}

                {/* Registration Form */}
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
                                    disabled={formData.isCustomName}
                                />
                                {showSuggestions && !formData.isCustomName && (
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
                            <div className="mt-3 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="customName"
                                    checked={formData.isCustomName}
                                    onChange={handleCustomNameToggle}
                                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <label htmlFor="customName" className="text-sm text-gray-600 cursor-pointer">
                                    직접 입력
                                </label>
                            </div>
                            {errors.organizationName && (
                                <span className="mt-2 text-sm text-red-500 block">{errors.organizationName}</span>
                            )}
                        </div>

                        {/* 국가 */}
                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Globe size={18} />
                                국가 <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="countryId"
                                value={formData.countryId || ''}
                                onChange={(e) => {
                                    const countryId = Number(e.target.value) || null;
                                    setFormData(prev => ({ ...prev, countryId }));
                                    
                                    // 국가 변경 시 해당 국가의 전화번호 코드 자동 선택
                                    if (countryId && countryCallingCodes.length > 0) {
                                        // TODO: 국가와 전화번호 코드 매핑 로직 (백엔드 API 확인 필요)
                                        // 임시로 첫 번째 코드 선택
                                        const defaultCallingCode = countryCallingCodes[0];
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
                                disabled={countries.length === 0}
                            >
                                <option value="">선택하세요</option>
                                {countries.map(country => (
                                    <option key={country.countryId} value={country.countryId}>
                                        {country.title}
                                    </option>
                                ))}
                            </select>
                            {errors.countryId && (
                                <span className="mt-2 text-sm text-red-500 block">{errors.countryId}</span>
                            )}
                        </div>

                        {/* 기관 유형 */}
                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Briefcase size={18} />
                                기관 유형 <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="organizationTypeId"
                                value={formData.organizationTypeId || ''}
                                onChange={(e) => {
                                    const organizationTypeId = Number(e.target.value) || null;
                                    setFormData(prev => ({ ...prev, organizationTypeId }));
                                    if (errors.organizationTypeId) {
                                        setErrors(prev => ({ ...prev, organizationTypeId: '' }));
                                    }
                                }}
                                className={`w-full px-4 py-3 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 transition-colors ${errors.organizationTypeId
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                disabled={organizationTypes.length === 0}
                            >
                                <option value="">선택하세요</option>
                                {organizationTypes.map(type => (
                                    <option key={type.organizationTypeId} value={type.organizationTypeId}>
                                        {type.title}
                                    </option>
                                ))}
                            </select>
                            {errors.organizationTypeId && (
                                <span className="mt-2 text-sm text-red-500 block">{errors.organizationTypeId}</span>
                            )}
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

                        {/* 담당자명 */}
                        <div className="mb-6">
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
                                placeholder="담당자 이름을 입력하세요"
                            />
                            {errors.contactPerson && (
                                <span className="mt-2 text-sm text-red-500 block">{errors.contactPerson}</span>
                            )}
                        </div>

                        {/* 부서/직위 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">부서</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="부서명"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">직위</label>
                                <input
                                    type="text"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="직위"
                                />
                            </div>
                        </div>

                        {/* 연락처 */}
                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Phone size={18} />
                                연락처 <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <select
                                    name="countryCallingCodeId"
                                    value={formData.countryCallingCodeId || ''}
                                    onChange={(e) => {
                                        const countryCallingCodeId = Number(e.target.value) || null;
                                        setFormData(prev => ({ ...prev, countryCallingCodeId }));
                                        if (errors.phone) {
                                            setErrors(prev => ({ ...prev, phone: '' }));
                                        }
                                    }}
                                    className={`inline-flex items-center px-4 py-3 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 transition-colors ${errors.phone
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    disabled={countryCallingCodes.length === 0}
                                >
                                    <option value="">코드 선택</option>
                                    {countryCallingCodes.map(ccc => (
                                        <option key={ccc.countryCallingCodeId} value={ccc.countryCallingCodeId}>
                                            {ccc.code} ({ccc.title})
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
                            {errors.phone && (
                                <span className="mt-2 text-sm text-red-500 block">{errors.phone}</span>
                            )}
                        </div>

                        {/* 이메일 */}
                        <div className="mb-8">
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

                        {/* 버튼 */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                                disabled={createOrganizationMutation.isPending}
                            >
                                초기화
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={createOrganizationMutation.isPending}
                            >
                                {createOrganizationMutation.isPending ? '등록 중...' : '등록하기'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* AlertDialog: 성공/실패 메시지 표시 */}
            <AlertDialog
                isOpen={alertState.isOpen}
                onClose={closeAlert}
                message={alertState.message}
            />
        </section>
    );
}
