import React from 'react';
import { Modal } from '@/components/shared/ui';
import { Button } from '@/components/shared/ui';
import { ScenarioData } from '../../../types';

interface ScenarioGeneralModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ScenarioData;
    updateMetadata: (field: keyof ScenarioData['metadata'], value: string) => void;
}

export const ScenarioGeneralModal: React.FC<ScenarioGeneralModalProps> = ({
    isOpen,
    onClose,
    data,
    updateMetadata
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="기본 정보" maxWidth="max-w-2xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">시나리오 제목</label>
                    <input type="text" value={data.metadata.title} onChange={(e) => updateMetadata('title', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none" placeholder="예: 급성 심근경색 환자 간호" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">인계 사항 (SBAR)</label>
                    <textarea value={data.metadata.handover} onChange={(e) => updateMetadata('handover', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none h-32 resize-none" placeholder="Situation, Background, Assessment, Recommendation..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">학습 목표 (Mission)</label>
                    <textarea value={data.metadata.mission} onChange={(e) => updateMetadata('mission', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none" placeholder="학습자가 달성해야 할 구체적인 목표..." />
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                <Button onClick={onClose}>완료</Button>
            </div>
        </Modal>
    );
};
