import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/ui';
import { Button } from '@/components/shared/ui';
import { ScenarioData } from '../../types';

interface ScenarioAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        scenarioId: string;
        thumbnail: string | null;
        thumbnailFile: File | null;
        category: string;
        platform: string;
        metadata: ScenarioData['metadata'];
    }) => void;
    data: ScenarioData;
    updateMetadata: (field: keyof ScenarioData['metadata'], value: string) => void;
    showAlert?: (message: string) => void;
}

export default function ScenarioAddModal({
    isOpen,
    onClose,
    onSave,
    data,
    updateMetadata,
    showAlert
}: ScenarioAddModalProps): React.ReactElement {
    const [scenarioId, setScenarioId] = useState<string>('');
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [category, setCategory] = useState<string>('');
    const [platform, setPlatform] = useState<string>('');

    // 모달이 열릴 때 state 초기화
    useEffect(() => {
        if (isOpen) {
            setScenarioId('');
            setThumbnail(null);
            setThumbnailFile(null);
            setCategory('');
            setPlatform('');
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 이미지 파일인지 확인
            if (!file.type.startsWith('image/')) {
                if (showAlert) {
                    showAlert('이미지 파일만 업로드 가능합니다.');
                }
                return;
            }
            setThumbnailFile(file);
            
            // 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnail(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveThumbnail = () => {
        setThumbnail(null);
        setThumbnailFile(null);
    };

    const handleSave = () => {
        if (!scenarioId.trim()) {
            if (showAlert) {
                showAlert('시나리오 ID를 입력해주세요.');
            }
            return;
        }
        if (!data.metadata.title.trim()) {
            if (showAlert) {
                showAlert('시나리오 제목을 입력해주세요.');
            }
            return;
        }

        onSave({
            scenarioId: scenarioId.trim(),
            thumbnail,
            thumbnailFile,
            category,
            platform,
            metadata: data.metadata
        });
        
        // 초기화
        setScenarioId('');
        setThumbnail(null);
        setThumbnailFile(null);
        setCategory('');
        setPlatform('');
    };

    const handleClose = () => {
        // 초기화
        setScenarioId('');
        setThumbnail(null);
        setThumbnailFile(null);
        setCategory('');
        setPlatform('');
        onClose();
    };

    const categoryOptions = [
        { value: '', label: '선택하세요' },
        { value: 'Essential Skills', label: 'Essential Skills' },
        { value: 'Disease Care', label: 'Disease Care' },
        { value: 'Diagnosis', label: 'Diagnosis' },
        { value: 'Procedure', label: 'Procedure' }
    ];

    const platformOptions = [
        { value: '', label: '선택하세요' },
        { value: 'VR', label: 'VR' },
        { value: 'Mobile/Web', label: 'Mobile/Web' }
    ];

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="시나리오 추가" maxWidth="max-w-2xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        시나리오 ID <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        value={scenarioId} 
                        onChange={(e) => setScenarioId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none" 
                        placeholder="예: SCENARIO_001"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">시나리오 제목 <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        value={data.metadata.title} 
                        onChange={(e) => updateMetadata('title', e.target.value)} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none" 
                        placeholder="예: 급성 심근경색 환자 간호" 
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">인계 사항 (SBAR)</label>
                    <textarea 
                        value={data.metadata.handover} 
                        onChange={(e) => updateMetadata('handover', e.target.value)} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none h-32 resize-none" 
                        placeholder="Situation, Background, Assessment, Recommendation..." 
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">학습 목표 (Mission)</label>
                    <textarea 
                        value={data.metadata.mission} 
                        onChange={(e) => updateMetadata('mission', e.target.value)} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none" 
                        placeholder="학습자가 달성해야 할 구체적인 목표..." 
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">카테고리</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                        {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">플랫폼</label>
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                        {platformOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">썸네일</label>
                    <div className="flex items-start gap-4">
                        <div className="w-32 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                            {thumbnail ? (
                                <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs text-gray-400">이미지 없음</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="mt-1 text-xs text-gray-500">권장 사이즈: 1280x720px (JPG, PNG)</p>
                            {thumbnail && (
                                <button
                                    type="button"
                                    onClick={handleRemoveThumbnail}
                                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                                >
                                    이미지 제거
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <Button onClick={handleClose} variant="outline">취소</Button>
                <Button onClick={handleSave} variant="primary">저장</Button>
            </div>
        </Modal>
    );
}
