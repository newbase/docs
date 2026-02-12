import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LockOpen } from 'lucide-react';
import { ClassItem } from '../../data/classes';
import { PageHeader, Pagination } from '@/components/shared/ui';
import { useClassesList } from '../../data/queries/useClasses';
import { useAuth } from '../../contexts/AuthContext';

const ITEMS_PER_PAGE = 6;

export default function ClassList(): React.ReactElement {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useAuth();
    const orgId = user?.currentAccount?.organizationId ?? null;
    const { classesList, loading: classesLoading, error: classesError } = useClassesList(orgId);

    const allClasses = classesList as ClassItem[];
    // Show all classes including private ones
    const filteredClasses = allClasses;

    const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);

    const currentClasses = filteredClasses.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (classesLoading && allClasses.length === 0) {
        return (
            <>
                <PageHeader title="클래스" breadcrumbs={[{ label: '클래스' }]} />
                <div className="p-8 text-center text-gray-500">클래스 목록을 불러오는 중...</div>
            </>
        );
    }
    if (classesError && allClasses.length === 0) {
        return (
            <>
                <PageHeader title="클래스" breadcrumbs={[{ label: '클래스' }]} />
                <div className="p-8 text-center text-red-600">클래스 목록을 불러오지 못했습니다.</div>
            </>
        );
    }

    return (
        <>
            <PageHeader
                title="클래스"
                breadcrumbs={[{ label: '클래스' }]}
            />

            <div className="space-y-6">
                {currentClasses.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => navigate(`/class-detail?tab=${item.id}`)}
                        className="flex flex-col md:flex-row bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                        {/* Thumbnail */}
                        <div className="md:w-64 h-48 md:h-auto shrink-0 relative overflow-hidden bg-gray-100">
                            {item.thumbnail ? (
                                <img
                                    src={item.thumbnail}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                    No Image
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-900 transition-colors mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 text-base leading-relaxed line-clamp-2 mb-4">
                                    {item.description}
                                </p>
                            </div>

                            <div className="flex items-center justify-between gap-4 text-sm text-gray-500 pt-4 mt-auto">
                                <div className="flex items-center gap-4">
                                    {item.participationPeriod && (
                                        <>
                                            참여기간&nbsp;<span className="text-brand-600 font-medium">{item.participationPeriod.startDate} ~ {item.participationPeriod.endDate}</span>
                                            <span className="w-px h-3 bg-gray-300" />
                                            </>
                                    )}
                                    <span>
                                        세션 수 &nbsp;<span className="text-brand-600 font-medium">{item.curriculum.length}</span>
                                    </span>
                                    {item.duration && (
                                        <>
                                            <span className="w-px h-3 bg-gray-300" />
                                            소요시간&nbsp;<span className="font-semibold text-brand-600">{item.duration}</span> 
                                        </>
                                    )}
                                </div>
                                {!(item as ClassItem & { isPublic?: boolean }).isPublic && (
                                    <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold min-w-20 text-gray-500 border border-gray-400">
                                        <Lock size={12} />
                                        비공개
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 mb-12">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </>
    );
}
