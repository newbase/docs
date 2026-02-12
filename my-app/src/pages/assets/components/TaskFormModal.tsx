import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/shared/ui';
import { X, Plus } from 'lucide-react';
import { TaskTemplate } from '../../../data/tasks';
import { actions, getActionByKey } from '../../../data/actions';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: TaskTemplate) => void;
    initialData: TaskTemplate | null;
    existingIds: string[];
}

export default function TaskFormModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    existingIds
}: TaskFormModalProps): React.ReactElement {
    const generateUniqueId = () => {
        const prefix = 'task_';
        const timestamp = Date.now().toString().slice(-6);
        let counter = 1;
        let id = `${prefix}${timestamp}_${counter}`;

        while (existingIds.includes(id)) {
            counter++;
            id = `${prefix}${timestamp}_${counter}`;
        }

        return id;
    };

    const [formData, setFormData] = useState<Partial<TaskTemplate>>({
        id: '',
        evaluationType: 'performance',
        eventName: '공통',
        taskType: 'To-do',
        taskName: '',
        description: '',
        score: 10,
        feedback: '',
        category: '',
        actionKeys: []
    });

    const [selectedActionKey, setSelectedActionKey] = useState<string>('');

    const taskTypes: ('To-do' | 'Decision' | 'Must-not')[] = ['To-do', 'Decision', 'Must-not'];
    const evaluationTypes: ('performance' | 'assessment' | 'equipment' | 'procedure')[] = ['performance', 'assessment', 'equipment', 'procedure'];
    const categories = ['공통술기', '활력징후', '투약', '처치', '응급처치', '검사', '기록', '기타'];

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData
            });
        } else {
            setFormData({
                id: generateUniqueId(),
                evaluationType: 'performance',
                eventName: '공통',
                taskType: 'To-do',
                taskName: '',
                description: '',
                score: 10,
                feedback: '',
                category: categories[0],
                actionKeys: []
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'score' ? parseInt(value) || 0 : value
        }));
    };

    const handleAddAction = () => {
        if (selectedActionKey && !formData.actionKeys?.includes(selectedActionKey)) {
            setFormData(prev => ({
                ...prev,
                actionKeys: [...(prev.actionKeys || []), selectedActionKey]
            }));
            setSelectedActionKey('');
        }
    };

    const handleRemoveAction = (actionKey: string) => {
        setFormData(prev => ({
            ...prev,
            actionKeys: prev.actionKeys?.filter(k => k !== actionKey) || []
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.id || !formData.taskName || !formData.description) {
            alert('필수 항목을 입력해주세요.');
            return;
        }

        onSave(formData as TaskTemplate);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData?.id ? '태스크 수정' : '새 태스크 생성'}
            size="large"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>취소</Button>
                    <Button variant="primary" onClick={handleSubmit}>저장</Button>
                </>
            }
        >
            <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">기본 정보</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Input
                                label="Task ID *"
                                type="text"
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                                placeholder="task_"
                                readOnly={!!initialData}
                                className={initialData ? 'bg-gray-50' : ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">카테고리 *</label>
                            <Select
                                value={formData.category || ''}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="카테고리 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Task 유형 *</label>
                            <Select
                                value={formData.taskType || 'To-do'}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, taskType: val as 'To-do' | 'Decision' | 'Must-not' }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {taskTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">평가 유형 *</label>
                            <Select
                                value={formData.evaluationType || 'performance'}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, evaluationType: val as 'performance' | 'assessment' | 'equipment' | 'procedure' }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {evaluationTypes.map(type => (
                                        <SelectItem key={type} value={type}>
                                            {type === 'performance' ? '수행' :
                                                type === 'assessment' ? '평가' :
                                                    type === 'equipment' ? '장비' : '절차'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Input
                                label="점수 *"
                                type="number"
                                name="score"
                                value={formData.score}
                                onChange={handleChange}
                                placeholder="10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Input
                            label="이벤트명"
                            type="text"
                            name="eventName"
                            value={formData.eventName}
                            onChange={handleChange}
                            placeholder="공통"
                        />
                    </div>

                    <div className="space-y-2">
                        <Input
                            label="태스크명 *"
                            type="text"
                            name="taskName"
                            value={formData.taskName}
                            onChange={handleChange}
                            placeholder="예: 손 위생"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">설명 *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="태스크에 대한 설명을 입력하세요"
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">피드백</label>
                        <textarea
                            name="feedback"
                            value={formData.feedback}
                            onChange={handleChange}
                            placeholder="미수행 시 피드백 메시지"
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm min-h-[60px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Action Selection */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-sm font-semibold text-gray-900">연결된 액션</h3>
                        <div className="flex items-center gap-2">
                            <Select
                                value={selectedActionKey}
                                onValueChange={setSelectedActionKey}
                            >
                                <SelectTrigger className="h-8 min-w-[200px] px-2 text-xs">
                                    <SelectValue placeholder="액션 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {actions
                                        .filter(a => !formData.actionKeys?.includes(a.key))
                                        .map(action => (
                                            <SelectItem key={action.key} value={action.key}>
                                                {action.name} ({action.category})
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddAction}
                                disabled={!selectedActionKey}
                                className="h-8 px-3 text-xs"
                            >
                                <Plus size={14} className="mr-1" />
                                추가
                            </Button>
                        </div>
                    </div>

                    {formData.actionKeys && formData.actionKeys.length > 0 ? (
                        <div className="space-y-2">
                            {formData.actionKeys.map(actionKey => {
                                const action = getActionByKey(actionKey);
                                if (!action) return null;

                                return (
                                    <div
                                        key={actionKey}
                                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{action.name}</span>
                                                <span className="px-2 py-0.5 bg-white border border-blue-200 rounded text-xs text-blue-700">
                                                    {action.category}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <span className="font-mono">{action.key}</span>
                                                <span className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">
                                                    {action.actionStartType}
                                                </span>
                                                {action.correctToolUsed && <span>도구: {action.correctToolUsed}</span>}
                                                {action.score && action.score > 0 && (
                                                    <span>점수: {action.score}</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAction(actionKey)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-3"
                                            title="제거"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                            연결된 액션이 없습니다. 액션을 선택하여 추가하세요.
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
