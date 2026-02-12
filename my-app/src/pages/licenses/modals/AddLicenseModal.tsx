import React, { useState, useMemo } from 'react';
import { Modal, AlertDialog } from '@/components/shared/ui';
import { useCreateLicense } from '@/hooks/useLicense';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../../services/productService';
import { getDeviceTypeList } from '../../../services/scenarioService';
import type { CreateLicenseRequestDto } from '@/types/api/license';
import type { GetDeviceTypeListResponseDto } from '@/types/api/device';
import type { ProductListItemDto } from '@/types/api/product';

interface AddLicenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizationId: number;
    onSuccess?: () => void;
}

interface FormData {
    productId: number | null;
    licenseType: 'USER' | 'DEVICE' | 'LIFETIME' | 'DEMO';
    plan: 'BASIC' | 'PRO';
    quantity: number | string;
    validityPeriod: number | string;
    validityUnit: 'MONTH' | 'YEAR';
    startDate: string;
    /** 허용 디바이스 타입 ID 리스트 (Swagger 필수) */
    deviceTypeIdList: number[];
}

export default function AddLicenseModal({ isOpen, onClose, organizationId, onSuccess }: AddLicenseModalProps): React.ReactElement {
    const [formData, setFormData] = useState<FormData>({
        productId: null,
        licenseType: 'USER',
        plan: 'BASIC',
        quantity: 10,
        validityPeriod: 12,
        validityUnit: 'MONTH',
        startDate: new Date().toISOString().split('T')[0],
        deviceTypeIdList: [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [alertState, setAlertState] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
        isOpen: false,
        type: 'success',
        message: ''
    });

    // 🌐 Real API: Product 목록 조회
    const { data: productListData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products', 1, 1000],
        queryFn: () => productService.getList({ page: 1, pageSize: 1000 }),
        enabled: isOpen,
    });

    // 🌐 디바이스 타입 목록 (라이센스 발급 시 deviceTypeIdList 필수)
    const { data: deviceTypeData } = useQuery({
        queryKey: ['deviceTypeList'],
        queryFn: () => getDeviceTypeList() as Promise<GetDeviceTypeListResponseDto>,
        enabled: isOpen,
    });

    const products = useMemo(() => {
        return productListData?.productList || [];
    }, [productListData]);

    const deviceTypes = useMemo(() => {
        return deviceTypeData?.deviceTypeList ?? [];
    }, [deviceTypeData]);

    // 디바이스 타입 로드 시 기본값: 전체 선택
    React.useEffect(() => {
        if (deviceTypes.length > 0 && formData.deviceTypeIdList.length === 0) {
            setFormData(prev => ({
                ...prev,
                deviceTypeIdList: deviceTypes.map(d => d.deviceTypeId),
            }));
        }
    }, [deviceTypes.length]);

    // 🌐 Real API: 라이센스 생성 Mutation
    const createLicenseMutation = useCreateLicense();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // 에러 제거
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const calculateEndDate = (): string => {
        const start = new Date(formData.startDate + 'T00:00:00');
        if (isNaN(start.getTime())) return formData.startDate;
        
        const period = typeof formData.validityPeriod === 'string' ? parseInt(formData.validityPeriod) : formData.validityPeriod;
        
        if (formData.validityUnit === 'MONTH') {
            start.setMonth(start.getMonth() + period);
        } else if (formData.validityUnit === 'YEAR') {
            start.setFullYear(start.getFullYear() + period);
        }
        
        const y = start.getFullYear();
        const m = String(start.getMonth() + 1).padStart(2, '0');
        const d = String(start.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.productId) {
            newErrors.productId = '상품을 선택해주세요.';
        }

        if (!formData.quantity || (typeof formData.quantity === 'string' && parseInt(formData.quantity) < 1)) {
            newErrors.quantity = '수량은 1 이상이어야 합니다.';
        }

        if (!formData.validityPeriod || (typeof formData.validityPeriod === 'string' && parseInt(formData.validityPeriod) < 1)) {
            newErrors.validityPeriod = '유효 기간은 1 이상이어야 합니다.';
        }

        const effectiveDeviceTypeIds = formData.deviceTypeIdList?.length ? formData.deviceTypeIdList : deviceTypes.map(d => d.deviceTypeId);
        if (deviceTypes.length > 0 && effectiveDeviceTypeIds.length === 0) {
            newErrors.deviceTypeIdList = '디바이스 타입을 선택해주세요.';
        }

        if (!formData.startDate) {
            newErrors.startDate = '시작일을 선택해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // 🌐 Real API 호출
        try {
            // ✅ Swagger 스펙에 맞춰 데이터 변환
            const licenseData = {
                type: formData.licenseType,
                plan: formData.plan,
                quantity: typeof formData.quantity === 'string' ? parseInt(formData.quantity) : formData.quantity,
                validityPeriod: typeof formData.validityPeriod === 'string' ? parseInt(formData.validityPeriod) : formData.validityPeriod,
                validityUnit: formData.validityUnit,
                startDate: formData.startDate,
                endDate: formData.licenseType === 'LIFETIME' ? '' : calculateEndDate(),
                curriculumIdList: [], // TODO: 커리큘럼 선택 기능 추가 필요
            };

            await createLicenseMutation.mutateAsync({ 
                organizationId: organizationId.toString(), 
                licenseData 
            });

            setAlertState({ 
                isOpen: true, 
                type: 'success', 
                message: '라이센스가 발급되었습니다.' 
            });

            // Reset form
            handleReset();

            // Call success callback
            if (onSuccess) {
                onSuccess();
            }

            // Close modal after alert
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error: any) {
            const errorMessage = error?.message || '라이센스 발급에 실패했습니다.';
            setAlertState({ 
                isOpen: true, 
                type: 'error', 
                message: errorMessage 
            });
        }
    };

    const handleReset = () => {
        setFormData({
            productId: null,
            licenseType: 'USER',
            plan: 'BASIC',
            quantity: 10,
            validityPeriod: 12,
            validityUnit: 'MONTH',
            startDate: new Date().toISOString().split('T')[0],
            deviceTypeIdList: deviceTypes.length ? deviceTypes.map(d => d.deviceTypeId) : [],
        });
        setErrors({});
    };

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, isOpen: false }));
    };

    const footer = (
        <>
            <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={onClose}
            >
                취소
            </button>
            <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
                초기화
            </button>
            <button
                type="submit"
                form="add-license-form"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={createLicenseMutation.isPending || isLoadingProducts}
            >
                {createLicenseMutation.isPending ? '발급 중...' : '발급'}
            </button>
        </>
    );

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="라이센스 신규 발급" footer={footer} size="medium">
                <form id="add-license-form" onSubmit={handleSubmit} className="space-y-4">
                    {/* 상품 선택 */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            상품 (Product) <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="productId"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                errors.productId ? 'border-red-500' : 'border-gray-300'
                            }`}
                            value={formData.productId || ''}
                            onChange={(e) => {
                                const productId = Number(e.target.value) || null;
                                setFormData(prev => ({ ...prev, productId }));
                                if (errors.productId) {
                                    setErrors(prev => ({ ...prev, productId: '' }));
                                }
                            }}
                            disabled={isLoadingProducts}
                        >
                            <option value="">상품을 선택하세요</option>
                            {products.map((product: ProductListItemDto) => (
                                <option key={product.productId} value={product.productId}>
                                    {product.title} (시나리오 {product.scenarioCount}개)
                                </option>
                            ))}
                        </select>
                        {errors.productId && (
                            <span className="text-sm text-red-500 block">{errors.productId}</span>
                        )}
                        {isLoadingProducts && (
                            <p className="text-xs text-gray-500">상품 목록을 불러오는 중...</p>
                        )}
                    </div>

                    {/* 라이센스 유형 */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            라이센스 유형 <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="licenseType"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            value={formData.licenseType}
                            onChange={handleChange}
                            required
                        >
                            <option value="USER">사용자 구독 (USER)</option>
                            <option value="DEVICE">기기 구독 (DEVICE)</option>
                            <option value="LIFETIME">평생 구독 (LIFETIME)</option>
                            <option value="DEMO">데모 (DEMO)</option>
                        </select>
                    </div>

                    {/* 구독 플랜 */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            구독 플랜 <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="plan"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            value={formData.plan}
                            onChange={handleChange}
                            required
                        >
                            <option value="BASIC">Basic</option>
                            <option value="PRO">Pro</option>
                        </select>
                    </div>

                    {/* 수량 */}
                    {formData.licenseType !== 'LIFETIME' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                최대 {formData.licenseType === 'USER' ? '사용자' : '기기'} 수 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.quantity}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                            {errors.quantity && (
                                <span className="text-sm text-red-500 block">{errors.quantity}</span>
                            )}
                        </div>
                    )}

                    {/* 유효 기간 */}
                    {formData.licenseType !== 'LIFETIME' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    유효 기간 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="validityPeriod"
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                        errors.validityPeriod ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    value={formData.validityPeriod}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                                {errors.validityPeriod && (
                                    <span className="text-sm text-red-500 block">{errors.validityPeriod}</span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    단위 <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="validityUnit"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    value={formData.validityUnit}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="MONTH">개월</option>
                                    <option value="YEAR">년</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* 시작일 */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            시작일 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                                errors.startDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                        />
                        {errors.startDate && (
                            <span className="text-sm text-red-500 block">{errors.startDate}</span>
                        )}
                    </div>

                    {/* 종료일 미리보기 */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-700">
                            <strong>종료일:</strong> {formData.licenseType === 'LIFETIME' ? 'Lifetime (무제한)' : calculateEndDate()}
                        </div>
                    </div>
                </form>
            </Modal>

            <AlertDialog
                isOpen={alertState.isOpen}
                onClose={closeAlert}
                message={alertState.message}
            />
        </>
    );
}
