import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, ChevronDown } from 'lucide-react';
import {
    PageHeader, Button, Badge, ListHeader, FilterGroup, FilterSelect, DateRangeFilter, SearchBar, Pagination, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from '@/components/shared/ui';
import { cn } from '@/lib/cn';
import { ClassItem } from '../../data/classes';
import { useClassesList } from '../../data/queries/useClasses';
import { useOrganizations } from '../../hooks/useOrganization';

const ITEMS_PER_PAGE = 10;

export default function AdminClassManagement(): React.ReactElement {
    const navigate = useNavigate();
    const basePath = '/admin';

    const { classesList, loading: classesLoading, error: classesError } = useClassesList(undefined);
    const data = useMemo(() => classesList as ClassItem[], [classesList]);
    const [items, setItems] = useState<ClassItem[]>(data);

    useEffect(() => {
        setItems(data);
    }, [data]);

    // Fetch organizations for displaying organization names
    const { data: organizationsData } = useOrganizations(
        { page: 1, pageSize: 1000 }
    );

    // Create organization map for quick lookup
    const organizationMap = useMemo(() => {
        if (!organizationsData?.organizationList) return new Map();
        return new Map(
            organizationsData.organizationList.map(org => [org.organizationId, org.title])
        );
    }, [organizationsData]);

    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [visibilityFilter, setVisibilityFilter] = useState('all');
    const [saleFilter, setSaleFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter logic
    const filteredData = useMemo(() => {
        return items.filter(item => {
            // Search
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());

            // Visibility (isPublic 제거됨: ClassItem 타입에 없음)
            const itemPublic = (item as ClassItem & { isPublic?: boolean }).isPublic;
            const matchesVisibility = visibilityFilter === 'all' ||
                (visibilityFilter === 'public' && itemPublic) ||
                (visibilityFilter === 'private' && !itemPublic);

            // Sale Status
            const itemSaleStatus = item.saleStatus || (item.isForSale ? 'available' : 'unavailable');
            const matchesSale = saleFilter === 'all' ||
                (saleFilter === 'available' && itemSaleStatus === 'available') ||
                (saleFilter === 'unavailable' && itemSaleStatus === 'unavailable');

            // Date Range (Created Date)
            let matchesDate = true;
            if (startDate && endDate && item.createdDate) {
                const itemDate = new Date(item.createdDate);
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchesDate = itemDate >= start && itemDate <= end;
            }

            return matchesSearch && matchesVisibility && matchesSale && matchesDate;
        });
    }, [items, searchTerm, visibilityFilter, saleFilter, startDate, endDate]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, visibilityFilter, saleFilter, startDate, endDate]);

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (classesLoading && items.length === 0) {
        return (
            <>
                <PageHeader title="클래스 관리" breadcrumbs={[{ label: '클래스 관리' }]} />
                <div className="p-8 text-center text-gray-500">클래스 목록을 불러오는 중...</div>
            </>
        );
    }
    if (classesError && items.length === 0) {
        return (
            <>
                <PageHeader title="클래스 관리" breadcrumbs={[{ label: '클래스 관리' }]} />
                <div className="p-8 text-center text-red-600">클래스 목록을 불러오지 못했습니다.</div>
            </>
        );
    }

    const handleSetSaleStatus = (id: string, status: boolean) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { 
                ...item, 
                isForSale: status,
                saleStatus: status ? 'available' : 'unavailable'
            } : item
        ));
    };

    const getDurationDetails = (item: ClassItem) => {
        const totalMinutes = item.curriculum.reduce((acc, curr) => {
            const match = curr.duration?.match(/(\d+)분/);
            return match ? acc + parseInt(match[1], 10) : acc;
        }, 0);

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return {
            count: item.curriculum.length,
            totalTime: hours > 0
                ? `${hours}시간 ${minutes > 0 ? `${minutes}분` : ''} `
                : `${totalMinutes} 분`
        };
    };

    return (
        <>
            <PageHeader
                title="클래스 관리"
                breadcrumbs={[
                    { label: '클래스 관리' }
                ]}
                actions={
                    <Button variant="lightdark" size="md" onClick={() => navigate(`${basePath}/class/create`)}>
                        <Plus size={16} className="mr-2" />
                        클래스 생성
                    </Button>
                }
            />

            <div className="space-y-6">
                <div>
                    <ListHeader
                        totalCount={filteredData.length}
                        rightContent={
                            <FilterGroup>
                                <DateRangeFilter
                                    startDate={startDate}
                                    endDate={endDate}
                                    onStartDateChange={(val) => setStartDate(val)}
                                    onEndDateChange={(val) => setEndDate(val)}
                                />
                                <FilterSelect
                                    value={visibilityFilter}
                                    onValueChange={(val) => setVisibilityFilter(val)}
                                    options={[
                                        { value: 'all', label: '전체 공개여부' },
                                        { value: 'public', label: '공개' },
                                        { value: 'private', label: '비공개' }
                                    ]}
                                />
                                <FilterSelect
                                    value={saleFilter}
                                    onValueChange={(val) => setSaleFilter(val)}
                                    options={[
                                        { value: 'all', label: '전체 판매상태' },
                                        { value: 'available', label: '가능' },
                                        { value: 'unavailable', label: '불가' }
                                    ]}
                                />
                                <div className="w-64">
                                    <SearchBar
                                        placeholder="클래스명 검색"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </FilterGroup>
                        }
                    />

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">썸네일</TableHead>
                                <TableHead>클래스명</TableHead>
                                <TableHead className="text-center w-[150px]">참여자 수</TableHead>
                                <TableHead className="text-center w-[100px]">이수율</TableHead>
                                <TableHead className="text-center w-[100px]">세션 수</TableHead>
                                <TableHead className="text-center w-[100px]">총 소요시간</TableHead>
                                <TableHead className="text-center w-[120px]">개설자</TableHead>
                                <TableHead className="text-center w-[120px]">개설일</TableHead>
                                <TableHead className="text-center w-[180px]">참여기간</TableHead>
                                <TableHead className="text-center w-[120px]">판매여부</TableHead>
                                <TableHead className="text-center w-[150px]">교육기관</TableHead>
                                <TableHead className="text-center w-[120px]">수강료</TableHead>
                                <TableHead className="text-center w-[100px]">공개여부</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item) => {
                                    const { count, totalTime } = getDurationDetails(item);
                                    const current = item.currentParticipants || 0;
                                    const max = item.maxParticipants || 0;
                                    const isFull = current >= max;
                                    const completionRate = item.completionRate || 0;

                                    return (
                                        <TableRow key={item.id} className="hover:bg-gray-50 transition-colors text-sm">
                                            <TableCell>
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                                    {item.thumbnail ? (
                                                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <GraduationCap size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="cursor-pointer group" onClick={() => navigate(`${basePath}/class-management/${item.id}`)}>
                                                    <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {item.title}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <div className="text-sm font-medium">
                                                        <span className={isFull ? "text-red-600" : "text-gray-900"}>{current}</span>
                                                        <span className="text-gray-400 mx-1">/</span>
                                                        <span className="text-gray-600">{max}</span>
                                                    </div>
                                                    {max > 0 && (
                                                        <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-blue-500'}`}
                                                                style={{ width: `${Math.min((current / max) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <span className="text-sm font-medium text-gray-900">{completionRate}%</span>
                                                    <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-green-500"
                                                            style={{ width: `${Math.min(completionRate, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="bg-gray-50">
                                                    {count}개
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-sm text-gray-600 font-medium">{totalTime}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-sm text-gray-600">{item.creatorId || '-'}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-sm text-gray-600">{item.createdDate || '-'}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.participationPeriod ? (
                                                    <div className="text-sm text-gray-500 flex flex-col gap-0.5">
                                                        <span>{item.participationPeriod.startDate}</span>
                                                        <span>~ {item.participationPeriod.endDate}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className={cn(
                                                                "h-8 px-2 gap-1 text-xs",
                                                                (item.saleStatus === 'available' || item.isForSale) ? "text-emerald-700 border-emerald-200 bg-emerald-50" : "text-rose-700 border-rose-200 bg-rose-50"
                                                            )}
                                                        >
                                                            {(item.saleStatus === 'available' || item.isForSale) ? "가능" : "불가"}
                                                            <ChevronDown size={14} className="opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="center">
                                                        <DropdownMenuItem onClick={() => handleSetSaleStatus(item.id, true)}>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                                <span>가능</span>
                                                            </div>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleSetSaleStatus(item.id, false)}>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                                                <span>불가</span>
                                                            </div>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(item.saleStatus === 'available' || item.isForSale) && item.organizationId ? (
                                                    <span className="text-sm text-gray-600">
                                                        {item.organizationName || organizationMap.get(item.organizationId) || '-'}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(item.saleStatus === 'available' || item.isForSale) && (item.price !== undefined || item.discountPrice !== undefined) ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        {item.price !== undefined && (
                                                            <span className="text-sm text-gray-900 font-medium">
                                                                {item.price.toLocaleString()}원
                                                            </span>
                                                        )}
                                                        {item.discountPrice !== undefined && item.discountPrice > 0 && (
                                                            <span className="text-xs text-blue-600">
                                                                할인: {item.discountPrice.toLocaleString()}원
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={(item as ClassItem & { isPublic?: boolean }).isPublic ? "default" : "secondary"} className={(item as ClassItem & { isPublic?: boolean }).isPublic ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : ""}>
                                                    {(item as ClassItem & { isPublic?: boolean }).isPublic ? "공개" : "비공개"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={13} className="h-24 text-center text-gray-500">
                                        검색 결과가 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-center pb-8">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </>
    );
}
