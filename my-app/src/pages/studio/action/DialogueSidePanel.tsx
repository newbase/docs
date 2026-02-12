import React, { useState } from 'react';
import { X, List, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { Event, DialogueItem } from '../../../types';
import { Button } from '@/components/shared/ui';
import { DIALOGUE_PRESETS } from '../../../data/dialoguePresets';

interface DialogueSidePanelProps {
    editingDialogue: { stateId: string, event: Event } | null;
    setEditingDialogue: (data: { stateId: string, event: Event } | null) => void;
    updateEvent: (stateId: string, eventId: string, updates: Partial<Event>) => void;
}

export const DialogueSidePanel: React.FC<DialogueSidePanelProps> = ({
    editingDialogue,
    setEditingDialogue,
    updateEvent
}) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPreset, setSelectedPreset] = useState('');

    if (!editingDialogue) return null;

    const { stateId, event } = editingDialogue;

    return (
        <div className="w-[400px] bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0">
                <h3 className="font-bold text-slate-800">대화 / 질문 편집</h3>
                <button onClick={() => setEditingDialogue(null)} className="text-slate-400 hover:text-slate-600"> <X size={20} /> </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                <div className="flex flex-col space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="text-xs font-semibold text-slate-500 uppercase">대화 추가</label>
                    <div className="grid grid-cols-1 gap-2">
                        <select
                            value={selectedCategory}
                            onChange={e => { setSelectedCategory(e.target.value); setSelectedPreset(''); }}
                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none"
                        >
                            <option value="">카테고리 선택...</option>
                            {DIALOGUE_PRESETS.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.title}</option>
                            ))}
                        </select>

                        <select
                            value={selectedPreset}
                            onChange={e => setSelectedPreset(e.target.value)}
                            disabled={!selectedCategory}
                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none disabled:bg-slate-100 disabled:text-slate-300"
                        >
                            <option value="">질문 선택...</option>
                            {selectedCategory && DIALOGUE_PRESETS.find(c => c.id === selectedCategory)?.items.map(item => (
                                <option key={item.id} value={item.id}>{item.label}</option>
                            ))}
                        </select>

                        <Button
                            size="sm"
                            disabled={!selectedCategory || !selectedPreset}
                            onClick={() => {
                                const category = DIALOGUE_PRESETS.find(c => c.id === selectedCategory);
                                const item = category?.items.find(i => i.id === selectedPreset);
                                if (item) {
                                    const newDialogue: DialogueItem = {
                                        id: crypto.randomUUID(),
                                        question: item.question,
                                        answer: item.answer
                                    };
                                    updateEvent(stateId, event.id, { dialogues: [...(event.dialogues || []), newDialogue] });
                                    setSelectedPreset(''); // Reset selection
                                }
                            }}
                            className="w-full text-xs"
                        >
                            <Plus size={12} className="mr-1" /> 대화 리스트에 추가
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-xs font-semibold text-slate-500 uppercase flex items-center mt-4"> <List size={14} className="mr-1" /> 등록된 대화 목록 </label>
                    {(event.dialogues || []).map((dialogue, idx) => (
                        <div key={dialogue.id} className="p-3 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                                    <div className="flex space-x-0.5">
                                        <button
                                            disabled={idx === 0}
                                            onClick={() => {
                                                const newDialogues = [...(event.dialogues || [])];
                                                [newDialogues[idx - 1], newDialogues[idx]] = [newDialogues[idx], newDialogues[idx - 1]];
                                                updateEvent(stateId, event.id, { dialogues: newDialogues });
                                            }}
                                            className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                        >
                                            <ArrowUp size={12} />
                                        </button>
                                        <button
                                            disabled={idx === (event.dialogues?.length || 0) - 1}
                                            onClick={() => {
                                                const newDialogues = [...(event.dialogues || [])];
                                                [newDialogues[idx], newDialogues[idx + 1]] = [newDialogues[idx + 1], newDialogues[idx]];
                                                updateEvent(stateId, event.id, { dialogues: newDialogues });
                                            }}
                                            className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                        >
                                            <ArrowDown size={12} />
                                        </button>
                                    </div>
                                    <label className="flex items-center space-x-1 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={dialogue.isRequired || false}
                                            onChange={(e) => {
                                                const newDialogues = event.dialogues!.map(d => d.id === dialogue.id ? { ...d, isRequired: e.target.checked } : d);
                                                updateEvent(stateId, event.id, { dialogues: newDialogues });
                                            }}
                                            className="w-3 h-3 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                        />
                                        <span className={`text-[10px] ${dialogue.isRequired ? 'text-red-600 font-bold' : 'text-slate-400'}`}>필수</span>
                                    </label>
                                </div>
                                <Button variant="ghost" size="sm" className="h-4 w-4 text-slate-300 hover:text-red-500 p-0" onClick={() => {
                                    const newDialogues = event.dialogues!.filter(d => d.id !== dialogue.id);
                                    updateEvent(stateId, event.id, { dialogues: newDialogues });
                                }}> <X size={12} /> </Button>
                            </div>
                            <div>
                                <input value={dialogue.question} onChange={e => {
                                    const newDialogues = event.dialogues!.map(d => d.id === dialogue.id ? { ...d, question: e.target.value } : d);
                                    updateEvent(stateId, event.id, { dialogues: newDialogues });
                                }} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs mb-1" placeholder="내 질문 (System)" />
                                <textarea value={dialogue.answer} onChange={e => {
                                    const newDialogues = event.dialogues!.map(d => d.id === dialogue.id ? { ...d, answer: e.target.value } : d);
                                    updateEvent(stateId, event.id, { dialogues: newDialogues });
                                }} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs bg-indigo-50/30 resize-none h-16" placeholder="환자/캐릭터 답변" />
                            </div>
                        </div>
                    ))}
                    {(!event.dialogues || event.dialogues.length === 0) && <p className="text-xs text-slate-400 italic py-4 text-center">등록된 대화가 없습니다.</p>}
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200">
                <Button onClick={() => setEditingDialogue(null)} className="w-full">완료</Button>
            </div>
        </div>
    );
};
