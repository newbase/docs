import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import { PageHeader, Button, Badge } from '@/components/shared/ui';
import { useClasses } from '../../data/queries/useClasses';
import { ClassItem } from '../../data/classes';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../lib/constants/routes';

interface Order {
    id: string;
    orderDate: string;
    classIds: string[];
    totalAmount: number;
    status: 'completed' | 'processing' | 'cancelled' | 'confirmed';
    paymentMethod: string;
}

export default function Orders(): React.ReactElement {
    const navigate = useNavigate();
    const { user } = useAuth();
    const organizationId = user?.currentAccount?.organizationId;
    const { classes } = useClasses(organizationId);
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [partialCancelMode, setPartialCancelMode] = useState<Record<string, boolean>>({}); // 주문별 부분취소 모드
    const [selectedClasses, setSelectedClasses] = useState<Record<string, Set<string>>>({}); // 주문별 선택된 클래스

    // 부분취소 모드 토글
    const togglePartialCancelMode = (orderId: string) => {
        const isCurrentlyActive = partialCancelMode[orderId];
        
        setPartialCancelMode(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
        
        if (isCurrentlyActive) {
            // 모드 해제 시 선택 초기화
            setSelectedClasses(prev => {
                const newSelected = { ...prev };
                delete newSelected[orderId];
                return newSelected;
            });
        } else {
            // 모드 활성화 시 모든 클래스 선택
            const order = orders.find(o => o.id === orderId);
            if (order) {
                setSelectedClasses(prev => ({
                    ...prev,
                    [orderId]: new Set(order.classIds)
                }));
            }
        }
    };

    // 클래스 선택/해제
    const toggleClassSelection = (orderId: string, classId: string) => {
        setSelectedClasses(prev => {
            const orderSelections = prev[orderId] || new Set<string>();
            const newSelections = new Set(orderSelections);
            
            if (newSelections.has(classId)) {
                newSelections.delete(classId);
            } else {
                newSelections.add(classId);
            }
            
            return {
                ...prev,
                [orderId]: newSelections
            };
        });
    };

    // 부분취소 처리
    const handlePartialCancel = (orderId: string, order: Order) => {
        const selectedClassIds = selectedClasses[orderId];
        
        if (!selectedClassIds || selectedClassIds.size === 0) {
            alert('취소할 클래스를 선택해주세요.');
            return;
        }

        // 선택된 클래스들의 취소 가능 여부 확인
        for (const classId of selectedClassIds) {
            const classItem = classes[classId];
            if (classItem) {
                // 기간모집 클래스 확인
                if (classItem.enrollmentType === 'scheduled' && classItem.courseStartDate) {
                    const startDate = new Date(classItem.courseStartDate);
                    startDate.setHours(0, 0, 0, 0);
                    const now = new Date();
                    
                    if (now >= startDate) {
                        alert(`${classItem.title}\n기간모집 강의는 수강 시작일부터 취소가 불가합니다.`);
                        return;
                    }
                }
                
                // 상시모집 클래스 확인
                if (classItem.enrollmentType === 'ongoing') {
                    const practiceKey = `practice_${orderId}_${classId}`;
                    const hasPractice = localStorage.getItem(practiceKey);
                    
                    if (hasPractice) {
                        alert(`${classItem.title}\n실습 이력이 있어 취소가 불가합니다.`);
                        return;
                    }
                }
            }
        }

        // 부분 환불 금액 계산
        const refundAmount = Array.from(selectedClassIds)
            .map(classId => classes[classId])
            .filter(Boolean)
            .reduce((sum, item) => {
                const price = item.discountPrice !== undefined ? item.discountPrice : (item.price || 0);
                return sum + price;
            }, 0);

        if (window.confirm(`선택한 ${selectedClassIds.size} 개 클래스를 취소하시겠습니까?\n환불 금액: ${refundAmount.toLocaleString()} 원`)) {
            // 남은 클래스 ID 계산
            const remainingClassIds = order.classIds.filter(id => !selectedClassIds.has(id));
            
            if (remainingClassIds.length === 0) {
                // 모든 클래스를 취소한 경우 주문 전체 취소
                updateOrderStatus(orderId, 'cancelled');
            } else {
                // 일부만 취소한 경우 클래스 목록 업데이트
                const updatedOrders = orders.map(o => 
                    o.id === orderId 
                        ? { ...o, classIds: remainingClassIds, totalAmount: o.totalAmount - refundAmount }
                        : o
                );
                setOrders(updatedOrders);
                localStorage.setItem('orders', JSON.stringify(updatedOrders));
            }
            
            // 부분취소 모드 해제 및 선택 초기화
            togglePartialCancelMode(orderId);
            alert('선택한 클래스가 취소되었습니다.\n환불이 진행됩니다.');
        }
    };

    // 주문 상태 업데이트
    const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
        const updatedOrders = orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
    };

    // 취소 가능 여부 확인
    const canCancelOrder = (order: Order): { canCancel: boolean; reason: string } => {
        // 수강확정 상태인 경우 취소 불가
        if (order.status === 'confirmed') {
            return {
                canCancel: false,
                reason: '수강이 확정된 주문은 취소가 불가합니다.'
            };
        }

        const orderClasses = order.classIds
            .map(id => classes[id])
            .filter(Boolean) as ClassItem[];

        // 각 클래스의 취소 가능 여부 확인
        for (const classItem of orderClasses) {
            // 기간모집 클래스인 경우
            if (classItem.enrollmentType === 'scheduled' && classItem.courseStartDate) {
                const startDate = new Date(classItem.courseStartDate);
                startDate.setHours(0, 0, 0, 0);
                const now = new Date();
                
                if (now >= startDate) {
                    return {
                        canCancel: false,
                        reason: '기간모집 강의는 수강 시작일 오전 00시 00분부터는 구매가 확정되어 수강취소가 불가합니다.'
                    };
                }
            }
            
            // 상시모집 클래스인 경우 (실습 이력 확인)
            if (classItem.enrollmentType === 'ongoing') {
                // TODO: 실제로는 API에서 실습 이력 확인
                // const practiceHistory = await checkPracticeHistory(order.id, classItem.id);
                // if (practiceHistory.count > 0) { ... }
                
                // Mock: localStorage에서 실습 이력 확인
                const practiceKey = `practice_${order.id}_${classItem.id}`;
                const hasPractice = localStorage.getItem(practiceKey);
                
                if (hasPractice) {
                    return {
                        canCancel: false,
                        reason: '상시모집 강의는 세션 시작 후 1회 이상 실습이력이 발생하면 구매가 확정되어 수강취소가 불가합니다.'
                    };
                }
            }
        }

        return { canCancel: true, reason: '' };
    };

    // 주문 취소 처리
    const handleCancelOrder = (orderId: string, order: Order) => {
        // 이미 취소된 주문은 처리하지 않음
        if (order.status === 'cancelled') {
            alert('이미 취소된 주문입니다.');
            return;
        }

        // 취소 가능 여부 확인
        const cancelCheck = canCancelOrder(order);
        if (!cancelCheck.canCancel) {
            alert(cancelCheck.reason);
            return;
        }

        // 간단한 확인 메시지
        if (window.confirm('주문을 취소하시겠습니까?')) {
            updateOrderStatus(orderId, 'cancelled');
            alert('주문이 취소되었습니다.\n전액 환불이 진행됩니다.');
        }
    };

    // processing/completed 상태의 주문을 자동으로 전환 (시뮬레이션)
    useEffect(() => {
        const autoTransitionTimer = setTimeout(() => {
            const updatedOrders = orders.map(order => {
                const orderDate = new Date(order.orderDate);
                const now = new Date();
                const diffMinutes = (now.getTime() - orderDate.getTime()) / (1000 * 60);
                
                // processing → completed (6초 후)
                if (order.status === 'processing' && diffMinutes >= 0.1) {
                    return { ...order, status: 'completed' as const };
                }
                
                // completed → confirmed (수강확정 체크)
                if (order.status === 'completed') {
                    const orderClasses = order.classIds
                        .map(id => classes[id])
                        .filter(Boolean) as ClassItem[];
                    
                    for (const classItem of orderClasses) {
                        // 기간모집: 수강 시작일이 지났으면 확정
                        if (classItem.enrollmentType === 'scheduled' && classItem.courseStartDate) {
                            const startDate = new Date(classItem.courseStartDate);
                            startDate.setHours(0, 0, 0, 0);
                            if (now >= startDate) {
                                return { ...order, status: 'confirmed' as const };
                            }
                        }
                        
                        // 상시모집: 실습 이력이 있으면 확정
                        if (classItem.enrollmentType === 'ongoing') {
                            const practiceKey = `practice_${order.id}_${classItem.id}`;
                            const hasPractice = localStorage.getItem(practiceKey);
                            if (hasPractice) {
                                return { ...order, status: 'confirmed' as const };
                            }
                        }
                    }
                }
                
                return order;
            });
            
            if (JSON.stringify(updatedOrders) !== JSON.stringify(orders)) {
                setOrders(updatedOrders);
                localStorage.setItem('orders', JSON.stringify(updatedOrders));
            }
        }, 10000); // 10초마다 체크

        return () => clearTimeout(autoTransitionTimer);
    }, [orders, classes]);

    // 주문 데이터 로드
    useEffect(() => {
        // localStorage에서 주문 로드
        const savedOrders = localStorage.getItem('orders');
        if (savedOrders) {
            try {
                const parsedOrders = JSON.parse(savedOrders);
                setOrders(Array.isArray(parsedOrders) ? parsedOrders : []);
            } catch {
                setOrders([]);
            }
        } else {
            // 초기 Mock 데이터 설정 (주문이 없을 때만)
            const mockOrders: Order[] = [
                {
                    id: 'ORD-2026-001',
                    orderDate: '2026-01-15T10:30:00',
                    classIds: ['001', '002'],
                    totalAmount: 300000,
                    status: 'completed',
                    paymentMethod: '신용카드'
                },
                {
                    id: 'ORD-2026-002',
                    orderDate: '2026-01-20T14:45:00',
                    classIds: ['003'],
                    totalAmount: 150000,
                    status: 'processing',
                    paymentMethod: '계좌이체'
                }
            ];
            setOrders(mockOrders);
            localStorage.setItem('orders', JSON.stringify(mockOrders));
        }
        
        // 실제 구현 시: API에서 주문 목록 가져오기
        // fetchOrders().then(setOrders);
    }, []);

    // 주문 상태 배지
    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'completed':
                return { label: '구매완료', variant: 'default' as const, icon: CheckCircle, className: 'bg-green-100 text-green-700' };
            case 'processing':
                return { label: '결제 진행중', variant: 'default' as const, icon: Clock, className: 'bg-blue-100 text-blue-700' };
            case 'confirmed':
                return { label: '구매확정', variant: 'default' as const, icon: CheckCircle, className: 'bg-purple-100 text-purple-700' };
            case 'cancelled':
                return { label: '취소완료', variant: 'secondary' as const, icon: XCircle, className: '' };
            default:
                return { label: '주문 확인중', variant: 'secondary' as const, icon: Clock, className: '' };
        }
    };

    // 주문의 클래스 정보 가져오기
    const getOrderClasses = (classIds: string[]) => {
        return classIds
            .map(id => classes[id])
            .filter(Boolean) as ClassItem[];
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* 페이지 타이틀 */}
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">주문관리</h1>
                {/* 필터 */}
                {orders.length === 0 ? (
                    // 빈 주문 목록
                    <div className="bg-gray-50 rounded-lg p-8 sm:p-12 text-center">
                        <Package size={48} className="mx-auto mb-3 sm:mb-4 text-gray-300 sm:w-16 sm:h-16" />
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                            주문 내역이 없습니다
                        </h3>
                        <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
                            관심있는 클래스를 찾아보세요
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES.COMMON.CLASS_LIST)}
                        >
                            클래스 둘러보기
                        </Button>
                    </div>
                ) : (
                    // 주문 목록
                    <div className="space-y-4 sm:space-y-6 rounded-lg">
                        {orders.map((order) => {
                            const orderClasses = getOrderClasses(order.classIds);
                            const statusInfo = getStatusBadge(order.status);
                            const StatusIcon = statusInfo.icon;
                            
                            // 주문일시 포맷팅 (YYYY-MM-DD HH:MM)
                            const formatOrderDate = (dateString: string) => {
                                const date = new Date(dateString);
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const hours = String(date.getHours()).padStart(2, '0');
                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                return `${year}-${month}-${day} ${hours}:${minutes}`;
                            };

                            return (
                                    <div key={order.id} className="rounded-lg border border-gray-400 overflow-hidden">
                                    {/* 주문 헤더 */}
                                    <div className="px-4 sm:px-6 pt-3 sm:pt-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-600">
                                                <Calendar size={16} />
                                                <span>{formatOrderDate(order.orderDate)}</span>
                                            </div>
                                            <Badge variant={statusInfo.variant} className={`flex items-center text-xs sm:text-sm font-medium gap-1 self-start sm:self-auto ${statusInfo.className}`}>
                                                {statusInfo.label}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* 주문 상품 */}
                                    <div className="px-4 sm:px-6 py-2 sm:py-3">
                                            {orderClasses.map((item) => (
                                                <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 py-3 ${partialCancelMode[order.id] ? '' : 'hover:bg-gray-50'}`}>
                                                    <div className="flex items-start gap-2 sm:gap-3 flex-1">
                                                        {/* 체크박스 */}
                                                        {partialCancelMode[order.id] && (
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 mt-1 cursor-pointer flex-shrink-0"
                                                                checked={selectedClasses[order.id]?.has(item.id) || false}
                                                                onChange={() => toggleClassSelection(order.id, item.id)}
                                                            />
                                                        )}

                                                        {/* 클래스 정보 */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 
                                                                className="text-sm sm:text-base font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-800"
                                                                onClick={() => navigate(`/open-class/${item.id}`)}
                                                            >
                                                                {item.title}
                                                            </h3>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                                                {item.organizationName && (
                                                                    <span>{item.organizationName}</span>
                                                                )}
                                                                {item.organizationName && item.participationPeriod && (
                                                                    <span className="hidden sm:inline text-gray-400">|</span>
                                                                )}
                                                                {item.participationPeriod && (
                                                                    <span>
                                                                        수강기간: {item.participationPeriod.startDate} ~ {item.participationPeriod.endDate}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 가격 */}
                                                    <div className="text-left sm:text-right pl-6 sm:pl-0">
                                                        {item.discountPrice !== undefined ? (
                                                            <p className="text-sm sm:text-base font-medium text-gray-800">
                                                                {item.discountPrice.toLocaleString()} 원
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm sm:text-base font-semibold text-gray-900">
                                                                {item.price?.toLocaleString()} 원
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>

                                    {/* 주문 푸터 */}
                                    <div className="px-4 sm:px-6 pb-3 sm:pb-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                                                <CreditCard size={16} />
                                                <span>{order.paymentMethod}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                <div className="text-left sm:text-right">
                                                    <span className="text-xs sm:text-sm text-gray-600 mr-2">총 결제금액</span>
                                                    <span className="text-base sm:text-lg font-bold text-gray-900">
                                                        {order.totalAmount.toLocaleString()} 원
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {(order.status === 'completed' || order.status === 'confirmed') && !partialCancelMode[order.id] && (
                                                        <Button
                                                            variant="lightdark"
                                                            size="md"
                                                            onClick={() => navigate('/student/my-classes')}
                                                        >
                                                            조회하기
                                                        </Button>
                                                    )}
                                                    {order.status !== 'cancelled' && order.status !== 'confirmed' && (
                                                        <>
                                                            {!partialCancelMode[order.id] ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="md"
                                                                    onClick={() => togglePartialCancelMode(order.id)}
                                                                >
                                                                    구매취소
                                                                </Button>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        variant="lightdark"
                                                                        size="md"
                                                                        onClick={() => handlePartialCancel(order.id, order)}
                                                                        disabled={!selectedClasses[order.id] || selectedClasses[order.id].size === 0}
                                                                    >
                                                                        구매취소 확인
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="md"
                                                                        onClick={() => togglePartialCancelMode(order.id)}
                                                                    >
                                                                        닫기
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 주문취소 및 환불정책 안내 */}
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-base sm:text-lg font-bold text-brand-600 mb-2 sm:mb-3">주문취소 및 환불정책</h3>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
                        <p>• 대면 참여 클래스는 수강 시작일 오전 00시 00분부터는 구매가 확정되어 수강취소가 불가합니다.</p>
                        <p>• 온라인 참여 클래스는 세션 시작 후 1회 이상 실습이력이 발생하면 구매가 확정되어 수강취소가 불가합니다.</p>
                        <p>• 구매확정 이전에는 수강취소가 가능하며 전액환불이 됩니다.</p>
                        <p>• 환불은 구매취소 후 카드사 사정에 따라 영업일 기준 최대 7일 내외로 소요될 수 있습니다.</p>
                        <p>• 교육 참가 자격조건에 부합하지만 부득이한 사유로 인해 인원 조정이 필요한 경우 수강이 취소될 수 있습니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
