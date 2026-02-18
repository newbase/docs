import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, SimpleSelect } from '@/components/shared/ui';
import CenteredPageLayout from '@/components/shared/layout/CenteredPageLayout';
import { isFeatureEnabled } from '../../config/featureFlags';

/** 프로덕트 유형별 품목 한 줄 (OrderCreate 품목 행과 동일 구조) */
export interface OrderDetailItem {
    id: string;
    productName: string;
    optionName?: string;       // 구독: 구독플랜, 장비/물품·커스텀: 옵션
    period?: number;
    periodUnit?: 'MONTH' | 'DAY';  // 구독·커스텀: 기간, 오픈클래스: 초대유효기간(일)
    startDate?: string;        // 품목별 시작일
    quantity: number;
    unitPrice: number;
    costPrice?: number;        // 장비/물품만
    amount: number;           // quantity * unitPrice
}

export interface OrderDetailRow {
    id: string;
    ordererName: string;
    type: string;
    currency: string;
    amount: number;
    cost: number;
    expectedProfit: number;
    actualProfit: number;
    salesChannel: string;
    status: string;
    orderNote?: string;
    items: OrderDetailItem[];
    createdAt: string;
    updatedAt: string;
}

export const MOCK_ORDERS: OrderDetailRow[] = [
    { id: 'ORD-2025-001', ordererName: '서울대학교병원', type: '콘텐츠', currency: 'KRW', amount: 5500000, cost: 4000000, expectedProfit: 1000000, actualProfit: 1000000, salesChannel: '본사', status: '상담', orderNote: '', items: [{ id: 'i1', productName: '메디컬 에듀 구독', optionName: 'Pro', period: 12, periodUnit: 'MONTH', startDate: '2025-03-01', quantity: 50, unitPrice: 110000, amount: 5500000 }], createdAt: '2025-02-10 14:30', updatedAt: '2025-02-10 14:30' },
    { id: 'ORD-2025-002', ordererName: '연세대학교병원', type: '상품', currency: 'KRW', amount: 3300000, cost: 2500000, expectedProfit: 500000, actualProfit: 0, salesChannel: '본사', status: '진행', items: [{ id: 'i1', productName: 'VR 헤드셋 패키지', optionName: '기본', startDate: '2025-02-15', quantity: 30, unitPrice: 100000, costPrice: 83333, amount: 3000000 }, { id: 'i2', productName: '설치 키트', optionName: '기본', startDate: '2025-02-20', quantity: 3, unitPrice: 100000, costPrice: 66667, amount: 300000 }], createdAt: '2025-02-10 11:20', updatedAt: '2025-02-11 09:00' },
    { id: 'ORD-2025-003', ordererName: '삼성서울병원', type: '콘텐츠', currency: 'KRW', amount: 11000000, cost: 8000000, expectedProfit: 2000000, actualProfit: 0, salesChannel: '메디컬에듀 판매처', status: '진행', items: [{ id: 'i1', productName: '메디컬 에듀 구독', optionName: 'Enterprise', period: 12, periodUnit: 'MONTH', startDate: '2025-03-15', quantity: 100, unitPrice: 110000, amount: 11000000 }], createdAt: '2025-02-11 09:15', updatedAt: '2025-02-12 10:00' },
    { id: 'ORD-2025-004', ordererName: '가톨릭대학교 서울성모병원', type: '서비스', currency: 'KRW', amount: 2750000, cost: 1500000, expectedProfit: 800000, actualProfit: 750000, salesChannel: '본사', status: '완료', items: [{ id: 'i1', productName: '맞춤 시뮬레이션 코스', optionName: '기본', period: 6, periodUnit: 'MONTH', startDate: '2025-02-20', quantity: 25, unitPrice: 110000, amount: 2750000 }], createdAt: '2025-02-11 16:45', updatedAt: '2025-02-13 14:00' },
    { id: 'ORD-2025-005', ordererName: '분당서울대병원', type: '콘텐츠', currency: 'KRW', amount: 2200000, cost: 1200000, expectedProfit: 700000, actualProfit: 680000, salesChannel: '본사', status: '완료', items: [{ id: 'i1', productName: '응급의료 오픈클래스', period: 30, periodUnit: 'DAY', startDate: '2025-02-25', quantity: 20, unitPrice: 110000, amount: 2200000 }], createdAt: '2025-02-12 10:00', updatedAt: '2025-02-14 11:00' },
    { id: 'ORD-2025-006', ordererName: '강남세브란스병원', type: '상품', currency: 'KRW', amount: 4400000, cost: 3200000, expectedProfit: 900000, actualProfit: -50000, salesChannel: '헬스케어솔루션', status: '환불완료', items: [{ id: 'i1', productName: 'VR 헤드셋 패키지', optionName: '기본', startDate: '2025-02-18', quantity: 40, unitPrice: 110000, costPrice: 80000, amount: 4400000 }], createdAt: '2025-02-09 15:30', updatedAt: '2025-02-15 16:00' },
    { id: 'ORD-2025-007', ordererName: '고려대학교안암병원', type: '콘텐츠', currency: 'KRW', amount: 1100000, cost: 800000, expectedProfit: 200000, actualProfit: 0, salesChannel: '본사', status: '대기', items: [{ id: 'i1', productName: '메디컬 에듀 구독', optionName: 'Basic', period: 12, periodUnit: 'MONTH', startDate: '2025-04-01', quantity: 10, unitPrice: 110000, amount: 1100000 }], createdAt: '2025-02-08 13:20', updatedAt: '2025-02-08 13:20' },
];

export default function OrderDetail(): React.ReactElement {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const basePath = '/admin';

    const order = useMemo(() => {
        if (!orderId) return null;
        if (isFeatureEnabled('USE_MOCK_DATA')) {
            return MOCK_ORDERS.find((o) => o.id === orderId) ?? null;
        }
        return null;
    }, [orderId]);

    if (!orderId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-red-500 font-medium">주문번호가 없습니다.</p>
                <Button variant="outline" onClick={() => navigate(`${basePath}/order-management`)}>
                    <ArrowLeft size={16} className="mr-2" />
                    목록으로
                </Button>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-red-500 font-medium">주문 정보를 찾을 수 없습니다.</p>
                <Button variant="outline" onClick={() => navigate(`${basePath}/order-management`)}>
                    <ArrowLeft size={16} className="mr-2" />
                    목록으로
                </Button>
            </div>
        );
    }

    const unit = order.currency === 'KRW' ? '원' : 'USD';
    const vatRate = order.currency === 'KRW' ? 10 : 0;
    const supplyValue = vatRate > 0 ? Math.round(order.amount / (1 + vatRate / 100)) : order.amount;
    const vatAmount = order.amount - supplyValue;

    return (
        <CenteredPageLayout
            title="주문 상세조회"
            maxWidth="max-w-5xl"
        >
            <div className="space-y-6 mt-6">
                <section className="bg-white rounded-lg border border-gray-400 shadow-sm space-y-4 px-6 py-4">
                    {/* 첫행: 주문번호, 등록일시, 수정일시, 주문상태 */}
                    <div className="grid grid-cols-4 gap-x-8 gap-y-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-medium shrink-0 w-20 text-gray-500">주문번호</span>
                            <span className="font-mono text-sm text-gray-900 truncate">{order.id}</span>
                        </div>
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-medium shrink-0 w-20 text-gray-500">등록일시</span>
                            <span className="text-sm text-gray-900 truncate">{order.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-medium shrink-0 w-20 text-gray-500">수정일시</span>
                            <span className="text-sm text-gray-900 truncate">{order.updatedAt}</span>
                        </div>
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-medium shrink-0 w-20 text-gray-500">주문상태</span>
                            <SimpleSelect
                                value={order.status}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {}}
                                wrapperClassName="min-w-20"
                            >
                                <option value="데모/견적">데모/견적</option>
                                <option value="주문진행">주문진행</option>
                                <option value="주문완료">주문완료</option>
                                <option value="취소요청">취소요청</option>
                                <option value="취소승인">취소승인</option>
                                <option value="환불완료">환불완료</option>
                            </SimpleSelect>
                        </div>
                    </div>

                    <div className="border-t border-gray-200" />

                    {/* 주문자명, 프로덕트 유형, 판매처, 통화 */}
                    <div className="grid grid-cols-4 gap-x-8 gap-y-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-medium shrink-0 w-20 text-gray-500">주문자명</span>
                            <span className="text-sm text-gray-900 truncate">{order.ordererName}</span>
                        </div>
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-medium shrink-0 w-20 text-gray-500">프로덕트 유형</span>
                            <span className="text-sm text-gray-900 truncate">{order.type}</span>
                        </div>
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-medium shrink-0 w-20 text-gray-500">판매처</span>
                            <span className="text-sm text-gray-900 truncate">{order.salesChannel}</span>
                        </div>
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-medium shrink-0 w-20 text-gray-500">통화</span>
                            <span className="text-sm text-gray-900 truncate">{order.currency === 'KRW' ? '원 (VAT 10%)' : 'USD'}</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200" />

                    {/* 금액 요약 */}
                    <div className="grid grid-cols-4 gap-x-8 gap-y-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-medium shrink-0 w-20 text-gray-500">총 매출</span>
                            <span className="text-sm font-semibold text-gray-900 tabular-nums">{order.amount.toLocaleString()} {unit}</span>
                        </div>
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-medium shrink-0 w-20 text-gray-500">총 원가</span>
                            <span className="text-sm font-semibold text-gray-900 tabular-nums">{order.cost.toLocaleString()} {unit}</span>
                        </div>
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-medium shrink-0 w-20 text-gray-500">부가세</span>
                            <span className="text-sm font-semibold text-gray-900 tabular-nums">{vatAmount.toLocaleString()} {unit}</span>
                        </div>
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-medium shrink-0 w-20 text-gray-500">(예상)수익</span>
                            <span className="text-sm font-semibold text-gray-900 tabular-nums">{order.expectedProfit.toLocaleString()} {unit}</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200" />

                    {/* 품목 정보 (프로덕트 유형별 상세: 콘텐츠·상품·서비스) */}
                    {order.items && order.items.length > 0 && (() => {
                        const type = order.type;
                        const isContent = type === '콘텐츠';
                        const isProduct = type === '상품';
                        const isService = type === '서비스';
                        const showOption = isContent;
                        const showSubscriptionPeriod = isContent || isService;
                        const showInvitePeriod = isContent; // 콘텐츠의 일 단위 기간(초대유효기간 등)
                        const showCostPrice = isProduct;
                        const colClass = 'whitespace-nowrap';
                        const numClass = 'text-right tabular-nums ' + colClass;
                        const thClass = 'px-3 py-2';
                                return (
                        <>
                            <div className="overflow-x-auto">
                                <Table className="w-full">
                                    <TableHeader className="bg-brand-50">
                                        <TableRow>
                                            <TableHead className={thClass + ' min-w-[11rem]'}>{'프로덕트'}</TableHead>
                                            {showOption && <TableHead className={thClass + ' min-w-[6rem]'}>{'구독플랜/옵션'}</TableHead>}
                                            {(showSubscriptionPeriod || showInvitePeriod) && <TableHead className={thClass + ' min-w-[6rem]'}>{'기간'}</TableHead>}
                                            <TableHead className={thClass + ' min-w-[5.5rem]'}>{'시작일'}</TableHead>
                                            <TableHead className={thClass + ' min-w-[4rem] text-center'}>{'수량'}</TableHead>
                                            <TableHead className={thClass + ' min-w-[5.5rem] ' + numClass}>{'단가'}</TableHead>
                                            {showCostPrice && <TableHead className={thClass + ' min-w-[5rem] ' + numClass}>{'원가'}</TableHead>}
                                            <TableHead className={thClass + ' min-w-[6rem] ' + numClass}>{'금액'}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item) => {
                                            const periodLabel = item.period != null && item.periodUnit
                                                ? `${item.period} ${item.periodUnit === 'MONTH' ? '개월' : '일'}`
                                                : '-';
                                            return (
                                                <TableRow key={item.id} className="text-sm">
                                                    <TableCell className={'font-medium px-3 py-2 ' + colClass}>{item.productName}</TableCell>
                                                    {showOption && <TableCell className={'px-3 py-2 ' + colClass}>{item.optionName ?? '-'}</TableCell>}
                                                    {(showSubscriptionPeriod || showInvitePeriod) && <TableCell className={'px-3 py-2 ' + colClass}>{periodLabel}</TableCell>}
                                                    <TableCell className={'px-3 py-2 ' + colClass}>{item.startDate ?? '-'}</TableCell>
                                                    <TableCell className={'px-3 py-2 text-center tabular-nums ' + colClass}>{item.quantity.toLocaleString()}</TableCell>
                                                    <TableCell className={'px-3 py-2 ' + numClass}>{item.unitPrice.toLocaleString()} {unit}</TableCell>
                                                    {showCostPrice && <TableCell className={'px-3 py-2 ' + numClass}>{item.costPrice != null ? `${item.costPrice.toLocaleString()} ${unit}` : '-'}</TableCell>}
                                                    <TableCell className={'font-medium px-3 py-2 ' + numClass}>{item.amount.toLocaleString()} {unit}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="border-t border-gray-200" />
                        </>
                                );
                    })()}

                    {/* 비고 */}
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700 w-20 pt-2">비고</label>
                        <div className="flex-1 text-sm text-gray-700 whitespace-pre-wrap">{order.orderNote || '-'}</div>
                    </div>
                </section>

                <div className="flex justify-end gap-2 pb-8">
                    <Button variant="outline" onClick={() => navigate(`${basePath}/order-management`)}>
                        <ArrowLeft size={16} className="mr-2" />
                        목록으로
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`${basePath}/order-management/${orderId}/edit`)}>
                        <Pencil size={16} className="mr-2" />
                        수정
                    </Button>
                    <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        onClick={() => {
                            if (window.confirm('이 주문을 삭제하시겠습니까?')) {
                                // TODO: 삭제 API 연동
                                navigate(`${basePath}/order-management`);
                            }
                        }}
                    >
                        <Trash2 size={16} className="mr-2" />
                        삭제
                    </Button>
                </div>
            </div>
        </CenteredPageLayout>
    );
}
