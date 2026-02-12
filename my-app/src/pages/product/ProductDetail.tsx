import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Edit } from 'lucide-react';
import { PageHeader, Button, Badge } from '@/components/shared/ui';
import { useClass } from '../../data/queries/useClasses';
import type { ScenarioPlatform } from '../../types/admin';

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

    const { title, description, createdDate, isActive, curriculum } = classData;
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
