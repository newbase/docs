/**
 * 오픈클래스 생성 위저드
 * 한 페이지: 기관 선택(자동완성) + 제품 선택(목록 뷰) → 폼으로 이동
 */
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button, ComboBox, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/shared/ui';
import { CenteredPageLayout } from '@/components/shared/layout';
import { ClassItem } from '../../data/classes';
import { useClasses } from '../../data/queries/useClasses';
import { organizationService } from '../../services/organizationService';
import { mockOrganizationsForClassCreate } from '../../data/mock/classCreation';
import { ROUTES } from '@/lib/constants/routes';

type ProductWithMeta = ClassItem & {
    productType?: string;
    salesType?: string;
    priceUsd?: number;
};

function formatCreatedDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return dateStr.split('T')[0].replace(/-/g, '.');
}

function formatValidityPeriod(item: ClassItem): string {
    const period = item.participationPeriod;
    if (period?.startDate && period?.endDate) {
        return `${period.startDate.replace(/-/g, '.')} ~ ${period.endDate.replace(/-/g, '.')}`;
    }
    const start = item.courseStartDate;
    const end = item.courseEndDate;
    if (start && end) return `${start.replace(/-/g, '.')} ~ ${end.replace(/-/g, '.')}`;
    return '-';
}

interface OrganizationOption {
    id: number;
    title: string;
}

export default function OpenClassCreateWizard(): React.ReactElement {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const basePath = pathname.startsWith('/master') ? '/master' : '/admin';
    const openCreatePath = basePath === '/master' ? ROUTES.MASTER.OPEN_CLASS_CREATE : ROUTES.ADMIN.OPEN_CLASS_CREATE;

    const [organizationOptions, setOrganizationOptions] = useState<OrganizationOption[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string>('');
    const [selectedProductId, setSelectedProductId] = useState<string>('');

    const { classes: productsMap, loading: productsLoading } = useClasses(selectedOrgId || null);
    const productList: ClassItem[] = productsMap ? Object.values(productsMap) : [];

    /** 오픈클래스 프로덕트: 활성, 콘텐츠·서비스, 온라인 판매 */
    const openProductList = useMemo(() => {
        return productList.filter((item) => {
            if (item.isActive === false) return false;
            const pt = (item as ProductWithMeta).productType;
            const st = (item as ProductWithMeta).salesType;
            return (pt === '콘텐츠' || pt === '서비스') && st === 'online';
        });
    }, [productList]);

    const selectedProduct = useMemo(() => {
        if (!selectedProductId) return null;
        return openProductList.find((p) => p.id === selectedProductId) ?? null;
    }, [selectedProductId, openProductList]);

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const response = await organizationService.getList({ page: 1, pageSize: 1000 });
                if (response?.organizationList?.length) {
                    setOrganizationOptions(
                        response.organizationList.map((org) => ({
                            id: org.organizationId,
                            title: org.title,
                        }))
                    );
                } else {
                    setOrganizationOptions(
                        mockOrganizationsForClassCreate.map((org) => ({ id: org.organizationId, title: org.title }))
                    );
                }
            } catch (e) {
                console.error('Failed to fetch organizations', e);
                setOrganizationOptions(
                    mockOrganizationsForClassCreate.map((org) => ({ id: org.organizationId, title: org.title }))
                );
            }
        };
        fetchOrgs();
    }, []);

    const handleGoToForm = () => {
        if (!selectedProduct || !selectedOrgId) return;
        navigate(openCreatePath, {
            state: {
                selectedProduct,
                organizationId: selectedOrgId,
                participationType: 'online',
            },
            replace: true,
        });
    };

    const canGoToForm = !!selectedOrgId && !!selectedProductId;
    const isLoadingProducts = !!selectedOrgId && productsLoading;

    return (
        <CenteredPageLayout title="오픈클래스 생성">
            <div className="space-y-6">
                <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h2 className="text-sm font-medium text-gray-700 mb-4">기관 및 제품 선택</h2>
                    <p className="text-sm text-gray-500 mb-6">오픈클래스를 개설할 기관을 선택한 뒤, 제품 목록에서 제품을 선택하세요.</p>

                    <div className="max-w-xl mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">기관</label>
                        <ComboBox
                            placeholder="기관명 검색 또는 선택"
                            value={selectedOrgId ? String(selectedOrgId) : ''}
                            onValueChange={(val) => {
                                const found = organizationOptions.find((o) => String(o.id) === val);
                                if (found) {
                                    setSelectedOrgId(val);
                                    setSelectedProductId('');
                                } else if (val === '') {
                                    setSelectedOrgId('');
                                    setSelectedProductId('');
                                }
                            }}
                            options={organizationOptions.map((org) => ({ value: String(org.id), label: org.title }))}
                        />
                    </div>

                    <h3 className="text-sm font-medium text-gray-700 mb-3">제품 선택</h3>
                    {!selectedOrgId ? (
                        <p className="text-gray-500 py-6">기관을 먼저 선택해주세요.</p>
                    ) : isLoadingProducts ? (
                        <div className="flex items-center gap-2 py-6">
                            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                            <span className="text-sm text-gray-500">제품 목록을 불러오는 중...</span>
                        </div>
                    ) : openProductList.length === 0 ? (
                        <p className="text-gray-500 py-8">해당 기관의 오픈클래스 제품(온라인 판매, 활성)이 없습니다.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">프로덕트유형</TableHead>
                                        <TableHead>프로덕트명</TableHead>
                                        <TableHead className="text-center w-[180px]">유효기간</TableHead>
                                        <TableHead className="text-center w-[100px]">가격(원)</TableHead>
                                        <TableHead className="text-center w-[90px]">가격(USD)</TableHead>
                                        <TableHead className="text-center w-[120px]">제휴기관명</TableHead>
                                        <TableHead className="text-center w-[100px]">등록일</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {openProductList.map((product) => {
                                        const pt = (product as ProductWithMeta).productType ?? '-';
                                        const priceKrw = product.price ?? 0;
                                        const priceUsd = (product as ProductWithMeta).priceUsd ?? 0;
                                        const isSelected = selectedProductId === product.id;
                                        return (
                                            <TableRow
                                                key={product.id}
                                                className={`cursor-pointer transition-colors text-sm ${isSelected ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-50'}`}
                                                onClick={() => setSelectedProductId(product.id)}
                                            >
                                                <TableCell className="text-gray-600">{pt}</TableCell>
                                                <TableCell className="font-medium text-gray-900">{product.title}</TableCell>
                                                <TableCell className="text-center text-gray-600 text-xs">
                                                    {formatValidityPeriod(product)}
                                                </TableCell>
                                                <TableCell className="text-center text-gray-900">
                                                    {priceKrw > 0 ? priceKrw.toLocaleString() : '-'}
                                                </TableCell>
                                                <TableCell className="text-center text-gray-900">
                                                    {priceUsd > 0 ? priceUsd.toLocaleString() : '-'}
                                                </TableCell>
                                                <TableCell className="text-center text-gray-600">
                                                    {product.organizationName ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-center text-gray-600">
                                                    {formatCreatedDate(product.createdDate)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </section>

                <div className="flex justify-between">
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        취소
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleGoToForm}
                        disabled={!canGoToForm || isLoadingProducts}
                    >
                        클래스 생성 폼으로 이동
                    </Button>
                </div>
            </div>
        </CenteredPageLayout>
    );
}
