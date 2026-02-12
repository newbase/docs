import React from 'react';
import { Modal } from '@/components/shared/ui';
import { Button } from '@/components/shared/ui';
import { ScenarioData } from '../../../types';
import { MAP_OPTIONS, ITEM_OPTIONS } from '../../../data/studioPresets';
import { Layout, CheckCircle2 } from 'lucide-react';

interface ScenarioEnvironmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ScenarioData;
    updateEnvironment: (mapId: string) => void;
    toggleEnvItem: (itemId: string) => void;
}

export const EnvironmentModal: React.FC<ScenarioEnvironmentModalProps> = ({
    isOpen,
    onClose,
    data,
    updateEnvironment,
    toggleEnvItem
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="맵 설정" maxWidth="max-w-4xl">
            <div className="space-y-8">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center"> <Layout size={16} className="mr-2" /> 배경 선택 </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {MAP_OPTIONS.map(opt => (
                            <button key={opt.id} onClick={() => updateEnvironment(opt.id)} className={`relative group rounded-xl border-2 overflow-hidden transition-all text-left ${data.environment.mapId === opt.id ? 'border-brand-600 ring-2 ring-brand-200 ring-offset-1' : 'border-slate-200 hover:border-brand-300'}`}>
                                <div className="aspect-video bg-slate-100 relative">
                                    {(opt as any).image ? (
                                        <img src={(opt as any).image} alt={opt.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            {opt.icon}
                                        </div>
                                    )}
                                    {data.environment.mapId === opt.id && (
                                        <div className="absolute inset-0 bg-brand-900/20 flex items-center justify-center">
                                            <div className="bg-white rounded-full p-1 shadow-md text-brand-600">
                                                <CheckCircle2 size={24} strokeWidth={3} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-white">
                                    <div className="font-bold text-sm text-slate-800">{opt.name}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1"> 기본 장비 설정 </h3>
                    <p className="text-xs text-slate-500 mb-3">시나리오 시작 시 배치되는 기본장비와 추가 요청할 수 있는 옵션장비 목록입니다.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {ITEM_OPTIONS.map(item => {
                            const isSelected = data.environment.availableItemIds.includes(item.id);
                            return (
                                <button key={item.id} onClick={() => toggleEnvItem(item.id)} className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all h-24 ${isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                    <div className={`mb-1 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>{item.icon}</div>
                                    <div className="text-xs font-semibold text-center leading-tight mb-2">{item.name}</div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-500'}`}>
                                        {isSelected ? '기본' : '옵션'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                <Button onClick={onClose}>완료</Button>
            </div>
        </Modal>
    );
};
