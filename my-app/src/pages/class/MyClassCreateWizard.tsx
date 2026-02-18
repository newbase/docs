/**
 * 마이클래스(기관클래스) 생성 위저드
 * 1. 기관 선택 → 2. 기관판매 프로덕트 목록 조회 및 선택 → 폼으로 이동(프로덕트 교육정보 불러오기)
 */
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button, SimpleSelect } from '@/components/shared/ui';
import { CenteredPageLayout } from '@/components/shared/layout';
import { ClassItem } from '../../data/classes';
import { useClasses } from '../../data/queries/useClasses';
import { organizationService } from '../../services/organizationService';
import { mockOrganizationsForClassCreate } from '../../data/mock/classCreation';
import { ROUTES } from '@/lib/constants/routes';

type ProductWithMeta = ClassItem & { productType?: string; salesType?: string };

function formatCreatedDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return dateStr.split('T')[0].replace(/-/g, '.');
}

interface OrganizationOption {
    id: number;
    title: string;
}

export default function MyClassCreateWizard(): React.ReactElement {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const basePath = pathname.startsWith('/master') ? '/master' : '/admin';
    const orgCreatePath = basePath === '/master' ? ROUTES.MASTER.CLASS_CREATE_ORGANIZATION : ROUTES.ADMIN.CLASS_CREATE_ORGANIZATION;

    const [organizationOptions, setOrganizationOptions] = useState<OrganizationOption[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string>('');
    const [selectedProductId, setSelectedProductId] = useState<string>('');

    const { classes: productsMap, loading: productsLoading } = useClasses(selectedOrgId || null);
    const productList: ClassItem[] = productsMap ? Object.values(productsMap) : [];

    /** 기관판매 프로덕트: 활성, 콘텐츠·서비스, 기관판매 */
    const agencyProductList = useMemo(() => {
        return productList.filter((item) => {
            if (item.isActive === false) return false;
            const pt = (item as ProductWithMeta).productType;
            const st = (item as ProductWithMeta).salesType;
            return (pt === '콘텐츠' || pt === '서비스') && st === 'agency';
        });
    }, [productList]);

    const selectedProduct = useMemo(() => {
        if (!selectedProductId) return null;
        return agencyProductList.find((p) => p.id === selectedProductId) ?? null;
    }, [selectedProductId, agencyProductList]);

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
        navigate(orgCreatePath, {
            state: {
                selectedProduct,
                organizationId: selectedOrgId,
            },
            replace: true,
        });
    };

    const handleBack = () => navigate(-1);

    const isLoadingProducts = !!selectedOrgId && productsLoading;
    const canProceed = !!selectedProductId && !!selectedProduct;

    return (
        <CenteredPageLayout title="마이클래스 생성">
            <div className="space-y-6">
                <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h2 className="text-sm font-medium text-gray-700 mb-4">1. 기관 선택</h2>
                    <p className="text-sm text-gray-500 mb-4">마이클래스를 개설할 기관을 선택하세요.</p>
                    <div className="max-w-xl mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">기관</label>
                        <SimpleSelect
                            value={selectedOrgId}
                            onChange={(e) => {
                                setSelectedOrgId(e.target.value);
                                setSelectedProductId('');
                            }}
                            wrapperClassName="w-full"
                            className="h-10"
                        >
                            <option value="">기관 선택</option>
                            {organizationOptions.map((org) => (
                                <option key={org.id} value={String(org.id)}>
                                    {org.title}
                                </option>
                            ))}
                        </SimpleSelect>
                    </div>

                    <h2 className="text-sm font-medium text-gray-700 mb-4">2. 기관판매 프로덕트 선택</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        선택한 기관의 기관판매 프로덕트 목록입니다. 프로덕트를 선택하면 교육정보(커리큘럼 등)가 생성 폼에 불러와집니다.
                    </p>
                    {!selectedOrgId ? (
                        <p className="text-gray-500 py-4">기관을 먼저 선택해주세요.</p>
                    ) : isLoadingProducts ? (
                        <div className="flex items-center gap-2 py-6">
                            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                            <span className="text-sm text-gray-500">프로덕트 목록을 불러오는 중...</span>
                        </div>
                    ) : agencyProductList.length === 0 ? (
                        <p className="text-gray-500 py-8">해당 기관의 기관판매 프로덕트(활성)가 없습니다.</p>
                    ) : (
                        <div className="max-w-xl">
                            <label className="block text-sm font-medium text-gray-700 mb-2">프로덕트</label>
                            <SimpleSelect
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                wrapperClassName="w-full"
                                className="h-10"
                            >
                                <option value="">프로덕트 선택</option>
                                {agencyProductList.map((product) => {
                                    const pt = (product as ProductWithMeta).productType ?? '-';
                                    const date = formatCreatedDate(product.createdDate);
                                    const label = `(${pt}) ${product.title}, ${date}`;
                                    return (
                                        <option key={product.id} value={product.id}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </SimpleSelect>
                        </div>
                    )}
                </section>

                <div className="flex justify-between">
                    <Button variant="secondary" onClick={handleBack}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleGoToForm} disabled={!canProceed || isLoadingProducts}>
                        클래스 생성 폼으로 이동 (교육정보 불러오기)
                    </Button>
                </div>
            </div>
        </CenteredPageLayout>
    );
}
