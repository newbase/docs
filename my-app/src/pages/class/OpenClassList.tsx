
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { ClassItem } from '../../data/classes';
import { Button, PageHeader, Pagination, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Input } from '@/components/shared/ui';
import { useClasses } from '../../data/queries/useClasses';
import { useAuth } from '../../contexts/AuthContext';

const ITEMS_PER_PAGE = 6;

// 수강일수 계산 헬퍼 함수
const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export default function OpenClassList(): React.ReactElement {
    const navigate = useNavigate();
    const { user, getCurrentRole } = useAuth();
    const role = getCurrentRole();
    const isMaster = role === 'master';
    const organizationId = user?.currentAccount?.organizationId;

    const { classes, loading, error } = useClasses(organizationId);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'new-nurse' | 'nursing-college' | 'disaster-emergency'>('all');
    const [platformFilter, setPlatformFilter] = useState<'all' | 'screen' | 'vr'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const raw = localStorage.getItem('participatingClasses') || '{}';
        const participatingClasses = JSON.parse(raw) as Record<string, boolean>;
        if (participatingClasses['001']) {
            delete participatingClasses['001'];
            localStorage.setItem('participatingClasses', JSON.stringify(participatingClasses));
        }
    }, []);

    const allClasses = Object.values(classes) as ClassItem[];

    // Apply all filters
    const getFilteredClasses = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filtered = allClasses.filter(item => item.isActive !== false);

        filtered = filtered.filter(item => item.classType === '오픈');

        filtered = filtered.filter(item => {
            if (!item.participationPeriod?.endDate) return true;
            const endDate = new Date(item.participationPeriod.endDate);
            endDate.setHours(0, 0, 0, 0);
            return endDate >= today;
        });

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(item => item.category === categoryFilter);
        }

        // Platform filter
        if (platformFilter === 'screen') {
            filtered = filtered.filter(item =>
                item.curriculum?.some(curr => curr.platform === 'mobile' || curr.platform === 'both')
            );
        } else if (platformFilter === 'vr') {
            filtered = filtered.filter(item =>
                item.curriculum?.some(curr => curr.platform === 'vr' || curr.platform === 'both')
            );
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.organizationName?.toLowerCase().includes(query)
            );
        }

        return filtered;
    };

    const filteredClasses = getFilteredClasses();

    const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);

    const currentClasses = filteredClasses.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-gray-500">오픈클래스 목록을 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="pb-8">
            <PageHeader
                title="오픈클래스"
                description="임상 실무에 자신감을 높여주는 오픈 시뮬레이션 클래스에 참여해보세요."
                align="center"
                withBackground
                breadcrumbs={[{ label: '오픈클래스' }]}
            />

            {/* Category Filter Buttons + 검색 및 필터 */}
            <div className="mb-6 flex items-center justify-between gap-4">
                {/* 좌측: 카테고리 필터 버튼 */}
                <div className="flex gap-2">
                    <Button
                        onClick={() => {
                            setCategoryFilter('all');
                            setCurrentPage(1);
                        }}
                        variant={categoryFilter === 'all' ? 'lightdark' : 'outline'}
                        size="md"
                    >
                        전체
                    </Button>
                    <Button
                        onClick={() => {
                            setCategoryFilter('new-nurse');
                            setCurrentPage(1);
                        }}
                        variant={categoryFilter === 'new-nurse' ? 'lightdark' : 'outline'}
                        size="md"
                    >
                        신규간호사
                    </Button>
                    <Button
                        onClick={() => {
                            setCategoryFilter('nursing-college');
                            setCurrentPage(1);
                        }}
                        variant={categoryFilter === 'nursing-college' ? 'lightdark' : 'outline'}
                        size="md"
                    >
                        간호대학
                    </Button>
                    <Button
                        onClick={() => {
                            setCategoryFilter('disaster-emergency');
                            setCurrentPage(1);
                        }}
                        variant={categoryFilter === 'disaster-emergency' ? 'lightdark' : 'outline'}
                        size="md"
                    >
                        재난응급
                    </Button>
                </div>

                {/* 우측: 필터 및 검색바 */}
                <div className="flex items-center gap-3">
                    {/* 플랫폼 필터 */}
                    <Select
                        value={platformFilter}
                        onValueChange={(value) => {
                            setPlatformFilter(value as 'all' | 'screen' | 'vr');
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="플랫폼" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">플랫폼</SelectItem>
                            <SelectItem value="screen">스크린</SelectItem>
                            <SelectItem value="vr">VR</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* 검색바 */}
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
                        <Input
                            type="text"
                            placeholder="클래스명, 기관명 검색"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentClasses.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
                        <p className="text-lg">해당 카테고리의 클래스가 없습니다.</p>
                    </div>
                ) : (
                    currentClasses.map((item) => {
                        const participatingClasses = JSON.parse(localStorage.getItem('participatingClasses') || '{}') as Record<string, boolean>;
                        const isEnrolled = !!participatingClasses[item.id];

                        return (
                            <div
                                key={item.id}
                                onClick={() => {
                                    if (isEnrolled) {
                                        navigate(`/student/my-classes/${item.id}`);
                                    } else {
                                        navigate(`/open-class/${item.id}`);
                                    }
                                }}
                                className="flex flex-col h-[420px] bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                            >
                                {/* Thumbnail */}
                                <div className="w-full h-64 relative overflow-hidden bg-gray-100">
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
                                    {/* Badges */}
                                    {(item.isNew || item.isRecommended || isEnrolled || item.price === 0) && (
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            {isEnrolled && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
                                                    참여중
                                                </span>
                                            )}
                                            {item.isNew && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
                                                    NEW
                                                </span>
                                            )}
                                            {item.isRecommended && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">
                                                    추천
                                                </span>
                                            )}
                                            {item.price === 0 && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-500 text-white">
                                                    무료
                                                </span>
                                            )}
                                        </div>
                                    )}

                                </div>

                                {/* Content */}
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="text-base font-bold text-gray-900 mb-3">
                                        {item.title}
                                    </h3>

                                    {/* 참여 정보: 대면 → 모집기간, 온라인 → 온라인 참여 */}
                                    <div className="mb-3">
                                        {item.onlineUrl || item.onlinePlatform ? (
                                            <span className="text-gray-700 text-sm font-medium">온라인 참여</span>
                                        ) : item.educationVenue || item.educationSchedule ? (
                                            item.recruitmentPeriod && (
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-gray-500 text-xs min-w-[52px]">모집기간</span>
                                                    <span className="text-gray-700 text-sm font-medium">
                                                        {item.recruitmentPeriod.startDate && item.recruitmentPeriod.endDate
                                                            ? `${item.recruitmentPeriod.startDate} ~ ${item.recruitmentPeriod.endDate}`
                                                            : item.recruitmentPeriod.endDate || item.recruitmentPeriod.startDate}
                                                    </span>
                                                </div>
                                            )
                                        ) : null}
                                    </div>

                                    {/* 개설기관 및 참가비 */}
                                    <div className="mt-auto pt-3">
                                        <div className="flex items-end justify-between">
                                            {/* 개설기관 */}
                                            {(item.organizationLogo || item.organizationName) && (
                                                <div>
                                                    {item.organizationLogo ? (
                                                        <img
                                                            src={item.organizationLogo}
                                                            alt={item.organizationName || '기관 로고'}
                                                            className="h-5 object-contain"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const parent = e.currentTarget.parentElement;
                                                                if (parent && item.organizationName) {
                                                                    const text = document.createElement('div');
                                                                    text.className = 'text-sm text-gray-500 font-medium';
                                                                    text.textContent = item.organizationName;
                                                                    parent.appendChild(text);
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="text-sm font-medium text-gray-500">
                                                            {item.organizationName}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* 참가비 */}
                                            {item.price !== undefined && (
                                                <span className="text-sm font-semibold text-gray-800">
                                                    {item.discountPrice !== undefined ? item.discountPrice.toLocaleString() : item.price.toLocaleString()} 원
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-8 mb-12">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}
