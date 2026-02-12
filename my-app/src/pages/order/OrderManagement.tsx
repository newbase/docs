import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Loader2, Plus } from 'lucide-react';
import {
    PageHeader, Button, ListHeader, FilterGroup, SimpleSelect, DateRangeFilter, SearchBar, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
    StatsGrid,
} from '@/components/shared/ui';
import { Pagination } from '@/components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { isFeatureEnabled } from '../../config/featureFlags';

const ITEMS_PER_PAGE = 10;

/** 주문유형별 탭: 전체 | 구독 | 장비/물품 | 커스텀 서비스 | 오픈클래스 */
const ORDER_TYPE_TABS = ['all', '구독', '장비/물품', '커스텀 서비스', '오픈클래스'] as const;
type OrderTypeTab = typeof ORDER_TYPE_TABS[number];

interface OrderRow {
    id: string;
    ordererName: string; // 기관명 또는 사용자명
    type: string;
    currency: string;
    amount: number;
    cost: number;
    expectedProfit: number;
    actualProfit: number;
    salesChannel: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

const MOCK_ORDERS: OrderRow[] = [
    { id: 'ORD-2025-001', ordererName: '서울대학교병원', type: '구독', currency: 'KRW', amount: 5500000, cost: 4000000, expectedProfit: 1000000, actualProfit: 1000000, salesChannel: '본사', status: '상담', createdAt: '2025-02-10 14:30', updatedAt: '2025-02-10 14:30' },
    { id: 'ORD-2025-002', ordererName: '연세대학교병원', type: '장비/물품', currency: 'KRW', amount: 3300000, cost: 2500000, expectedProfit: 500000, actualProfit: 0, salesChannel: '본사', status: '진행', createdAt: '2025-02-10 11:20', updatedAt: '2025-02-11 09:00' },
    { id: 'ORD-2025-003', ordererName: '삼성서울병원', type: '구독', currency: 'KRW', amount: 11000000, cost: 8000000, expectedProfit: 2000000, actualProfit: 0, salesChannel: '메디컬에듀 판매처', status: '진행', createdAt: '2025-02-11 09:15', updatedAt: '2025-02-12 10:00' },
    { id: 'ORD-2025-004', ordererName: '가톨릭대학교 서울성모병원', type: '커스텀 서비스', currency: 'KRW', amount: 2750000, cost: 1500000, expectedProfit: 800000, actualProfit: 750000, salesChannel: '본사', status: '완료', createdAt: '2025-02-11 16:45', updatedAt: '2025-02-13 14:00' },
    { id: 'ORD-2025-005', ordererName: '분당서울대병원', type: '오픈클래스', currency: 'KRW', amount: 2200000, cost: 1200000, expectedProfit: 700000, actualProfit: 680000, salesChannel: '본사', status: '완료', createdAt: '2025-02-12 10:00', updatedAt: '2025-02-14 11:00' },
    { id: 'ORD-2025-006', ordererName: '강남세브란스병원', type: '장비/물품', currency: 'KRW', amount: 4400000, cost: 3200000, expectedProfit: 900000, actualProfit: -50000, salesChannel: '헬스케어솔루션', status: '환불완료', createdAt: '2025-02-09 15:30', updatedAt: '2025-02-15 16:00' },
    { id: 'ORD-2025-007', ordererName: '고려대학교안암병원', type: '구독', currency: 'KRW', amount: 1100000, cost: 800000, expectedProfit: 200000, actualProfit: 0, salesChannel: '본사', status: '대기', createdAt: '2025-02-08 13:20', updatedAt: '2025-02-08 13:20' },
];

export default function OrderManagement(): React.ReactElement {
    const navigate = useNavigate();
    const { user } = useAuth();
    const organizationId = user?.currentAccount?.organizationId ? parseInt(user.currentAccount.organizationId) : undefined;
    const basePath = '/admin';

    // TODO: Use order list query when Order API is available
    const loading = false;
    const [activeTab, setActiveTab] = useState<OrderTypeTab>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [salesChannelFilter, setSalesChannelFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersState, setOrdersState] = useState<OrderRow[]>(MOCK_ORDERS);
    const orders: OrderRow[] = useMemo(() => (isFeatureEnabled('USE_MOCK_DATA') ? ordersState : []), [ordersState]);

    const filteredOrders = useMemo(() => {
        return orders
            .filter((o) => activeTab === 'all' || o.type === activeTab)
            .filter((o) => {
                if (statusFilter && o.status !== statusFilter) return false;
                if (salesChannelFilter && o.salesChannel !== salesChannelFilter) return false;
                if (searchTerm.trim() && !o.ordererName.toLowerCase().includes(searchTerm.trim().toLowerCase())) return false;
                return true;
            });
    }, [orders, activeTab, searchTerm, statusFilter, salesChannelFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
    const paginatedData = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    /** 통계: 총 주문금액 + 유형별 주문금액·수익율 (orders 전체 기준) */
    const orderStats = useMemo(() => {
        const totalAmount = orders.reduce((sum, o) => sum + o.amount, 0);
        const totalProfit = orders.reduce((sum, o) => sum + o.expectedProfit, 0);
        const totalRate = totalAmount > 0 ? ((totalProfit / totalAmount) * 100).toFixed(1) : '0';
        const byType = (ORDER_TYPE_TABS.filter((t) => t !== 'all') as readonly string[]).map((type) => {
            const list = orders.filter((o) => o.type === type);
            const amount = list.reduce((s, o) => s + o.amount, 0);
            const profit = list.reduce((s, o) => s + o.expectedProfit, 0);
            const rate = amount > 0 ? ((profit / amount) * 100).toFixed(1) : '0';
            return { type, amount, profit, rate };
        });
        const totalCard = { label: '총 주문금액', value: `${totalAmount.toLocaleString()}원`, subLine: `수익율 ${totalRate}%`, filterValue: 'all' as const };
        const typeCards = byType.map(({ type, amount, rate }) => ({
            label: type,
            value: `${amount.toLocaleString()}원`,
            subLine: `수익율 ${rate}%`,
            filterValue: type,
        }));
        return [totalCard, ...typeCards];
    }, [orders]);

    /** 통계 카드 클릭 시 해당 목록 필터 + 카드 활성 표시 */
    const statsItemsWithClick = useMemo(() => {
        return orderStats.map((item) => {
            const { filterValue, ...rest } = item;
            return {
                ...rest,
                onClick: () => {
                    setActiveTab(filterValue as OrderTypeTab);
                    setCurrentPage(1);
                },
                isActive: activeTab === filterValue,
            };
        });
    }, [orderStats, activeTab]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const updateOrderStatus = (orderId: string, status: string) => {
        const now = new Date().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        setOrdersState((prev) => prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: now } : o)));
    };

    const handleDeleteOrder = (orderId: string) => {
        if (window.confirm('해당 주문을 삭제하시겠습니까?')) {
            setOrdersState((prev) => prev.filter((o) => o.id !== orderId));
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-gray-500">주문 목록을 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <>
            <PageHeader
                title="주문 관리"
                breadcrumbs={[
                    { label: '주문 관리' }
                ]}
                actions={
                    <div className="flex items-center gap-3">
                        <FilterGroup>
                            <DateRangeFilter
                                startDate={startDate}
                                endDate={endDate}
                                onStartDateChange={(val) => setStartDate(val)}
                                onEndDateChange={(val) => setEndDate(val)}
                            />
                        </FilterGroup>
                        <Button variant="lightdark" size="md" onClick={() => navigate(`${basePath}/order-management/create`)}>
                            <Plus size={16} className="mr-2" />
                            주문 등록
                        </Button>
                    </div>
                }
            />

            <div className="space-y-6">
                <StatsGrid items={statsItemsWithClick} columns={5} />

                <div>
                    <ListHeader
                        totalCount={filteredOrders.length}
                        rightContent={
                            <FilterGroup>
                                <SimpleSelect
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                    wrapperClassName="min-w-[80px]"
                                >
                                    <option value="">전체 상태</option>
                                    <option value="데모/견적">데모/견적</option>
                                    <option value="주문진행">주문진행</option>
                                    <option value="주문완료">주문완료</option>
                                    <option value="취소요청">취소요청</option>
                                    <option value="취소승인">취소승인</option>
                                    <option value="환불완료">환불완료</option>
                                </SimpleSelect>
                                <SimpleSelect
                                    value={salesChannelFilter}
                                    onChange={(e) => { setSalesChannelFilter(e.target.value); setCurrentPage(1); }}
                                    wrapperClassName="min-w-[80px]"
                                >
                                    <option value="">전체 판매처</option>
                                    <option value="본사">본사</option>
                                    <option value="메디컬에듀 판매처">메디컬에듀 판매처</option>
                                    <option value="헬스케어솔루션">헬스케어솔루션</option>
                                </SimpleSelect>
                                <div className="min-w-[280px] w-80">
                                    <SearchBar
                                        placeholder="주문번호, 주문자명 검색"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </FilterGroup>
                        }
                    />

                    <Table>
                                <TableHeader className="bg-brand-50">
                                    <TableRow>
                                        <TableHead className="text-center w-[140px]">주문번호</TableHead>
                                        <TableHead>주문자명</TableHead>
                                        {activeTab === 'all' && <TableHead className="w-[140px]">주문유형</TableHead>}
                                        <TableHead className="text-center w-[120px]">주문금액</TableHead>
                                        <TableHead className="text-center w-[120px]">(예상)매출이익</TableHead>
                                        <TableHead className="text-center w-[120px]">판매처</TableHead>
                                        <TableHead className="text-center w-[140px]">주문상태</TableHead>
                                        <TableHead className="text-center w-[160px]">수정일시</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-gray-50 text-sm">
                                                <TableCell className="font-mono text-sm">
                                                    <Link
                                                        to={`${basePath}/order-management/${item.id}`}
                                                        className="text-brand-600 hover:underline"
                                                    >
                                                        {item.id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{item.ordererName}</TableCell>
                                                {activeTab === 'all' && <TableCell>{item.type}</TableCell>}
                                                <TableCell className="text-right">{item.amount.toLocaleString()} 원</TableCell>
                                                <TableCell className="text-right">{item.expectedProfit.toLocaleString()} 원</TableCell>
                                                <TableCell className="text-center">{item.salesChannel}</TableCell>
                                                <TableCell className="text-center">
                                                    <SimpleSelect
                                                        value={item.status}
                                                        onChange={(e) => updateOrderStatus(item.id, e.target.value)}
                                                        wrapperClassName="w-full min-w-[100px]"
                                                    >
                                                        <option value="데모/견적">데모/견적</option>
                                                        <option value="주문진행">주문진행</option>
                                                        <option value="주문완료">주문완료</option>
                                                        <option value="취소요청">취소요청</option>
                                                        <option value="취소승인">취소승인</option>
                                                        <option value="환불완료">환불완료</option>
                                                    </SimpleSelect>
                                                </TableCell>
                                                <TableCell className="text-center">{item.updatedAt}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={activeTab === 'all' ? 8 : 7} className="h-40 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <Package size={40} className="text-gray-300 mb-2" />
                                                    <p className="font-medium">{activeTab === 'all' ? '주문이 없습니다.' : `해당 유형의 주문이 없습니다.`}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 pb-8">
                    {totalPages <= 1 ? (
                        <p className="text-sm text-gray-500" aria-live="polite">
                            전체 {filteredOrders.length}건 · 1 / 1 페이지
                        </p>
                    ) : null}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredOrders.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </>
    );
}
