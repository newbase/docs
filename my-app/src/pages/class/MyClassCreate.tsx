import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Badge, Checkbox, SimpleSelect, ComboBox } from '@/components/shared/ui';
import { CenteredPageLayout } from '@/components/shared/layout';
import CurriculumSetup from './CurriculumSetup';
import { ToggleLabel } from '@/components/shared/ui/Toggle';
import { CurriculumItem, VideoLecture } from '../../types/curriculum';
import { scenarioDetails, ScenarioDetail } from '../../data/scenarioDetails';
import { ClassItem } from '../../data/classes';
import { courseService } from '../../services/courseService';
import { CreateCourseRequestDto } from '../../types/api/course';
import { organizationService } from '../../services/organizationService';

import { useAuth } from '../../contexts/AuthContext';
import { isFeatureEnabled } from '../../config/featureFlags';
import { useClasses } from '../../data/queries/useClasses';

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
    'US': '$'
};

export default function MyClassCreate(): React.ReactElement {
    const navigate = useNavigate();
    const { getLicenseInfo, getCurrentRole, user } = useAuth();
    const licenseInfo = getLicenseInfo();
    const isAdmin = getCurrentRole() === 'admin';
    const organizationId = user?.currentAccount?.organizationId;

    const { classes: purchasedClasses } = useClasses(organizationId);
    const purchasedProducts = purchasedClasses ? Object.values(purchasedClasses) : [];

    // Form state
    const today = new Date().toISOString().split('T')[0];
    const [partnerOrganization, setPartnerOrganization] = useState('');
    const [className, setClassName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [maxParticipants, setMaxParticipants] = useState<number>(30); // Default to 30
    const [visibility, setVisibility] = useState<'organization' | 'private'>('organization');
    const [password, setPassword] = useState('');
    const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
    const [isOpenClass, setIsOpenClass] = useState(false);
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
    const [discountType, setDiscountType] = useState<'none' | 'affiliate' | 'event'>('none');
    const [affiliateOrg, setAffiliateOrg] = useState('');
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

    // In-person participation state
    const [customParticipationMethod, setCustomParticipationMethod] = useState('온라인 실습');
    const [showOfflineFields, setShowOfflineFields] = useState(false);
    const [inPersonRecruitmentStartDate, setInPersonRecruitmentStartDate] = useState(today);
    const [inPersonRecruitmentEndDate, setInPersonRecruitmentEndDate] = useState(today);
    const [inPersonRecruitmentCapacity, setInPersonRecruitmentCapacity] = useState<number>(30);
    const [participationInfo, setParticipationInfo] = useState('');
    const [openingOrganizationId, setOpeningOrganizationId] = useState<number>(0);

    // Fetch organizations for admin
    // determine if we still need organizationsData if it's used elsewhere
    // In this file, it seems only used for the selection we are removing.

    // Duplication state
    const location = useLocation();
    const duplicateFrom = location.state?.duplicateFrom as ClassItem | undefined;

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

    // Initialize state if duplicating
    useEffect(() => {
        if (duplicateFrom) {
            setClassName(`${duplicateFrom.title} (copy)`);
            setDescription(duplicateFrom.description || '');

            if (duplicateFrom.participationPeriod) {
                setStartDate(duplicateFrom.participationPeriod.startDate);
                setEndDate(duplicateFrom.participationPeriod.endDate);
            }

            if (duplicateFrom.maxParticipants) {
                setMaxParticipants(duplicateFrom.maxParticipants);
            }

            if (duplicateFrom.password !== undefined) {
                setVisibility(duplicateFrom.password ? 'private' : 'organization');
            }

            if ((duplicateFrom as any).isOpenClass !== undefined) {
                setIsOpenClass((duplicateFrom as any).isOpenClass);
            }

            if (duplicateFrom.password) {
                setPassword(duplicateFrom.password);
            }

            if (duplicateFrom.completionRequirements) {
                setCompletionRequirements(duplicateFrom.completionRequirements);
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

        if (price === undefined || price < 0) {
            newErrors.price = '참가비를 입력해주세요.';
        }

        if (!isOnlineSale && !isInstitutionalSale) {
            newErrors.salesType = '최소 하나의 판매 방식을 선택해주세요.';
        }

        // Validate Online Sales
        if (isOnlineSale) {
            if (participationMethod === 'online') {
                if (!country) newErrors.country = '국가를 선택해주세요.';
                if (accessPeriodType === 'days') {
                    if (accessPeriod < 1) newErrors.accessPeriod = '수강기간은 1일 이상이어야 합니다.';
                } else {
                    if (!accessStartDate) newErrors.accessPeriod = '시작일을 선택해주세요.';
                    if (!accessEndDate) newErrors.accessPeriod = '종료일을 선택해주세요.';
                    if (accessStartDate && accessEndDate && new Date(accessStartDate) > new Date(accessEndDate)) {
                        newErrors.accessPeriod = '종료일은 시작일 이후여야 합니다.';
                    }
                }
                if (discountPrice > price) newErrors.discountPrice = '할인가는 수강료보다 클 수 없습니다.';
            } else {
                if (!offlineCountry) newErrors.offlineCountry = '국가를 선택해주세요.';
                if (!recruitmentStartDate) newErrors.recruitmentStartDate = '모집 시작일을 입력해주세요.';
                if (!recruitmentEndDate) newErrors.recruitmentEndDate = '모집 종료일을 입력해주세요.';
                if (recruitmentStartDate && recruitmentEndDate && new Date(recruitmentStartDate) > new Date(recruitmentEndDate)) {
                    newErrors.recruitmentEndDate = '모집 종료일은 시작일 이후여야 합니다.';
                }
                if (!educationDate) newErrors.educationDate = '교육일시를 입력해주세요.';
                if (!maxParticipantsOffline || maxParticipantsOffline < 1) newErrors.maxParticipantsOffline = '참가자 수는 1명 이상이어야 합니다.';
                if (offlineDiscountPrice > offlinePrice) newErrors.offlineDiscountPrice = '할인가는 수강료보다 클 수 없습니다.';
            }
        }

        // Validate In-person Participation
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

        // 참여기간 검증
        {
            if (!startDate) {
                newErrors.startDate = '시작일을 선택해주세요.';
            }

            if (!endDate) {
                newErrors.endDate = '종료일을 선택해주세요.';
            }

            if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
                newErrors.endDate = '종료일은 시작일 이후여야 합니다.';
            }
        }

        // 참가자 수 검증
        {
            if (!maxParticipants || maxParticipants < 1) {
                newErrors.maxParticipants = '최대 참가자 수는 1명 이상이어야 합니다.';
            } else if (!isAdmin && licenseInfo.type === 'user' && maxParticipants > licenseInfo.count) {
                newErrors.maxParticipants = `등록 가능 사용자 수(${licenseInfo.count}개)를 초과할 수 없습니다.`;
            }
        }

        if (curriculumItems.length === 0) {
            newErrors.scenarios = '최소 1개 이상의 커리큘럼 아이템을 추가해주세요.';
        }

        if (visibility === 'private' && !password.trim()) {
            newErrors.password = '비공개 클래스는 비밀번호를 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        const finalOrganizationId = (isAdmin && openingOrganizationId !== 0) ? openingOrganizationId : (organizationId ? Number(organizationId) : undefined);

        if (!validateForm() || !finalOrganizationId) {
            if (!finalOrganizationId) alert('기관 정보가 없습니다.');
            return;
        }

        setIsSubmitting(true);

        try {
            const useMock = isFeatureEnabled('USE_MOCK_DATA');

            if (useMock) {
                // Mock behavior
                console.log('Mock: Creating class', {
                    className,
                    price: price,
                    visibility,
                    organizationId: finalOrganizationId
                });
                await new Promise(resolve => setTimeout(resolve, 1000));
                alert('클래스가 생성되었습니다! (Mock)');
                navigate(-1);
                return;
            }

            const requestData: CreateCourseRequestDto = {
                organizationId: finalOrganizationId,
                organizationLicenseIdList: [1], // TODO: 실제 라이선스 ID 연동 필요
                title: className,
                isPrivate: visibility === 'private',
                isOpenClass: isOpenClass,

                // Open Class Fields
                enrollmentType: showOfflineFields ? 'offline' : 'online',
                recruitmentStartDate: showOfflineFields ? inPersonRecruitmentStartDate : undefined,
                recruitmentEndDate: showOfflineFields ? inPersonRecruitmentEndDate : undefined,
                recruitmentCapacity: showOfflineFields ? inPersonRecruitmentCapacity : undefined,
                participationGuide: participationInfo,

                subscriptionStartDate: accessPeriodType === 'dates' ? accessStartDate : undefined,
                subscriptionEndDate: accessPeriodType === 'dates' ? accessEndDate : undefined,
                subscriptionPeriodDays: accessPeriodType === 'days' ? accessPeriod : undefined,

                price,
                discountPrice: discountType !== 'none' ? discountPrice : undefined,

                thumbnailImage: thumbnailMode === 'custom' ? (customThumbnail || undefined) : (selectedScenarioThumbnail || undefined),
                password: visibility === 'private' ? password : undefined,

                minPlayCount: completionRequirements.minScenarios,
                minPerfectCount: completionRequirements.requireAllScenarios ? curriculumItems.filter(item => item.type === 'scenario').length : undefined,

                scenarioList: curriculumItems
                    .filter(item => item.type === 'scenario')
                    .map((item, index) => ({
                        scenarioId: (item.data as ScenarioDetail).id,
                        order: index + 1
                    })),
                isActive
            };

            await courseService.createCourse(requestData);
            alert('클래스가 생성되었습니다!');
            navigate(-1);
        } catch (error) {
            console.error('Error creating class:', error);
            alert('마이클래스 생성 중 오류가 발생했습니다.');
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

    return (
        <CenteredPageLayout title="마이클래스 생성">
            <div className="space-y-6">
                <section className="bg-white rounded-lg border border-gray-400 shadow-sm space-y-2 px-6 py-4">

                    {/* 제휴기관 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                            제휴기관
                        </label>
                        <div className="flex-1 max-w-md">
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
                                className="w-1/2"
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

                    {/* 참가자 수 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                            참가자 수
                        </label>
                        <div className="flex-1">
                            <div className="flex items-center gap-6">
                                {!isAdmin && licenseInfo.type === 'user' && (
                                    <>
                                        <span className="text-sm text-gray-600 whitespace-nowrap">
                                            최대 <span className="font-bold text-gray-900 mx-1">{licenseInfo.count - licenseInfo.usedCount}</span>명 가능
                                        </span>
                                        <span className="text-gray-300">/</span>
                                    </>
                                )}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600 whitespace-nowrap">최대</span>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={maxParticipants}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxParticipants(parseInt(e.target.value) || 0)}
                                        wrapperClassName="w-24"
                                        className="text-right"
                                        suffix="명"
                                    />
                                </div>
                            </div>
                            {errors.maxParticipants && (
                                <p className="text-sm text-red-600 mt-2">{errors.maxParticipants}</p>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* 비밀번호 설정 */}
                    <div className="flex items-center gap-8">
                        <label className="text-sm font-medium text-gray-700 w-28 pt-2">
                            비밀번호
                        </label>
                        <div className="flex flex-col space-y-4 flex-1">
                            <ToggleLabel
                                checked={visibility === 'organization'}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVisibility(e.target.checked ? 'organization' : 'private')}
                                onLabel="사용안함 : 라이선스를 보유한 모든 사용자가 자유롭게 조회하고 참여할 수 있습니다."
                                offLabel="사용함 : 비밀번호를 입력한 사용자만 이 클래스에 참여할 수 있습니다."
                                size="sm"
                            />
                            {visibility === 'private' && (
                                <div className="mt-0 ml-11">
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                        placeholder="비밀번호 입력"
                                        className="w-1/3"
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

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
                                onLabel="활성 : 다른 사용자가 클래스를 조회하고 참여할 수 있습니다."
                                offLabel="비활성 : 클래스 사용이 중지됩니다."
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
                        {isSubmitting ? '생성 중...' : '저장'}
                    </Button>
                </div>
            </div>
        </CenteredPageLayout>
    );
}
