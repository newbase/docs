import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, CreditCard, Building2, User, Mail, Phone, Briefcase } from 'lucide-react';
import { PageHeader, Button } from '@/components/shared/ui';
import CenteredPageLayout from '../../components/shared/layout/CenteredPageLayout';
import { useClasses } from '../../data/queries/useClasses';
import { ClassItem } from '../../data/classes';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../data/queries/useUser';
import { ROUTES } from '../../lib/constants/routes';
import { setMyClassStatus } from '../../utils/myClassStatus';

export interface OrderConfirmItem {
    classId: string;
    quantity: number;
}

interface OrderConfirmState {
    items?: OrderConfirmItem[];
    selectedClassIds?: string[];
    totalPrice: number;
}

export default function OrderConfirm(): React.ReactElement {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, getCurrentRole } = useAuth();
    const { getProfile } = useUser();
    const role = getCurrentRole();
    const organizationId = user?.currentAccount?.organizationId;
    const { classes } = useClasses(organizationId);

    const state = location.state as OrderConfirmState;
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'bank'>('credit');
    const [agreeTerms, setAgreeTerms] = useState(false);

    // 수강신청자 정보
    const [applicantInfo, setApplicantInfo] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        organization: '',
        jobRole: ''
    });

    // state가 없으면 장바구니로 리다이렉트
    useEffect(() => {
        const hasItems = state?.items?.length;
        const hasIds = state?.selectedClassIds?.length;
        if (!state || (!hasItems && !hasIds)) {
            alert('잘못된 접근입니다.');
            const cartPath = role === 'master' ? ROUTES.MASTER.BASE + '/cart' : ROUTES.STUDENT.BASE + '/cart';
            navigate(cartPath);
        }
    }, [state, navigate, role]);

    // 수강신청자 정보 불러오기
    useEffect(() => {
        const loadApplicantInfo = async () => {
            try {
                // API에서 프로필 정보 가져오기
                const profile = await getProfile();

                // localStorage에서 추가 정보 가져오기
                const savedPhoneNumber = localStorage.getItem('userPhoneNumber') || '';
                const savedJobRole = localStorage.getItem('userJobRole') || '';
                const savedCustomJobRole = localStorage.getItem('userCustomJobRole') || '';

                // 직무 처리 (직접입력인 경우 customJobRole 사용)
                const finalJobRole = savedJobRole === '직접입력' ? savedCustomJobRole : savedJobRole;

                setApplicantInfo({
                    name: profile.realName || user?.name || '',
                    email: profile.email || user?.email || '',
                    phoneNumber: savedPhoneNumber,
                    organization: user?.currentAccount?.organizationName || '',
                    jobRole: finalJobRole
                });
            } catch (error) {
                console.error('수강신청자 정보 불러오기 실패:', error);
                // 실패 시 기본 정보 사용
                setApplicantInfo({
                    name: user?.name || '',
                    email: user?.email || '',
                    phoneNumber: localStorage.getItem('userPhoneNumber') || '',
                    organization: user?.currentAccount?.organizationName || '',
                    jobRole: localStorage.getItem('userJobRole') === '직접입력'
                        ? localStorage.getItem('userCustomJobRole') || ''
                        : localStorage.getItem('userJobRole') || ''
                });
            }
        };

        loadApplicantInfo();
    }, [getProfile, user]);

    if (!state) {
        return <></>;
    }

    const { items: stateItems, selectedClassIds = [], totalPrice } = state;
    const orderItems: Array<{ class: ClassItem; quantity: number }> = stateItems?.length
        ? stateItems
            .map(({ classId, quantity }) => {
                const c = classes[classId];
                return c ? { class: c, quantity } : null;
            })
            .filter(Boolean) as Array<{ class: ClassItem; quantity: number }>
        : selectedClassIds
            .map(id => {
                const c = classes[id];
                return c ? { class: c, quantity: 1 } : null;
            })
            .filter(Boolean) as Array<{ class: ClassItem; quantity: number }>;

    const selectedClassIdsList = stateItems?.map(i => i.classId) ?? selectedClassIds;

    const originalTotal = orderItems.reduce((sum, { class: item, quantity }) => sum + (item.price || 0) * quantity, 0);
    const discountTotal = orderItems
        .filter(({ class: item }) => item.discountPrice !== undefined)
        .reduce((sum, { class: item, quantity }) => sum + ((item.price || 0) - (item.discountPrice || 0)) * quantity, 0);

    // 주문 ID 생성
    const generateOrderId = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `ORD-${year}-${month}${day}-${random}`;
    };

    // 최종 결제하기
    const handleFinalCheckout = () => {
        if (!agreeTerms) {
            alert('환불 정책에 동의해주세요.');
            return;
        }

        const newOrder = {
            id: generateOrderId(),
            orderDate: new Date().toISOString(),
            classIds: selectedClassIdsList,
            totalAmount: totalPrice,
            status: 'processing',
            paymentMethod: paymentMethod === 'credit' ? '신용카드' : '계좌이체'
        };

        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        existingOrders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(existingOrders));

        selectedClassIdsList.forEach((id) => {
            setMyClassStatus(id, 'eligible');
        });

        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                const cartEntries = Array.isArray(parsed)
                    ? parsed.map((x: unknown) =>
                        x && typeof x === 'object' && 'id' in x
                            ? { id: (x as { id: string }).id, quantity: (x as { quantity?: number }).quantity ?? 1 }
                            : typeof x === 'string'
                                ? { id: x, quantity: 1 }
                                : null
                    ).filter(Boolean) as Array<{ id: string; quantity: number }>
                    : [];
                const removeIds = new Set(selectedClassIdsList);
                const remaining = cartEntries.filter(e => !removeIds.has(e.id));
                localStorage.setItem('cart', JSON.stringify(remaining));
            } catch {
                // ignore
            }
        }

        // 성공 메시지 및 마이클래스로 이동
        alert(`주문이 완료되었습니다.\n주문번호: ${newOrder.id}`);
        const myClassesPath = role === 'master' ? `${ROUTES.MASTER.BASE}/my-classes` : `${ROUTES.STUDENT.BASE}/my-classes`;
        navigate(myClassesPath);
    };

    return (
        <CenteredPageLayout title="주문정보 확인">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 주문 내역 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 신청 클래스 목록 */}
                    <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">신청 클래스</h2>
                        <div className="space-y-4">
                            {orderItems.map(({ class: item, quantity }) => {
                                const unitPrice = item.discountPrice !== undefined ? item.discountPrice : (item.price || 0);
                                const lineTotal = unitPrice * quantity;
                                return (
                                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                                        <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.thumbnail ? (
                                                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                                            {item.organizationName && (
                                                <p className="text-sm text-gray-500 mb-2">{item.organizationName}</p>
                                            )}
                                            {quantity > 1 && (
                                                <p className="text-sm text-gray-500">수량: {quantity}개</p>
                                            )}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            {item.discountPrice !== undefined ? (
                                                <>
                                                    <div className="text-sm text-gray-400 line-through mb-1">
                                                        {item.price?.toLocaleString()} 원 {quantity > 1 && `× ${quantity}`}
                                                    </div>
                                                    <div className="text-base font-semibold text-blue-500">
                                                        {lineTotal.toLocaleString()} 원
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-base font-semibold text-gray-800">
                                                    {lineTotal.toLocaleString()} 원
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* 주문자 정보 */}
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            {/* 타이틀과 수정하기 버튼 */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold text-gray-800">주문자 정보</h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-sm font-semibold"
                                    onClick={() => navigate('/settings')}
                                >
                                    수정하기
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {/* 이름 */}
                                <div className="flex items-center font-medium gap-3">
                                    <User size={16} className="text-gray-500 flex-shrink-0" />
                                    <div className="flex flex-1 items-center">
                                        <div className="text-sm text-gray-500 w-24 flex-shrink-0">이름</div>
                                        <div className="text-sm text-gray-800">
                                            {applicantInfo.name || '정보 없음'}
                                        </div>
                                    </div>
                                </div>

                                {/* 이메일 */}
                                <div className="flex items-center font-medium gap-3">
                                    <Mail size={16} className="text-gray-500 flex-shrink-0" />
                                    <div className="flex flex-1 items-center">
                                        <div className="text-sm text-gray-500 w-24 flex-shrink-0">이메일</div>
                                        <div className="text-sm text-gray-800">
                                            {applicantInfo.email || '정보 없음'}
                                        </div>
                                    </div>
                                </div>

                                {/* 휴대폰번호 */}
                                <div className="flex items-center font-medium gap-3">
                                    <Phone size={16} className="text-gray-500 flex-shrink-0" />
                                    <div className="flex flex-1 items-center">
                                        <div className="text-sm text-gray-500 w-24 flex-shrink-0">휴대폰번호</div>
                                        <div className="text-sm text-gray-800">
                                            {applicantInfo.phoneNumber || '정보 없음'}
                                        </div>
                                    </div>
                                </div>

                                {/* 소속기관 */}
                                <div className="flex items-center font-medium gap-3">
                                    <Building2 size={16} className="text-gray-500 flex-shrink-0" />
                                    <div className="flex flex-1 items-center">
                                        <div className="text-sm text-gray-500 w-24 flex-shrink-0">소속기관</div>
                                        <div className="text-sm text-gray-800">
                                            {applicantInfo.organization || '정보 없음'}
                                        </div>
                                    </div>
                                </div>

                                {/* 직무 */}
                                <div className="flex items-center font-medium gap-3">
                                    <Briefcase size={16} className="text-gray-500 flex-shrink-0" />
                                    <div className="flex flex-1 items-center">
                                        <div className="text-sm text-gray-500 w-24 flex-shrink-0">직무</div>
                                        <div className="text-sm text-gray-800">
                                            {applicantInfo.jobRole || '정보 없음'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                            {/* 서비스 이용 및 환불 정책*/}
                            <div className="border-t border-gray-200 pt-6 mt-6">
                            <h2 className="text-base font-semibold text-gray-800 mb-4">서비스 이용 및 환불 정책</h2>
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <ul className="space-y-1 text-sm text-gray-700">
                                    <li>• 결제완료 또는 관리자 승인 후 초대코드를 이메일로 보내드립니다.</li>
                                    <li>• 주문자와 참가자가 다른 경우, 참가자에게 초대코드를 전달해주세요.</li>
                                    <li>• 교육 당일 또는 세션 시작 이전에는 수강취소가 가능하며 전액환불 됩니다.</li>
                                    <li>• 대면 교육은 관리자 승인 후 수강이 확정되며, 관리자 취소 시 수강료 전액 자동 환불됩니다.</li>
                                    <li>• 세션 시작 이후에는 환불이 불가능합니다.</li>
                                    <li>• 환불 처리는 영업일 기준 3-5일이 소요될 수 있습니다.</li>
                                </ul>
                            </div>
                            <label className="flex items-center gap-2 px-4 py-2 border border-red-300 hover:bg-red-50 rounded-lg cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600"
                                />
                                <span className="text-sm text-gray-700"> 동의합니다 (필수)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 결제 정보 요약 */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-6 sticky top-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            결제정보
                        </h3>

                        <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">선택한 클래스</span>
                                <span className="font-medium text-gray-900">
                                    {orderItems.reduce((acc, { quantity }) => acc + quantity, 0)} 개
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">총 상품금액</span>
                                <span className="font-medium text-gray-900">
                                    {originalTotal.toLocaleString()} 원
                                </span>
                            </div>
                            {discountTotal > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">할인금액</span>
                                    <span className="font-medium text-red-600">
                                        -{discountTotal.toLocaleString()} 원
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between mb-6 pt-2">
                            <span className="text-sm font-bold text-gray-900">최종 결제금액</span>
                            <span className="text-base font-bold text-blue-500">
                                {totalPrice.toLocaleString()} 원
                            </span>
                        </div>

                        <div className="space-y-2">
                            <Button
                                variant="primary"
                                size="md"
                                className="w-full"
                                onClick={handleFinalCheckout}
                                disabled={!agreeTerms}
                            >
                                결제하기
                            </Button>
                            <Button
                                variant="outline"
                                size="md"
                                className="w-full"
                                onClick={() => navigate(-1)}
                            >
                                이전으로
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </CenteredPageLayout>
    );
}
