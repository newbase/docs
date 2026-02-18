import React, { useState, useEffect, useMemo } from 'react';
import { Modal, AlertDialog } from '@/components/shared/ui';
import { Building, User, Phone, Mail, FileText, Globe, Briefcase } from 'lucide-react';
import { Organization } from '../../../types/admin';
import { 
	useUpdateOrganization, 
	useOrganizationTypes, 
	useCountries, 
	useCountryCallingCodes,
	useOrganizationDetail
} from '@/hooks/useOrganization';
import type { UpdateOrganizationBodyDto } from '../../../types/api';

interface EditOrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization: Organization | undefined;
    onSave?: (org: Organization) => void; // Optional: API 연동 시 사용하지 않음
    dataSource?: 'mock' | 'real'; // Mock/Real 데이터 소스
}

interface FormData {
    title: string;
    countryId: number | null;
    organizationTypeId: number | null;
    businessRegistrationNumber: string;
    managerName: string;
    department: string;
    countryCallingCodeId: number | null;
    phoneNumber: string;
    email: string;
    isPartner: boolean;
    commissionRate: number;
}

export default function EditOrganizationModal({ 
	isOpen, 
	onClose, 
	organization, 
	onSave,
	dataSource = 'mock'
}: EditOrganizationModalProps): React.ReactElement {
    const [formData, setFormData] = useState<FormData>({
        title: '',
        countryId: null,
        organizationTypeId: null,
        businessRegistrationNumber: '',
        managerName: '',
        department: '',
        countryCallingCodeId: null,
        phoneNumber: '',
        email: '',
        isPartner: false,
        commissionRate: 0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string }>({
        isOpen: false,
        message: ''
    });
    
    // 엄격하게: 원본 데이터 저장 (초기화 시 사용)
    const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);

    // 🌐 Real API Hooks
    const updateOrganizationMutation = useUpdateOrganization();
    const { data: organizationTypesData } = useOrganizationTypes();
    const { data: countriesData } = useCountries();
    const { data: countryCallingCodesData } = useCountryCallingCodes();
    
    // 기관 상세 데이터 가져오기 (수정 화면에서 실제 데이터 표시용)
    const organizationId = organization?.id ? Number(organization.id) : null;
    const { data: organizationDetailData, isLoading: isDetailLoading } = useOrganizationDetail(
        organizationId || 0,
        { enabled: !!organizationId && isOpen }
    );

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

    // 실제 API 상세 데이터를 사용하여 폼 데이터 설정
    useEffect(() => {
        if (organizationDetailData && isOpen) {
            // API 상세 데이터에서 직접 가져오기 (엄격하게 - 모든 필드 명시적 처리)
            const initialData: FormData = {
                title: organizationDetailData.title || '',
                countryId: organizationDetailData.country?.id || null,
                organizationTypeId: organizationDetailData.organizationType?.id || null,
                businessRegistrationNumber: organizationDetailData.businessRegistrationNumber || '',
                managerName: organizationDetailData.managerName || '',
                department: organizationDetailData.department || '', // 엄격하게: API에서 가져온 값 사용
                countryCallingCodeId: organizationDetailData.countryCallingCode?.id || null,
                phoneNumber: organizationDetailData.phoneNumber || '',
                email: organizationDetailData.email || '',
                isPartner: organizationDetailData.isPartner ?? false,
                commissionRate: organizationDetailData.commissionRate ?? 0
            };
            setFormData(initialData);
            // 엄격하게: 원본 데이터 저장 (초기화 시 사용)
            setOriginalFormData(initialData);
        } else if (organization && isOpen && !organizationDetailData) {
            // API 상세 데이터가 아직 로딩 중이거나 없는 경우, 목록 데이터로 임시 표시
            // 주의: 목록 API에는 department 필드가 없으므로 빈 문자열로 설정됨
            const countryId = organization.country 
                ? countries.find(c => c.title === (typeof organization.country === 'string' ? organization.country : (organization.country as any)?.title))?.countryId || null
                : null;
            const organizationTypeId = organization.type
                ? organizationTypes.find(ot => ot.title === organization.type)?.organizationTypeId || null
                : null;
            
            const initialData: FormData = {
                title: organization.name || '',
                countryId,
                organizationTypeId,
                businessRegistrationNumber: organization.businessNumber || '',
                managerName: organization.contactPerson || '',
                department: organization.department || '', // 목록 데이터에서 가져오기 (없으면 빈 문자열)
                countryCallingCodeId: null,
                phoneNumber: organization.phone || '',
                email: organization.email || '',
                isPartner: (organization as any).isPartner ?? false,
                commissionRate: (organization as any).commissionRate ?? 0
            };
            setFormData(initialData);
            // 엄격하게: 원본 데이터 저장 (초기화 시 사용)
            setOriginalFormData(initialData);
        }
    }, [organizationDetailData, organization, isOpen, countries, organizationTypes]);

    // 선택된 국가에 따라 전화번호 코드 자동 설정
    useEffect(() => {
        if (formData.countryId && countryCallingCodes.length > 0) {
            const selectedCountry = countries.find(c => c.countryId === formData.countryId);
            if (selectedCountry) {
                // 국가에 맞는 전화번호 코드 찾기
                const matchingCode = countryCallingCodes.find(ccc => 
                    ccc.title === selectedCountry.title || 
                    ccc.code === '+82' // 기본값
                );
                if (matchingCode && formData.countryCallingCodeId !== matchingCode.countryCallingCodeId) {
                    setFormData(prev => ({ ...prev, countryCallingCodeId: matchingCode.countryCallingCodeId }));
                }
            }
        }
    }, [formData.countryId, countries, countryCallingCodes]);

    // 선택된 국가의 전화번호 코드 찾기
    const selectedCountryCallingCode = useMemo(() => {
        if (!formData.countryCallingCodeId) {
            return countryCallingCodes.find(ccc => ccc.code === '+82') || countryCallingCodes[0];
        }
        return countryCallingCodes.find(ccc => ccc.countryCallingCodeId === formData.countryCallingCodeId);
    }, [formData.countryCallingCodeId, countryCallingCodes]);

    const phoneCode = selectedCountryCallingCode?.code || '+82';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // 에러 제거
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // 폼 검증
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = '기관명은 필수 입력 항목입니다.';
        }

        if (!formData.countryId) {
            newErrors.countryId = '국가는 필수 선택 항목입니다.';
        }

        if (!formData.organizationTypeId) {
            newErrors.organizationTypeId = '기관 유형은 필수 선택 항목입니다.';
        }

        if (!formData.managerName.trim()) {
            newErrors.managerName = '담당자명은 필수 입력 항목입니다.';
        }

        if (!formData.countryCallingCodeId) {
            newErrors.phoneNumber = '전화번호 코드를 선택해주세요.';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = '연락처는 필수 입력 항목입니다.';
        }

        if (!formData.email.trim()) {
            newErrors.email = '이메일은 필수 입력 항목입니다.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식이 아닙니다.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!organization) return;

        if (!validateForm()) {
            return;
        }

        // 🌐 Real API 모드
        try {
            const organizationId = Number(organization.id);
            if (!organizationId) {
                setAlertState({ isOpen: true, message: '기관 ID가 유효하지 않습니다.' });
                return;
            }

            // ✅ Swagger 스펙에 맞춰 데이터 변환
            const requestData: UpdateOrganizationBodyDto = {
                title: formData.title.trim(),
                countryId: formData.countryId!,
                organizationTypeId: formData.organizationTypeId!,
                businessRegistrationNumber: formData.businessRegistrationNumber.trim() || undefined,
                managerName: formData.managerName.trim(),
                department: formData.department.trim() || undefined,
                countryCallingCodeId: formData.countryCallingCodeId!,
                phoneNumber: formData.phoneNumber.trim() || undefined,
                email: formData.email.trim() || undefined,
                isPartner: formData.isPartner,
                commissionRate: formData.isPartner && formData.commissionRate > 0 ? formData.commissionRate : undefined,
            };

            await updateOrganizationMutation.mutateAsync({
                organizationId,
                data: requestData
            });

            setAlertState({ isOpen: true, message: '기관 정보가 수정되었습니다.' });
            
            // 성공 후 모달 닫기
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error: any) {
            const errorMessage = error?.message || '기관 정보 수정에 실패했습니다.';
            setAlertState({ isOpen: true, message: errorMessage });
        }
    };

    // 폼 초기화: 엄격하게 - 원본 저장된 데이터로 복원 (사용자가 수정한 부분만 초기화)
    const handleReset = () => {
        if (originalFormData) {
            // 원본 데이터로 복원 (기존 저장된 데이터 유지)
            setFormData(originalFormData);
        } else if (organizationDetailData) {
            // originalFormData가 없으면 organizationDetailData에서 직접 가져오기
            const resetData: FormData = {
                title: organizationDetailData.title || '',
                countryId: organizationDetailData.country?.id || null,
                organizationTypeId: organizationDetailData.organizationType?.id || null,
                businessRegistrationNumber: organizationDetailData.businessRegistrationNumber || '',
                managerName: organizationDetailData.managerName || '',
                department: organizationDetailData.department || '',
                countryCallingCodeId: organizationDetailData.countryCallingCode?.id || null,
                phoneNumber: organizationDetailData.phoneNumber || '',
                email: organizationDetailData.email || '',
                isPartner: organizationDetailData.isPartner ?? false,
                commissionRate: organizationDetailData.commissionRate ?? 0
            };
            setFormData(resetData);
        } else if (organization) {
            // organizationDetailData도 없으면 organization prop에서 가져오기
            const orgAny = organization as any;
            const countryId = organization.country 
                ? countries.find(c => c.title === (typeof organization.country === 'string' ? organization.country : (organization.country as any)?.title))?.countryId || null
                : null;
            const organizationTypeId = organization.type
                ? organizationTypes.find(ot => ot.title === organization.type)?.organizationTypeId || null
                : null;
            
            const resetData: FormData = {
                title: organization.name || '',
                countryId,
                organizationTypeId,
                businessRegistrationNumber: organization.businessNumber || '',
                managerName: organization.contactPerson || '',
                department: organization.department || '',
                countryCallingCodeId: orgAny.countryCallingCode?.id || null,
                phoneNumber: organization.phone || '',
                email: organization.email || '',
                isPartner: (organization as any).isPartner ?? false,
                commissionRate: (organization as any).commissionRate ?? 0
            };
            setFormData(resetData);
        }
        setErrors({});
    };

    // Modal 닫을 때 폼 초기화
    const handleClose = () => {
        setErrors({});
        onClose();
    };

    // AlertDialog 닫기
    const closeAlert = () => {
        setAlertState({ isOpen: false, message: '' });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="기관 정보 수정"
            size="large"
            footer={
                <>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                    >
                        초기화
                    </button>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                    >
                        닫기
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={updateOrganizationMutation.isPending}
                    >
                        {updateOrganizationMutation.isPending ? '저장 중...' : '저장하기'}
                    </button>
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
                            // 사용자는 "저장하기" 버튼을 클릭해야 함
                        }
                    }
                }}
            >
                {/* 로딩 상태 표시 */}
                {isDetailLoading && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">기관 정보를 불러오는 중...</p>
                    </div>
                )}
                
                {/* 기관명 */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Building size={18} />
                        기관명 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, title: e.target.value }));
                            if (errors.title) {
                                setErrors(prev => ({ ...prev, title: '' }));
                            }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 transition-colors ${errors.title
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                        placeholder="기관명을 입력하세요"
                    />
                    {errors.title && (
                        <span className="mt-2 text-sm text-red-500 block">{errors.title}</span>
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
                                const countryId = Number(e.target.value) || null;
                                setFormData(prev => ({ ...prev, countryId }));
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
                    <div>
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
                </div>

                {/* 사업자등록번호 */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText size={18} />
                        사업자등록번호 <span className="text-sm text-gray-500 font-normal">(선택)</span>
                    </label>
                    <input
                        type="text"
                        name="businessRegistrationNumber"
                        value={formData.businessRegistrationNumber}
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
                            name="managerName"
                            value={formData.managerName}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, managerName: e.target.value }));
                                if (errors.managerName) {
                                    setErrors(prev => ({ ...prev, managerName: '' }));
                                }
                            }}
                            className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 transition-colors ${errors.managerName
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                            placeholder="담당자 이름"
                        />
                        {errors.managerName && (
                            <span className="mt-2 text-sm text-red-500 block">{errors.managerName}</span>
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
                            <span className="inline-flex items-center px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium whitespace-nowrap">
                                {phoneCode}
                            </span>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, phoneNumber: e.target.value }));
                                    if (errors.phoneNumber) {
                                        setErrors(prev => ({ ...prev, phoneNumber: '' }));
                                    }
                                }}
                                className={`flex-1 px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 transition-colors ${errors.phoneNumber
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                placeholder="10-1234-5678"
                            />
                        </div>
                        {errors.phoneNumber && (
                            <span className="mt-2 text-sm text-red-500 block">{errors.phoneNumber}</span>
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

                {/* 제휴기관 여부 */}
                <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isPartner}
                                onChange={(e) => setFormData(prev => ({ ...prev, isPartner: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">제휴기관</span>
                        </label>
                        {formData.isPartner && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">수수료율</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    value={formData.commissionRate || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        commissionRate: parseFloat(e.target.value) || 0
                                    }))}
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0"
                                />
                                <span className="text-sm text-gray-500">%</span>
                            </div>
                        )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">체크 시 해당 기관이 제휴기관으로 등록됩니다.</p>
                </div>
            </form>

            {/* AlertDialog: 성공/실패 메시지 표시 */}
            <AlertDialog
                isOpen={alertState.isOpen}
                onClose={closeAlert}
                message={alertState.message}
            />
        </Modal>
    );
}

