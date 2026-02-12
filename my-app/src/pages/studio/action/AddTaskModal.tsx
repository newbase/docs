import React, { useState, useMemo } from 'react';
import { Search, Square, CheckSquare } from 'lucide-react';
import { Modal } from '@/components/shared/ui';
import { Button } from '@/components/shared/ui';
import { PRESET_TASKS } from '../../../data/studioPresets';
import { Todo, TaskType } from '../../../types';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    handleAddTaskSubmit: (newTasks: Partial<Todo>[]) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, handleAddTaskSubmit }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [taskType, setTaskType] = useState<TaskType>('todo');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

    const filteredTasks = useMemo(() => {
        const term = searchTerm.toLowerCase();
        let tasks = PRESET_TASKS.flatMap(category =>
            category.items.map(item => ({ ...item, categoryId: category.id }))
        );

        // Filter by Task Type
        tasks = tasks.filter(t => t.type === taskType);

        // Filter by Category
        if (selectedCategory !== 'all') {
            tasks = tasks.filter(t => t.categoryId === selectedCategory);
        }

        // Filter by Search Term
        if (term) {
            tasks = tasks.filter(t => t.content.toLowerCase().includes(term));
        }

        return tasks;
    }, [searchTerm, taskType, selectedCategory]);

    const toggleSelection = (content: string) => {
        const newSet = new Set(selectedTasks);
        if (newSet.has(content)) newSet.delete(content);
        else newSet.add(content);
        setSelectedTasks(newSet);
    };

    const handleSubmit = () => {
        let newTasks: Partial<Todo>[] = [];
        if (selectedTasks.size > 0) {
            newTasks = Array.from(selectedTasks).map(content => ({
                content,
                type: taskType
            }));
        } else if (searchTerm) {
            newTasks = [{ content: searchTerm, type: taskType }];
        }

        if (newTasks.length > 0) {
            handleAddTaskSubmit(newTasks);
            onClose();
            setSearchTerm("");
            setSelectedTasks(new Set());
            setSelectedCategory('all');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="활동 추가">
            <div className="space-y-5">
                <div className="grid grid-cols-3 gap-2">
                    {(['todo', 'decision', 'must-not'] as TaskType[]).map((t) => (
                        <button key={t} onClick={() => { setTaskType(t); setSelectedTasks(new Set()); setSelectedCategory('all'); }} className={`py-2 px-1 text-xs font-semibold rounded-md border uppercase transition-all ${taskType === t ? t === 'todo' ? 'bg-brand-600 text-white border-brand-600' : t === 'decision' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                            {t === 'todo' ? '할 일' : t === 'decision' ? '의사결정' : '패널티'}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    <div className="flex gap-2">
                        <div className="relative w-1/3 min-w-[140px]">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer"
                            >
                                <option value="all">전체</option>
                                {PRESET_TASKS.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-sm" placeholder="검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="h-64 overflow-y-auto space-y-1 border border-slate-100 rounded-md p-1 bg-slate-50/50 custom-scrollbar">
                        {filteredTasks.map((item, idx) => {
                            const content = item.content;
                            const isSelected = selectedTasks.has(content);
                            return (
                                <button key={idx} onClick={() => toggleSelection(content)} className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${isSelected ? 'bg-brand-100 text-brand-700 font-medium' : 'hover:bg-slate-100 text-slate-600'}`}>
                                    {isSelected ? <CheckSquare size={14} className="mr-2 text-brand-600" /> : <Square size={14} className="mr-2 text-slate-300" />}
                                    {content}
                                </button>
                            );
                        })}
                        {filteredTasks.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-xs">
                                {searchTerm ? `"${searchTerm}" 검색 결과가 없습니다.` : '해당 카테고리에 항목이 없습니다.'}
                                {searchTerm && (
                                    <div className="mt-2">
                                        <Button size="sm" variant="outline" onClick={() => { handleSubmit(); }}>"{searchTerm}" 직접 추가</Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={handleSubmit} disabled={selectedTasks.size === 0 && !searchTerm}>
                        {selectedTasks.size > 0 ? `${selectedTasks.size}개 ${taskType === 'todo' ? '할 일' : taskType === 'decision' ? '의사결정' : '패널티'} 추가` : '추가'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
