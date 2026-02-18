import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Badge, Checkbox, SimpleSelect, ComboBox } from '@/components/shared/ui';
import { CenteredPageLayout } from '@/components/shared/layout';
import CurriculumSetup from './CurriculumSetup';
import { ToggleLabel } from '@/components/shared/ui/Toggle';
import { CurriculumItem, VideoLecture } from '../../types/curriculum';
import { scenarioDetails, ScenarioDetail } from '../../data/scenarioDetails';
import { ClassItem } from '../../data/classes';
import { courseService } from '../../services/courseService';
import { UpdateCourseRequestDto } from '../../types/api/course';
import { organizationService } from '../../services/organizationService';

import { useAuth } from '../../contexts/AuthContext';
import { isFeatureEnabled } from '../../config/featureFlags';
import { useClasses, useClass } from '../../data/queries/useClasses';

interface CompletionRequirement {
    minScenarios: number;
    minPassingScore: number;
    requireAllScenarios: boolean;
}

interface OrganizationOption {
    id: number;
    title: string;
}

// 국가별 화폐 단위 매핑
const CURRENCY_MAP: { [key: string]: string } = {
    'KR': '원',
    'US': '$',
    'JP': '¥',
    'CN': '¥',
    'VN': '₫'
};

export default function OpenClassEdit(): React.ReactElement {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getLicenseInfo, getCurrentRole, user } = useAuth();
    const licenseInfo = getLicenseInfo();
    const isAdmin = getCurrentRole() === 'admin';
    const organizationId = user?.currentAccount?.organizationId;

    const { classData, loading: isLoadingData } = useClass(id);
    const { classes: purchasedClasses } = useClasses(organizationId);
    const purchasedProducts = purchasedClasses ? Object.values(purchasedClasses) : [];

    // Form state
    const today = new Date().toISOString().split('T')[0];
    const [partnerOrganization, setPartnerOrganization] = useState('');
    const [className, setClassName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [visibility, setVisibility] = useState<'organization' | 'private'>('organization');
    const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completionRequirements, setCompletionRequirements] = useState<CompletionRequirement>({
        minScenarios: 1,
        minPassingScore: 70,
        requireAllScenarios: false
    });

    // Sales Settings State
    const [isOnlineSale, setIsOnlineSale] = useState(false);
    const [isInstitutionalSale, setIsInstitutionalSale] = useState(false);

    // Online Sales Config
    const [participationMethod, setParticipationMethod] = useState<'online' | 'offline'>('online');

    const [organizationOptions, setOrganizationOptions] = useState<OrganizationOption[]>([]);

    // Online participation specific state
    const [accessPeriod, setAccessPeriod] = useState<number>(30); // in days
    const [accessPeriodType, setAccessPeriodType] = useState<'days' | 'dates'>('days');
    const [accessStartDate, setAccessStartDate] = useState(today);
    const [accessEndDate, setAccessEndDate] = useState(today);
    const [price, setPrice] = useState<number>(0);
    const [discountPrice, setDiscountPrice] = useState<number>(0);
    const [settlementPrice, setSettlementPrice] = useState<number>(0);
    const [country, setCountry] = useState<string>('');
    const [currency, setCurrency] = useState<string>('원');
    const [partnerOrgId, setPartnerOrgId] = useState<string>('none');
    const [discountType, setDiscountType] = useState<'none' | 'event'>('none');
    const [discountCondition, setDiscountCondition] = useState('');

    // Offline participation specific state
    const [recruitmentStartDate, setRecruitmentStartDate] = useState(today);
    const [recruitmentEndDate, setRecruitmentEndDate] = useState(today);
    const [educationDate, setEducationDate] = useState(today);
    const [maxParticipantsOffline, setMaxParticipantsOffline] = useState<number>(30);
    const [offlinePrice, setOfflinePrice] = useState<number>(0);
    const [offlineDiscountPrice, setOfflineDiscountPrice] = useState<number>(0);
    const [offlineSettlementPrice, setOfflineSettlementPrice] = useState<number>(0);
    const [offlineCountry, setOfflineCountry] = useState<string>('');
    const [offlineCurrency, setOfflineCurrency] = useState<string>('원');
    const [offlinePartnerOrgId, setOfflinePartnerOrgId] = useState<string>('none');

    // Thumbnail state
    const [thumbnailMode, setThumbnailMode] = useState<'custom' | 'scenario'>('custom');
    const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
    const [selectedScenarioThumbnail, setSelectedScenarioThumbnail] = useState<string | null>(null);

    // Admin-specific state
    const [saleStatus, setSaleStatus] = useState<'available' | 'unavailable'>('available');

    // Private license state (비공개 시)
    const [licenseType, setLicenseType] = useState<'device' | 'user'>('device');
    const [plan, setPlan] = useState<'basic' | 'pro'>('basic');
    const [licenseQuantity, setLicenseQuantity] = useState<number>(1);
    const [licenseStartDate, setLicenseStartDate] = useState(today);
    const [validityPeriodMonths, setValidityPeriodMonths] = useState<number>(12);
    const [orderNotes, setOrderNotes] = useState('');

    // In-person participation state
    const [customParticipationMethod, setCustomParticipationMethod] = useState('온라인 실습');
    const [showOfflineFields, setShowOfflineFields] = useState(false);
    const [inPersonRecruitmentStartDate, setInPersonRecruitmentStartDate] = useState(today);
    const [inPersonRecruitmentEndDate, setInPersonRecruitmentEndDate] = useState(today);
    const [inPersonRecruitmentCapacity, setInPersonRecruitmentCapacity] = useState<number>(30);
    const [participationInfo, setParticipationInfo] = useState('');

    // Fetch organizations for admin
    // determine if we still need organizationsData if it's used elsewhere
    // In this file, it seems only used for the selection we are removing.

    // 비공개 시 종료일 자동계산
    const licenseEndDate = React.useMemo(() => {
        if (visibility !== 'private') return '';
        const start = new Date(licenseStartDate);
        start.setMonth(start.getMonth() + validityPeriodMonths);
        return start.toISOString().split('T')[0];
    }, [visibility, licenseStartDate, validityPeriodMonths]);

    // Validation state
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Fetch organizations
    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const response = await organizationService.getList({ page: 1, pageSize: 1000 });
                if (response && response.organizationList) {
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
            } catch (e) {
                console.error("Failed to fetch organizations", e);
                setOrganizationOptions([
                    { id: 1, title: '메디크루 병원' },
                    { id: 2, title: '서울대학교병원' },
                    { id: 3, title: '연세세브란스병원' },
                ]);
            }
        };
        fetchOrgs();
    }, []);

    // Load initial data
    useEffect(() => {
        if (classData) {
            setClassName(classData.title);
            setPartnerOrganization((classData as ClassItem).organizationName || '');
            setDescription(classData.description || '');

            if (classData.participationPeriod) {
                setStartDate(classData.participationPeriod.startDate);
                setEndDate(classData.participationPeriod.endDate);
            }

            if (classData.password !== undefined) {
                setVisibility(classData.password ? 'private' : 'organization');
            }

            if (classData.completionRequirements) {
                setCompletionRequirements(classData.completionRequirements);
            }

            if ((classData as ClassItem & { price?: number }).price !== undefined) {
                setPrice((classData as ClassItem & { price?: number }).price ?? 0);
            }
            if ((classData as ClassItem & { discountPrice?: number }).discountPrice !== undefined) {
                setDiscountPrice((classData as ClassItem & { discountPrice?: number }).discountPrice ?? 0);
            }

            setIsActive(classData.isActive !== false);

            const initialItems: CurriculumItem[] = (classData.curriculum || []).map(item => {
                const itemId = `edit-${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                if (item.type === 'video') {
                    return {
                        id: itemId,
                        type: 'video',
                        data: {
                            id: item.id.toString(),
                            title: item.name,
                            url: '',
                            duration: item.duration,
                            author: { name: item.author || 'Unknown', type: item.authorType || 'individual' },
                            description: ''
                        } as VideoLecture
                    };
                }
                const detail = scenarioDetails[item.id];
                return {
                    id: itemId,
                    type: 'scenario',
                    data: (detail || {
                        id: item.id,
                        title: item.name,
                        duration: item.duration,
                        platform: item.platform,
                        ContributedBy: item.author || 'Medicrew'
                    }) as ScenarioDetail
                };
            });
            setCurriculumItems(initialItems);
        }
    }, [classData]);

    const handleCountryChange = (selectedCountry: string) => {
        setCountry(selectedCountry);
        setCurrency(CURRENCY_MAP[selectedCountry] || '원');
    };

    const handleOfflineCountryChange = (selectedCountry: string) => {
        setOfflineCountry(selectedCountry);
        setOfflineCurrency(CURRENCY_MAP[selectedCountry] || '원');
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!className.trim()) {
            newErrors.className = '클래스명을 입력해주세요.';
        }

        if (curriculumItems.length === 0) {
            newErrors.scenarios = '최소 1개 이상의 커리큘럼 아이템을 추가해주세요.';
        }

        if (visibility === 'organization') {
            // 공개: 참여방법, 수강기간, 참가비, 할인 설정 검증
            if (price === undefined || price < 0) {
                newErrors.price = '참가비를 입력해주세요.';
            }
            if (accessPeriodType === 'days') {
                if (accessPeriod < 1) newErrors.accessPeriod = '수강기간은 1일 이상이어야 합니다.';
            } else {
                if (!accessStartDate) newErrors.accessPeriod = '시작일을 선택해주세요.';
                if (!accessEndDate) newErrors.accessPeriod = '종료일을 선택해주세요.';
                if (accessStartDate && accessEndDate && new Date(accessStartDate) > new Date(accessEndDate)) {
                    newErrors.accessPeriod = '종료일은 시작일 이후여야 합니다.';
                }
            }
            if (discountType !== 'none' && discountPrice > price) {
                newErrors.discountPrice = '할인가는 수강료보다 클 수 없습니다.';
            }
            if (showOfflineFields) {
                if (!inPersonRecruitmentStartDate) newErrors.inPersonRecruitmentStartDate = '모집 시작일을 입력해주세요.';
                if (!inPersonRecruitmentEndDate) newErrors.inPersonRecruitmentEndDate = '모집 종료일을 입력해주세요.';
                if (inPersonRecruitmentStartDate && inPersonRecruitmentEndDate && new Date(inPersonRecruitmentStartDate) > new Date(inPersonRecruitmentEndDate)) {
                    newErrors.inPersonRecruitmentEndDate = '모집 종료일은 시작일 이후여야 합니다.';
                }
                if (!inPersonRecruitmentCapacity || inPersonRecruitmentCapacity < 1) {
                    newErrors.inPersonRecruitmentCapacity = '모집인원은 1명 이상이어야 합니다.';
                }
                if (!participationInfo.trim()) newErrors.participationInfo = '참여안내를 입력해주세요.';
            }
        } else {
            // 비공개: 라이선스 설정 검증
            if (!licenseQuantity || licenseQuantity < 1) {
                newErrors.licenseQuantity = '수량은 1개 이상이어야 합니다.';
            }
            if (!licenseStartDate) {
                newErrors.licenseStartDate = '시작일을 선택해주세요.';
            }
            if (!validityPeriodMonths || validityPeriodMonths < 1) {
                newErrors.validityPeriodMonths = '유효기간은 1개월 이상이어야 합니다.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !id) return;

        setIsSubmitting(true);

        try {
            const useMock = isFeatureEnabled('USE_MOCK_DATA');

            if (useMock) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                alert('오픈클래스가 수정되었습니다! (Mock)');
                navigate(-1);
                return;
            }

            const requestData: UpdateCourseRequestDto = {
                title: className,
                isPrivate: visibility === 'private',
                price,
                discountPrice: discountType !== 'none' ? discountPrice : undefined,
                subscriptionStartDate: accessPeriodType === 'dates' ? accessStartDate : undefined,
                subscriptionEndDate: accessPeriodType === 'dates' ? accessEndDate : undefined,
                subscriptionPeriodDays: accessPeriodType === 'days' ? accessPeriod : undefined,
                minPlayCount: completionRequirements.minScenarios,
                scenarioList: curriculumItems
                    .filter(item => item.type === 'scenario')
                    .map((item, index) => ({
                        scenarioId: (item.data as ScenarioDetail).id,
                        order: index + 1
                    })),
                isActive
            };

            await courseService.updateCourse(parseInt(id), requestData);
            alert('오픈클래스가 수정되었습니다!');
            navigate(-1);
        } catch (error) {
            console.error('Error updating open class:', error);
            alert('오픈클래스 수정 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (className || curriculumItems.length > 0) {
            if (window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
                navigate(-1);
            }
        } else {
            navigate(-1);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomThumbnail(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Extract images from scenarios
    const scenarioImages = (curriculumItems || [])
        .filter(item => item?.type === 'scenario')
        .map(item => {
            const scenario = item?.data as ScenarioDetail;
            if (!scenario) return { id: '', title: '', image: null };
            // Use the first example image if available
            const image = scenario.simulationExamples?.[0]?.image;
            return {
                id: scenario.id,
                title: scenario.title,
                image: image
            };
        })
        .filter(item => item && item.image); // Only keep items with images

    if (isLoadingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-gray-500">오픈클래스 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <CenteredPageLayout title="오픈클래스 수정">
            <div className="space-y-6">
                <section className="bg-white rounded-lg border border-gray-400 shadow-sm space-y-2 px-6 py-4">

                    {/* 제휴기관 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                            제휴기관
                        </label>
                        <div className="flex-1 max-w-sm">
                            <ComboBox
                                placeholder="키워드로 제휴기관 검색"
                                value={partnerOrganization}
                                onValueChange={setPartnerOrganization}
                                options={organizationOptions.map(org => ({ value: org.title, label: org.title }))}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* 클래스명 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                            클래스명
                        </label>
                        <div className="flex-1">
                            <Input
                                type="text"
                                value={className}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClassName(e.target.value)}
                                placeholder="클래스명을 입력하세요"
                                className="max-w-sm"
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
                                placeholder="클래스에 대한 소개를 입력하세요"
                                rows={5}
                            />
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>

                    {/* 커리큘럼 설정 */}
                    <CurriculumSetup
                        items={curriculumItems}
                        onItemsChange={setCurriculumItems}
                        error={errors.scenarios}
                        purchasedProducts={purchasedProducts}
                    />

                    <div className="border-t border-gray-200"></div>

                    {/* 이수조건 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                            이수조건
                        </label>
                        <div className="flex-1">
                            <div className="space-y-1">
                                {/* 모든 시나리오 완료 필수 */}
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

                                {/* 최소 완료 시나리오 수 */}
                                {!completionRequirements.requireAllScenarios && (
                                    <div className="flex items-center gap-2">
                                        <span className="w-48 text-sm text-gray-600">최소 완료 시나리오 수</span>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={(curriculumItems?.length) || 1}
                                            value={completionRequirements.minScenarios}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompletionRequirements({
                                                ...completionRequirements,
                                                minScenarios: parseInt(e.target.value) || 1
                                            })}
                                            wrapperClassName="w-20"
                                            suffix="개"
                                        />
                                    </div>
                                )}

                                {/* 최소 합격 점수 */}
                                <div className="flex items-center gap-2">
                                    <span className="w-48 text-sm text-gray-600">최소 합격 점수(%)</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={completionRequirements.minPassingScore}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompletionRequirements({
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

                    {/* 썸네일 이미지 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                            썸네일 이미지
                        </label>
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
                                                        className={`cursor-pointer rounded-lg overflow-hidden border-2 relative group ${selectedScenarioThumbnail === img.image ? 'border-blue-500' : 'border-transparent'}`}
                                                    >
                                                        <div className="aspect-video bg-gray-100">
                                                            <img src={img.image || ''} alt={img.title} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded">선택</span>
                                                        </div>
                                                        {selectedScenarioThumbnail === img.image && (
                                                            <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                                                ✓
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg text-center border border-dashed border-gray-200">
                                                선택 가능한 시나리오 이미지가 없습니다.
                                                <br />
                                                커리큘럼에 시나리오를 먼저 추가해주세요.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>

                    {visibility === 'organization' ? (
                        <>
                            {/* 참여방법 */}
                            <div className="flex items-start gap-8">
                                <label className="text-sm font-medium text-gray-700 w-28 pt-2">
                                    참여방법
                                </label>
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Input
                                            value={customParticipationMethod}
                                            onChange={(e) => setCustomParticipationMethod(e.target.value)}
                                            placeholder="예: 온라인 실습, 대면 실습 등"
                                            wrapperClassName="w-64"
                                            className="h-9"
                                        />
                                        <div className="flex items-center gap-2 pt-1">
                                            <Checkbox
                                                id="showOfflineFields"
                                                checked={showOfflineFields}
                                                onCheckedChange={(checked) => setShowOfflineFields(!!checked)}
                                            />
                                            <label htmlFor="showOfflineFields" className="text-sm text-gray-600 cursor-pointer">
                                                대면 참여 정보 입력
                                            </label>
                                        </div>
                                    </div>

                                    {showOfflineFields && (
                                        <div className="w-1/2 space-y-1">
                                            <div className="flex items-center justify-start">
                                                <label className="text-sm font-medium text-gray-700 w-24 pt-2">모집기간</label>
                                                <div className="flex-1 w-1/3">
                                                    <div className="flex items-center justify-start gap-2 w-full">
                                                        <Input
                                                            type="date"
                                                            value={inPersonRecruitmentStartDate}
                                                            onChange={(e) => setInPersonRecruitmentStartDate(e.target.value)}
                                                            className="w-full h-9"
                                                        />
                                                        <span className="text-gray-600">~</span>
                                                        <Input
                                                            type="date"
                                                            value={inPersonRecruitmentEndDate}
                                                            onChange={(e) => setInPersonRecruitmentEndDate(e.target.value)}
                                                            className="w-full h-9"
                                                        />
                                                    </div>
                                                    {(errors.inPersonRecruitmentStartDate || errors.inPersonRecruitmentEndDate) && (
                                                        <p className="text-xs text-red-600 mt-1">
                                                            {errors.inPersonRecruitmentStartDate || errors.inPersonRecruitmentEndDate}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-start justify-start">
                                                <label className="text-sm font-medium text-gray-700 w-24 pt-2">모집인원</label>
                                                <div className="flex-1">
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={inPersonRecruitmentCapacity}
                                                        onChange={(e) => setInPersonRecruitmentCapacity(parseInt(e.target.value) || 0)}
                                                        wrapperClassName="w-24"
                                                        className="text-right h-9"
                                                        suffix="명"
                                                    />
                                                    {errors.inPersonRecruitmentCapacity && (
                                                        <p className="text-xs text-red-600 mt-1">{errors.inPersonRecruitmentCapacity}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-start justify-start">
                                                <label className="text-sm font-medium text-gray-700 w-24 pt-2">참여안내</label>
                                                <div className="flex-1">
                                                    <Input
                                                        multiline
                                                        rows={3}
                                                        value={participationInfo}
                                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setParticipationInfo(e.target.value)}
                                                        placeholder="교육 장소, 일정 등 참여 안내 사항을 입력하세요"
                                                        className="w-full"
                                                    />
                                                    {errors.participationInfo && (
                                                        <p className="text-xs text-red-600 mt-1">{errors.participationInfo}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-200"></div>

                            {/* 수강기간 */}
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                    수강기간
                                </label>
                                <div className="flex-1">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <SimpleSelect
                                                value={accessPeriodType}
                                                onChange={(e) => setAccessPeriodType(e.target.value as 'days' | 'dates')}
                                                wrapperClassName="w-40"
                                                className="h-9"
                                            >
                                                <option value="days">등록일로 부터</option>
                                                <option value="dates">직접 입력</option>
                                            </SimpleSelect>
                                            {accessPeriodType === 'days' ? (
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={accessPeriod}
                                                    onChange={(e) => setAccessPeriod(parseInt(e.target.value) || 0)}
                                                    wrapperClassName="w-20"
                                                    className="text-right h-9"
                                                    suffix="일"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="date"
                                                        value={accessStartDate}
                                                        onChange={(e) => setAccessStartDate(e.target.value)}
                                                        className="w-41 h-9"
                                                    />
                                                    <span>~</span>
                                                    <Input
                                                        type="date"
                                                        value={accessEndDate}
                                                        onChange={(e) => setAccessEndDate(e.target.value)}
                                                        className="w-41 h-9"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {errors.accessPeriod && (
                                            <p className="text-xs text-red-600">{errors.accessPeriod}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200"></div>

                            {/* 참가비 */}
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                    참가비
                                </label>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={0}
                                            value={price}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(parseInt(e.target.value) || 0)}
                                            wrapperClassName="w-40"
                                            className="text-right"
                                            suffix="원"
                                        />
                                        <span className="text-sm text-gray-500">참가비 무료는 0을 입력하세요.</span>
                                    </div>
                                    {errors.price && (
                                        <p className="text-sm text-red-600 ml-2">{errors.price}</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-200"></div>

                            {/* 할인 설정 */}
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                    할인 설정
                                </label>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <SimpleSelect
                                            value={discountType}
                                            onChange={(e) => setDiscountType(e.target.value as any)}
                                            wrapperClassName="w-40"
                                        >
                                            <option value="none">할인 없음</option>
                                            <option value="event">이벤트 할인</option>
                                        </SimpleSelect>
                                    </div>
                                    {discountType !== 'none' && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-4">
                                                <label className="text-sm font-medium text-gray-700 w-24">할인가 입력</label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={discountPrice}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscountPrice(parseInt(e.target.value) || 0)}
                                                        wrapperClassName="w-40"
                                                        className="text-right"
                                                        suffix="원"
                                                    />
                                                    {price > 0 && discountPrice > 0 && (
                                                        <span className="text-xs text-brand-600 font-medium">
                                                            실제 참가비: {(price - discountPrice).toLocaleString()}원 ({Math.round((discountPrice / price) * 100)}% 할인)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-7">
                                                <label className="text-sm font-medium text-gray-700 w-24">할인 조건</label>
                                                <Input
                                                    type="text"
                                                    value={discountCondition}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscountCondition(e.target.value)}
                                                    placeholder="예: 특정 쿠폰 코드 소지자, 제휴 단체 회원 등"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* 비공개: 라이선스 설정 */}
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                    라이선스 유형
                                </label>
                                <div className="flex-1">
                                    <SimpleSelect
                                        value={licenseType}
                                        onChange={(e) => setLicenseType(e.target.value as 'device' | 'user')}
                                        wrapperClassName="w-40"
                                        className="h-9"
                                    >
                                        <option value="device">기기구독</option>
                                        <option value="user">사용자구독</option>
                                    </SimpleSelect>
                                </div>
                            </div>

                            <div className="border-t border-gray-200"></div>

                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                    플랜
                                </label>
                                <div className="flex-1">
                                    <SimpleSelect
                                        value={plan}
                                        onChange={(e) => setPlan(e.target.value as 'basic' | 'pro')}
                                        wrapperClassName="w-40"
                                        className="h-9"
                                    >
                                        <option value="basic">Basic</option>
                                        <option value="pro">Pro</option>
                                    </SimpleSelect>
                                </div>
                            </div>

                            <div className="border-t border-gray-200"></div>

                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                    수량
                                </label>
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={licenseQuantity}
                                        onChange={(e) => setLicenseQuantity(parseInt(e.target.value) || 1)}
                                        wrapperClassName="w-24"
                                        className="text-right h-9"
                                        suffix="개"
                                    />
                                    {errors.licenseQuantity && (
                                        <p className="text-sm text-red-600 mt-1">{errors.licenseQuantity}</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-200"></div>

                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                    시작일
                                </label>
                                <div className="flex-1">
                                    <Input
                                        type="date"
                                        value={licenseStartDate}
                                        onChange={(e) => setLicenseStartDate(e.target.value)}
                                        className="w-41 h-9"
                                    />
                                    {errors.licenseStartDate && (
                                        <p className="text-sm text-red-600 mt-1">{errors.licenseStartDate}</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-200"></div>

                                    <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                    유효기간
                                </label>
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={validityPeriodMonths}
                                        onChange={(e) => setValidityPeriodMonths(parseInt(e.target.value) || 1)}
                                        wrapperClassName="w-24"
                                        className="text-right h-9"
                                        suffix="개월"
                                    />
                                    {errors.validityPeriodMonths && (
                                        <p className="text-sm text-red-600 mt-1">{errors.validityPeriodMonths}</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-200"></div>

                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                    종료일
                                </label>
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        value={licenseEndDate || '-'}
                                        readOnly
                                        disabled
                                        className="w-41 h-9 bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">시작일 + 유효기간(개월)으로 자동 계산됩니다.</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200"></div>

                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                    주문 비고
                                </label>
                                <div className="flex-1">
                                    <Input
                                        multiline
                                        rows={3}
                                        value={orderNotes}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrderNotes(e.target.value)}
                                        placeholder="주문 관련 비고 사항을 입력하세요"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="border-t border-gray-200"></div>

                    {/* 활성 여부 */}
                    <div className="flex items-center gap-8">
                        <label className="text-sm font-medium text-gray-700 w-28 pt-2">
                            활성 여부
                        </label>
                        <div className="flex flex-col space-y-2">
                            <ToggleLabel
                                checked={isActive}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsActive(e.target.checked)}
                                onLabel="활성 : 오픈클래스 조회와 참여가 가능합니다."
                                offLabel="비활성 : 오픈클래스 조회와 참여가 불가능합니다."
                                size="sm"
                            />
                        </div>
                    </div>
                </section>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pb-8">
                    <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? '수정 중...' : '수정 완료'}
                    </Button>
                </div>
            </div>
        </CenteredPageLayout>
    );
}
