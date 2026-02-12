import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, SimpleSelect } from '@/components/shared/ui';
import { Loader2 } from 'lucide-react';
import { CenteredPageLayout } from '@/components/shared/layout';
import CurriculumSetup from '../class/CurriculumSetup';
import { ToggleLabel } from '@/components/shared/ui/Toggle';
import { CurriculumItem, VideoLecture } from '../../types/curriculum';
import { scenarioDetails, ScenarioDetail } from '../../data/scenarioDetails';
import { courseService } from '../../services/courseService';
import { UpdateCourseRequestDto } from '../../types/api/course';
import { useAuth } from '../../contexts/AuthContext';
import { isFeatureEnabled } from '../../config/featureFlags';
import { useClass } from '../../data/queries/useClasses';

export default function ProductEdit(): React.ReactElement {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const organizationId = user?.currentAccount?.organizationId;

    const { classData, loading: isLoadingData } = useClass(id);

    const ORDER_TYPE_OPTIONS = ['구독', '장비/물품', '커스텀 서비스', '오픈클래스'];

    // Form state (ProductCreate와 동일)
    const [orderType, setOrderType] = useState<string>('');
    const [className, setClassName] = useState('');
    const [description, setDescription] = useState('');
    const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Load initial data
    useEffect(() => {
        if (classData) {
            setOrderType((classData as { orderType?: string }).orderType ?? '');
            setClassName(classData.title);
            setDescription(classData.description || '');

            const initialItems: CurriculumItem[] = (classData.curriculum || []).map(item => {
                const itemId = `edit-${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                if (item.type === 'video') {
                    return {
                        id: itemId,
                        type: 'video',
                        data: {
                            id: item.id.toString(),
                            title: item.name,
                            url: '',
                            duration: item.duration,
                            author: {
                                name: item.author || 'Unknown',
                                type: item.authorType || 'individual'
                            },
                            description: ''
                        } as VideoLecture
                    };
                } else {
                    const detail = scenarioDetails[item.id];
                    return {
                        id: itemId,
                        type: 'scenario',
                        data: detail || {
                            id: item.id,
                            title: item.name,
                            duration: item.duration,
                            platform: item.platform,
                            ContributedBy: item.author || 'Medicrew',
                        } as any
                    };
                }
            });
            setCurriculumItems(initialItems);
            setIsActive(classData.isActive !== false);
        }
    }, [classData]);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!className.trim()) {
            newErrors.className = '제품명을 입력해주세요.';
        }

        if (curriculumItems.length === 0) {
            newErrors.scenarios = '최소 1개 이상의 커리큘럼 아이템을 추가해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !organizationId || !id) {
            if (!organizationId) alert('기관 정보가 없습니다.');
            return;
        }

        setIsSubmitting(true);

        try {
            const useMock = isFeatureEnabled('USE_MOCK_DATA');

            if (useMock) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                alert('제품 정보가 수정되었습니다! (Mock)');
                navigate(-1);
                return;
            }

            const requestData: UpdateCourseRequestDto = {
                title: className,
                isPrivate: true,
                minPlayCount: 1,
                scenarioList: curriculumItems
                    .filter(item => item.type === 'scenario')
                    .map((item, index) => ({
                        scenarioId: (item.data as ScenarioDetail).id,
                        order: index + 1
                    }))
            };

            await courseService.updateCourse(parseInt(id), requestData);
            alert('제품 정보가 수정되었습니다!');
            navigate(-1);
        } catch (error) {
            console.error('Error updating product:', error);
            alert('제품 수정 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (className || curriculumItems.length > 0) {
            if (window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
                navigate(-1);
            }
        } else {
            navigate(-1);
        }
    };

    if (isLoadingData) {
        return (
            <CenteredPageLayout title="프로덕트 수정">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-500">제품 정보를 불러오는 중입니다...</p>
                </div>
            </CenteredPageLayout>
        );
    }

    if (!classData && !isLoadingData) {
        return (
            <CenteredPageLayout title="프로덕트 수정">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <p className="text-red-500 font-medium">제품 정보를 찾을 수 없습니다.</p>
                    <Button onClick={() => navigate(-1)}>목록으로 돌아가기</Button>
                </div>
            </CenteredPageLayout>
        );
    }

    return (
        <CenteredPageLayout title="프로덕트 수정">
            <div className="space-y-6">
                <section className="bg-white rounded-lg border border-gray-400 shadow-sm space-y-2 px-6 py-4">

                    {/* 주문유형 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                            주문유형
                        </label>
                        <div className="flex-1">
                            <SimpleSelect
                                value={orderType}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOrderType(e.target.value)}
                                wrapperClassName="w-40"
                            >
                                <option value="">선택</option>
                                {ORDER_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </SimpleSelect>
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* 제품명 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                            제품명
                        </label>
                        <div className="flex-1">
                            <Input
                                type="text"
                                value={className}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClassName(e.target.value)}
                                placeholder="제품명을 입력하세요"
                                className="w-1/2"
                            />
                            {errors.className && (
                                <p className="text-sm text-red-600 mt-2">{errors.className}</p>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* 소개 */}
                    <div className="flex items-start gap-4">
                        <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                            소개
                        </label>
                        <div className="flex-1">
                            <Input
                                multiline
                                value={description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                placeholder="내용을 입력하세요"
                                rows={5}
                            />
                        </div>
                    </div>
                    <div className="border-t border-gray-200"></div>

                    {/* 커리큘럼 설정 */}
                    <CurriculumSetup
                        items={curriculumItems}
                        onItemsChange={setCurriculumItems}
                        error={errors.scenarios}
                    />

                    <div className="border-t border-gray-200"></div>

                    {/* 활성 여부 */}
                    <div className="flex items-center gap-8">
                        <label className="text-sm font-medium text-gray-700 w-28 pt-2">
                            활성 여부
                        </label>
                        <div className="flex flex-col space-y-2">
                            <ToggleLabel
                                checked={isActive}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsActive(e.target.checked)}
                                onLabel="활성"
                                offLabel="비활성"
                                size="sm"
                            />
                        </div>
                    </div>
                </section>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pb-8">
                    <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? '수정 중...' : '저장'}
                    </Button>
                </div>
            </div>
        </CenteredPageLayout>
    );
}
