/**
 * Product Edit Page
 * ProductCreate와 동일한 폼 구조 적용
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, SimpleSelect, ComboBox } from '@/components/shared/ui';
import { Loader2 } from 'lucide-react';
import { CenteredPageLayout } from '@/components/shared/layout';
import CurriculumCreate from '../class/CurriculumCreate';
import { ToggleLabel } from '@/components/shared/ui/Toggle';
import { CurriculumItem, VideoLecture } from '../../types/curriculum';
import { scenarioDetails, ScenarioDetail } from '../../data/scenarioDetails';
import { ClassItem } from '../../data/classes';
import { courseService } from '../../services/courseService';
import { UpdateCourseRequestDto } from '../../types/api/course';
import { organizationService } from '../../services/organizationService';
import { useAuth } from '../../contexts/AuthContext';
import { useClasses, useClass } from '../../data/queries/useClasses';
import { useCountries } from '../../hooks/useOrganization';
import { isFeatureEnabled } from '../../config/featureFlags';
import { countryTypes } from '../../data/organizations';
interface CompletionRequirement {
    minScenarios: number;
    minPassingScore: number;
    requireAllScenarios: boolean;
}

interface OrganizationOption {
    id: number;
    title: string;
}

export default function ProductEdit(): React.ReactElement {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const organizationId = user?.currentAccount?.organizationId;
    const { classData, loading: isLoadingData } = useClass(id);
    const { classes } = useClasses(organizationId);
    const { data: countriesData } = useCountries();

    const PRODUCT_TYPE_OPTIONS = ['콘텐츠', '상품', '서비스'];

    // Form state (ProductCreate와 동일)
    const [productType, setProductType] = useState<string>('');
    const [className, setClassName] = useState('');
    const [description, setDescription] = useState('');
    const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
    const [licenseType, setLicenseType] = useState<'device' | 'user'>('device');
    const [premiumScenarioCreate, setPremiumScenarioCreate] = useState<boolean>(false);
    const [premiumScenarioEdit, setPremiumScenarioEdit] = useState<boolean>(false);
    const [premiumAiChat, setPremiumAiChat] = useState<boolean>(false);
    const [orderNotes, setOrderNotes] = useState('');
    const [supplier, setSupplier] = useState('');
    const [costKrw, setCostKrw] = useState<number>(0);
    const [costUsd, setCostUsd] = useState<number>(0);
    const [faceToFaceValidityValue, setFaceToFaceValidityValue] = useState<number>(0);
    const [faceToFaceValidityUnit, setFaceToFaceValidityUnit] = useState<'days' | 'months'>('days');
    const [recruitmentStartDate, setRecruitmentStartDate] = useState<string>('');
    const [recruitmentEndDate, setRecruitmentEndDate] = useState<string>('');
    const [recruitmentCapacity, setRecruitmentCapacity] = useState<number>(0);
    const [participationGuide, setParticipationGuide] = useState('');
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

    useEffect(() => { fetchOrganizations(); }, [fetchOrganizations]);

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
        if (match) setDescription(match.description || '');
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

    // Load initial data from classData
    useEffect(() => {
        if (!classData) return;
        const d = classData as ClassItem & { productType?: string; salesType?: string; priceUsd?: number; organizationName?: string; publicCountries?: string[] };
        setProductType(d.productType ?? '');
        setClassName(d.title ?? '');
        setDescription(d.description ?? '');
        setOrganizationName(d.organizationName ?? '뉴베이스');
        setSalesType((d.salesType as 'online' | 'agency') ?? 'agency');
        setPriceKrw(d.price ?? d.discountPrice ?? 0);
        setPriceUsd(d.priceUsd ?? 0);
        setCostKrw((d as ClassItem & { costKrw?: number }).costKrw ?? 0);
        setCostUsd((d as ClassItem & { costUsd?: number }).costUsd ?? 0);
        setDiscountPrice(d.discountPrice ?? 0);
        setDiscountType(d.discountType ?? 'none');
        setAffiliateSellerName((d as ClassItem & { affiliateSellerName?: string }).affiliateSellerName ?? '');
        setAffiliateCommissionRate((d as ClassItem & { affiliateCommissionRate?: number }).affiliateCommissionRate ?? 0);
        setPublicCountries(d.publicCountries ?? []);
        setOrderNotes((d as ClassItem & { orderNotes?: string }).orderNotes ?? '');
        setSupplier((d as ClassItem & { supplier?: string }).supplier ?? '');
        const ap = (d as ClassItem & { accessPeriod?: number }).accessPeriod;
        const vpm = (d as ClassItem & { validityPeriodMonths?: number }).validityPeriodMonths;
        if (vpm && vpm > 0) {
            setValidityPeriodValue(vpm);
            setValidityPeriodUnit('months');
        } else {
            setValidityPeriodValue(ap ?? 30);
            setValidityPeriodUnit('days');
        }
        const ffap = (d as ClassItem & { faceToFaceAccessPeriod?: number }).faceToFaceAccessPeriod;
        if (ffap && ffap > 0) {
            setFaceToFaceValidityValue(ffap);
            setFaceToFaceValidityUnit('days');
        } else {
            setFaceToFaceValidityValue(0);
            setFaceToFaceValidityUnit('days');
        }
        setRecruitmentStartDate((d as ClassItem & { recruitmentStartDate?: string }).recruitmentStartDate ?? '');
        setRecruitmentEndDate((d as ClassItem & { recruitmentEndDate?: string }).recruitmentEndDate ?? '');
        setRecruitmentCapacity((d as ClassItem & { recruitmentCapacity?: number }).recruitmentCapacity ?? 0);
        setParticipationGuide((d as ClassItem & { participationGuide?: string }).participationGuide ?? '');
        if (d.completionRequirements) {
            setCompletionRequirements(d.completionRequirements);
        }
        setIsActive(d.isActive !== false);

        const initialItems: CurriculumItem[] = (d.curriculum || []).map(item => {
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
                data: detail || {
                    id: item.id,
                    title: item.name,
                    duration: item.duration,
                    platform: item.platform,
                    ContributedBy: item.author || 'Medicrew',
                } as any
            };
        });
        setCurriculumItems(initialItems);
    }, [classData]);

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
            if ((priceKrw === undefined || priceKrw < 0) && (priceUsd === undefined || priceUsd < 0)) newErrors.priceKrw = '가격을 입력해주세요.';
            if (validityPeriodValue < 1) newErrors.validityPeriod = '유효기간은 1 이상이어야 합니다.';
            if (discountType !== 'none' && discountPrice > priceKrw) newErrors.discountPrice = '할인가는 가격보다 클 수 없습니다.';
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
        if (!validateForm() || !organizationId || !id) {
            if (!organizationId) alert('기관 정보가 없습니다.');
            return;
        }
        setIsSubmitting(true);
        try {
            if (isFeatureEnabled('USE_MOCK_DATA')) {
                await new Promise(r => setTimeout(r, 1000));
                alert('제품 정보가 수정되었습니다! (Mock)');
                navigate(-1);
                return;
            }

            const isFaceToFace = productType === '서비스' && salesType === 'online';

            const requestData: UpdateCourseRequestDto = {
                title: className,
                isPrivate: publicCountries.length > 0,
                price: priceKrw > 0 ? priceKrw : undefined,
                discountPrice: discountType !== 'none' ? discountPrice : undefined,
                minPlayCount: productType === '콘텐츠' ? completionRequirements.minScenarios : undefined,
                scenarioList: curriculumItems
                    .filter(item => item.type === 'scenario')
                    .map((item, index) => ({
                        scenarioId: (item.data as ScenarioDetail).id,
                        order: index + 1
                    })),
                isActive,

                // 콘텐츠: 유효기간
                ...(productType === '콘텐츠' && validityPeriodValue > 0 && {
                    subscriptionPeriodDays: validityPeriodUnit === 'days' ? validityPeriodValue : validityPeriodValue * 30
                }),

                // 서비스+온라인(대면교육): 모집/수강 정보
                ...(isFaceToFace && {
                    enrollmentType: 'offline' as const,
                    recruitmentStartDate: recruitmentStartDate || undefined,
                    recruitmentEndDate: recruitmentEndDate || undefined,
                    recruitmentCapacity: recruitmentCapacity > 0 ? recruitmentCapacity : undefined,
                    participationGuide: participationGuide || undefined,
                    subscriptionPeriodDays: faceToFaceValidityValue > 0
                        ? (faceToFaceValidityUnit === 'days' ? faceToFaceValidityValue : faceToFaceValidityValue * 30)
                        : undefined
                })
            };

            await courseService.updateCourse(parseInt(id), requestData);
            alert('제품 정보가 수정되었습니다!');
            navigate(-1);
        } catch (error) {
            console.error('Error updating product:', error);
            alert('제품 수정 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('수정 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
            navigate(-1);
        }
    };

    if (isLoadingData) {
        return (
            <CenteredPageLayout title="프로덕트 수정">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-500">제품 정보를 불러오는 중입니다...</p>
                </div>
            </CenteredPageLayout>
        );
    }

    if (!classData && !isLoadingData) {
        return (
            <CenteredPageLayout title="프로덕트 수정">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <p className="text-red-500 font-medium">제품 정보를 찾을 수 없습니다.</p>
                    <Button onClick={() => navigate(-1)}>목록으로 돌아가기</Button>
                </div>
            </CenteredPageLayout>
        );
    }

    return (
        <CenteredPageLayout title="프로덕트 수정">
            <div className="space-y-6">
                <section className="bg-white rounded-lg border border-gray-400 shadow-sm space-y-2 px-6 py-4">

                    {/* 프로덕트 유형 / 판매유형 (필수, 수정 불가) */}
                    <div className="flex flex-wrap items-center gap-2 gap-y-4">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700 w-32"><span className="text-red-500">*</span> 프로덕트 유형</label>
                            <SimpleSelect value={productType} onChange={() => {}} disabled wrapperClassName="w-40" error={errors.productType}>
                                <option value="">선택</option>
                                {PRODUCT_TYPE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                            </SimpleSelect>
                        </div>
                        {productType && (
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 w-20"><span className="text-red-500">*</span> 판매유형</label>
                                <SimpleSelect value={salesType} onChange={() => {}} disabled wrapperClassName="w-40" error={errors.salesType}>
                                    <option value="online">온라인 판매</option>
                                    <option value="agency">기관판매</option>
                                </SimpleSelect>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* 기관명 (필수, 수정 불가) */}
                    {productType && (
                        <>
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2"><span className="text-red-500">*</span> 기관명</label>
                                <div className="flex-1 max-w-sm">
                                    <ComboBox placeholder="기관명" value={organizationName} onValueChange={() => {}} options={organizationOptions.map(org => ({ value: org.title, label: org.title }))} disabled />
                                    {errors.organizationName && <p className="text-sm text-red-600 mt-1">{errors.organizationName}</p>}
                                </div>
                            </div>
                            <div className="border-t border-gray-200"></div>
                        </>
                    )}

                    {/* 제품명 (필수, 수정 불가) */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2"><span className="text-red-500">*</span> 제품명</label>
                        <div className="flex-1 max-w-md">
                            <ComboBox placeholder="제품명" value={className} onValueChange={() => {}} options={productNameOptions} disabled />
                            {errors.className && <p className="text-sm text-red-600 mt-2">{errors.className}</p>}
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>

                    {/* 소개 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">소개</label>
                        <div className="flex-1">
                            <Input multiline value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} placeholder="내용을 입력하세요" rows={5} />
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>

                    {/* 공급처: 상품만 */}
                    {productType === '상품' && (
                        <>
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">공급처</label>
                                <div className="flex-1 max-w-sm">
                                    <ComboBox placeholder="공급처 검색 또는 입력" value={supplier} onValueChange={setSupplier} options={organizationOptions.map(org => ({ value: org.title, label: org.title }))} />
                                </div>
                            </div>
                            <div className="border-t border-gray-200"></div>
                        </>
                    )}

                    {/* 커리큘럼: 상품 제외 */}
                    {productType !== '상품' && (
                        <>
                            <CurriculumCreate items={curriculumItems} onItemsChange={setCurriculumItems} error={errors.scenarios} hideEditCompleteAndReset />
                            <div className="border-t border-gray-200"></div>
                        </>
                    )}

                    {/* 썸네일 이미지: 항상 입력 가능 */}
                    {productType && (
                        <>
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">썸네일 이미지</label>
                                <div className="flex-1">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="thumbnailMode" value="custom" checked={thumbnailMode === 'custom'} onChange={() => setThumbnailMode('custom')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                                <span className="text-sm text-gray-700">직접 업로드</span>
                                            </label>
                                            {productType !== '상품' && (
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="thumbnailMode" value="scenario" checked={thumbnailMode === 'scenario'} onChange={() => setThumbnailMode('scenario')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                                    <span className="text-sm text-gray-700">시나리오 이미지 선택</span>
                                                </label>
                                            )}
                                        </div>
                                        {thumbnailMode === 'custom' ? (
                                            <div className="flex items-start gap-4">
                                                <div className="w-32 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                                                    {customThumbnail ? <img src={customThumbnail} alt="Thumbnail" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">이미지 없음</span>}
                                                </div>
                                                <div>
                                                    <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                                    <p className="mt-1 text-xs text-gray-500">권장: 1280x720px (JPG, PNG)</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {scenarioImages.length > 0 ? (
                                                    <div className="grid grid-cols-5 gap-3 max-h-60 overflow-y-auto pr-2">
                                                        {scenarioImages.map((img) => (
                                                            <div key={img.id} onClick={() => setSelectedScenarioThumbnail(img.image)} className={`cursor-pointer rounded-lg overflow-hidden border-2 relative group ${selectedScenarioThumbnail === img.image ? 'border-blue-500' : 'border-transparent'}`}>
                                                                <div className="aspect-video bg-gray-100">
                                                                    <img src={img.image || ''} alt={img.title} className="w-full h-full object-cover" />
                                                                </div>
                                                                {selectedScenarioThumbnail === img.image && <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg text-center border border-dashed border-gray-200">커리큘럼에 시나리오를 먼저 추가해주세요.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200"></div>
                        </>
                    )}

                    {/* 이수조건, 프리미엄, 수강기간/라이선스: 콘텐츠만 */}
                    {productType === '콘텐츠' && (
                        <>
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">이수조건</label>
                                <div className="flex-1">
                                    <div className="space-y-1">
                                        <label className="flex items-center mb-2 gap-2 cursor-pointer">
                                            <input type="checkbox" checked={completionRequirements.requireAllScenarios} onChange={(e) => setCompletionRequirements({ ...completionRequirements, requireAllScenarios: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                            <span className="text-sm text-gray-700">모든 시나리오 완료 필수</span>
                                        </label>
                                        {!completionRequirements.requireAllScenarios && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-48 text-sm text-gray-600">최소 완료 시나리오 수</span>
                                                <Input type="number" min={1} max={(curriculumItems?.length) || 1} value={completionRequirements.minScenarios} onChange={(e) => setCompletionRequirements({ ...completionRequirements, minScenarios: parseInt(e.target.value) || 1 })} wrapperClassName="w-20" suffix="개" />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="w-48 text-sm text-gray-600">최소 합격 점수(%)</span>
                                            <Input type="number" min={0} max={100} value={completionRequirements.minPassingScore} onChange={(e) => setCompletionRequirements({ ...completionRequirements, minPassingScore: parseInt(e.target.value) || 0 })} wrapperClassName="w-20" suffix="%" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200"></div>

                            {/* 프리미엄 서비스 */}
                            {(productType as string) !== '상품' && (
                                <div className="flex items-start py-2 gap-4">
                                    <label className="text-sm font-medium text-gray-700 w-32">프리미엄 서비스</label>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={premiumScenarioCreate} onChange={(e) => setPremiumScenarioCreate(e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                            <span className="text-sm text-gray-700">시나리오 생성</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={premiumScenarioEdit} onChange={(e) => setPremiumScenarioEdit(e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                            <span className="text-sm text-gray-700">시나리오 수정</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={premiumAiChat} onChange={(e) => setPremiumAiChat(e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
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
                                    <Input type="number" min={1} value={validityPeriodValue} onChange={(e) => setValidityPeriodValue(parseInt(e.target.value) || 0)} wrapperClassName="w-24" className="text-right h-9" />
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

                    {/* 대면교육: 서비스 + 온라인 */}
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

                    {/* 가격, 원가 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">가격</label>
                        <div className="flex-1 flex flex-wrap items-center gap-4">
                            <Input type="number" min={0} value={priceKrw || ''} onChange={(e) => setPriceKrw(parseFloat(e.target.value) || 0)} wrapperClassName="w-36" className="text-right" suffix="원" />
                            <Input type="number" min={0} value={priceUsd || ''} onChange={(e) => setPriceUsd(parseFloat(e.target.value) || 0)} wrapperClassName="w-36" className="text-right" suffix="USD" />
                            {errors.priceKrw && <p className="text-sm text-red-600 ml-2">{errors.priceKrw}</p>}
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">원가</label>
                        <div className="flex-1 flex flex-wrap items-center gap-4">
                            <Input type="number" min={0} value={costKrw || ''} onChange={(e) => setCostKrw(parseFloat(e.target.value) || 0)} wrapperClassName="w-36" className="text-right" suffix="원" />
                            <Input type="number" min={0} value={costUsd || ''} onChange={(e) => setCostUsd(parseFloat(e.target.value) || 0)} wrapperClassName="w-36" className="text-right" suffix="USD" />
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>

                    {/* 할인 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">할인가</label>
                        <div className="flex flex-wrap items-center gap-4">
                            <SimpleSelect value={discountType} onChange={(e) => setDiscountType(e.target.value as 'none' | 'hospital_association' | 'event')} wrapperClassName="w-48">
                                <option value="none">적용안함</option>
                                <option value="hospital_association">대한병원협회 할인</option>
                                <option value="event">이벤트 할인</option>
                            </SimpleSelect>
                            {discountType !== 'none' && (
                                <div className="flex items-center gap-4">
                                    <Input type="number" min={0} value={discountPrice} onChange={(e) => setDiscountPrice(parseInt(e.target.value) || 0)} wrapperClassName="w-40" className="text-right" suffix="원" />
                                    <Input type="number" min={0} value={discountPriceUsd || ''} onChange={(e) => setDiscountPriceUsd(parseFloat(e.target.value) || 0)} wrapperClassName="w-36" className="text-right" suffix="USD" />
                                    {priceKrw > 0 && discountPrice > 0 && <span className="text-xs text-brand-600 font-medium">실제 참가비: {(priceKrw - discountPrice).toLocaleString()}원</span>}
                                    <Input type="text" value={discountCondition} onChange={(e) => setDiscountCondition(e.target.value)} placeholder="할인조건" wrapperClassName="w-60" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>

                    {/* 제휴기관 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">제휴기관</label>
                        <div className="flex-1 flex flex-wrap items-center gap-6">
                            <SimpleSelect value={affiliateSellerName} onChange={(e) => setAffiliateSellerName(e.target.value)} wrapperClassName="w-48">
                                <option value="">제휴기관 없음</option>
                                {organizationOptions.map((org) => <option key={org.id} value={org.title}>{org.title}</option>)}
                            </SimpleSelect>
                            {affiliateSellerName && (
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">수수료율</label>
                                    <Input type="number" min={0} max={100} value={affiliateCommissionRate || ''} onChange={() => {}} disabled wrapperClassName="w-24" className="text-right" suffix="%" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>

                    {/* 공개범위: 온라인판매인 경우에만 */}
                    {salesType === 'online' && (
                        <>
                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium text-gray-700 w-32 pt-2">공개범위지정</label>
                                <div className="flex-1 flex flex-col gap-2">
                                    <p className="text-xs text-gray-500">아무것도 입력하지 않으면 모두 공개됩니다.</p>
                                    <div className="max-w-md">
                                        <ComboBox placeholder="국가명 검색 또는 입력" value={publicCountryInput} onValueChange={handlePublicCountryChange} options={countryOptions.filter(o => !publicCountries.includes(o.value))} />
                                    </div>
                                    {publicCountries.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {publicCountries.map((c) => (
                                                <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-sm text-gray-800">
                                                    {c}
                                                    <button type="button" onClick={() => setPublicCountries(prev => prev.filter(x => x !== c))} className="text-gray-500 hover:text-gray-700" aria-label={`${c} 제거`}>×</button>
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
                        <label className="text-sm font-medium text-gray-700 w-28 pt-2">활성 여부</label>
                        <ToggleLabel checked={isActive} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsActive(e.target.checked)} onLabel="활성" offLabel="비활성" size="sm" />
                    </div>
                    <div className="border-t border-gray-200"></div>

                    {/* 비고 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">비고</label>
                        <div className="flex-1">
                            <Input multiline rows={3} value={orderNotes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrderNotes(e.target.value)} placeholder="주문 관련 비고 사항을 입력하세요" className="w-full" />
                        </div>
                    </div>
                </section>

                <div className="flex justify-end gap-3 pb-8">
                    <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>취소</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? '수정 중...' : '저장'}</Button>
                </div>
            </div>
        </CenteredPageLayout>
    );
}
