import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Input, SimpleSelect, ComboBox } from '@/components/shared/ui';
import { CenteredPageLayout } from '@/components/shared/layout';
import CurriculumCreate from '../class/CurriculumCreate';
import { ToggleLabel } from '@/components/shared/ui/Toggle';
import { CurriculumItem, VideoLecture } from '../../types/curriculum';
import { scenarioDetails, ScenarioDetail } from '../../data/scenarioDetails';
import { ClassItem } from '../../data/classes';
import { courseService } from '../../services/courseService';
import { CreateCourseRequestDto } from '../../types/api/course';
import { organizationService } from '../../services/organizationService';
import { useAuth } from '../../contexts/AuthContext';
import { useClasses } from '../../data/queries/useClasses';
import { useCountries } from '../../hooks/useOrganization';
import { isFeatureEnabled } from '../../config/featureFlags';
import { countryTypes } from '../../data/organizations';
import AddOrganizationModal from '../organization/modals/AddOrganizationModal';

interface CompletionRequirement {
    minScenarios: number;
    minPassingScore: number;
    requireAllScenarios: boolean;
}

interface OrganizationOption {
    id: number;
    title: string;
}

export default function ProductCreate(): React.ReactElement {
    const navigate = useNavigate();
    const { getLicenseInfo, getCurrentRole, user } = useAuth();
    const licenseInfo = getLicenseInfo();
    const isAdmin = getCurrentRole() === 'admin';
    const organizationId = user?.currentAccount?.organizationId;
    const { classes } = useClasses(organizationId);
    const { data: countriesData } = useCountries();

    const PRODUCT_TYPE_OPTIONS = ['콘텐츠', '상품', '서비스'];

    // Form state
    const [productType, setProductType] = useState<string>('');
    const [className, setClassName] = useState('');
    const [description, setDescription] = useState('');
    const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 콘텐츠 전용: OpenClassCreate 스타일
    const [partnerOrganization, setPartnerOrganization] = useState('');
    const [salesType, setSalesType] = useState<'online' | 'agency'>('agency');
    const [organizationName, setOrganizationName] = useState('뉴베이스');
    const [completionRequirements, setCompletionRequirements] = useState<CompletionRequirement>({
        minScenarios: 1,
        minPassingScore: 70,
        requireAllScenarios: false
    });
    const [thumbnailMode, setThumbnailMode] = useState<'custom' | 'scenario'>('custom');
    const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
    const [selectedScenarioThumbnail, setSelectedScenarioThumbnail] = useState<string | null>(null);
    const [organizationOptions, setOrganizationOptions] = useState<OrganizationOption[]>([]);
    // 공개
    const [validityPeriodValue, setValidityPeriodValue] = useState<number>(30);
    const [validityPeriodUnit, setValidityPeriodUnit] = useState<'days' | 'months'>('days');
    const [priceKrw, setPriceKrw] = useState<number>(0);
    const [priceUsd, setPriceUsd] = useState<number>(0);
    const [affiliateSellerName, setAffiliateSellerName] = useState('');
    const [affiliateCommissionRate, setAffiliateCommissionRate] = useState<number>(0);
    const [discountPrice, setDiscountPrice] = useState<number>(0);
    const [discountPriceUsd, setDiscountPriceUsd] = useState<number>(0);
    const [discountType, setDiscountType] = useState<'none' | 'event' | 'hospital_association'>('none');
    const [discountCondition, setDiscountCondition] = useState('');
    const [publicCountries, setPublicCountries] = useState<string[]>([]);
    const [publicCountryInput, setPublicCountryInput] = useState('');
    const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
    // 비공개
    const [licenseType, setLicenseType] = useState<'device' | 'user'>('device');
    const [premiumScenarioCreate, setPremiumScenarioCreate] = useState<boolean>(false);
    const [premiumScenarioEdit, setPremiumScenarioEdit] = useState<boolean>(false);
    const [premiumAiChat, setPremiumAiChat] = useState<boolean>(false);
    const [licenseQuantity, setLicenseQuantity] = useState<number>(1);
    const [orderNotes, setOrderNotes] = useState('');
    // 상품 전용
    const [supplier, setSupplier] = useState('');
    const [costKrw, setCostKrw] = useState<number>(0);
    // 서비스 + 온라인: 대면교육 전용
    const [faceToFacePriceKrw, setFaceToFacePriceKrw] = useState<number>(0);
    const [faceToFacePriceUsd, setFaceToFacePriceUsd] = useState<number>(0);
    const [faceToFaceCostKrw, setFaceToFaceCostKrw] = useState<number>(0);
    const [faceToFaceCostUsd, setFaceToFaceCostUsd] = useState<number>(0);
    const [faceToFaceValidityValue, setFaceToFaceValidityValue] = useState<number>(0);
    const [faceToFaceValidityUnit, setFaceToFaceValidityUnit] = useState<'days' | 'months'>('days');
    const [recruitmentStartDate, setRecruitmentStartDate] = useState<string>('');
    const [recruitmentEndDate, setRecruitmentEndDate] = useState<string>('');
    const [recruitmentCapacity, setRecruitmentCapacity] = useState<number>(0);
    const [participationGuide, setParticipationGuide] = useState('');
    const [costUsd, setCostUsd] = useState<number>(0);
    const [unitPriceKrw, setUnitPriceKrw] = useState<number>(0);
    const [unitPriceUsd, setUnitPriceUsd] = useState<number>(0);

    // Duplication state
    const location = useLocation();
    const duplicateFrom = location.state?.duplicateFrom as ClassItem | undefined;

    // Validation state
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const fetchOrganizations = useCallback(async () => {
        try {
            const response = await organizationService.getList({ page: 1, pageSize: 1000 });
            if (response?.organizationList) {
                setOrganizationOptions(response.organizationList.map(org => ({
                    id: org.organizationId,
                    title: org.title
                })));
            } else {
                setOrganizationOptions([
                    { id: 1, title: '메디크루 병원' },
                    { id: 2, title: '서울대학교병원' },
                    { id: 3, title: '연세세브란스병원' },
                ]);
            }
        } catch {
            setOrganizationOptions([
                { id: 1, title: '메디크루 병원' },
                { id: 2, title: '서울대학교병원' },
                { id: 3, title: '연세세브란스병원' },
            ]);
        }
    }, []);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    const productNameOptions = useMemo(() => {
        const list = classes ? Object.values(classes) : [];
        const titles = [...new Set(list.map((c: ClassItem) => c.title).filter(Boolean))];
        return titles.map(t => ({ value: t, label: t }));
    }, [classes]);

    const countryOptions = useMemo(() => {
        const apiList = countriesData?.countryList || [];
        const fallback = Array.isArray(countryTypes) ? countryTypes.filter((c: string) => c !== '전체 국가') : ['대한민국', '일본', '미국', '영국', '프랑스', '독일'];
        const names = apiList.length > 0
            ? apiList.map((c: { countryId: number; title: string }) => c.title)
            : fallback;
        return [...new Set(names)].map((name: string) => ({ value: name, label: name }));
    }, [countriesData]);

    const handleProductNameChange = (value: string) => {
        setClassName(value);
        const list = classes ? Object.values(classes) : [];
        const match = list.find((c: ClassItem) => c.title === value);
        if (match) {
            setDescription(match.description || '');
        }
    };

    const handlePublicCountryChange = (value: string) => {
        const match = countryOptions.find(o => o.value === value || o.label === value);
        if (match && !publicCountries.includes(match.value)) {
            setPublicCountries(prev => [...prev, match.value]);
            setPublicCountryInput('');
        } else {
            setPublicCountryInput(value);
        }
    };

    // Initialize state if duplicating
    useEffect(() => {
        if (duplicateFrom) {
            setClassName(`${duplicateFrom.title} (copy)`);
            setDescription(duplicateFrom.description || '');
            const orgName = (duplicateFrom as ClassItem & { organizationName?: string }).organizationName || '';
            setPartnerOrganization(orgName);
            setOrganizationName(orgName);
            if ((duplicateFrom as ClassItem & { completionRequirements?: CompletionRequirement }).completionRequirements) {
                setCompletionRequirements((duplicateFrom as ClassItem & { completionRequirements?: CompletionRequirement }).completionRequirements!);
            }

            // Map curriculum items back
            const initialItems: CurriculumItem[] = (duplicateFrom.curriculum || []).map(item => {
                const itemId = `copy-${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                if (item.type === 'video') {
                    return {
                        id: itemId,
                        type: 'video',
                        data: {
                            id: item.id.toString(),
                            title: item.name,
                            url: '', // Missing in legacy data
                            duration: item.duration,
                            author: {
                                name: item.author || 'Unknown',
                                type: item.authorType || 'individual'
                            },
                            description: ''
                        } as VideoLecture
                    };
                } else {
                    // Default to scenario
                    const detail = scenarioDetails[item.id];
                    return {
                        id: itemId,
                        type: 'scenario',
                        data: detail || {
                            id: item.id,
                            title: item.name,
                            duration: item.duration,
                            platform: item.platform,
                            ContributedBy: item.author || 'Medicrew',
                            // Add other required fields with defaults if detail is missing
                        } as any
                    };
                }
            });
            setCurriculumItems(initialItems);
        }
    }, [duplicateFrom]);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!productType) newErrors.productType = '프로덕트 유형을 선택해주세요.';
        if (productType && salesType !== 'online' && salesType !== 'agency') newErrors.salesType = '판매유형을 선택해주세요.';
        if (productType && !organizationName?.trim()) newErrors.organizationName = '기관명을 입력해주세요.';
        if (!className.trim()) newErrors.className = '제품명을 입력해주세요.';

        if (productType === '콘텐츠' && curriculumItems.length === 0) {
            newErrors.scenarios = '최소 1개 이상의 커리큘럼 아이템을 추가해주세요.';
        }

        if (productType === '콘텐츠' && salesType === 'online') {
            if ((priceKrw === undefined || priceKrw < 0) && (priceUsd === undefined || priceUsd < 0)) newErrors.price = '가격을 입력해주세요.';
            if (validityPeriodValue < 1) newErrors.validityPeriod = '유효기간은 1 이상이어야 합니다.';
            if (discountType !== 'none' && discountPrice > priceKrw) {
                newErrors.discountPrice = '할인가는 가격보다 클 수 없습니다.';
            }
        } else if (productType === '콘텐츠' && salesType === 'agency') {
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setCustomThumbnail(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const scenarioImages = (curriculumItems || [])
        .filter(item => item?.type === 'scenario')
        .map(item => {
            const scenario = item?.data as ScenarioDetail;
            if (!scenario) return { id: '', title: '', image: null };
            const image = scenario.simulationExamples?.[0]?.image;
            return { id: scenario.id, title: scenario.title, image };
        })
        .filter(item => item && item.image);

    const handleSubmit = async () => {
        if (!validateForm() || !organizationId) {
            if (!organizationId) alert('기관 정보가 없습니다.');
            return;
        }

        setIsSubmitting(true);

        try {
            const useMock = isFeatureEnabled('USE_MOCK_DATA');

            if (useMock) {
                // Mock behavior
                console.log('Mock: Creating class', { className });
                await new Promise(resolve => setTimeout(resolve, 1000));
                alert('클래스가 생성되었습니다! (Mock)');
                navigate(-1);
                return;
            }

            const requestData: CreateCourseRequestDto = {
                organizationId: organizationId ? Number(organizationId) : 0,
                organizationLicenseIdList: [1], // TODO: 실제 라이선스 ID 연동 필요
                title: className,
                isPrivate: true,
                minPlayCount: 1,
                scenarioList: curriculumItems
                    .filter(item => item.type === 'scenario')
                    .map((item, index) => ({
                        scenarioId: (item.data as ScenarioDetail).id,
                        order: index + 1
                    }))
            };

            await courseService.createCourse(requestData);
            alert('클래스가 생성되었습니다!');
            navigate(-1);
        } catch (error) {
            console.error('Error creating class:', error);
            alert('클래스 생성 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasDraftContent = className || curriculumItems.length > 0 ||
        (productType && affiliateSellerName.trim()) ||
        (productType && (customThumbnail || selectedScenarioThumbnail)) ||
        (productType === '콘텐츠' && (
            partnerOrganization || organizationName.trim() || priceKrw > 0 || priceUsd > 0 ||
            (salesType === 'online' && (validityPeriodValue > 0 || discountType !== 'none')) ||
            (salesType === 'agency' && (orderNotes.trim() || validityPeriodValue > 0))
        ));

    const handleCancel = () => {
        if (hasDraftContent) {
            if (window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
                navigate(-1);
            }
        } else {
            navigate(-1);
        }
    };

    return (
        <CenteredPageLayout title="프로덕트 생성">
            <div className="space-y-6">
                <section className="bg-white rounded-lg border border-gray-400 shadow-sm space-y-2 px-6 py-4">

                    {/* 프로덕트 유형 / 판매유형 (필수) */}
                    <div className="flex flex-wrap items-center gap-2 gap-y-4">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700 w-32"><span className="text-red-500">*</span> 프로덕트 유형</label>
                            <SimpleSelect
                                value={productType}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProductType(e.target.value)}
                                wrapperClassName="w-40"
                                error={errors.productType}
                            >
                                <option value="">선택</option>
                                {PRODUCT_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </SimpleSelect>
                        </div>
                        {productType && (
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 w-20"><span className="text-red-500">*</span> 판매유형</label>
                                <SimpleSelect
                                    value={salesType}
                                    onChange={(e) => setSalesType(e.target.value as 'online' | 'agency')}
                                    wrapperClassName="w-48"
                                    error={errors.salesType}
                                >
                                    <option value="online">온라인 판매 (오픈클래스)</option>
                                    <option value="agency">기관판매</option>
                                </SimpleSelect>
                            </div>
                        )}
                    </div>

                    {/* 기관명 (필수) */}
                    <div className="border-t border-gray-200"></div>
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2"><span className="text-red-500">*</span> 기관명</label>
                        <div className="flex-1 flex items-center gap-2">
                            <div className="max-w-sm flex-1">
                                <ComboBox
                                    placeholder="기관명 검색 또는 입력"
                                    value={organizationName}
                                    onValueChange={setOrganizationName}
                                    options={organizationOptions.map(org => ({ value: org.title, label: org.title }))}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsAddOrgModalOpen(true)}
                            >
                                신규 기관등록
                            </Button>
                            {errors.organizationName && <p className="text-sm text-red-600 ml-2">{errors.organizationName}</p>}
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* 제품명 (필수) */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2"><span className="text-red-500">*</span> 제품명</label>
                        <div className="flex-1 max-w-md">
                            <ComboBox
                                placeholder="제품명 검색 또는 입력"
                                value={className}
                                onValueChange={handleProductNameChange}
                                options={productNameOptions}
                            />
                            {errors.className && (
                                <p className="text-sm text-red-600 mt-2">{errors.className}</p>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* 소개 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                            소개
                        </label>
                        <div className="flex-1">
                            <Input
                                multiline
                                value={description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                placeholder="내용을 입력하세요"
                                rows={5}
                            />
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>

                    {/* 공급처: 상품 타입만 */}
                    {productType === '상품' && (
                        <>
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">공급처</label>
                                <div className="flex-1 max-w-sm">
                                    <ComboBox
                                        placeholder="공급처 검색 또는 입력"
                                        value={supplier}
                                        onValueChange={setSupplier}
                                        options={organizationOptions.map(org => ({ value: org.title, label: org.title }))}
                                    />
                                </div>
                            </div>
                            <div className="border-t border-gray-200"></div>
                        </>
                    )}

                    {/* 커리큘럼 설정: 상품 타입 제외 */}
                    {productType !== '상품' && (
                        <>
                            <CurriculumCreate
                                items={curriculumItems}
                                onItemsChange={setCurriculumItems}
                                error={errors.scenarios}
                                hideEditCompleteAndReset
                            />
                            <div className="border-t border-gray-200"></div>
                        </>
                    )}

                    {/* 썸네일 이미지: 항상 입력 가능 */}
                    
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">썸네일 이미지</label>
                                <div className="flex-1">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="thumbnailMode"
                                                    value="custom"
                                                    checked={thumbnailMode === 'custom'}
                                                    onChange={() => setThumbnailMode('custom')}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">직접 업로드</span>
                                            </label>
                                            {productType !== '상품' && (
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="thumbnailMode"
                                                        value="scenario"
                                                        checked={thumbnailMode === 'scenario'}
                                                        onChange={() => setThumbnailMode('scenario')}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">시나리오 이미지 선택</span>
                                                </label>
                                            )}
                                        </div>
                                        {thumbnailMode === 'custom' ? (
                                            <div className="flex items-start gap-4">
                                                <div className="w-32 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                                                    {customThumbnail ? (
                                                        <img src={customThumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs text-gray-400">이미지 없음</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">권장 사이즈: 1280x720px (JPG, PNG)</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {scenarioImages.length > 0 ? (
                                                    <div className="grid grid-cols-5 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                        {scenarioImages.map((img) => (
                                                            <div
                                                                key={img.id}
                                                                onClick={() => setSelectedScenarioThumbnail(img.image)}
                                                                className={`cursor-pointer overflow-hidden border-2 relative group rounded-lg ${selectedScenarioThumbnail === img.image ? 'border-blue-500' : 'border-transparent'}`}
                                                            >
                                                                <div className="aspect-video bg-gray-100">
                                                                    <img src={img.image || ''} alt={img.title} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded">선택</span>
                                                                </div>
                                                                {selectedScenarioThumbnail === img.image && (
                                                                    <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg text-center border border-dashed border-gray-200">
                                                        선택 가능한 시나리오 이미지가 없습니다. 커리큘럼에 시나리오를 먼저 추가해주세요.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200"></div>

                    {/* 서비스 + 온라인: 유효기간, 모집기간, 모집인원, 참가안내 */}
                    {productType === '서비스' && salesType === 'online' && (
                        <>
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">유효기간</label>
                                <div className="flex-1 flex items-center gap-2">
                                    <Input type="number" min={0} value={faceToFaceValidityValue} onChange={(e) => setFaceToFaceValidityValue(parseInt(e.target.value) || 0)} wrapperClassName="w-24" className="text-right h-9" />
                                    <SimpleSelect value={faceToFaceValidityUnit} onChange={(e) => setFaceToFaceValidityUnit(e.target.value as 'days' | 'months')} wrapperClassName="w-24" className="h-9">
                                        <option value="days">일</option>
                                        <option value="months">개월</option>
                                    </SimpleSelect>
                                </div>
                            </div>
                            <div className="border-t border-gray-200"></div>
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">모집기간</label>
                                <div className="flex-1 flex flex-wrap items-center gap-4">
                                    <Input type="date" value={recruitmentStartDate} onChange={(e) => setRecruitmentStartDate(e.target.value)} wrapperClassName="w-40" className="h-9" />
                                    <span className="text-gray-500">~</span>
                                    <Input type="date" value={recruitmentEndDate} onChange={(e) => setRecruitmentEndDate(e.target.value)} wrapperClassName="w-40" className="h-9" />
                                </div>
                            </div>
                            <div className="border-t border-gray-200"></div>
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">모집인원</label>
                                <div className="flex-1">
                                    <Input type="number" min={0} value={recruitmentCapacity || ''} onChange={(e) => setRecruitmentCapacity(parseInt(e.target.value) || 0)} wrapperClassName="w-24" className="text-right h-9" suffix="명" />
                                </div>
                            </div>
                            <div className="border-t border-gray-200"></div>
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">참가안내</label>
                                <div className="flex-1">
                                    <Input multiline value={participationGuide} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setParticipationGuide(e.target.value)} placeholder="참가 안내 문구를 입력하세요" rows={4} />
                                </div>
                            </div>
                            <div className="border-t border-gray-200"></div>
                        </>
                    )}

                    {/* 이수조건: 콘텐츠만 */}
                    {productType === '콘텐츠' && (
                        <>
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">이수조건</label>
                                <div className="flex-1">
                                    <div className="space-y-1">
                                        <label className="flex items-center mb-2 gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={completionRequirements.requireAllScenarios}
                                                onChange={(e) => setCompletionRequirements({
                                                    ...completionRequirements,
                                                    requireAllScenarios: e.target.checked
                                                })}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">모든 시나리오 완료 필수</span>
                                        </label>
                                        {!completionRequirements.requireAllScenarios && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-48 text-sm text-gray-600">최소 완료 시나리오 수</span>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={(curriculumItems?.length) || 1}
                                                    value={completionRequirements.minScenarios}
                                                    onChange={(e) => setCompletionRequirements({
                                                        ...completionRequirements,
                                                        minScenarios: parseInt(e.target.value) || 1
                                                    })}
                                                    wrapperClassName="w-20"
                                                    suffix="개"
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="w-48 text-sm text-gray-600">최소 합격 점수(%)</span>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={completionRequirements.minPassingScore}
                                                onChange={(e) => setCompletionRequirements({
                                                    ...completionRequirements,
                                                    minPassingScore: parseInt(e.target.value) || 0
                                                })}
                                                wrapperClassName="w-20"
                                                suffix="%"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200"></div>

                             {/* 프리미엄 서비스 (상품 타입만 숨김, 세일즈 타입 무관) */}
                             {(productType as string) !== '상품' && (
                                    <div className="flex items-start py-2 gap-4">
                                        <label className="text-sm font-medium text-gray-700 w-32">프리미엄 서비스</label>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={premiumScenarioCreate}
                                                    onChange={(e) => setPremiumScenarioCreate(e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">시나리오 생성</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={premiumScenarioEdit}
                                                    onChange={(e) => setPremiumScenarioEdit(e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">시나리오 수정</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={premiumAiChat}
                                                    onChange={(e) => setPremiumAiChat(e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">AI 대화</span>
                                            </label>
                                        </div>
                                    </div>
                                    )}
                                    <div className="border-t border-gray-200"></div>


                            {salesType === 'agency' && (
                                <>
                                    <div className="flex items-start gap-4">
                                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">라이선스 유형</label>
                                        <div className="flex-1">
                                            <SimpleSelect value={licenseType} onChange={(e) => setLicenseType(e.target.value as 'device' | 'user')} wrapperClassName="w-40" className="h-9">
                                                <option value="device">기기구독</option>
                                                <option value="user">사용자구독</option>
                                            </SimpleSelect>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200"></div>
                                </>
                            )}
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">유효기간</label>
                                <div className="flex-1 flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={validityPeriodValue}
                                        onChange={(e) => setValidityPeriodValue(parseInt(e.target.value) || 0)}
                                        wrapperClassName="w-24"
                                        className="text-right h-9"
                                    />
                                    <SimpleSelect value={validityPeriodUnit} onChange={(e) => setValidityPeriodUnit(e.target.value as 'days' | 'months')} wrapperClassName="w-24" className="h-9">
                                        <option value="days">일</option>
                                        <option value="months">개월</option>
                                    </SimpleSelect>
                                    {errors.validityPeriod && <p className="text-xs text-red-600">{errors.validityPeriod}</p>}
                                </div>
                            </div>
                            <div className="border-t border-gray-200"></div>
                        </>
                    )}

                    {/* 가격, 원가 (할인가 앞 고정 표시) */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">가격</label>
                        <div className="flex-1 flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={0}
                                    value={priceKrw || ''}
                                    onChange={(e) => setPriceKrw(parseFloat(e.target.value) || 0)}
                                    wrapperClassName="w-36"
                                    className="text-right"
                                    suffix="원"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={0}
                                    value={priceUsd || ''}
                                    onChange={(e) => setPriceUsd(parseFloat(e.target.value) || 0)}
                                    wrapperClassName="w-36"
                                    className="text-right"
                                    suffix="USD"
                                />
                            </div>
                            {errors.priceKrw && <p className="text-sm text-red-600 ml-2">{errors.priceKrw}</p>}
                            {errors.priceUsd && <p className="text-sm text-red-600 ml-2">{errors.priceUsd}</p>}
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">원가</label>
                        <div className="flex-1 flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={0}
                                    value={costKrw || ''}
                                    onChange={(e) => setCostKrw(parseFloat(e.target.value) || 0)}
                                    wrapperClassName="w-36"
                                    className="text-right"
                                    suffix="원"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={0}
                                    value={costUsd || ''}
                                    onChange={(e) => setCostUsd(parseFloat(e.target.value) || 0)}
                                    wrapperClassName="w-36"
                                    className="text-right"
                                    suffix="USD"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>

                    {/* 할인가 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">할인가</label>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <SimpleSelect
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value as 'none' | 'hospital_association' | 'event')}
                                    wrapperClassName="w-48"
                                >
                                    <option value="none">적용안함</option>
                                    <option value="hospital_association">대한병원협회 할인</option>
                                    <option value="event">이벤트 할인</option>
                                </SimpleSelect>
                            </div>
                            {discountType !== 'none' && (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={0}
                                            value={discountPrice}
                                            onChange={(e) => setDiscountPrice(parseInt(e.target.value) || 0)}
                                            wrapperClassName="w-40"
                                            className="text-right"
                                            suffix="원"
                                        />
                                        <Input
                                            type="number"
                                            min={0}
                                            value={discountPriceUsd || ''}
                                            onChange={(e) => setDiscountPriceUsd(parseFloat(e.target.value) || 0)}
                                            wrapperClassName="w-36"
                                            className="text-right"
                                            suffix="USD"
                                        />
                                        {priceKrw > 0 && discountPrice > 0 && (
                                            <span className="text-xs text-brand-600 font-medium">
                                                실제 참가비: {(priceKrw - discountPrice).toLocaleString()}원 ({Math.round((discountPrice / priceKrw) * 100)}% 할인)
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="text"
                                            value={discountCondition}
                                            onChange={(e) => setDiscountCondition(e.target.value)}
                                            placeholder="할인조건 예: 특정 쿠폰 코드 소지자, 제휴 단체 회원 등"
                                            wrapperClassName="w-60"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>

                    {/* 제휴기관 설정 */}
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">제휴기관</label>
                                <div className="flex-1 flex flex-wrap items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <SimpleSelect
                                            value={affiliateSellerName}
                                            onChange={(e) => setAffiliateSellerName(e.target.value)}
                                            wrapperClassName="w-48"
                                        >
                                            <option value=""> 제휴기관 없음</option>
                                            {organizationOptions.map((org) => (
                                                <option key={org.id} value={org.title}>{org.title}</option>
                                            ))}
                                        </SimpleSelect>
                                        {errors.affiliateSellerName && <p className="text-sm text-red-600">{errors.affiliateSellerName}</p>}
                                    </div>
                                    {affiliateSellerName && (
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-600">수수료율</label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={affiliateCommissionRate || ''}
                                                onChange={() => {}}
                                                disabled
                                                wrapperClassName="w-24"
                                                className="text-right"
                                                suffix="%"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                    <div className="border-t border-gray-200"></div>

                    {/* 공개국가 지정: 온라인판매인 경우에만 */}
                    {salesType === 'online' && (
                        <>
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">공개국가 지정</label>
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="max-w-md">
                                        <ComboBox
                                            placeholder="국가명 검색 또는 입력 (빈 칸이면 모두 공개)"
                                            value={publicCountryInput}
                                            onValueChange={handlePublicCountryChange}
                                            options={countryOptions.filter(o => !publicCountries.includes(o.value))}
                                        />
                                    </div>
                                    {publicCountries.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {publicCountries.map((c) => (
                                                <span
                                                    key={c}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-sm text-gray-800"
                                                >
                                                    {c}
                                                    <button
                                                        type="button"
                                                        onClick={() => setPublicCountries(prev => prev.filter(x => x !== c))}
                                                        className="text-gray-500 hover:text-gray-700"
                                                        aria-label={`${c} 제거`}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="border-t border-gray-200"></div>
                        </>
                    )}
                    {/* 활성 여부 */}
                    <div className="flex items-center gap-8">
                        <label className="text-sm font-medium text-gray-700 w-28 pt-2">
                            활성 여부
                        </label>
                        <div className="flex flex-col space-y-2">
                            <ToggleLabel
                                checked={isActive}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsActive(e.target.checked)}
                                onLabel="활성"
                                offLabel="비활성"
                                size="sm"
                            />
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>
                        <div className="flex items-start gap-4">
                            <label className="text-sm font-medium text-gray-700 w-32 pt-2">비고</label>
                            <div className="flex-1">
                                <Input multiline rows={3} value={orderNotes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrderNotes(e.target.value)} placeholder="주문 관련 비고 사항을 입력하세요" className="w-full" />
                            </div>
                        </div>
                </section>

                <AddOrganizationModal
                    isOpen={isAddOrgModalOpen}
                    onClose={() => setIsAddOrgModalOpen(false)}
                    onSuccess={() => { fetchOrganizations(); }}
                />

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pb-8">
                    <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? '생성 중...' : '저장'}
                    </Button>
                </div>
            </div>
        </CenteredPageLayout>
    );
}
