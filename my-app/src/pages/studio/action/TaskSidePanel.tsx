import React, { useState } from 'react';
import { X, Clock, Trash2, HelpCircle, List, ArrowUp, ArrowDown, Plus, AlertTriangle, Ban, CheckCircle2 } from 'lucide-react';
import { Todo, TaskType, Event } from '../../../types';
import { Button } from '@/components/shared/ui';
import { Badge } from '@/components/shared/ui';


interface TaskSidePanelProps {
    editingTodo: { stateId: string, eventId: string, todo: Todo } | null;
    setEditingTodo: (data: { stateId: string, eventId: string, todo: Todo } | null) => void;
    updateTodo: (stateId: string, eventId: string, todoId: string, updates: Partial<Todo>) => void;
    updateEvent: (stateId: string, eventId: string, updates: Partial<Event>) => void;
    deleteTodo: (stateId: string, eventId: string, todoId: string) => void;
    allStateOptions: { id: string, title: string }[];
}

export const TaskSidePanel: React.FC<TaskSidePanelProps> = ({
    editingTodo,
    setEditingTodo,
    updateTodo,
    updateEvent,
    deleteTodo,
    allStateOptions
}) => {
    const [selectedCategory, setSelectedCategory] = useState('');


    if (editingTodo) {
        const { stateId, eventId, todo } = editingTodo;
        return (
            <div className="w-[400px] bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col h-full">
                <div className="p-4 flex justify-between items-center bg-slate-50 sticky top-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                        {todo.type === 'todo' && (
                            <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">
                                <CheckCircle2 size={12} className="mr-1" />
                                할 일
                            </div>
                        )}
                        {todo.type === 'decision' && (
                            <div className="flex items-center text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 shrink-0">
                                <AlertTriangle size={12} className="mr-1" />
                                의사결정
                            </div>
                        )}
                        {todo.type === 'must-not' && (
                            <div className="flex items-center text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 shrink-0">
                                <Ban size={12} className="mr-1" />
                                금기
                            </div>
                        )}
                        <h3 className="font-bold text-slate-800 truncate" title={todo.content}>{todo.content || '활동 이름 없음'}</h3>
                    </div>
                    <button onClick={() => setEditingTodo(null)} className="text-slate-400 hover:text-slate-600 shrink-0 ml-2"> <X size={20} /> </button>
                </div>
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">

                    {/* Attribute Editing Section */}
                    <div>
                        <h4 className="text-xs font-medium text-slate-800 mb-3 border-b pb-2">속성 편집</h4>
                    </div>

                    {/* Path Setting Section (Decision / Penalty) */}
                    {(todo.type === 'decision' || todo.type === 'must-not') && (
                        <div>
                            <h4 className="text-xs font-medium text-slate-800 mb-3 border-b pb-2">경로 설정</h4>
                            {todo.type === 'decision' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-light text-slate-500 mb-1.5 uppercase">선택 시 다음으로 이동</label>
                                        <select value={todo.successStateId || ''} onChange={e => updateTodo(stateId, eventId, todo.id, { successStateId: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none">
                                            <option value="">이동 안 함</option>
                                            {allStateOptions.map(s => (
                                                <option key={s.id} value={s.id}>{s.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {todo.type === 'must-not' && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">수행 시 패널티 경로</label>
                                    <select value={todo.failStateId || ''} onChange={e => updateTodo(stateId, eventId, todo.id, { failStateId: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none">
                                        <option value="">이동 안 함</option>
                                        {allStateOptions.map(s => (
                                            <option key={s.id} value={s.id}>{s.title}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                </div>
                <div className="pl-4 pr-4 pt-2 pb-2 bg-slate-80 flex justify-end items-center gap-3">
                    <Button variant="ghost" onClick={() => { deleteTodo(stateId, eventId, todo.id); setEditingTodo(null); }} className="text-slate-400 hover:text-slate-600 hover:bg-slate px-3"> <Trash2 size={18} /> </Button>
                </div>
            </div>
        );
    }



    return null;
};
