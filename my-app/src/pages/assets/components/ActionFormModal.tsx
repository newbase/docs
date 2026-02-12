import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/ui';
import { Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectCombo } from '@/components/shared/ui';
import { Plus, RotateCcw } from 'lucide-react';
import { Action, ActionStartTracking, ActionCompleteCondition, SpotType, RequirementType, ActionEffect, getRequirementTypeLabel, actions as existingActions } from '../../../data/actions';
import { assets } from '../../../data/assets';
import { spots } from '../../../data/spots';
import { dialogues } from '../../../data/dialogues';

interface ActionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (action: Action) => void;
    initialData: Action | null;
    existingKeys: string[];
}

export default function ActionFormModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    existingKeys
}: ActionFormModalProps): React.ReactElement {
    const generateUniqueKey = () => {
        const prefix = 'action_';
        const timestamp = Date.now().toString().slice(-6);
        let counter = 1;
        let key = `${prefix}${timestamp}_${counter}`;

        while (existingKeys.includes(key)) {
            counter++;
            key = `${prefix}${timestamp}_${counter}`;
        }

        return key;
    };

    const [formData, setFormData] = useState<Partial<Action>>({
        key: '',
        name: '',
        category: '',
        description: '',
        actionStartType: '아이템 잡기',
        templateId: '',
        requiredConditionType: 'none',
        requiredConditionTarget: '',
        requiredConditionDetail: '',
        maxRetryCount: 3,
        firstHintText: '',
        secondHintText: '',
        thirdHintText: '',
        failureEffect: {
            hapticVibration: false,
            warningSound: false
        },
        completeOnFinalFailure: false,
        finalFailureMessage: '',
        completeCondition: undefined,
        correctToolUsed: '',
        correctSpotSelected: '',
        score: 0,
        completionEffect: {
            hapticVibration: false,
            completionSound: false
        },
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'admin',
        usageCount: 0
    });

    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedDialogueType, setSelectedDialogueType] = useState<string>('');


    const requirementTypes: RequirementType[] = [
        'none', 'item_equipped', 'item_used', 'skill_completed',
        'time_elapsed', 'patient_state', 'vital_sign', 'location',
        'dialogue_completed', 'custom'
    ];

    const actionCategories = [
        '활력징후', '투약', '신체검진', '처치', '응급처치', '호흡관리',
        '수액관리', '검사', '기록', '교육', '기타'
    ];

    const actionStartTypes: ActionStartTracking[] = ['윈도우 오픈', '아이템 잡기', '동료호출', '메시지 팝업', '입력 시작', '음성인식 시작', '기타'];
    const spotTypes: SpotType[] = ['환자', '물품', '장비', '플레이어'];

    // Filter assets
    const toolAssets = assets.filter(a => a.type === '도구' || a.type === '장비' || a.type === '약물');

    // Get actions by selected category
    const actionsByCategory = selectedCategory
        ? existingActions.filter(a => a.category === selectedCategory)
        : [];

    // Get unique dialogue types and topics
    const dialogueCategories = Array.from(new Set(dialogues.map(d => d.category)));
    const dialogueTopics = selectedDialogueType
        ? Array.from(new Set(dialogues.filter(d => d.category === selectedDialogueType).map(d => d.topic)))
        : [];

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                updatedAt: new Date().toISOString().split('T')[0]
            });
            setSelectedCategory(initialData.category || '');
            setIsCreatingNew(false);
        } else {
            setFormData({
                key: generateUniqueKey(),
                name: '',
                category: actionCategories[0],
                description: '',
                actionStartType: '아이템 잡기',
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0],
                createdBy: 'admin',
                usageCount: 0
            });
            setSelectedCategory(actionCategories[0]);
            setIsCreatingNew(true);
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChange = (name: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setFormData(prev => ({
            ...prev,
            [name]: numValue
        }));
    };

    const handleEffectChange = (effectType: 'failureEffect' | 'completionEffect', field: keyof ActionEffect, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            [effectType]: {
                ...prev[effectType],
                [field]: value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.key || !formData.name || !formData.category || !formData.actionStartType) {
            alert('필수 항목을 입력해주세요.');
            return;
        }

        onSave({
            ...formData,
            updatedAt: new Date().toISOString().split('T')[0]
        } as Action);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData?.key ? '액션 수정' : '새 액션 생성'}
            size="large"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>취소</Button>
                    <Button variant="primary" onClick={handleSubmit}>저장</Button>
                </>
            }
        >
            <div className="flex gap-8">
                {/* Left Column: Basic Information */}
                <div className="w-[280px] shrink-0 space-y-4">
                <h3 className="text-sm font-bold text-blue-700 mb-2">액션 정의</h3>
                    <div className="pr-4 border-r border-gray-200 space-y-2">
                        <div className="space-y-2">
                            <Select
                                value={selectedCategory}
                                onValueChange={(val) => {
                                    setSelectedCategory(val);
                                    setFormData(prev => ({ ...prev, category: val }));
                                    setIsCreatingNew(true);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="카테고리 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {actionCategories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedCategory && actionsByCategory.length > 0 && (
                            <div className="space-y-2">
                                <Select
                                    value={isCreatingNew ? 'new' : formData.key}
                                    onValueChange={(val) => {
                                        if (val === 'new') {
                                            setIsCreatingNew(true);
                                            setFormData(prev => ({
                                                ...prev,
                                                key: generateUniqueKey(),
                                                name: '',
                                                description: '',
                                                actionStartType: '아이템 잡기',
                                                templateId: '',
                                                requiredConditionType: 'none',
                                                requiredConditionTarget: '',
                                                requiredConditionDetail: '',
                                                maxRetryCount: 3,
                                                firstHintText: '',
                                                secondHintText: '',
                                                thirdHintText: '',
                                                score: 0
                                            }));
                                        } else {
                                            const selectedAction = actionsByCategory.find(a => a.key === val);
                                            if (selectedAction) {
                                                setIsCreatingNew(false);
                                                setFormData({
                                                    ...selectedAction,
                                                    updatedAt: new Date().toISOString().split('T')[0]
                                                });
                                            }
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="액션 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">
                                            <div className="flex items-center gap-2">
                                                <Plus size={14} />
                                                <span>새 액션 생성</span>
                                            </div>
                                        </SelectItem>
                                        {actionsByCategory.map(action => (
                                            <SelectItem key={action.key} value={action.key}>
                                                {action.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="액션명 *"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    name="key"
                                    value={formData.key}
                                    onChange={handleChange}
                                    placeholder="액션 Key *"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setFormData(prev => ({ ...prev, key: generateUniqueKey() }))}
                                    className="h-10 px-3 shrink-0"
                                    title="재생성"
                                >
                                    <RotateCcw size={16} />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="액션에 대한 설명을 입력하세요"
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-base min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="w-full">
                                <Select
                                label="액션 시작 감지"
                                    value={formData.actionStartType}
                                    onValueChange={(val) => {
                                        setFormData(prev => ({ ...prev, actionStartType: val as ActionStartTracking, templateId: '' }));
                                        setSelectedDialogueType('');
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="액션 시작 타입 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {actionStartTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                    </div>
                </div>

                {/* Right Column: Three Sections */}
                <div className="flex-1 space-y-6">
                    {/* 액션 완료*/}
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-blue-700 mb-2">액션 완료</h3>
                        <div className="flex flex-col gap-2">
                            {formData.actionStartType === '윈도우 오픈' ? (
                                <div className="w-full">
                                    <Select
                                        value={selectedDialogueType}
                                        onValueChange={(val) => {
                                            setSelectedDialogueType(val);
                                            setFormData(prev => ({ ...prev, templateId: '' }));
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="대화 분류 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dialogueCategories.map(category => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Input
                                        type="text"
                                        name="templateId"
                                        value={formData.templateId || ''}
                                        onChange={handleChange}
                                        placeholder="템플릿/아이템 ID (예: eq_mon_01)"
                                    />
                                </div>
                            )}
                        </div>

                        {formData.actionStartType === '윈도우 오픈' && selectedDialogueType && (
                            <div className="space-y-2">
                                <Select
                                    value={formData.templateId || ''}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, templateId: val }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="대화 토픽 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dialogueTopics.map(topic => (
                                            <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* 액션 완료 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-blue-700 mb-2">액션 완료</h3>
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Select
                                    value={formData.completeCondition || ''}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, completeCondition: val as ActionCompleteCondition }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="완료 조건 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="발화완료">발화완료</SelectItem>
                                        <SelectItem value="정답 수치 입력">정답 수치 입력</SelectItem>
                                        <SelectItem value="정답 선택">정답 선택</SelectItem>
                                        <SelectItem value="정답 도구 선택">정답 도구 선택</SelectItem>
                                        <SelectItem value="정답 스팟 선택">정답 스팟 선택</SelectItem>
                                        <SelectItem value="유효 인터랙션 회수 충족">유효 인터랙션 회수 충족</SelectItem>
                                        <SelectItem value="확인 완료">확인 완료</SelectItem>
                                        <SelectItem value="기타">기타</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.completeCondition === '정답 도구 선택' && (
                                <div className="space-y-2">
                                    <SelectCombo
                                        value={formData.correctToolUsed || ''}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, correctToolUsed: val }))}
                                        options={toolAssets.map(asset => ({ value: asset.key, label: `${asset.name} (${asset.key})` }))}
                                        placeholder="정답 도구 선택"
                                    />
                                </div>
                            )}

                            {formData.completeCondition === '정답 스팟 선택' && (
                                <div className="space-y-2">
                                    <SelectCombo
                                        value={formData.correctSpotSelected || ''}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, correctSpotSelected: val }))}
                                        options={spots.map(spot => ({ value: spot.key, label: `${spot.name} (${spot.key})` }))}
                                        placeholder="정답 스팟 선택"
                                    />
                                </div>
                            )}

                            {formData.completeCondition === '정답 수치 입력' && (
                                <div className="space-y-2">
                                    <Input
                                        type="number"
                                        name="correctInputValue"
                                        value={formData.correctInputValue?.toString() || ''}
                                        onChange={(e) => handleNumberChange('correctInputValue', e.target.value)}
                                        placeholder="정답 수치 입력"
                                    />
                                </div>
                            )}

                            {formData.completeCondition === '정답 선택' && (
                                <div className="space-y-2">
                                    <Input
                                        type="text"
                                        name="correctAnswer"
                                        value={formData.correctAnswer || ''}
                                        onChange={handleChange}
                                        placeholder="정답 답변"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Input
                                    type="number"
                                    name="score"
                                    value={formData.score?.toString() || '0'}
                                    onChange={(e) => handleNumberChange('score', e.target.value)}
                                    placeholder="획득 점수"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">효과</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.completionEffect?.hapticVibration || false}
                                        onChange={(e) => handleEffectChange('completionEffect', 'hapticVibration', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">햅틱 진동</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.completionEffect?.completionSound || false}
                                        onChange={(e) => handleEffectChange('completionEffect', 'completionSound', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">완료알림음</span>
                                </label>
                            </div>
                        </div>
                    </div>
                                        {/* 액션 실패 */}
                                        <div className="space-y-4">
                        <h3 className="text-sm font-bold text-blue-700 mb-2">액션 실패</h3>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Select
                                    value={formData.requiredConditionType || 'none'}
                                    onValueChange={(val) => setFormData(prev => ({
                                        ...prev,
                                        requiredConditionType: val as RequirementType
                                    }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="조건 유형 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {requirementTypes.map(type => (
                                            <SelectItem key={type} value={type}>
                                                {getRequirementTypeLabel(type)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.requiredConditionType && formData.requiredConditionType !== 'none' && (
                                <>
                                    <div className="space-y-2">
                                        <Input
                                            type="text"
                                            name="requiredConditionTarget"
                                            value={formData.requiredConditionTarget || ''}
                                            onChange={handleChange}
                                            placeholder="조건 대상 (예: eq_mon_01)"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            type="text"
                                            name="requiredConditionDetail"
                                            value={formData.requiredConditionDetail || ''}
                                            onChange={handleChange}
                                            placeholder="내용 (예: 착용 필요)"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Input
                                    type="number"
                                    name="maxRetryCount"
                                    value={formData.maxRetryCount?.toString() || '3'}
                                    onChange={(e) => handleNumberChange('maxRetryCount', e.target.value)}
                                    placeholder="다시시도 회수"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Input
                                type="text"
                                name="firstHintText"
                                value={formData.firstHintText || ''}
                                onChange={handleChange}
                                placeholder="첫 번째 힌트"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="text"
                                name="secondHintText"
                                value={formData.secondHintText || ''}
                                onChange={handleChange}
                                placeholder="두 번째 힌트"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="text"
                                name="thirdHintText"
                                value={formData.thirdHintText || ''}
                                onChange={handleChange}
                                placeholder="세 번째 힌트"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">효과</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.failureEffect?.hapticVibration || false}
                                        onChange={(e) => handleEffectChange('failureEffect', 'hapticVibration', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">햅틱 진동</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.failureEffect?.warningSound || false}
                                        onChange={(e) => handleEffectChange('failureEffect', 'warningSound', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">경고음</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.completeOnFinalFailure || false}
                                    onChange={(e) => setFormData(prev => ({ ...prev, completeOnFinalFailure: e.target.checked }))}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-semibold text-gray-700">최종 액션 실패 시 completion 처리</span>
                            </label>
                        </div>

                        <div className="space-y-2">
                            <textarea
                                name="finalFailureMessage"
                                value={formData.finalFailureMessage || ''}
                                onChange={handleChange}
                                placeholder="최종 실패 메시지"
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </Modal>
    );
}
