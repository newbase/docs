import React, { useState } from 'react';
import { X, Clock, CheckCircle2, Trash2, Activity, Plus } from 'lucide-react';
import { Event, Todo, Role, TriggerType } from '../../../types';
import { Button } from '@/components/shared/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui';

interface ScenarioSidePanelProps {
    editingEvent: { stateId: string, event: Event, initialTab?: string } | null;
    setEditingEvent: (data: { stateId: string, event: Event, initialTab?: string } | null) => void;
    updateEvent: (stateId: string, eventId: string, updates: Partial<Event>) => void;
    updateTodo: (stateId: string, eventId: string, todoId: string, updates: Partial<Todo>) => void;
    deleteTodo: (stateId: string, eventId: string, todoId: string) => void;
    roles: Role[];
    allStateOptions: { id: string, title: string }[];
    getAllEvents: () => { id: string, title: string, stateId: string }[];
    deleteEvent: (stateId: string, eventId: string) => void;
}

export const EventSidePanel: React.FC<ScenarioSidePanelProps> = ({
    editingEvent,
    setEditingEvent,
    updateEvent,
    updateTodo,
    deleteTodo,
    roles,
    allStateOptions,
    getAllEvents,
    deleteEvent
}) => {
    const allEvents = getAllEvents();
    const [activeTab, setActiveTab] = useState('basic');

    // Update active tab when editingEvent changes
    React.useEffect(() => {
        if (editingEvent?.initialTab) {
            setActiveTab(editingEvent.initialTab);
        } else {
            // Default to basic if no specific request, but only if switching to a DIFFERENT event?
            // Or just keep current tab?
            // If we are opening a fresh event, default to basic.
            // If we are just updating props, maybe keep.
            // For simplicity, let's behave like this: 
            // If we receive a new event object (even same ID) with NO initialTab, we might want to keep activeTab? 
            // In ScenarioBoard we create a new object { stateId, event } on click.
            // So if I click card body -> { stateId, event }. initialTab unused. 
            // If I click badge -> { stateId, event, initialTab: 'path' }.
            // I should reset to 'basic' if no initialTab is provided? Or persist user preference?
            // The standard behavior for a side panel is usually reset to default or persist.
            // Let's reset to 'basic' if new event ID.
            setActiveTab('basic');
        }
    }, [editingEvent?.event.id, editingEvent?.initialTab]);

    // Helper to get role
    const getEventRole = (event: Event) => roles.find(r => r.id === event.roleId);

    if (editingEvent) {
        const { stateId, event } = editingEvent;
        const eventRole = getEventRole(event);
        const isPatient = eventRole?.type === 'Patient';

        return (
            <div className="w-[400px] bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col h-full">
                <div className="flex justify-between items-center p-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800">이벤트 편집</h3>
                    <button onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-slate-600"> <X size={20} /> </button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic" className="text-xs">기본설정</TabsTrigger>
                            <TabsTrigger value="attributes" className="text-xs">속성</TabsTrigger>
                            <TabsTrigger value="path" className="text-xs">경로</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {/* --- Basic Settings Tab --- */}
                        <TabsContent value="basic" className="space-y-6 mt-0">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">이벤트명</label>
                                    <input value={event.title} onChange={e => updateEvent(stateId, event.id, { title: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" placeholder="이벤트 제목 입력" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">설명</label>
                                    <textarea value={event.description} onChange={e => updateEvent(stateId, event.id, { description: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none h-24" placeholder="이벤트 설명 입력" />
                                </div>
                            </div>
                        </TabsContent>

                        {/* --- Attributes Tab --- */}
                        <TabsContent value="attributes" className="space-y-6 mt-0">


                            {isPatient && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase flex items-center"> <Activity size={14} className="mr-1" /> 증상 (Symptoms) </label>
                                        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => {
                                            const newTodo: Todo = { id: crypto.randomUUID(), content: '새로운 증상', type: 'symptom' };
                                            updateEvent(stateId, event.id, { todos: [...event.todos, newTodo] });
                                        }}> <Plus size={12} className="mr-1" /> 추가 </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {event.todos.filter(t => t.type === 'symptom').map(todo => (
                                            <div key={todo.id} className="flex gap-2">
                                                <input value={todo.content} onChange={e => updateTodo(stateId, event.id, todo.id, { content: e.target.value })} className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm outline-none" placeholder="증상 입력" />
                                                <Button variant="ghost" size="sm" className="h-full w-8 text-slate-400 hover:text-red-500 p-0" onClick={() => deleteTodo(stateId, event.id, todo.id)}> <Trash2 size={14} /> </Button>
                                            </div>
                                        ))}
                                        {event.todos.filter(t => t.type === 'symptom').length === 0 && <p className="text-xs text-slate-400 italic py-2 text-center">등록된 증상이 없습니다.</p>}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">활력징후 (Vital Signs)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div> <label className="text-[10px] text-slate-400">혈압 (수축기)</label> <input type="number" value={event.vitalSigns?.bpSys || ''} onChange={e => updateEvent(stateId, event.id, { vitalSigns: { ...event.vitalSigns!, bpSys: parseInt(e.target.value) } })} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" placeholder="mmHg" /> </div>
                                    <div> <label className="text-[10px] text-slate-400">혈압 (이완기)</label> <input type="number" value={event.vitalSigns?.bpDia || ''} onChange={e => updateEvent(stateId, event.id, { vitalSigns: { ...event.vitalSigns!, bpDia: parseInt(e.target.value) } })} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" placeholder="mmHg" /> </div>
                                    <div> <label className="text-[10px] text-slate-400">맥박 (HR)</label> <input type="number" value={event.vitalSigns?.hr || ''} onChange={e => updateEvent(stateId, event.id, { vitalSigns: { ...event.vitalSigns!, hr: parseInt(e.target.value) } })} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" placeholder="회/분" /> </div>
                                    <div> <label className="text-[10px] text-slate-400">호흡 (RR)</label> <input type="number" value={event.vitalSigns?.rr || ''} onChange={e => updateEvent(stateId, event.id, { vitalSigns: { ...event.vitalSigns!, rr: parseInt(e.target.value) } })} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" placeholder="회/분" /> </div>
                                    <div> <label className="text-[10px] text-slate-400">체온 (BT)</label> <input type="number" value={event.vitalSigns?.bt || ''} onChange={e => updateEvent(stateId, event.id, { vitalSigns: { ...event.vitalSigns!, bt: parseFloat(e.target.value) } })} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" placeholder="°C" /> </div>
                                    <div> <label className="text-[10px] text-slate-400">SpO2</label> <input type="number" value={event.vitalSigns?.spo2 || ''} onChange={e => updateEvent(stateId, event.id, { vitalSigns: { ...event.vitalSigns!, spo2: parseInt(e.target.value) } })} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" placeholder="%" /> </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">의식 수준 (GCS)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Eye (E)</label>
                                        <select
                                            value={event.consciousness?.match(/E(\d+)/)?.[1] || ''}
                                            onChange={e => {
                                                let current = event.consciousness || 'E1V1M1';
                                                if (!/^E\d+V[\dT]+M\d+$/.test(current)) current = 'E1V1M1';
                                                const newVal = e.target.value;
                                                const newGCS = current.replace(/E\d+/, `E${newVal}`);
                                                updateEvent(stateId, event.id, { consciousness: newGCS });
                                            }}
                                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-brand-500 outline-none"
                                        >
                                            <option value="4">E4 - 자발적</option>
                                            <option value="3">E3 - 언어지시</option>
                                            <option value="2">E2 - 통증자극</option>
                                            <option value="1">E1 - 무반응</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Verbal (V)</label>
                                        <select
                                            value={event.consciousness?.match(/V([\dT]+)/)?.[1] || ''}
                                            onChange={e => {
                                                let current = event.consciousness || 'E1V1M1';
                                                if (!/^E\d+V[\dT]+M\d+$/.test(current)) current = 'E1V1M1';
                                                const newVal = e.target.value;
                                                const newGCS = current.replace(/V[\dT]+/, `V${newVal}`);
                                                updateEvent(stateId, event.id, { consciousness: newGCS });
                                            }}
                                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-brand-500 outline-none"
                                        >
                                            <option value="5">V5 - 지남력 있음</option>
                                            <option value="4">V4 - 혼란된 대화</option>
                                            <option value="3">V3 - 부적절한 언어</option>
                                            <option value="2">V2 - 이해불명 음성</option>
                                            <option value="1">V1 - 무반응</option>
                                            <option value="T">VT - 기관절개관</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Motor (M)</label>
                                        <select
                                            value={event.consciousness?.match(/M(\d+)/)?.[1] || ''}
                                            onChange={e => {
                                                let current = event.consciousness || 'E1V1M1';
                                                if (!/^E\d+V[\dT]+M\d+$/.test(current)) current = 'E1V1M1';
                                                const newVal = e.target.value;
                                                const newGCS = current.replace(/M\d+/, `M${newVal}`);
                                                updateEvent(stateId, event.id, { consciousness: newGCS });
                                            }}
                                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-brand-500 outline-none"
                                        >
                                            <option value="6">M6 - 명령 수행</option>
                                            <option value="5">M5 - 통증 국소화</option>
                                            <option value="4">M4 - 통증 회피</option>
                                            <option value="3">M3 - 이상 굴곡</option>
                                            <option value="2">M2 - 이상 신전</option>
                                            <option value="1">M1 - 무반응</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-2 text-right">
                                    <span className="text-xs font-bold text-slate-600">Total: {event.consciousness || '입력 없음'}</span>
                                </div>
                            </div>
                        </TabsContent>

                        {/* --- Path Tab --- */}
                        <TabsContent value="path" className="space-y-6 mt-0">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800 mb-2">진입 조건 (Start)</h4>
                                    {(() => {
                                        const currentEvents = allEvents.filter(ev => ev.stateId === editingEvent?.stateId);
                                        const myIndex = currentEvents.findIndex(ev => ev.id === event.id);
                                        const isFirstEvent = myIndex <= 0;

                                        return (
                                            <select value={event.triggerType} onChange={e => {
                                                const newType = e.target.value as TriggerType | 'simultaneous';
                                                let newTriggerValue = event.triggerValue;
                                                // Apply default previous event logic for both 'event' and 'simultaneous' types
                                                if (newType === 'event' || newType === 'simultaneous') {
                                                    if (myIndex > 0) {
                                                        newTriggerValue = currentEvents[myIndex - 1].id;
                                                    }
                                                }
                                                updateEvent(stateId, event.id, { triggerType: newType, triggerValue: newTriggerValue });
                                            }} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none mb-2">
                                                <option value="immediate">상황 발생 즉시 시작</option>
                                                <option value="time">시간 경과 후 시작</option>
                                                <option value="simultaneous" disabled={isFirstEvent}>
                                                    선택 이벤트와 동시에 시작 {isFirstEvent ? '(이전 이벤트 없음)' : ''}
                                                </option>
                                                <option value="event" disabled={isFirstEvent}>
                                                    선택 이벤트 완료 후 시작 {isFirstEvent ? '(이전 이벤트 없음)' : ''}
                                                </option>
                                            </select>
                                        );
                                    })()}

                                    {event.triggerType === 'time' && (
                                        <div className="flex items-center space-x-2">
                                            <input type="number" value={event.triggerValue || ''} onChange={e => updateEvent(stateId, event.id, { triggerValue: e.target.value })} placeholder="0" className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm outline-none" />
                                            <span className="text-sm text-slate-600">초 후 시작</span>
                                        </div>
                                    )}
                                    {(event.triggerType === 'event' || event.triggerType === 'simultaneous') && (
                                        <select value={event.triggerValue || ''} onChange={e => updateEvent(stateId, event.id, { triggerValue: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none">
                                            <option value="">이벤트 선택...</option>
                                            {allEvents.filter(e => e.id !== event.id && e.stateId === editingEvent?.stateId).map(e => (
                                                <option key={e.id} value={e.id}>{e.title}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="border-t border-slate-100 my-4" />

                                <h4 className="text-xs font-bold text-slate-800">다음 경로 (End)</h4>
                                {(() => {
                                    const hasTodos = event.todos.some(t => t.type === 'todo'); // Or check for any task? User said 'todo items'. Let's stick to user request literal or broad 'any checklist item'. Usually "All Done" means all checklist items.
                                    // User said "할 일 태스크가 없는 경우" (If there are no Todo tasks).
                                    // Let's assume t.type === 'todo'.
                                    return (
                                        <div>
                                            <label className={`block text-xs font-semibold mb-1.5 uppercase flex items-center ${!hasTodos ? 'text-slate-400' : 'text-slate-500'}`}>
                                                <CheckCircle2 size={14} className={`mr-1 ${!hasTodos ? 'text-slate-400' : 'text-emerald-600'}`} />
                                                할 일 모두 완료 {!hasTodos && '(할 일 없음)'}
                                            </label>
                                            <select
                                                value={event.onAllTodosSuccess || ''}
                                                onChange={e => updateEvent(stateId, event.id, { onAllTodosSuccess: e.target.value })}
                                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                                                disabled={!hasTodos}
                                            >
                                                <option value="">다음 순서 자동 진행</option>
                                                {allStateOptions.map(s => (
                                                    <option key={s.id} value={s.id}>{s.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                })()}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase flex items-center"> <Clock size={14} className="mr-1 text-orange-600" /> 시간 초과 (Time Limit) </label>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <input type="number" value={event.timeLimit || 720} onChange={e => updateEvent(stateId, event.id, { timeLimit: parseInt(e.target.value) || undefined })} placeholder="720" className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm outline-none" />
                                        <span className="text-sm text-slate-600">초</span>
                                    </div>
                                    <select value={event.onTimeLimitFail || ''} onChange={e => updateEvent(stateId, event.id, { onTimeLimitFail: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none">
                                        <option value="">다음 순서 자동 진행</option>
                                        {allStateOptions.map(s => (
                                            <option key={s.id} value={s.id}>{s.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        );
    }

    return null;
};

