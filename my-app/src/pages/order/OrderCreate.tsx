import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, SimpleSelect, Checkbox } from '@/components/shared/ui';
import CenteredPageLayout from '@/components/shared/layout/CenteredPageLayout';
import { useClasses } from '../../data/queries/useClasses';
import { organizationService } from '../../services/organizationService';
import { useAuth } from '../../contexts/AuthContext';
import { isFeatureEnabled } from '../../config/featureFlags';
import { Plus, Trash2 } from 'lucide-react';

const SEARCH_DEBOUNCE_MS = 300;

interface OrganizationOption {
    id: number;
    title: string;
    isKhaRegularMember?: boolean;
}

interface AgencyOption {
    id: string;
    title: string;
}

const MOCK_AGENCIES: AgencyOption[] = [
    { id: '0', title: '본사' },
    { id: '1', title: '메디컬에듀 판매처' },
    { id: '2', title: '헬스케어솔루션' },
    { id: '3', title: '에듀테크코리아' },
    { id: '4', title: '메디컬파트너스' },
    { id: '5', title: '의료교육센터' },
];

export default function OrderCreate(): React.ReactElement {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const prefilledOrgId = searchParams.get('organizationId');
    const { user } = useAuth();
    const basePath = '/admin';

    const adminOrganizationId = user?.currentAccount?.organizationId;
    const { classes: productsData } = useClasses(adminOrganizationId);

    const [orgSearchQuery, setOrgSearchQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<OrganizationOption[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string>(prefilledOrgId || '');
    const [selectedOrgName, setSelectedOrgName] = useState<string>('');
    const [selectedOrg, setSelectedOrg] = useState<OrganizationOption | null>(null);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState<boolean>(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const [agencySearchQuery, setAgencySearchQuery] = useState<string>('본사');
    const [agencySuggestions, setAgencySuggestions] = useState<AgencyOption[]>([]);
    const [selectedAgencyId, setSelectedAgencyId] = useState<string>('0');
    const [selectedAgencyName, setSelectedAgencyName] = useState<string>('본사');
    const [isAgencySuggestionsOpen, setIsAgencySuggestionsOpen] = useState<boolean>(false);
    const agencySuggestionsRef = useRef<HTMLDivElement>(null);

    const [productType, setProductType] = useState<'DEFAULT' | '콘텐츠' | '상품' | '서비스'>('DEFAULT');
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [licenseType, setLicenseType] = useState<'USER' | 'DEVICE'>('USER');
    const [plan, setPlan] = useState<'BASIC' | 'PRO'>('BASIC');
    const [quantity, setQuantity] = useState<number>(10);
    const [validityPeriod, setValidityPeriod] = useState<number>(12);
    const [validityUnit, setValidityUnit] = useState<'MONTH' | 'YEAR'>('MONTH');
    const [inviteValidityPreset, setInviteValidityPreset] = useState<7 | 14 | 30 | 90 | 180 | 365 | 'custom'>(30);
    const [inviteValidityCustomDays, setInviteValidityCustomDays] = useState<string>('');
    const [openClassQuantity, setOpenClassQuantity] = useState<number>(1);
    const [unitPrice, setUnitPrice] = useState<number>(0);
    const [currency, setCurrency] = useState<'KRW' | 'USD'>('KRW');
    const [vatRate, setVatRate] = useState<number>(10);
    const [vatIncluded, setVatIncluded] = useState<boolean>(true);
    const [totalCostDirectInput, setTotalCostDirectInput] = useState<number>(0);
    const [orderNote, setOrderNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    type ProductOption = { id: string; name: string };
    type PeriodUnit = 'MONTH' | 'DAY';
    type OrderItemRow = { id: string; productId: string; optionId: string; period: number; periodUnit: PeriodUnit; quantity: number; unitPrice: number; costPrice?: number };
    const [orderItemRows, setOrderItemRows] = useState<OrderItemRow[]>([]);

    const productList = productsData
        ? (Array.isArray(productsData) ? productsData : Object.values(productsData))
        : [];

    const defaultProductOptionsByType: Record<string, ProductOption[]> = {
        콘텐츠: [
            { id: 'basic', name: 'Basic' },
            { id: 'pro', name: 'Pro' },
            { id: 'enterprise', name: 'Enterprise' },
            { id: 'default', name: '기본' },
        ],
        상품: [{ id: 'default', name: '기본' }],
        서비스: [{ id: 'default', name: '기본' }],
    };

    const getOptionsForProduct = (productId: string): ProductOption[] => {
        if (!productId) return [];
        const product = productList.find((p: any) => p.id?.toString() === productId);
        const options = (product as any)?.options;
        if (Array.isArray(options) && options.length > 0) {
            return options.map((o: any) => typeof o === 'object' && o?.id != null ? { id: String(o.id), name: String(o.name ?? o.title ?? o.id) } : { id: String(o), name: String(o) });
        }
        return defaultProductOptionsByType[productType] ?? [];
    };

    // 선택 기관 변경 시 대한병원협회 할인가 자동 적용/해제
    useEffect(() => {
        const isKhaMember = selectedOrg?.isKhaRegularMember ?? false;
        setOrderItemRows(prev => prev.map(r => {
            if (!r.productId) return r;
            const product = productList.find((p: any) => p.id?.toString() === r.productId) as any;
            if (!product || product.discountType !== 'hospital_association') return r;
            const fullPrice = product.price ?? 0;
            const discountAmount = product.discountPrice ?? 0;
            const discountedPrice = Math.max(0, fullPrice - discountAmount);
            const targetPrice = isKhaMember && discountAmount > 0 ? discountedPrice : fullPrice;
            return r.unitPrice === targetPrice ? r : { ...r, unitPrice: targetPrice };
        }));
    }, [selectedOrg?.isKhaRegularMember, selectedOrg?.id]);

    // prefilledOrgId가 있으면 해당 주문자(기관)명 로드
    useEffect(() => {
        if (!prefilledOrgId) return;
        let cancelled = false;
        const loadPrefilled = async () => {
            try {
                const response = await organizationService.getList({ page: 1, pageSize: 1000 });
                if (cancelled || !response?.organizationList) return;
                const org = response.organizationList.find(
                    o => o.organizationId.toString() === prefilledOrgId
                );
                if (org) {
                    setSelectedOrgName(org.title);
                    setOrgSearchQuery(org.title);
                    setSelectedOrg({
                        id: org.organizationId,
                        title: org.title,
                        isKhaRegularMember: (org as any).isKhaRegularMember ?? false
                    });
                }
            } catch (e) {
                console.error('Failed to load prefilled organization', e);
            }
        };
        loadPrefilled();
        return () => { cancelled = true; };
    }, [prefilledOrgId]);

    // 주문자명(기관명) 입력 시 디바운스 검색
    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
            return;
        }
        setIsLoadingSuggestions(true);
        try {
            const response = await organizationService.getList({
                page: 1,
                pageSize: 20,
                search: query.trim()
            });
            const list = response?.organizationList ?? [];
            setSuggestions(list.map(org => ({
                id: org.organizationId,
                title: org.title,
                isKhaRegularMember: (org as any).isKhaRegularMember ?? false
            })));
            setIsSuggestionsOpen(true);
        } catch (e) {
            console.error('Failed to search organizations', e);
            setSuggestions([]);
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, []);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = null;
        }
        if (!orgSearchQuery.trim()) {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
            return;
        }
        searchTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(orgSearchQuery);
        }, SEARCH_DEBOUNCE_MS);
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [orgSearchQuery, fetchSuggestions]);

    const filteredAgencySuggestions = useMemo(() => {
        if (!agencySearchQuery.trim()) return [];
        const q = agencySearchQuery.trim().toLowerCase();
        return MOCK_AGENCIES.filter((a) => a.title.toLowerCase().includes(q));
    }, [agencySearchQuery]);

    const handleSelectOrganization = (org: OrganizationOption) => {
        setSelectedOrgId(org.id.toString());
        setSelectedOrgName(org.title);
        setSelectedOrg(org);
        setOrgSearchQuery(org.title);
        setIsSuggestionsOpen(false);
    };

    const handleOrgInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setOrgSearchQuery(value);
        setSelectedOrgId('');
        setSelectedOrgName('');
        setSelectedOrg(null);
    };

    const handleAgencyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAgencySearchQuery(value);
        setSelectedAgencyId('');
        setSelectedAgencyName('');
    };

    const handleSelectAgency = (agency: AgencyOption) => {
        setSelectedAgencyId(agency.id);
        setSelectedAgencyName(agency.title);
        setAgencySearchQuery(agency.title);
        setIsAgencySuggestionsOpen(false);
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        const ordererName = selectedOrgName || orgSearchQuery.trim();
        if (!ordererName) newErrors.organization = '주문자명을 입력해주세요. (기관명 또는 사용자명)';

        if (productType !== 'DEFAULT') {
            if (orderItemRows.length === 0) {
                newErrors.items = '품목을 1개 이상 추가해주세요.';
            } else {
                const rowHasError = orderItemRows.some(
                    (row) =>
                        !row.productId ||
                        row.quantity < 1 ||
                        ((productType === '콘텐츠' || productType === '서비스') && row.period < 1)
                );
                if (rowHasError) newErrors.items = '각 품목의 프로덕트, 수량, 기간을 확인해주세요.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (productType === 'DEFAULT') return;
        if (!validateForm()) return;

        // TODO: 주문 API 연동 시 등록 처리
        setIsSubmitting(true);
        try {
            if (isFeatureEnabled('USE_MOCK_DATA')) {
                await new Promise(resolve => setTimeout(resolve, 600));
                alert('주문이 등록되었습니다. (Mock)');
                navigate(`${basePath}/order-management`);
            } else {
                alert('주문 API 연동이 준비되면 등록됩니다. 현재는 Mock 모드에서만 등록 가능합니다.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const ordererNameValue = selectedOrgName || orgSearchQuery.trim();
    const hasDraftContent = !!ordererNameValue || selectedProductId || orderItemRows.length > 0 || orderNote.trim();
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
        <CenteredPageLayout
            title="주문 생성"
            maxWidth="max-w-5xl"
        >
            <div className="space-y-6 mt-6">
                <section className="bg-white rounded-lg border border-gray-400 shadow-sm space-y-4 px-6 py-4">
                    {/* 주문자명: 기관명 또는 사용자명 (기관 검색 자동완성 또는 직접 입력) / 판매처 */}
                    <div className="flex items-start gap-4 flex-wrap">
                        <label className="text-sm font-medium text-gray-700 w-20 pt-2">주문자명</label>
                        <div className="flex-1 min-w-[200px] max-w-md relative" ref={suggestionsRef}>
                            <Input
                                type="text"
                                value={orgSearchQuery}
                                onChange={handleOrgInputChange}
                                onFocus={() => suggestions.length > 0 && setIsSuggestionsOpen(true)}
                                onBlur={() => {
                                    setTimeout(() => setIsSuggestionsOpen(false), 200);
                                }}
                                placeholder="기관명 또는 사용자명을 입력하세요"
                                wrapperClassName="w-full"
                                aria-autocomplete="list"
                                aria-expanded={isSuggestionsOpen}
                            />
                            {isLoadingSuggestions && (
                                <p className="text-xs text-gray-500 mt-1">검색 중...</p>
                            )}
                            {isSuggestionsOpen && suggestions.length > 0 && (
                                <div
                                    className="autocomplete-suggestions"
                                    role="listbox"
                                    aria-label="주문자(기관) 검색 결과"
                                >
                                    {suggestions.map((org) => (
                                        <div
                                            key={org.id}
                                            role="option"
                                            aria-selected={selectedOrgId === org.id.toString()}
                                            className="autocomplete-item"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleSelectOrganization(org);
                                            }}
                                        >
                                            {org.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isSuggestionsOpen && !isLoadingSuggestions && orgSearchQuery.trim() && suggestions.length === 0 && (
                                <div className="autocomplete-suggestions">
                                    <div className="autocomplete-item text-gray-500 cursor-default">
                                        검색 결과가 없습니다.
                                    </div>
                                </div>
                            )}
                            {errors.organization && (
                                <p className="text-sm text-red-600 mt-1">{errors.organization}</p>
                            )}
                        </div>
                        <label className="text-sm font-medium text-gray-700 w-20 pt-2">판매처</label>
                        <div className="flex-1 min-w-[200px] max-w-md relative" ref={agencySuggestionsRef}>
                            <Input
                                type="text"
                                value={agencySearchQuery}
                                onChange={handleAgencyInputChange}
                                onFocus={() => filteredAgencySuggestions.length > 0 && setIsAgencySuggestionsOpen(true)}
                                onBlur={() => {
                                    setTimeout(() => setIsAgencySuggestionsOpen(false), 200);
                                }}
                                placeholder="판매처를 입력하세요"
                                wrapperClassName="w-full"
                                aria-autocomplete="list"
                                aria-expanded={isAgencySuggestionsOpen}
                            />
                            {isAgencySuggestionsOpen && filteredAgencySuggestions.length > 0 && (
                                <div
                                    className="autocomplete-suggestions"
                                    role="listbox"
                                    aria-label="판매처 검색 결과"
                                >
                                    {filteredAgencySuggestions.map((agency) => (
                                        <div
                                            key={agency.id}
                                            role="option"
                                            aria-selected={selectedAgencyId === agency.id}
                                            className="autocomplete-item"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleSelectAgency(agency);
                                            }}
                                        >
                                            {agency.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isAgencySuggestionsOpen && agencySearchQuery.trim() && filteredAgencySuggestions.length === 0 && (
                                <div className="autocomplete-suggestions">
                                    <div className="autocomplete-item text-gray-500 cursor-default">
                                        검색 결과가 없습니다.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-200" />

                    {/* 프로덕트 유형 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-20 pt-2">프로덕트 유형</label>
                        <div className="flex flex-1 flex-wrap items-center justify-start gap-4">
                            <SimpleSelect
                                value={productType}
                                onChange={(e) => {
                                    setProductType(e.target.value as 'DEFAULT' | '콘텐츠' | '상품' | '서비스');
                                    setSelectedProductId('');
                                    setOrderItemRows([]);
                                }}
                                wrapperClassName="w-40"
                            >
                                <option value="DEFAULT">선택</option>
                                <option value="콘텐츠">콘텐츠</option>
                                <option value="상품">상품</option>
                                <option value="서비스">서비스</option>
                            </SimpleSelect>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="lightdark"
                                    size="sm"
                                    onClick={() => setOrderItemRows(prev => [...prev, { id: `item-${Date.now()}`, productId: '', optionId: productType === '콘텐츠' ? 'basic' : 'default', period: (productType === '콘텐츠' || productType === '서비스') ? 12 : 0, periodUnit: 'MONTH', quantity: 1, unitPrice: 0, costPrice: 0 }])}
                                >
                                    <Plus size={16} />
                                    품목 추가
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`${basePath}/product/create`)}
                                >
                                    <Plus size={16} />
                                    프로덕트 추가
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                                <label className="text-sm font-medium text-gray-700">통화 단위</label>
                                <SimpleSelect
                                    value={currency}
                                    onChange={(e) => {
                                        const c = e.target.value as 'KRW' | 'USD';
                                        setCurrency(c);
                                        setVatRate(c === 'KRW' ? 10 : 0);
                                    }}
                                    wrapperClassName="w-40"
                                >
                                    <option value="KRW">원 (VAT 10%)</option>
                                    <option value="USD">USD</option>
                                </SimpleSelect>
                            </div>
                        </div>
                    </div>

                    {/* 품목 카드 */}
                    {productType !== 'DEFAULT' && (
                        <div className="flex items-center gap-4">
                            <div className="flex-1 flex flex-col gap-4">
                            {errors.items && (
                                <p className="text-sm text-red-600">{errors.items}</p>
                            )}
                            {orderItemRows.length > 0 && (
                                <div className="space-y-2">
                                    {orderItemRows.map((row) => (
                                        <div key={row.id} className="flex flex-wrap items-end pb-2 gap-1 rounded border-b border-gray-200 overflow-hidden">
                                                <div className="min-w-[240px]">
                                                    <label className="text-sm font-medium text-gray-700 block mb-1">프로덕트</label>
                                                    <SimpleSelect
                                                        value={row.productId}
                                                        onChange={(e) => {
                                                            const newProductId = e.target.value;
                                                            const product = productList.find((p: any) => p.id?.toString() === newProductId) as any;
                                                            let newUnitPrice = 0;
                                                            if (product?.price != null) {
                                                                const isKhaMember = selectedOrg?.isKhaRegularMember ?? false;
                                                                const hasHospitalDiscount = product.discountType === 'hospital_association' && (product.discountPrice ?? 0) > 0;
                                                                if (isKhaMember && hasHospitalDiscount) {
                                                                    newUnitPrice = Math.max(0, (product.price ?? 0) - (product.discountPrice ?? 0));
                                                                } else {
                                                                    newUnitPrice = product.price ?? 0;
                                                                }
                                                            }
                                                            setOrderItemRows(prev => prev.map(r => r.id === row.id ? { ...r, productId: newProductId, unitPrice: newUnitPrice } : r));
                                                        }}
                                                        wrapperClassName="w-full"
                                                    >
                                                        <option value="">프로덕트명 선택</option>
                                                        {productList.map((p: any) => (
                                                            <option key={p.id} value={p.id}>{p.title}</option>
                                                        ))}
                                                    </SimpleSelect>
                                                </div>
                                                {/* 콘텐츠: 구독플랜/옵션 */}
                                                {productType === '콘텐츠' && (
                                                    <div className="min-w-[140px]">
                                                        <label className="text-sm font-medium text-gray-700 block mb-1">구독플랜</label>
                                                        <SimpleSelect
                                                            value={row.optionId}
                                                            onChange={(e) => setOrderItemRows(prev => prev.map(r => r.id === row.id ? { ...r, optionId: e.target.value } : r))}
                                                            wrapperClassName="w-full"
                                                        >
                                                            <option value="">선택</option>
                                                            {getOptionsForProduct(row.productId).map((opt) => (
                                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                                            ))}
                                                        </SimpleSelect>
                                                    </div>
                                                )}
                                                {/* 기간: 콘텐츠, 서비스 */}
                                                {(productType === '콘텐츠' || productType === '서비스') && (
                                                    <div className="flex items-end gap-1">
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700 block mb-1">기간</label>
                                                            <div className="flex items-center gap-1">
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    value={row.period}
                                                                    onChange={(e) => setOrderItemRows(prev => prev.map(r => r.id === row.id ? { ...r, period: parseInt(e.target.value) || 0 } : r))}
                                                                    wrapperClassName="w-16"
                                                                />
                                                                <SimpleSelect
                                                                    value={row.periodUnit}
                                                                    onChange={(e) => setOrderItemRows(prev => prev.map(r => r.id === row.id ? { ...r, periodUnit: e.target.value as PeriodUnit } : r))}
                                                                    wrapperClassName="w-20"
                                                                >
                                                                    <option value="MONTH">개월</option>
                                                                    <option value="DAY">일</option>
                                                                </SimpleSelect>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="w-20">
                                                    <label className="text-sm font-medium text-gray-700 block mb-1">수량</label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={row.quantity}
                                                        onChange={(e) => setOrderItemRows(prev => prev.map(r => r.id === row.id ? { ...r, quantity: parseInt(e.target.value) || 0 } : r))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 block mb-1">단가</label>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={row.unitPrice}
                                                        onChange={(e) => setOrderItemRows(prev => prev.map(r => r.id === row.id ? { ...r, unitPrice: parseFloat(e.target.value) || 0 } : r))}
                                                        wrapperClassName="w-28"
                                                        className="text-right"
                                                    />
                                                </div>
                                                {productType === '상품' && (
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 block mb-1">원가</label>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            value={row.costPrice ?? 0}
                                                            onChange={(e) => setOrderItemRows(prev => prev.map(r => r.id === row.id ? { ...r, costPrice: parseFloat(e.target.value) || 0 } : r))}
                                                            wrapperClassName="w-28"
                                                            className="text-right"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 block mb-1">금액</label>
                                                    <Input
                                                        type="text"
                                                        value={`${(row.quantity * row.unitPrice).toLocaleString()} ${currency === 'KRW' ? '원' : 'USD'}`}
                                                        disabled
                                                        readOnly
                                                        className="text-right"
                                                        wrapperClassName="font-semibold text-gray-900 bg-yellow-500/50 w-36"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ml-auto"
                                                    onClick={() => setOrderItemRows(prev => prev.filter(r => r.id !== row.id))}
                                                    aria-label="품목 삭제"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                    ))}

                                    <div className="flex items-center gap-4">
                                        {(() => {
                                            const totalSales = orderItemRows.reduce((s, r) => s + r.quantity * r.unitPrice, 0);
                                            const supplyValue = vatRate > 0 ? Math.round(totalSales / (1 + vatRate / 100)) : totalSales;
                                            const vatAmount = totalSales - supplyValue;
                                            const totalCost = productType === '상품'
                                                ? orderItemRows.reduce((s, r) => s + r.quantity * (r.costPrice ?? 0), 0)
                                                : totalCostDirectInput;
                                            const totalProfit = supplyValue - totalCost;
                                            const unit = currency === 'KRW' ? '원' : 'USD';
                                            const inputClass = 'text-right font-semibold text-gray-900 bg-yellow-500/50 w-42';
                                            return (
                                                <div className="flex flex-wrap items-end gap-3">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 block mb-1">총 판매가</label>
                                                        <Input
                                                            type="text"
                                                            value={`${totalSales.toLocaleString()} ${unit}`}
                                                            disabled
                                                            readOnly
                                                            className="text-right"
                                                            wrapperClassName={inputClass}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 block mb-1">총 원가</label>
                                                        {productType === '상품' ? (
                                                            <Input
                                                                type="text"
                                                                value={`${totalCost.toLocaleString()} ${unit}`}
                                                                disabled
                                                                readOnly
                                                                className="text-right"
                                                                wrapperClassName={inputClass}
                                                            />
                                                        ) : (
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                value={totalCostDirectInput}
                                                                onChange={(e) => setTotalCostDirectInput(parseFloat(e.target.value) || 0)}
                                                                className="text-right"
                                                                wrapperClassName={inputClass}
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 block mb-1">부가세</label>
                                                        <Input
                                                            type="text"
                                                            value={`${vatAmount.toLocaleString()} ${unit}`}
                                                            disabled
                                                            readOnly
                                                            className="text-right"
                                                            wrapperClassName={inputClass}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 block mb-1">총수익</label>
                                                        <Input
                                                            type="text"
                                                            value={`${totalProfit.toLocaleString()} ${unit}`}
                                                            disabled
                                                            readOnly
                                                            className="text-right"
                                                            wrapperClassName="text-right font-semibold text-gray-900 bg-blue-100 w-40"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>
                    )}

                    {productType !== 'DEFAULT' && (
                        <>
                    <div className="border-t border-gray-200" />

                    {/* 주문 비고 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-20 pt-2">비고</label>
                        <div className="flex-1">
                            <Input
                                multiline
                                value={orderNote}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrderNote(e.target.value)}
                                placeholder="주문 관련 메모 (선택)"
                                rows={2}
                            />
                        </div>
                    </div>
                        </>
                    )}

                </section>

                {productType !== 'DEFAULT' && (
                    <div className="flex justify-end gap-3 pb-8">
                        <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
                            취소
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? '등록 중...' : '주문 확인'}
                        </Button>
                    </div>
                )}
            </div>
        </CenteredPageLayout>
    );
}
