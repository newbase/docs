import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Badge, Checkbox, SimpleSelect, ComboBox } from '@/components/shared/ui';
import { Loader2, Users, Edit, Copy, Share2, ShoppingCart } from 'lucide-react';
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
import { useClass } from '../../data/queries/useClasses';

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

export default function MyClassEdit(): React.ReactElement {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getLicenseInfo, getCurrentRole, user } = useAuth();
    const licenseInfo = getLicenseInfo();
    const isAdmin = getCurrentRole() === 'admin';
    const organizationId = user?.currentAccount?.organizationId;

    const { classData, loading: isLoadingData } = useClass(id);

    // Form state
    const today = new Date().toISOString().split('T')[0];
    const [partnerOrganization, setPartnerOrganization] = useState('');
    const [className, setClassName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [maxParticipants, setMaxParticipants] = useState<number>(30);
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
    const [participationMethod, setParticipationMethod] = useState<'online' | 'offline'>('online');
    const [organizationOptions, setOrganizationOptions] = useState<OrganizationOption[]>([]);

    // Online participation specific state
    const [accessPeriod, setAccessPeriod] = useState<number>(30);
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
    const [affiliateOrg, setAffiliateOrg] = useState('');
    const [discountCondition, setDiscountCondition] = useState('');

    // Thumbnail state
    const [thumbnailMode, setThumbnailMode] = useState<'custom' | 'scenario'>('custom');
    const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
    const [selectedScenarioThumbnail, setSelectedScenarioThumbnail] = useState<string | null>(null);

    // Admin-specific state
    const [saleStatus, setSaleStatus] = useState<'available' | 'unavailable'>('available');

    // In-person participation state
    const [inPersonParticipationMethod, setInPersonParticipationMethod] = useState<'offline' | 'online'>('online');
    const [inPersonRecruitmentStartDate, setInPersonRecruitmentStartDate] = useState(today);
    const [inPersonRecruitmentEndDate, setInPersonRecruitmentEndDate] = useState(today);
    const [inPersonRecruitmentCapacity, setInPersonRecruitmentCapacity] = useState<number>(30);
    const [inPersonGuide, setInPersonGuide] = useState('');

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
                }
            } catch (e) {
                console.error("Failed to fetch organizations", e);
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

            if (classData.maxParticipants) {
                setMaxParticipants(classData.maxParticipants);
            }

            setVisibility(classData.password ? 'private' : 'organization');

            if ((classData as any).isOpenClass !== undefined) {
                setIsOpenClass((classData as any).isOpenClass);
            }

            if (classData.password) {
                setPassword(classData.password);
            }

            if (classData.completionRequirements) {
                setCompletionRequirements(classData.completionRequirements);
            }

            // Map curriculum items
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
                            author: {
                                name: item.author || 'Unknown',
                                type: item.authorType || 'individual'
                            },
                            description: ''
                        } as VideoLecture
                    };
                } else {
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
                        } as any
                    };
                }
            });
            setCurriculumItems(initialItems);

            // Mock other data if it's missing in ClassItem but needed for the form
            // In a real app, ClassItem would have all these fields or we'd fetch an UpdateDto
            setIsActive(true);
            setIsOnlineSale(classData.price !== undefined);
            setPrice(classData.price || 0);
            setDiscountPrice(classData.discountPrice || 0);
        }
    }, [classData]);

    const handleCountryChange = (selectedCountry: string) => {
        setCountry(selectedCountry);
        setCurrency(CURRENCY_MAP[selectedCountry] || '원');
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!className.trim()) {
            newErrors.className = '클래스명을 입력해주세요.';
        }

        if (price === undefined || price < 0) {
            newErrors.price = '참가비를 입력해주세요.';
        }

        if (inPersonParticipationMethod === 'offline') {
            if (!inPersonRecruitmentStartDate) newErrors.inPersonRecruitmentStartDate = '모집 시작일을 입력해주세요.';
            if (!inPersonRecruitmentEndDate) newErrors.inPersonRecruitmentEndDate = '모집 종료일을 입력해주세요.';
            if (inPersonRecruitmentStartDate && inPersonRecruitmentEndDate && new Date(inPersonRecruitmentStartDate) > new Date(inPersonRecruitmentEndDate)) {
                newErrors.inPersonRecruitmentEndDate = '모집 종료일은 시작일 이후여야 합니다.';
            }
            if (!inPersonRecruitmentCapacity || inPersonRecruitmentCapacity < 1) {
                newErrors.inPersonRecruitmentCapacity = '모집인원은 1명 이상이어야 합니다.';
            }
            if (!inPersonGuide.trim()) newErrors.inPersonGuide = '참여안내를 입력해주세요.';
        }

        if (!startDate) newErrors.startDate = '시작일을 선택해주세요.';
        if (!endDate) newErrors.endDate = '종료일을 선택해주세요.';
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            newErrors.endDate = '종료일은 시작일 이후여야 합니다.';
        }

        if (!maxParticipants || maxParticipants < 1) {
            newErrors.maxParticipants = '최대 참가자 수는 1명 이상이어야 합니다.';
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
        if (!validateForm() || !organizationId || !id) {
            if (!organizationId) alert('기관 정보가 없습니다.');
            return;
        }

        setIsSubmitting(true);

        try {
            const useMock = isFeatureEnabled('USE_MOCK_DATA');

            if (useMock) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                alert('클래스 정보가 수정되었습니다! (Mock)');
                navigate(-1);
                return;
            }

            const requestData: UpdateCourseRequestDto = {
                title: className,
                isPrivate: visibility === 'private',
                isOpenClass: isOpenClass,

                enrollmentType: inPersonParticipationMethod,
                recruitmentStartDate: inPersonParticipationMethod === 'offline' ? inPersonRecruitmentStartDate : undefined,
                recruitmentEndDate: inPersonParticipationMethod === 'offline' ? inPersonRecruitmentEndDate : undefined,
                recruitmentCapacity: inPersonParticipationMethod === 'offline' ? inPersonRecruitmentCapacity : undefined,
                participationGuide: inPersonGuide,

                subscriptionStartDate: startDate,
                subscriptionEndDate: endDate,

                price: price,

                thumbnailImage: thumbnailMode === 'custom' ? (customThumbnail || undefined) : (selectedScenarioThumbnail || undefined),
                password: visibility === 'private' ? password : undefined,

                minPlayCount: completionRequirements.minScenarios,
                minPerfectCount: completionRequirements.requireAllScenarios ? curriculumItems.filter(item => item.type === 'scenario').length : undefined,

                scenarioList: curriculumItems
                    .filter(item => item.type === 'scenario')
                    .map((item, index) => ({
                        scenarioId: (item.data as ScenarioDetail).id,
                        order: index + 1
                    }))
            };

            await courseService.updateCourse(parseInt(id), requestData);
            alert('클래스 정보가 수정되었습니다!');
            navigate(-1);
        } catch (error) {
            console.error('Error updating class:', error);
            alert('마이클래스 수정 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        if (!window.confirm('정말로 이 클래스를 삭제하시겠습니까? 삭제된 클래스는 복구할 수 없습니다.')) {
            return;
        }

        setIsSubmitting(true);
        try {
            const useMock = isFeatureEnabled('USE_MOCK_DATA');
            if (useMock) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                alert('클래스가 삭제되었습니다! (Mock)');
                navigate(-1);
                return;
            }

            await courseService.deleteCourse(parseInt(id));
            alert('클래스가 삭제되었습니다.');
            navigate(-1);
        } catch (error) {
            console.error('Failed to delete class', error);
            alert('클래스 삭제 중 오류가 발생했습니다.');
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (isLoadingData) {
        return (
            <CenteredPageLayout title="마이클래스 수정">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-500">클래스 정보를 불러오는 중입니다...</p>
                </div>
            </CenteredPageLayout>
        );
    }

    if (!classData && !isLoadingData) {
        return (
            <CenteredPageLayout title="마이클래스 수정">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <p className="text-red-500 font-medium">클래스 정보를 찾을 수 없습니다.</p>
                    <Button onClick={() => navigate(-1)}>목록으로 돌아가기</Button>
                </div>
            </CenteredPageLayout>
        );
    }

    const scenarioImages = (curriculumItems || [])
        .filter(item => item?.type === 'scenario')
        .map(item => {
            const scenario = item?.data as ScenarioDetail;
            if (!scenario) return { id: '', title: '', image: null };
            const image = scenario.simulationExamples?.[0]?.image;
            return {
                id: scenario.id,
                title: scenario.title,
                image: image
            };
        })
        .filter(item => item && item.image);

    return (
        <CenteredPageLayout title="마이클래스 수정">
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
                    />

                    <div className="border-t border-gray-200"></div>

                    {/* 이수조건 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                            이수조건
                        </label>
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
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompletionRequirements({
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
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setCustomThumbnail(reader.result as string);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
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
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* 공개설정 */}
                    <div className="flex items-center gap-8">
                        <label className="text-sm font-medium text-gray-700 w-28 pt-2">
                            공개설정
                        </label>
                        <div className="flex flex-col space-y-4 flex-1">
                            <ToggleLabel
                                checked={visibility === 'organization'}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVisibility(e.target.checked ? 'organization' : 'private')}
                                onLabel="공개"
                                offLabel="비공개"
                                size="sm"
                            />
                        </div>
                    </div>
                </section>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pb-8">
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                    >
                        삭제
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
                            취소
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? '수정 중...' : '수정 완료'}
                        </Button>
                    </div>
                </div>
            </div>
        </CenteredPageLayout>
    );
}
