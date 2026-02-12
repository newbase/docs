import React, { useState, useMemo, useEffect } from 'react';
import { Search, User, ChevronDown } from 'lucide-react';
import { Modal } from '@/components/shared/ui';
import { Button } from '@/components/shared/ui';
import { PRESET_EVENTS } from '../../../data/studioPresets';
import { Role } from '../../../types';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    roles: Role[];
    handleAddEvents: (items: (typeof PRESET_EVENTS[0] | string)[], roleId?: string) => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, roles, handleAddEvents }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeRoleFilterId, setActiveRoleFilterId] = useState<string | 'all'>('all');
    const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');

    const CATEGORY_OPTIONS = [
        { id: 'all', label: '전체' },
        { id: 'symptom', label: '증상' },
        { id: 'critical', label: '응급' },
        { id: 'clinical', label: '처치' },
        { id: 'admin', label: '기타' },
    ];

    useEffect(() => {
        if (isOpen && roles.length > 0) {
            setActiveRoleFilterId(roles[0].id);
        }
    }, [isOpen, roles]);

    const filteredPresets = useMemo(() => {
        let events = PRESET_EVENTS;
        const term = searchTerm.toLowerCase();

        if (activeRoleFilterId !== 'all') {
            const targetRole = roles.find(r => r.id === activeRoleFilterId);
            if (targetRole) {
                events = events.filter(e => e.roleTypes.includes(targetRole.type));
            }
        }
        if (activeCategory !== 'all') {
            events = events.filter((e: any) => e.category === activeCategory);
        }
        return events.filter(e => e.title.toLowerCase().includes(term));
    }, [searchTerm, activeRoleFilterId, roles, activeCategory]);

    const handleSelect = (item: typeof PRESET_EVENTS[0] | string) => {
        handleAddEvents([item], activeRoleFilterId !== 'all' ? activeRoleFilterId : undefined);
        onClose();
        setSearchTerm("");
        setActiveRoleFilterId('all');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="이벤트 추가">
            <div className="space-y-2">
                {roles.length > 0 && (
                    <div className="mb-2">
                        <div className="relative">
                            <select
                                value={activeRoleFilterId}
                                onChange={(e) => setActiveRoleFilterId(e.target.value)}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none appearance-none bg-white"
                            >
                                <option value="all">모든 역할 (공통)</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14} /></div>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                    {CATEGORY_OPTIONS.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat.id
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {(roles.length > 0 || activeRoleFilterId === 'all') && (
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-md outline-none text-sm transition-colors bg-white border-slate-300 focus:ring-2 focus:ring-brand-500"
                            placeholder="이벤트 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}

                <div className="h-[300px] overflow-y-auto space-y-1 p-1 custom-scrollbar">
                    {roles.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm flex flex-col items-center">
                            <User size={24} className="mb-2 opacity-50" />
                            <span>사용 가능한 이벤트가 없습니다. <br /> 역할 바에서 역할을 먼저 추가해주세요.</span>
                        </div>
                    ) : filteredPresets.length > 0 ? (
                        filteredPresets.map((item, idx) => {
                            return (
                                <button key={idx} onClick={() => handleSelect(item)} className="w-full text-left px-4 py-3 rounded-lg border bg-white border-slate-100 hover:border-brand-200 hover:bg-slate-50 transition-all flex items-start group">
                                    <div className="mt-0.5 mr-3 w-4 h-4 rounded border border-slate-300 bg-white group-hover:border-brand-400 flex items-center justify-center transition-colors"> <div className="w-2 h-2 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" /> </div>
                                    <div> <div className="text-sm font-semibold text-slate-700 group-hover:text-brand-900 transition-colors">{item.title}</div> <div className="text-xs text-slate-400 mt-0.5">{item.description}</div> </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            조건에 맞는 이벤트가 없습니다.
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                    <Button variant="outline" onClick={onClose}>취소</Button>
                </div>
            </div>
        </Modal>
    );
};
