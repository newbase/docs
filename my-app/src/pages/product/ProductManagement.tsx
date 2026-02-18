import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLayoutWidth } from '@/contexts/LayoutWidthContext';
import { Plus, ChevronDown, Loader2, ExternalLink, ChevronUp, ChevronsUpDown } from 'lucide-react';
import {
    PageHeader, Button, Badge, ListHeader, SearchBar, Pagination, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, FilterGroup, SimpleSelect
} from '@/components/shared/ui';
import { ClassItem } from '../../data/classes';
import { useClasses } from '../../data/queries/useClasses';
import { useAuth } from '../../contexts/AuthContext';

const ITEMS_PER_PAGE = 10;

type SortKey = 'createdDate';

function getSortValue(item: ClassItem, key: SortKey): number | string {
    switch (key) {
        case 'createdDate': return item.createdDate ?? '';
        default: return '';
    }
}

export default function ProductManagement(): React.ReactElement {
    const navigate = useNavigate();
    const { setLayoutWidth } = useLayoutWidth();
    useEffect(() => {
        setLayoutWidth?.('wide');
        return () => setLayoutWidth?.('default');
    }, [setLayoutWidth]);

    const { user } = useAuth();
    const organizationId = user?.currentAccount?.organizationId;

    const { classes, loading } = useClasses(organizationId);
    const [items, setItems] = useState<ClassItem[]>([]);

    useEffect(() => {
        if (!loading && classes) {
            setItems(Object.values(classes));
        }
    }, [classes, loading]);

    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [productTypeFilter, setProductTypeFilter] = useState<string>('all');
    const [salesTypeFilter, setSalesTypeFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortKey>('createdDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter logic
    const filteredData = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesActive =
                activeStatusFilter === 'all' ||
                (activeStatusFilter === 'active' && item.isActive !== false) ||
                (activeStatusFilter === 'inactive' && item.isActive === false);
            const productType = (item as ClassItem & { productType?: string }).productType;
            const matchesProductType = productTypeFilter === 'all' || productType === productTypeFilter;
            const salesType = (item as ClassItem & { salesType?: string }).salesType;
            const matchesSalesType = salesTypeFilter === 'all' || salesType === salesTypeFilter;
            return matchesSearch && matchesActive && matchesProductType && matchesSalesType;
        });
    }, [items, searchTerm, activeStatusFilter, productTypeFilter, salesTypeFilter]);

    // Sort logic
    const sortedData = useMemo(() => {
        const sorted = [...filteredData].sort((a, b) => {
            const va = getSortValue(a, sortBy);
            const vb = getSortValue(b, sortBy);
            const numA = typeof va === 'number' ? va : (va ? String(va) : '');
            const numB = typeof vb === 'number' ? vb : (vb ? String(vb) : '');
            if (typeof numA === 'number' && typeof numB === 'number') {
                return sortDirection === 'asc' ? numA - numB : numB - numA;
            }
            const sa = String(numA);
            const sb = String(numB);
            const cmp = sa.localeCompare(sb);
            return sortDirection === 'asc' ? cmp : -cmp;
        });
        return sorted;
    }, [filteredData, sortBy, sortDirection]);

    // Reset pagination when filters/sort change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeStatusFilter, productTypeFilter, salesTypeFilter, sortBy, sortDirection]);

    // Pagination logic
    const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSort = (key: SortKey) => {
        if (sortBy === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortDirection('desc');
        }
    };

    const SortableHead = ({ sortKey, children, className = '' }: { sortKey: SortKey; children: React.ReactNode; className?: string }) => (
        <TableHead
            className={`text-center cursor-pointer select-none hover:bg-gray-100 transition-colors ${className}`}
            onClick={() => handleSort(sortKey)}
        >
            <div className="flex items-center justify-center gap-1">
                                {children}
                                {sortBy === sortKey ? (
                                    sortDirection === 'asc' ? <ChevronUp size={14} className="flex-shrink-0" /> : <ChevronDown size={14} className="flex-shrink-0" />
                                ) : (
                                    <ChevronsUpDown size={14} className="flex-shrink-0 text-gray-400" />
                                )}
                            </div>
        </TableHead>
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-gray-500">프로덕트 목록을 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <>
            <PageHeader
                title="프로덕트 관리"
                breadcrumbs={[
                    { label: '프로덕트 관리' }
                ]}
                actions={
                    <Button variant="lightdark" size="md" onClick={() => navigate('/admin/product/create')}>
                        <Plus size={16} className="mr-2" />
                        프로덕트 생성
                    </Button>
                }
            />

            <div className="space-y-6">
                <div>
                    <ListHeader
                        totalCount={sortedData.length}
                        rightContent={
                            <FilterGroup>
                                <SimpleSelect
                                    value={productTypeFilter}
                                    onChange={(e) => setProductTypeFilter(e.target.value)}
                                    wrapperClassName="w-32"
                                >
                                    <option value="all">전체 유형</option>
                                    <option value="콘텐츠">콘텐츠</option>
                                    <option value="상품">상품</option>
                                    <option value="서비스">서비스</option>
                                </SimpleSelect>
                                <SimpleSelect
                                    value={salesTypeFilter}
                                    onChange={(e) => setSalesTypeFilter(e.target.value)}
                                    wrapperClassName="w-32"
                                >
                                    <option value="all">전체 판매</option>
                                    <option value="online">온라인 판매</option>
                                    <option value="agency">기관판매</option>
                                </SimpleSelect>
                                <SimpleSelect
                                    value={activeStatusFilter}
                                    onChange={(e) => setActiveStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                                    wrapperClassName="w-32"
                                >
                                    <option value="all">전체 상태</option>
                                    <option value="active">활성</option>
                                    <option value="inactive">비활성</option>
                                </SimpleSelect>
                                <div className="w-64">
                                    <SearchBar
                                        placeholder="프로덕트명 검색"
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
                                <TableHead>프로덕트명</TableHead>
                                <TableHead className="text-center w-[100px]">프로덕트 유형</TableHead>
                                <TableHead className="text-center w-[90px]">판매유형</TableHead>
                                <TableHead className="text-center w-[180px]">기관명</TableHead>
                                <TableHead className="text-center w-[180px]">가격/판매수익(원)</TableHead>
                                <TableHead className="text-center w-[180px]">가격/판매수익(USD)</TableHead>
                                <SortableHead sortKey="createdDate" className="w-[120px]">등록일</SortableHead>
                                <TableHead className="text-center w-[90px]">활성여부</TableHead>
                                <TableHead className="text-center w-[50px]">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-gray-50 transition-colors text-sm">
                                            <TableCell>
                                                <div className="cursor-pointer group" onClick={() => navigate(`/admin/product/detail/${item.id}`)}>
                                                    <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                                                        {item.title}
                                                        <ExternalLink size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center text-gray-600">
                                                {(item as ClassItem & { productType?: string }).productType ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-center text-gray-600">
                                                {(() => {
                                                    const st = (item as ClassItem & { salesType?: string }).salesType;
                                                    return st === 'online' ? '온라인 판매' : st === 'agency' ? '기관판매' : '-';
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-center text-gray-600">
                                                {item.organizationName ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-center text-gray-900">
                                                {(() => {
                                                    const priceKrw = item.discountPrice ?? item.price ?? 0;
                                                    const qty = item.currentParticipants ?? 0;
                                                    const revenueKrw = priceKrw * qty;
                                                    const priceStr = priceKrw > 0 ? priceKrw.toLocaleString() : '-';
                                                    const revenueStr = revenueKrw > 0 ? revenueKrw.toLocaleString() : '-';
                                                    return `${priceStr} / ${revenueStr}`;
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-center text-gray-900">
                                                {(() => {
                                                    const priceUsd = (item as ClassItem & { priceUsd?: number }).priceUsd ?? 0;
                                                    const qty = item.currentParticipants ?? 0;
                                                    const revenueUsd = priceUsd * qty;
                                                    const priceStr = priceUsd > 0 ? priceUsd.toLocaleString() : '-';
                                                    const revenueStr = revenueUsd > 0 ? revenueUsd.toLocaleString() : '-';
                                                    return `${priceStr} / ${revenueStr}`;
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-center text-gray-600">
                                                {item.createdDate ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={item.isActive !== false ? "default" : "secondary"}
                                                    className={item.isActive !== false ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : ""}
                                                >
                                                    {item.isActive !== false ? "활성" : "비활성"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <ChevronDown size={14} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-32">
                                                        <DropdownMenuItem onClick={() => navigate(`/admin/product/edit/${item.id}`)}>
                                                            수정
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">
                                                            삭제
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-gray-500">
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
