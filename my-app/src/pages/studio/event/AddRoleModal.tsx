import React, { useState, useMemo } from 'react';
import { Search, CheckSquare } from 'lucide-react';
import { Modal } from '@/components/shared/ui';
import { Button } from '@/components/shared/ui';
import { PRESET_ROLES } from '../../../data/studioPresets';

interface AddRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    handleAddRoles: (items: (typeof PRESET_ROLES[0] | string)[]) => void;
}

export const AddRoleModal: React.FC<AddRoleModalProps> = ({ isOpen, onClose, handleAddRoles }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());

    const filteredPresets = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return PRESET_ROLES.filter(r => r.name.toLowerCase().includes(term));
    }, [searchTerm]);

    const toggleSelection = (key: string) => {
        const newSet = new Set(selectedPresets);
        if (newSet.has(key)) newSet.delete(key);
        else newSet.add(key);
        setSelectedPresets(newSet);
    };

    const handleBatchAdd = () => {
        const items = Array.from(selectedPresets).map(key => PRESET_ROLES.find(r => r.name === key) || key).filter((item): item is typeof PRESET_ROLES[number] | string => !!item);
        handleAddRoles(items);
        onClose();
        setSearchTerm("");
        setSelectedPresets(new Set());
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="역할 추가">
            <div className="space-y-4">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-sm" placeholder="역할 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-1 p-1 custom-scrollbar">
                    {filteredPresets.map((item, idx) => {
                        const isSelected = selectedPresets.has(item.name);
                        return (
                            <button key={idx} onClick={() => toggleSelection(item.name)} className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-start group ${isSelected ? 'bg-brand-50 border-brand-200 shadow-sm' : 'bg-white border-slate-100 hover:border-brand-200 hover:bg-slate-50'}`}>
                                <div className={`mt-0.5 mr-3 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-500 border-brand-500' : 'border-slate-300 bg-white group-hover:border-brand-400'}`}> {isSelected && <CheckSquare size={10} className="text-white" />} </div>
                                <div className={`text-sm font-semibold ${isSelected ? 'text-brand-900' : 'text-slate-700'}`}>{item.name}</div>
                            </button>
                        );
                    })}
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                    <span className="text-sm text-slate-400 flex items-center mr-auto"> {selectedPresets.size}개 선택됨 </span>
                    <Button variant="outline" onClick={onClose}>취소</Button>
                    <Button onClick={handleBatchAdd} disabled={selectedPresets.size === 0}> 선택 항목 추가 </Button>
                </div>
            </div>
        </Modal>
    );
};
