/**
 * 클래스 생성 진입 페이지
 * 프로덕트 선택(기관 보유 활성 프로덕트) → 해당 생성 폼으로 이동(프로덕트 정보 전달).
 * 판매유형이 온라인 판매면 오픈클래스 생성, 기관판매면 기관클래스 생성으로 이동.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button, SimpleSelect } from '@/components/shared/ui';
import { CenteredPageLayout } from '@/components/shared/layout';
import { ClassItem } from '../../data/classes';
import { useClasses } from '../../data/queries/useClasses';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '@/lib/constants/routes';

type ProductWithMeta = ClassItem & { productType?: string; salesType?: string };

function formatCreatedDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    const d = dateStr.split('T')[0].replace(/-/g, '.');
    return d;
}

function getSalesTypeLabel(salesType: string | undefined): string {
    if (salesType === 'online') return '온라인 판매';
    if (salesType === 'agency') return '기관판매';
    return '-';
}

export default function ClassCreateSelect(): React.ReactElement {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const basePath = pathname.startsWith('/master') ? '/master' : '/admin';

    const { user } = useAuth();
    const organizationId = user?.currentAccount?.organizationId;
    const { classes: productsMap, loading } = useClasses(organizationId);
    const productList: ClassItem[] = productsMap ? Object.values(productsMap) : [];

    /** 기관이 보유한 활성 프로덕트 중, 프로덕트 유형이 콘텐츠·서비스인 것만 (클래스 생성 가능) */
    const activeProductList = useMemo(() => {
        return productList.filter((item) => {
            if (item.isActive === false) return false;
            const pt = (item as ProductWithMeta).productType;
            return pt === '콘텐츠' || pt === '서비스';
        });
    }, [productList]);

    const [selectedProductId, setSelectedProductId] = useState<string>('');

    const openCreatePath = basePath === '/master' ? ROUTES.MASTER.OPEN_CLASS_CREATE : ROUTES.ADMIN.OPEN_CLASS_CREATE;
    const orgCreatePath = basePath === '/master' ? ROUTES.MASTER.CLASS_CREATE_ORGANIZATION : ROUTES.ADMIN.CLASS_CREATE_ORGANIZATION;

    const handleProductSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedProductId(id);
        if (!id) return;
        const product = activeProductList.find((p) => p.id === id);
        if (!product) return;
        const state = { selectedProduct: product };
        const salesType = (product as ProductWithMeta).salesType;
        if (salesType === 'online') {
            navigate(openCreatePath, { state });
        } else {
            navigate(orgCreatePath, { state });
        }
    };

    if (loading) {
        return (
            <CenteredPageLayout title="클래스 생성">
                <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                    <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                    <p className="text-gray-500">프로덕트 목록을 불러오는 중입니다...</p>
                </div>
            </CenteredPageLayout>
        );
    }

    return (
        <CenteredPageLayout title="클래스 생성">
            <div className="space-y-6">
                <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h2 className="text-sm font-medium text-gray-700 mb-4">프로덕트 선택</h2>
                    <p className="text-sm text-gray-500 mb-4">클래스에 사용할 프로덕트를 선택하세요. 선택하면 해당 클래스 생성 폼으로 이동합니다. 프로덕트 유형이 콘텐츠·서비스인 활성 프로덕트만 표시됩니다.</p>
                    {activeProductList.length === 0 ? (
                        <p className="text-gray-500 py-8">클래스 생성 가능한 프로덕트(콘텐츠·서비스 유형, 활성)가 없습니다. 프로덕트 관리에서 등록해주세요.</p>
                    ) : (
                        <div className="max-w-xl">
                            <label className="block text-sm font-medium text-gray-700 mb-2">프로덕트</label>
                            <SimpleSelect
                                value={selectedProductId}
                                onChange={handleProductSelectChange}
                                wrapperClassName="w-full"
                                className="h-10"
                            >
                                <option value="">프로덕트 선택</option>
                                {activeProductList.map((product) => {
                                    const pt = (product as ProductWithMeta).productType ?? '-';
                                    const sales = getSalesTypeLabel((product as ProductWithMeta).salesType);
                                    const date = formatCreatedDate(product.createdDate);
                                    const label = `(${pt}) ${product.title}, ${sales}, ${date}`;
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
                <div className="flex justify-end">
                    <Button variant="secondary" onClick={() => navigate(-1)}>취소</Button>
                </div>
            </div>
        </CenteredPageLayout>
    );
}
