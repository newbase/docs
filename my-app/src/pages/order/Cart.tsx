import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import { PageHeader, Button, Modal, Input } from '@/components/shared/ui';
import { useClasses } from '../../data/queries/useClasses';
import { ClassItem } from '../../data/classes';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../lib/constants/routes';

const QUOTE_REQUESTS_KEY = 'quoteRequests';

export interface CartItemEntry {
    id: string;
    quantity: number;
}

function parseCart(raw: string | null): CartItemEntry[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((x: unknown) => {
                if (x && typeof x === 'object' && 'id' in x && typeof (x as { id: unknown }).id === 'string') {
                    const q = (x as { quantity?: number }).quantity;
                    return { id: (x as { id: string }).id, quantity: typeof q === 'number' && q >= 1 ? q : 1 };
                }
                if (typeof x === 'string') return { id: x, quantity: 1 };
                return null;
            }).filter(Boolean) as CartItemEntry[];
        }
        return [];
    } catch {
        return [];
    }
}

function saveCart(items: CartItemEntry[]) {
    localStorage.setItem('cart', JSON.stringify(items));
}

export interface QuoteRequestRecord {
    id: string;
    organizationName: string;
    name: string;
    department: string;
    phone: string;
    email: string;
    message: string;
    selectedClassIds: string[];
    selectedItems: CartItemEntry[];
    createdAt: string;
}

export default function Cart(): React.ReactElement {
    const navigate = useNavigate();
    const { user, getCurrentRole } = useAuth();
    const role = getCurrentRole();
    const organizationId = user?.currentAccount?.organizationId;
    const { classes } = useClasses(organizationId);

    const [cartItems, setCartItems] = useState<CartItemEntry[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [quoteModalOpen, setQuoteModalOpen] = useState(false);
    const [quoteForm, setQuoteForm] = useState({
        organizationName: user?.currentAccount?.organizationName ?? '',
        name: user?.name ?? '',
        department: '',
        phone: '',
        email: user?.email ?? '',
        message: ''
    });

    const loadCart = useCallback(() => {
        const raw = localStorage.getItem('cart');
        const items = parseCart(raw);
        if (items.length > 0) {
            setCartItems(items);
            setSelectedItems(new Set(items.map(i => i.id)));
        } else {
            const mockCartItems: CartItemEntry[] = [
                { id: '002', quantity: 1 },
                { id: '003', quantity: 1 }
            ];
            setCartItems(mockCartItems);
            saveCart(mockCartItems);
            setSelectedItems(new Set(mockCartItems.map(i => i.id)));
        }
    }, []);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    useEffect(() => {
        setQuoteForm(prev => ({
            ...prev,
            organizationName: user?.currentAccount?.organizationName ?? prev.organizationName,
            name: user?.name ?? prev.name,
            email: user?.email ?? prev.email
        }));
    }, [user?.currentAccount?.organizationName, user?.name, user?.email]);

    const getQuantity = (classId: string): number => {
        const entry = cartItems.find(e => e.id === classId);
        return entry ? entry.quantity : 1;
    };

    const updateQuantity = (classId: string, quantity: number) => {
        const q = Math.max(1, Math.min(999, quantity));
        const next = cartItems.map(e => e.id === classId ? { ...e, quantity: q } : e);
        setCartItems(next);
        saveCart(next);
    };

    const removeFromCart = (classId: string) => {
        const updatedCart = cartItems.filter(e => e.id !== classId);
        setCartItems(updatedCart);
        saveCart(updatedCart);
        const newSelected = new Set(selectedItems);
        newSelected.delete(classId);
        setSelectedItems(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === cartItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(cartItems.map(i => i.id)));
        }
    };

    const toggleSelect = (classId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(classId)) newSelected.delete(classId);
        else newSelected.add(classId);
        setSelectedItems(newSelected);
    };

    const removeSelected = () => {
        const ids = new Set(selectedItems);
        const updatedCart = cartItems.filter(e => !ids.has(e.id));
        setCartItems(updatedCart);
        saveCart(updatedCart);
        setSelectedItems(new Set());
    };

    const cartClasses = cartItems
        .map(entry => classes[entry.id])
        .filter(Boolean) as ClassItem[];

    const selectedEntries = cartItems.filter(e => selectedItems.has(e.id));
    const totalPrice = selectedEntries.reduce<number>((sum, entry) => {
        const item = classes[entry.id] as ClassItem | undefined;
        if (!item) return sum;
        const price = item.discountPrice !== undefined ? item.discountPrice : (item.price || 0);
        return sum + price * entry.quantity;
    }, 0);

    const totalSelectedCount = selectedEntries.reduce((acc, e) => acc + e.quantity, 0);

    const handleCheckout = () => {
        if (selectedItems.size === 0) {
            alert('결제할 클래스를 선택해주세요.');
            return;
        }
        if (role === 'guest') {
            if (window.confirm('결제를 진행하려면 이메일 인증이 필요합니다.\n이메일 인증 페이지로 이동하시겠습니까?')) {
                navigate(ROUTES.AUTH.EMAIL_VERIFICATION);
            }
            return;
        }
        const items = selectedEntries.map(e => ({ classId: e.id, quantity: e.quantity }));
        navigate('/order-confirm', {
            state: {
                items,
                selectedClassIds: items.map(i => i.classId),
                totalPrice
            }
        });
    };

    const handleQuoteRequest = () => {
        if (selectedItems.size === 0) {
            alert('견적 문의할 클래스를 선택해주세요.');
            return;
        }
        setQuoteModalOpen(true);
    };

    const submitQuoteRequest = () => {
        const { organizationName, name, department, phone, email, message } = quoteForm;
        if (!organizationName.trim() || !name.trim() || !phone.trim() || !email.trim()) {
            alert('기관명, 이름, 휴대폰, 이메일을 입력해주세요.');
            return;
        }
        const list: QuoteRequestRecord[] = JSON.parse(localStorage.getItem(QUOTE_REQUESTS_KEY) || '[]');
        const record: QuoteRequestRecord = {
            id: `QR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            organizationName: organizationName.trim(),
            name: name.trim(),
            department: department.trim(),
            phone: phone.trim(),
            email: email.trim(),
            message: message.trim(),
            selectedClassIds: selectedEntries.map(e => e.id),
            selectedItems: selectedEntries,
            createdAt: new Date().toISOString()
        };
        list.unshift(record);
        localStorage.setItem(QUOTE_REQUESTS_KEY, JSON.stringify(list));
        setQuoteModalOpen(false);
        setQuoteForm({ organizationName: '', name: '', department: '', phone: '', email: '', message: '' });
        alert('견적문의가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.');
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="장바구니"
                breadcrumbs={[
                    { label: '장바구니', link: ROUTES.COMMON.CLASS_LIST }
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {cartItems.length === 0 ? (
                    <div className="rounded-lg p-12 text-center">
                        <ShoppingCart size={64} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            장바구니가 비어있습니다
                        </h3>
                        <p className="text-gray-500 mb-6">
                            관심있는 클래스를 장바구니에 담아보세요
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES.COMMON.CLASS_LIST)}
                        >
                            클래스 둘러보기
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg border border-gray-400 shadow-sm">
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">전체선택</span>
                                    </div>
                                    <button
                                        onClick={removeSelected}
                                        disabled={selectedItems.size === 0}
                                        className="text-sm text-gray-800 rounded-md px-2 py-1 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <Trash2 size={14} />
                                        선택삭제
                                    </button>
                                </div>

                                {cartItems.map((entry) => {
                                    const item = classes[entry.id] as ClassItem | undefined;
                                    if (!item) return null;
                                    const price = item.discountPrice !== undefined ? item.discountPrice : (item.price || 0);
                                    const lineTotal = price * entry.quantity;
                                    return (
                                        <div key={item.id} className="p-4 hover:bg-gray-50 border-b border-gray-200 rounded-md">
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.has(item.id)}
                                                    onChange={() => toggleSelect(item.id)}
                                                    className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 mt-1"
                                                />
                                                <div
                                                    className="w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                                                    onClick={() => navigate(`/open-class/${item.id}`)}
                                                >
                                                    {item.thumbnail ? (
                                                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3
                                                        className="text-base font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
                                                        onClick={() => navigate(`/open-class/${item.id}`)}
                                                    >
                                                        {item.title}
                                                    </h3>
                                                    {item.organizationName && (
                                                        <p className="text-sm font-medium text-gray-800 mb-2">{item.organizationName}</p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                        {item.price !== undefined && (
                                                            <>
                                                                <span className={item.discountPrice !== undefined ? 'text-sm text-gray-400 line-through' : 'text-base font-medium text-gray-900'}>
                                                                    {item.price.toLocaleString()} 원
                                                                </span>
                                                                {item.discountPrice !== undefined && (
                                                                    <span className="text-base font-medium text-blue-500">
                                                                        {item.discountPrice.toLocaleString()} 원
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-sm text-gray-600 whitespace-nowrap">수량</span>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={999}
                                                        value={entry.quantity}
                                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10) || 1)}
                                                        className="w-16 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                    />
                                                    <span className="text-sm font-medium text-gray-900 w-20 text-right">
                                                        {(lineTotal).toLocaleString()} 원
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-gray-400 p-2 rounded-md hover:text-gray-800 transition-colors flex-shrink-0"
                                                    aria-label="삭제"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-6 sticky top-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">결제정보</h3>
                                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">선택한 클래스</span>
                                        <span className="font-medium text-gray-900">{totalSelectedCount} 개</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">총 상품금액</span>
                                        <span className="font-medium text-gray-900">
                                            {selectedEntries
                                                .reduce((sum, e) => {
                                                    const it = classes[e.id] as ClassItem | undefined;
                                                    return sum + (it?.price ?? 0) * e.quantity;
                                                }, 0)
                                                .toLocaleString()} 원
                                        </span>
                                    </div>
                                    {selectedEntries.some(e => (classes[e.id] as ClassItem)?.discountPrice !== undefined) && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">할인금액</span>
                                            <span className="font-medium text-red-600">
                                                -{selectedEntries
                                                    .reduce((sum, e) => {
                                                        const it = classes[e.id] as ClassItem | undefined;
                                                        if (!it || it.discountPrice == null) return sum;
                                                        return sum + ((it.price ?? 0) - it.discountPrice) * e.quantity;
                                                    }, 0)
                                                    .toLocaleString()} 원
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mb-6 pt-2">
                                    <span className="text-base font-bold text-gray-900">최종 결제금액</span>
                                    <span className="text-xl font-semibold text-blue-500">{totalPrice.toLocaleString()} 원</span>
                                </div>
                                {role === 'master' ? (
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-full"
                                            onClick={handleCheckout}
                                            disabled={selectedItems.size === 0}
                                        >
                                            {selectedItems.size > 0 ? '온라인 주문하기' : '클래스를 선택해주세요'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-full"
                                            onClick={handleQuoteRequest}
                                            disabled={selectedItems.size === 0}
                                        >
                                            견적문의
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                        onClick={handleCheckout}
                                        disabled={selectedItems.size === 0}
                                    >
                                        {role === 'guest'
                                            ? '이메일 인증하고 온라인 주문하기'
                                            : selectedItems.size > 0
                                                ? '온라인 주문하기'
                                                : '클래스를 선택해주세요'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={quoteModalOpen}
                onClose={() => setQuoteModalOpen(false)}
                title="견적문의"
                size="medium"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setQuoteModalOpen(false)}>취소</Button>
                        <Button variant="primary" onClick={submitQuoteRequest}>문의 접수</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="기관명"
                        value={quoteForm.organizationName}
                        onChange={(e) => setQuoteForm(f => ({ ...f, organizationName: e.target.value }))}
                        placeholder="기관명을 입력하세요"
                    />
                    <Input
                        label="이름"
                        value={quoteForm.name}
                        onChange={(e) => setQuoteForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="이름을 입력하세요"
                    />
                    <Input
                        label="부서"
                        value={quoteForm.department}
                        onChange={(e) => setQuoteForm(f => ({ ...f, department: e.target.value }))}
                        placeholder="부서를 입력하세요"
                    />
                    <Input
                        label="휴대폰"
                        type="tel"
                        value={quoteForm.phone}
                        onChange={(e) => setQuoteForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="휴대폰 번호를 입력하세요"
                    />
                    <Input
                        label="이메일"
                        type="email"
                        value={quoteForm.email}
                        onChange={(e) => setQuoteForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="이메일을 입력하세요"
                    />
                    <Input
                        label="문의내용"
                        multiline
                        rows={4}
                        value={quoteForm.message}
                        onChange={(e) => setQuoteForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="문의 내용을 입력하세요"
                    />
                </div>
            </Modal>
        </div>
    );
}
