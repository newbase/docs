import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, Loader2, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import {
    PageHeader, Button, Badge, ListHeader, FilterGroup, DateRangeFilter, SearchBar, Pagination, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
    SimpleSelect, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from '@/components/shared/ui';
import { ClassItem } from '../../data/classes';
import { useClasses } from '../../data/queries/useClasses';
import { useAuth } from '../../contexts/AuthContext';

const ITEMS_PER_PAGE = 10;

export default function MyClassManagement(): React.ReactElement {
    const navigate = useNavigate();
    const { user, getCurrentRole } = useAuth();
    const role = getCurrentRole();
    const organizationId = user?.currentAccount?.organizationId;
    const basePath = role === 'master' ? '/master' : role === 'admin' ? '/admin' : '';

    const { classes, loading } = useClasses(organizationId);
    const [items, setItems] = useState<ClassItem[]>([]);

    useEffect(() => {
        if (!loading && classes) {
            setItems(Object.values(classes));
        }
    }, [classes, loading]);

    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter logic
    const filteredData = useMemo(() => {
        return items.filter(item => {
            // Search
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());

            // Active status (활성 / 비활성)
            const isActive = item.isActive !== false;
            const matchesActive = activeFilter === 'all' ||
                (activeFilter === 'active' && isActive) ||
                (activeFilter === 'inactive' && !isActive);

            // Date Range (Created Date)
            let matchesDate = true;
            if (startDate && endDate && item.createdDate) {
                const itemDate = new Date(item.createdDate);
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchesDate = itemDate >= start && itemDate <= end;
            }

            return matchesSearch && matchesActive && matchesDate;
        });
    }, [items, searchTerm, activeFilter, startDate, endDate]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilter, startDate, endDate]);

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

    const handleDelete = (item: ClassItem) => {
        if (window.confirm(`"${item.title}" 클래스를 삭제하시겠습니까?`)) {
            // TODO: 삭제 API 연동
            setItems(prev => prev.filter(i => i.id !== item.id));
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-gray-500">클래스 목록을 불러오는 중입니다...</p>
            </div>
        );
    }

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
                title="마이클래스 관리"
                breadcrumbs={[
                    { label: '마이클래스 관리' }
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
                                <SimpleSelect
                                    value={activeFilter}
                                    onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
                                    wrapperClassName="w-[106px]"
                                    className="h-9"
                                >
                                    <option value="all">전체상태</option>
                                    <option value="active">활성</option>
                                    <option value="inactive">비활성</option>
                                </SimpleSelect>

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
                                <TableHead className="text-center w-[80px]">참여자 수</TableHead>
                                <TableHead className="text-center w-[80px]">이수율</TableHead>
                                <TableHead className="text-center w-[80px]">세션 수</TableHead>
                                <TableHead className="text-center w-[100px]">총소요시간</TableHead>
                                <TableHead className="text-center w-[100px]">개설자</TableHead>
                                <TableHead className="text-center w-[110px]">개설일</TableHead>
                                <TableHead className="text-center w-[120px]">참여기간</TableHead>
                                <TableHead className="text-center w-[90px]">활성여부</TableHead>
                                <TableHead className="text-center w-[90px]">관리</TableHead>

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
                                                <span className="text-xs text-gray-600">{item.creatorId || '-'}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-xs text-gray-600">{item.createdDate || '-'}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.participationPeriod ? (
                                                    <div className="text-xs text-gray-500 flex flex-col gap-0.5">
                                                        <span>{item.participationPeriod.startDate}</span>
                                                        <span>~ {item.participationPeriod.endDate}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={item.isActive !== false ? 'default' : 'secondary'} className={item.isActive !== false ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}>
                                                    {item.isActive !== false ? '활성' : '비활성'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <ChevronDown size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-32">
                                                        <DropdownMenuItem onClick={() => navigate(`${basePath}/class/edit/${item.id}`)}>
                                                            <Pencil size={14} className="mr-2" />
                                                            수정
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => handleDelete(item)}
                                                        >
                                                            <Trash2 size={14} className="mr-2" />
                                                            삭제
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11} className="h-24 text-center text-gray-500">
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
