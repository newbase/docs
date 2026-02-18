import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Edit } from 'lucide-react';
import { PageHeader, Button, Badge } from '@/components/shared/ui';
import { useClass } from '../../data/queries/useClasses';
import type { ClassItem } from '../../data/classes';
import type { ScenarioPlatform } from '../../types/admin';

/** 프로덕트 생성 시 입력 필드 확장 타입 */
type ProductDetailData = ClassItem & {
    productType?: string;
    salesType?: string;
    priceUsd?: number;
    organizationName?: string;
    costKrw?: number;
    costUsd?: number;
    affiliateSellerName?: string;
    affiliateCommissionRate?: number;
    publicCountries?: string[];
    validityPeriodMonths?: number;
    orderNotes?: string;
    supplier?: string;
    accessPeriod?: number;
    faceToFaceAccessPeriod?: number;
    recruitmentStartDate?: string;
    recruitmentEndDate?: string;
    recruitmentCapacity?: number;
    participationGuide?: string;
    completionRequirements?: { minScenarios: number; minPassingScore: number; requireAllScenarios: boolean };
};

/** 플랫폼 표시용 정규화 */
function normalizePlatform(platform: string | undefined): ScenarioPlatform {
    if (!platform) return 'VR';
    const p = platform.trim();
    if (p === 'VR' || p === 'Mobile' || p === 'PC') return p;
    if (p.startsWith('VR') || p.includes('VR,')) return 'VR';
    if (p.startsWith('Mobile') || p === 'Mobile/PC') return 'Mobile';
    if (p.startsWith('PC')) return 'PC';
    return 'VR';
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    const v = value ?? '-';
    return (
        <div className="flex flex-wrap gap-2 py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500 w-36 flex-shrink-0">{label}</span>
            <span className="text-sm text-gray-900">{v}</span>
        </div>
    );
}

export default function ProductDetail(): React.ReactElement {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { classData, loading } = useClass(id);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-gray-500">프로덕트 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (!classData || !id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-red-500 font-medium">프로덕트 정보를 찾을 수 없습니다.</p>
                <Button onClick={() => navigate('/admin/product-management')}>목록으로</Button>
            </div>
        );
    }

    const d = classData as ProductDetailData;
    const { title, description, createdDate, isActive, curriculum } = classData;
    const productType = d.productType ?? '';
    const salesType = d.salesType ?? '';
    const organizationName = d.organizationName ?? '';
    const priceKrw = d.price ?? d.discountPrice ?? 0;
    const priceUsd = d.priceUsd ?? 0;
    const costKrw = d.costKrw ?? 0;
    const costUsd = d.costUsd ?? 0;
    const discountPrice = d.discountPrice ?? 0;
    const discountType = d.discountType ?? 'none';
    const affiliateSellerName = d.affiliateSellerName ?? '';
    const affiliateCommissionRate = d.affiliateCommissionRate ?? 0;
    const publicCountries = d.publicCountries ?? [];
    const validityPeriodMonths = d.validityPeriodMonths ?? 0;
    const orderNotes = d.orderNotes ?? '';
    const supplier = d.supplier ?? '';
    const accessPeriod = d.accessPeriod ?? 0;
    const faceToFaceAccessPeriod = d.faceToFaceAccessPeriod ?? 0;
    const recruitmentStartDate = d.recruitmentStartDate ?? '';
    const recruitmentEndDate = d.recruitmentEndDate ?? '';
    const recruitmentCapacity = d.recruitmentCapacity ?? 0;
    const participationGuide = d.participationGuide ?? '';
    const completionRequirements = d.completionRequirements;

    const totalMinutes = (curriculum || []).reduce((acc, item) => {
        const match = item.duration?.match(/(\d+)분/);
        return match ? acc + parseInt(match[1], 10) : acc;
    }, 0);
    const totalDuration =
        totalMinutes >= 60
            ? `${Math.floor(totalMinutes / 60)}시간 ${totalMinutes % 60 > 0 ? `${totalMinutes % 60}분` : ''}`.trim()
            : `${totalMinutes}분`;

    return (
        <>
            <PageHeader
                title={title}
                breadcrumbs={[
                    { label: '프로덕트 관리', link: '/admin/product-management' },
                    { label: '프로덕트 상세' }
                ]}
                actions={
                    <Button
                        variant="lightdark"
                        size="md"
                        onClick={() => navigate(`/admin/product/edit/${id}`)}
                    >
                        <Edit size={16} className="mr-2" />
                        프로덕트 수정
                    </Button>
                }
            />

            <div className="space-y-6">
                {/* 프로덕트 정보 */}
                <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                    {description && (
                        <div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{description}</p>
                        </div>
                    )}
                    <div className="flex flex-wrap items-center gap-4">
                        <div>
                            <span className="text-sm text-gray-500 mr-2">등록일</span>
                            <span className="text-sm font-medium text-gray-900">{createdDate ?? '-'}</span>
                        </div>
                        <div>
                            <Badge
                                variant={isActive !== false ? 'default' : 'secondary'}
                                className={isActive !== false ? 'bg-emerald-100 text-emerald-700' : ''}
                            >
                                {isActive !== false ? '활성' : '비활성'}
                            </Badge>
                        </div>
                    </div>
                </section>

                {/* 프로덕트 생성 시 제품정보 */}
                <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-bold text-gray-900">제품정보</h3>
                    </div>
                    <div className="px-6 py-4 space-y-0 divide-y divide-gray-100">
                        <DetailRow label="프로덕트 유형" value={productType || undefined} />
                        <DetailRow label="판매유형" value={salesType ? (salesType === 'online' ? '온라인 판매' : '기관판매') : undefined} />
                        <DetailRow label="기관명" value={organizationName || undefined} />
                        <DetailRow label="제품명" value={title || undefined} />
                        {description && <DetailRow label="소개" value={description} />}
                        {productType === '상품' && supplier && <DetailRow label="공급처" value={supplier} />}

                        {(priceKrw > 0 || priceUsd > 0) && (
                            <>
                                {priceKrw > 0 && <DetailRow label="가격(원)" value={`${priceKrw.toLocaleString()}원`} />}
                                {priceUsd > 0 && <DetailRow label="가격(USD)" value={`${priceUsd.toLocaleString()} USD`} />}
                            </>
                        )}
                        {(costKrw > 0 || costUsd > 0) && (
                            <>
                                {costKrw > 0 && <DetailRow label="원가(원)" value={`${costKrw.toLocaleString()}원`} />}
                                {costUsd > 0 && <DetailRow label="원가(USD)" value={`${costUsd.toLocaleString()} USD`} />}
                            </>
                        )}
                        {((priceKrw > 0 && costKrw > 0) || (priceUsd > 0 && costUsd > 0)) && (
                            <DetailRow
                                label="판매수익"
                                value={
                                    <>
                                        {priceKrw > 0 && costKrw > 0 && (
                                            <span>{(priceKrw - costKrw).toLocaleString()}원</span>
                                        )}
                                        {priceKrw > 0 && costKrw > 0 && priceUsd > 0 && costUsd > 0 && ' / '}
                                        {priceUsd > 0 && costUsd > 0 && (
                                            <span>{(priceUsd - costUsd).toLocaleString()} USD</span>
                                        )}
                                    </>
                                }
                            />
                        )}

                        {affiliateSellerName && (
                            <>
                                <DetailRow label="제휴기관명" value={affiliateSellerName} />
                                {affiliateCommissionRate > 0 && (
                                    <DetailRow label="수수료율" value={`${affiliateCommissionRate}%`} />
                                )}
                            </>
                        )}
                        {salesType === 'online' && (
                            <DetailRow
                                label="공개국가지정"
                                value={publicCountries.length > 0 ? publicCountries.join(', ') : '모두 공개'}
                            />
                        )}

                        {discountType !== 'none' && discountType && (
                            <DetailRow
                                label="할인"
                                value={
                                    <>
                                        <span>{discountType === 'hospital_association' ? '대한병원협회 할인' : discountType === 'event' ? '이벤트 할인' : discountType}</span>
                                        {discountPrice > 0 && <span className="ml-2">({discountPrice.toLocaleString()}원)</span>}
                                    </>
                                }
                            />
                        )}

                        {productType === '콘텐츠' && completionRequirements && (
                            <>
                                <DetailRow
                                    label="이수조건"
                                    value={
                                        completionRequirements.requireAllScenarios
                                            ? '모든 시나리오 완료 필수'
                                            : `최소 ${completionRequirements.minScenarios}개 완료, 합격점수 ${completionRequirements.minPassingScore}%`
                                    }
                                />
                                {(accessPeriod > 0 || validityPeriodMonths > 0) && (
                                    <DetailRow
                                        label="유효기간"
                                        value={validityPeriodMonths > 0 ? `${validityPeriodMonths}개월` : `${accessPeriod}일`}
                                    />
                                )}
                            </>
                        )}

                        {productType === '서비스' && salesType === 'online' && (
                            <>
                                {faceToFaceAccessPeriod > 0 && (
                                    <DetailRow label="유효기간" value={`${faceToFaceAccessPeriod}일`} />
                                )}
                                {(recruitmentStartDate || recruitmentEndDate) && (
                                    <DetailRow label="모집기간" value={[recruitmentStartDate, recruitmentEndDate].filter(Boolean).join(' ~ ')} />
                                )}
                                {recruitmentCapacity > 0 && <DetailRow label="모집인원" value={`${recruitmentCapacity}명`} />}
                                {participationGuide && <DetailRow label="참가안내" value={participationGuide} />}
                            </>
                        )}

                        <DetailRow label="활성 여부" value={isActive !== false ? '활성' : '비활성'} />
                        {orderNotes && <DetailRow label="비고" value={orderNotes} />}
                    </div>
                </section>

                {/* 커리큘럼 */}
                <section className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-900">커리큘럼</h3>
                        <span className="text-sm text-gray-700">
                            총 {(curriculum || []).length}개 세션
                            {totalDuration && (
                                <>
                                    <span className="mx-2">/</span>
                                    {totalDuration}
                                </>
                            )}
                        </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {(curriculum || []).length === 0 ? (
                            <div className="p-12 text-center text-gray-500 text-sm">등록된 커리큘럼이 없습니다.</div>
                        ) : (
                            (curriculum || []).map((item, index) => (
                                <div
                                    key={item.id}
                                    className="px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-gray-500 text-sm font-medium w-8 text-center flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <span
                                        className={`flex-shrink-0 w-14 text-xs text-center rounded-md font-medium py-0.5 ${
                                            item.type === 'video' ? 'bg-gray-100 text-gray-600' : 'bg-brand-100 text-brand-600'
                                        }`}
                                    >
                                        {item.type === 'video' ? 'Video' : normalizePlatform(item.platform)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                    </div>
                                    <span className="text-sm text-gray-500 flex-shrink-0">{item.duration ?? '-'}</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <div className="flex justify-end">
                    <Button variant="secondary" onClick={() => navigate('/admin/product-management')}>
                        목록으로
                    </Button>
                </div>
            </div>
        </>
    );
}
