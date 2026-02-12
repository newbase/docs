import React from 'react';
import { Trash2, Plus, Layout } from 'lucide-react';
import { ScenarioState, Event, Role, Todo } from '../../../types';
import { Button } from '@/components/shared/ui';

import { EventCard } from '../event/EventCard';

interface ScenarioBoardProps {
    states: ScenarioState[];
    highlightedTargets: Map<string, 'success' | 'fail'>;
    updateStateTitle: (id: string, title: string) => void;
    deleteState: (id: string) => void;
    getRole: (id: string) => Role | undefined;
    getAllEvents: () => { id: string, title: string, stateId: string }[];
    editingEvent: { stateId: string, event: Event, initialTab?: string } | null;
    setEditingEvent: (data: { stateId: string, event: Event, initialTab?: string } | null) => void;
    editingTodo?: { stateId: string, eventId: string, todo: Todo } | null;
    setEditingTodo: (data: { stateId: string, eventId: string, todo: Todo } | null) => void;
    setEditingDialogue: (data: { stateId: string, event: Event } | null) => void;
    setHighlightedTargets: (targets: Map<string, 'success' | 'fail'>) => void;
    deleteEvent: (stateId: string, eventId: string) => void;
    openAddModal: (type: 'event' | 'task', context?: any) => void;
    addState: () => void;
    allStateOptions: { id: string, title: string }[];
}

export const ScenarioBoard: React.FC<ScenarioBoardProps> = ({
    states,
    highlightedTargets,
    updateStateTitle,
    deleteState,
    getRole,
    getAllEvents,
    editingEvent,
    setEditingEvent,
    editingTodo,
    setEditingTodo,
    setEditingDialogue,
    setHighlightedTargets,
    deleteEvent,
    openAddModal,
    addState,
    allStateOptions
}) => {

    // Find the fresh version of the currently edited event to ensure highlights are reactive
    const currentEditingState = editingEvent || editingTodo ? states.find(s => s.id === (editingEvent?.stateId || editingTodo?.stateId)) : null;
    const currentEditingEventFull = currentEditingState && editingEvent ? currentEditingState.events.find(e => e.id === editingEvent.event.id) : null;
    const currentEditingTodoFull = currentEditingState && editingTodo ? currentEditingState.events.find(e => e.id === editingTodo.eventId)?.todos.find(t => t.id === editingTodo.todo.id) : null;

    return (
        <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
            <div className="flex h-full space-x-5 min-w-max relative">
                {states.map((state) => {
                    const highlightType = highlightedTargets.get(state.id);
                    let stateRingClass = "";
                    let stateBgClass = "bg-slate-100";
                    if (highlightType === 'success') { stateRingClass = "ring-4 ring-emerald-400 shadow-2xl scale-[1.02]"; stateBgClass = "bg-emerald-50"; }
                    else if (highlightType === 'fail') { stateRingClass = "ring-4 ring-red-400 shadow-2xl scale-[1.02]"; stateBgClass = "bg-red-50"; }
                    return (
                        <div key={state.id} className={`w-80 flex flex-col h-full rounded-xl border border-slate-200 shadow-sm overflow-hidden z-10 transition-all duration-300 ${stateBgClass} ${stateRingClass}`}>
                            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                                <input value={state.title} onChange={(e) => updateStateTitle(state.id, e.target.value)} className="font-semibold w-60 text-slate-800 bg-transparent focus:bg-slate-50 px-2 py-0.5 rounded w-full focus:outline-none" />
                                <Button variant="ghost" onClick={() => deleteState(state.id)} className="text-slate-400 hover:text-slate-600 p-3 h-6 hover:bg-slate-50"> <Trash2 size={16} /> </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                                {state.events.map((event) => {
                                    const role = getRole(event.roleId);

                                    // Calculate highlight type: mix of hover state and persistent editing state
                                    let eventHighlightType = highlightedTargets.get(event.id);

                                    // Apply persistent highlight if this event is a target of the currently edited event or todo
                                    if (!eventHighlightType) {
                                        if (currentEditingEventFull) {
                                            if (currentEditingEventFull.onAllTodosSuccess === event.id) eventHighlightType = 'success';
                                            else if (currentEditingEventFull.onTimeLimitFail === event.id) eventHighlightType = 'fail';
                                        }
                                        if (currentEditingTodoFull) {
                                            if (currentEditingTodoFull.successStateId === event.id) eventHighlightType = 'success';
                                            else if (currentEditingTodoFull.failStateId === event.id) eventHighlightType = 'fail';
                                        }
                                    }

                                    return (
                                        <EventCard
                                            key={event.id}
                                            stateId={state.id}
                                            event={event}
                                            role={role}
                                            highlightType={eventHighlightType}
                                            setHighlightedTargets={setHighlightedTargets}
                                            setEditingEvent={setEditingEvent}
                                            setEditingTodo={setEditingTodo}
                                            setEditingDialogue={setEditingDialogue}
                                            deleteEvent={deleteEvent}
                                            openAddModal={openAddModal}
                                            getAllEvents={getAllEvents}
                                            allStateOptions={allStateOptions}
                                        />
                                    );
                                })}
                                <Button variant="outline" size="sm" onClick={() => openAddModal('event', { stateId: state.id })} className="w-full bg-slate-80 border-dashed border-slate-300 hover:bg-slate-50 hover:text-primary-500"> <Plus size={16} className="mr-2" /> 이벤트 추가 </Button>
                            </div>
                        </div>
                    );
                })}
                <div className="w-80 shrink-0 z-10">
                    <button onClick={addState} className="w-full h-full min-h-[200px] max-h-[500px] flex flex-col items-center justify-center text-slate-400 hover:text-brand-600 bg-white/50 hover:bg-white border-2 border-dashed border-slate-300 rounded-xl"> <Layout size={32} className="mb-2 opacity-50" /> <span className="font-medium">새 단계 추가</span> </button>
                </div>
            </div>
        </main>
    );
};
