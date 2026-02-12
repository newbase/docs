import { X as XIcon } from 'lucide-react';
import { Event, Role, Todo } from '../../../types';
import { Button } from '@/components/shared/ui';
import { Badge } from '@/components/shared/ui';
import { TaskItem } from '../action/TaskItem';
import { TriggerUnified } from './Trigger';

interface EventCardProps {
    stateId: string;
    event: Event;
    role?: Role;
    highlightType?: 'success' | 'fail';
    setHighlightedTargets: (targets: Map<string, 'success' | 'fail'>) => void;
    setEditingEvent: (data: { stateId: string, event: Event, initialTab?: string } | null) => void;
    setEditingTodo: (data: { stateId: string, eventId: string, todo: Todo } | null) => void;
    setEditingDialogue: (data: { stateId: string, event: Event } | null) => void;
    deleteEvent: (stateId: string, eventId: string) => void;
    openAddModal: (type: 'event' | 'task', context?: any) => void;
    getAllEvents: () => { id: string, title: string, stateId: string }[];
    allStateOptions: { id: string, title: string }[];
}

export const EventCard: React.FC<EventCardProps> = ({
    stateId,
    event,
    role,
    highlightType,
    setHighlightedTargets,
    setEditingEvent,
    setEditingTodo,
    setEditingDialogue,
    deleteEvent,
    openAddModal,
    getAllEvents,
    allStateOptions
}) => {
    let eventRingClass = "";
    if (highlightType === 'success') eventRingClass = "ring-2 ring-emerald-400";
    else if (highlightType === 'fail') eventRingClass = "ring-2 ring-red-400";

    return (
        <div className={`bg-white rounded-lg border border-slate-200 shadow-sm group relative hover:shadow-md transition-shadow ${eventRingClass}`}>
            <div className="p-3 border-b border-slate-100">
                <div className="flex justify-between items-start mb-2">
                    {role ? (<Badge color={role.color} className="text-xs rounded-full shadow-sm">{role.name}</Badge>) : (<Badge color="slate" className="rounded-full shadow-sm bg-slate-100 text-slate-800">역할 없음</Badge>)}
                    <div className="flex items-center space-x-1">
                        <TriggerUnified variant="start" event={event} getAllEvents={getAllEvents} />
                        <Button variant="ghost" onClick={() => deleteEvent(stateId, event.id)} className="text-slate-400 hover:text-slate-600 group-hover:opacity-100 p-1.5 h-auto"> <XIcon size={20} /> </Button>
                    </div>
                </div>
                <h3 onClick={() => setEditingEvent({ stateId, event })} className="font-semibold text-sm text-slate-800 hover:text-brand-600 cursor-pointer mb-1">{event.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{event.description}</p>
            </div>

            <div className="bg-slate-50/50 p-2 space-y-2">
                {event.todos.map((todo) => (
                    <TaskItem
                        key={todo.id}
                        task={todo}
                        stateId={stateId}
                        eventId={event.id}
                        event={event}
                        setEditingTodo={setEditingTodo}
                        setEditingEvent={setEditingEvent}
                        setHighlightedTargets={setHighlightedTargets}
                    />
                ))}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
                    <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); openAddModal('task', { stateId, eventId: event.id }); }} className="flex-1 justify-center">+ 활동 추가</Button>
                    <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setEditingDialogue({ stateId, event }); }} className="flex-1 justify-center">대화 설정</Button>
                </div>
                <TriggerUnified
                    variant="end"
                    event={event}
                    stateId={stateId}
                    allStateOptions={allStateOptions}
                    setHighlightedTargets={setHighlightedTargets}
                />
            </div>
        </div>
    );
};
