import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, SelectCombo, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/shared/ui';
import { Pen, RotateCcw, User, Plus, Copy } from 'lucide-react';
import { Dialogue } from '../../../data/dialogues';
import { categories } from '../../../data/categories';
import { assets } from '../../../data/assets';

interface DialogueFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dialogue: Dialogue) => void;
    initialData: Partial<Dialogue> | null;
    existingKeys: string[];
}

export default function DialogueFormModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    existingKeys
}: DialogueFormModalProps): React.ReactElement {
    const generateUniqueKey = () => {
        const prefix = 'ac01';
        const numbers = existingKeys
            .filter(k => k.startsWith(prefix))
            .map(k => parseInt(k.replace(prefix, ''), 10))
            .filter(n => !isNaN(n));

        const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 10101;
        return `${prefix}${nextNum.toString().padStart(4, '0')}`;
    };

    const [formData, setFormData] = useState<Partial<Dialogue>>({
        language: navigator.language.startsWith('ko') ? 'kr' :
            navigator.language.startsWith('ja') ? 'jp' :
                navigator.language.startsWith('zh') ? 'cn' : 'en',
        topic: '',
        topicId: '',
        key: '',
        category: '',
        answerRole: '역할 선택',
        question: '',
        answer: '',
        tags: [],
        property: 'look_target'
    });

    const [isManualCategory, setIsManualCategory] = useState(false);
    const [isManualRole, setIsManualRole] = useState(false);

    // Filter characters from assets
    const characterAssets = assets.filter(a => a.type === '캐릭터');
    const selectedCharacter = characterAssets.find(a => a.key === formData.speakerId);

    // Get all categories (no filtering by type)
    const filteredCategories = categories;

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...formData,
                ...initialData
            });
        } else {
            setFormData({
                language: navigator.language.startsWith('ko') ? 'kr' :
                    navigator.language.startsWith('ja') ? 'jp' :
                        navigator.language.startsWith('zh') ? 'cn' : 'en',
                topic: '',
                topicId: '',
                category: filteredCategories.length > 0 ? filteredCategories[0].name : '',
                speakerId: '',
                roleType: '이름',
                answerRole: '역할 선택',
                question: '',
                answer: '',
                tags: [],
                property: 'look_target',
                key: generateUniqueKey()
            });
        }
    }, [initialData, isOpen]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'tags') {
            setFormData(prev => ({
                ...prev,
                tags: value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const insertVariable = (fieldName: 'question' | 'answer', variable: string) => {
        const textarea = document.querySelector(`textarea[name="${fieldName}"]`) as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = formData[fieldName] || '';
        const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);

        setFormData(prev => ({ ...prev, [fieldName]: newValue }));

        // 커서 위치 조정
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + variable.length, start + variable.length);
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            key: formData.key || `dialogue_${Date.now()}`
        } as Dialogue);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData?.key ? '대화 수정' : '새 대화 생성'}
            size="large"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>취소</Button>
                    <Button variant="primary" onClick={handleSubmit}>저장</Button>
                </>
            }
        >
            <div className="flex gap-8">
                {/* Left Column: Speaker Info (4/12 approx) */}
                <div className="w-[260px] shrink-0 space-y-2">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                        {/* Thumbnail Preview */}
                        <div className="aspect-square w-full bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center shadow-inner">
                            {selectedCharacter?.thumbnail ? (
                                <img
                                    src={selectedCharacter.thumbnail}
                                    alt={selectedCharacter.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-300">
                                    <User size={48} strokeWidth={1.5} />
                                    <span className="text-xs">No Image</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <SelectCombo
                                label="대표 캐릭터 선택"
                                value={formData.speakerId || ''}
                                onValueChange={(val) => {
                                    const char = characterAssets.find(a => a.key === val);
                                    setFormData(prev => ({
                                        ...prev,
                                        speakerId: val,
                                        roleType: char?.name || prev.roleType
                                    }));
                                }}
                                options={characterAssets.map(char => ({ value: char.key, label: char.name }))}
                                placeholder="대표 캐릭터 선택"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-700">역할 유형</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const nextManual = !isManualRole;
                                        setIsManualRole(nextManual);
                                        if (nextManual && formData.answerRole === '역할 선택') {
                                            setFormData(prev => ({ ...prev, answerRole: '' }));
                                        } else if (!nextManual && !formData.answerRole) {
                                            setFormData(prev => ({ ...prev, answerRole: '역할 선택' }));
                                        }
                                    }}
                                    className={`p-1 rounded transition-colors ${isManualRole ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                    title={isManualRole ? "역할 선택" : "직접 입력"}
                                >
                                    {isManualRole ? <RotateCcw size={14} /> : <Pen size={14} />}
                                </button>
                            </div>
                            {isManualRole ? (
                                <Input
                                    type="text"
                                    name="answerRole"
                                    value={formData.answerRole}
                                    onChange={handleChange}
                                    placeholder="직접 입력"
                                />
                            ) : (
                                <Select
                                    value={formData.answerRole}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, answerRole: val }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="역할 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="역할 선택">역할 선택</SelectItem>
                                        <SelectItem value="성인 환자">성인 환자</SelectItem>
                                        <SelectItem value="아동 환자">소아 환자</SelectItem>
                                        <SelectItem value="임산부 환자">임산부 환자</SelectItem>
                                        <SelectItem value="노인 환자">노인 환자</SelectItem>
                                        <SelectItem value="엄마 보호자">엄마 보호자</SelectItem>
                                        <SelectItem value="아빠 보호자">아빠 보호자</SelectItem>
                                        <SelectItem value="의사">의사</SelectItem>
                                        <SelectItem value="간호사">간호사</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">시선</label>
                            <Select
                                value={formData.property || 'look_target'}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, property: val === 'look_target' ? '' : val }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="속성 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="look_target">눈 마주보기</SelectItem>
                                    <SelectItem value="none">없음</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Right Column: Dialogue Info (8/12 approx) */}
                <div className="flex-1 space-y-2">
                    <div className="space-y-2">
                        <Select
                            value={formData.language || 'kr'}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, language: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="언어 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kr">한국어 (KR)</SelectItem>
                                <SelectItem value="en">English (EN)</SelectItem>
                                <SelectItem value="jp">日本語 (JP)</SelectItem>
                                <SelectItem value="cn">中文 (CN)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                {isManualCategory ? (
                                    <Input
                                        label="대화 토픽"
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="새 카테고리 입력"
                                    />
                                ) : (
                                    <SelectCombo
                                        label="대화 토픽"
                                        value={formData.category || ''}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                        options={filteredCategories.map(c => ({ value: c.name, label: c.name }))}
                                        placeholder="카테고리 선택"
                                    />
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsManualCategory(!isManualCategory);
                                    if (isManualCategory) {
                                        setFormData(prev => ({ ...prev, category: filteredCategories[0]?.name || '' }));
                                    } else {
                                        setFormData(prev => ({ ...prev, category: '' }));
                                    }
                                }}
                                className="h-10 px-3 shrink-0"
                                title={isManualCategory ? '목록 선택' : '직접 입력'}
                            >
                                {isManualCategory ? <RotateCcw size={16} /> : <Pen size={16} />}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Input
                            label="토픽 (대화 선택메뉴)"
                            type="text"
                            name="topic"
                            value={formData.topic}
                            onChange={handleChange}
                            placeholder="토픽 입력"
                        />
                    </div>


                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">사용자 질문</label>
                        <textarea
                            name="question"
                            value={formData.question}
                            onChange={handleChange}
                            placeholder="질문을 입력하세요"
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm min-h-[60px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">변수 삽입:</span>
                            <Select
                                value=""
                                onValueChange={(val) => {
                                    if (val) insertVariable('question', val);
                                }}
                            >
                                <SelectTrigger className="h-8 min-w-[180px] px-2 text-xs">
                                    <SelectValue placeholder="선택 추가" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="{userName}">사용자명</SelectItem>
                                    <SelectItem value="{speakerName}">화자명</SelectItem>
                                    <SelectItem value="{guardianName}">보호자명</SelectItem>
                                    <SelectItem value="{locationName}">장소명</SelectItem>
                                    <SelectItem value="{currentDate}">오늘 날짜</SelectItem>
                                    <SelectItem value="{currentMonth}">현재 월</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{formData.answerRole} 답변</label>
                        <textarea
                            name="answer"
                            value={formData.answer}
                            onChange={handleChange}
                            placeholder="답변을 입력하세요"
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">변수 삽입:</span>
                            <Select
                                value=""
                                onValueChange={(val) => {
                                    if (val) insertVariable('answer', val);
                                }}
                            >
                                <SelectTrigger className="h-8 min-w-[180px] px-2 text-xs">
                                    <SelectValue placeholder="선택 추가" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="{userName}">사용자명</SelectItem>
                                    <SelectItem value="{speakerName}">화자명</SelectItem>
                                    <SelectItem value="{roleType}">역할명</SelectItem>
                                    <SelectItem value="{guardianName}">보호자명</SelectItem>
                                    <SelectItem value="{locationName}">장소명</SelectItem>
                                    <SelectItem value="{currentDate}">오늘 날짜</SelectItem>
                                    <SelectItem value="{currentMonth}">현재 월</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">키워드 (쉰표 구분)</label>
                        <Input
                            type="text"
                            name="tags"
                            value={formData.tags?.join(', ')}
                            onChange={handleChange}
                            placeholder="예: 이름, 성함"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">토픽 Key</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                name="key"
                                value={formData.key}
                                readOnly
                                className="bg-gray-50 cursor-default"
                                placeholder="Key 자동 생성"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    if (formData.key) {
                                        navigator.clipboard.writeText(formData.key);
                                    }
                                }}
                                className="h-10 px-3 shrink-0"
                                title="복사"
                            >
                                <Copy size={16} />
                            </Button>
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
                </div>
            </div>
        </Modal >
    );
}
