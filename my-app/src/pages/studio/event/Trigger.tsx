import React, { useState } from 'react';
import { CheckCircle2, Timer, ArrowRight, AlertTriangle, Ban, CircleQuestionMark, TreeDeciduousIcon, ListTree, Waypoints } from 'lucide-react';
import { Event, Todo } from '../../../types';

export type TriggerVariant = 'start' | 'end' | 'decision' | 'mustnot' | 'todo';

interface TriggerProps {
    variant: TriggerVariant;
    event?: Event;
    todo?: Todo;
    stateId?: string;
    allStateOptions?: { id: string, title: string }[];
    getAllEvents?: () => { id: string, title: string, stateId: string }[];
    setHighlightedTargets?: (targets: Map<string, 'success' | 'fail'>) => void;
}

export const Trigger: React.FC<TriggerProps> = ({
    variant,
    event,
    todo,
    stateId,
    allStateOptions,
    getAllEvents,
    setHighlightedTargets
}) => {
    const [locked, setLocked] = useState<boolean>(false);

    // --- Start Trigger ---
    if (variant === 'start' && event && getAllEvents) {
        return (
            <div className="flex items-center text-xs text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span>
                    {event.triggerType === 'immediate' ? '바로 시작' :
                        event.triggerType === 'time' ? `+${event.triggerValue || 0}초 후 시작` :
                            event.triggerType === 'simultaneous' ? '동시 시작' :
                                event.triggerType === 'event' ? (getAllEvents().find(e => e.id === event.triggerValue)?.title.substring(0, 15) + (getAllEvents().find(e => e.id === event.triggerValue)?.title && getAllEvents().find(e => e.id === event.triggerValue)!.title.length > 15 ? '...' : '') || '완료 후 시작') : ''}
                </span>
            </div>
        );
    }

    // --- End Trigger ---
    if (variant === 'end' && event && allStateOptions && setHighlightedTargets) {
        if (!event.timeLimit && !event.onAllTodosSuccess) return null;

        return (
            <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                {event.onAllTodosSuccess && (
                    <div
                        className={`flex items-center text-xs px-2 py-1 rounded border cursor-pointer transition-colors ${locked === true ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'}`} // Simplified locked state check for now. Ideally should track type.
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        {/* Placeholder, real logic below in return */}
                    </div>
                )}
            </div>
        );
    }

    return null;
};

const TriggerStart = ({ event, getAllEvents }: { event: Event, getAllEvents: any }) => (
    <div className="flex items-center text-xs text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span>
            {event.triggerType === 'immediate' ? '바로 시작' :
                event.triggerType === 'time' ? `+${event.triggerValue || 0}초 후 시작` :
                    event.triggerType === 'simultaneous' ? (getAllEvents().find((e: any) => e.id === event.triggerValue)?.title.substring(0, 15) + (getAllEvents().find((e: any) => e.id === event.triggerValue)?.title && getAllEvents().find((e: any) => e.id === event.triggerValue)!.title.length > 15 ? '...' : '') || '동시 시작') + ' 동시 시작' :
                        event.triggerType === 'event' ? (getAllEvents().find((e: any) => e.id === event.triggerValue)?.title.substring(0, 15) + (getAllEvents().find((e: any) => e.id === event.triggerValue)?.title && getAllEvents().find((e: any) => e.id === event.triggerValue)!.title.length > 15 ? '...' : '') || '완료 후 시작') + ' 후 시작' : ''}
        </span>
    </div>
);

const TriggerEnd = ({ event, allStateOptions, setHighlightedTargets }: { event: Event, allStateOptions: any[], setHighlightedTargets: any }) => {
    const [lockedType, setLockedType] = useState<'success' | 'fail' | null>(null);
    if (!event.timeLimit && !event.onAllTodosSuccess) return null;

    return (
        <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
            {event.onAllTodosSuccess && (
                <div
                    className={`flex items-center text-xs px-2 py-1 rounded border cursor-pointer transition-colors ${lockedType === 'success' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (lockedType === 'success') {
                            setLockedType(null);
                            setHighlightedTargets(new Map());
                        } else {
                            setLockedType('success');
                            const targets = new Map<string, 'success' | 'fail'>();
                            targets.set(event.onAllTodosSuccess!, 'success');
                            setHighlightedTargets(targets);
                        }
                    }}
                    onMouseEnter={() => {
                        if (lockedType !== 'success') {
                            const targets = new Map<string, 'success' | 'fail'>();
                            targets.set(event.onAllTodosSuccess!, 'success');
                            setHighlightedTargets(targets);
                        }
                    }}
                    onMouseLeave={() => {
                        if (lockedType === 'success') {
                            const targets = new Map<string, 'success' | 'fail'>();
                            targets.set(event.onAllTodosSuccess!, 'success');
                            setHighlightedTargets(targets);
                        } else {
                            setHighlightedTargets(new Map());
                        }
                    }}
                    title={`이동: ${allStateOptions.find(s => s.id === event.onAllTodosSuccess)?.title}`}
                >
                    <CheckCircle2 size={16} className="mr-1" />
                    모두 완료 &rarr;
                </div>
            )}
            {event.timeLimit && (
                <div
                    className={`flex items-center text-xs px-1 py-1 rounded border cursor-pointer transition-colors hover:bg-opacity-80 ${event.onTimeLimitFail ?
                        (lockedType === 'fail' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100') :
                        'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (event.onTimeLimitFail) {
                            if (lockedType === 'fail') {
                                setLockedType(null);
                                setHighlightedTargets(new Map());
                            } else {
                                setLockedType('fail');
                                const targets = new Map<string, 'success' | 'fail'>();
                                targets.set(event.onTimeLimitFail, 'fail');
                                setHighlightedTargets(targets);
                            }
                        }
                    }}
                    onMouseEnter={() => {
                        if (event.onTimeLimitFail && lockedType !== 'fail') {
                            const targets = new Map<string, 'success' | 'fail'>();
                            targets.set(event.onTimeLimitFail, 'fail');
                            setHighlightedTargets(targets);
                        }
                    }}
                    onMouseLeave={() => {
                        if (lockedType === 'fail' && event.onTimeLimitFail) {
                            const targets = new Map<string, 'success' | 'fail'>();
                            targets.set(event.onTimeLimitFail, 'fail');
                            setHighlightedTargets(targets);
                        } else {
                            setHighlightedTargets(new Map());
                        }
                    }}
                    title={event.onTimeLimitFail ? `시간 초과 (${event.timeLimit}초) -> ${allStateOptions.find(s => s.id === event.onTimeLimitFail)?.title}` : `제한 시간: ${event.timeLimit}초 (전환 없음)`}
                >
                    <Timer size={16} className="mr-1" />
                    {event.timeLimit}초 초과 {event.onTimeLimitFail ? <ArrowRight size={14} className="ml-1" /> : ''}
                </div>
            )}
        </div>
    );
};

const TriggerDecision = ({ todo, setHighlightedTargets }: { todo: Todo, setHighlightedTargets: any }) => {
    // Decision Trigger logic (AlertTriangle)
    const [locked, setLocked] = useState(false);

    return (
        <div
            className="flex items-center text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 cursor-pointer hover:bg-indigo-100"
            onClick={(e) => {
                e.stopPropagation();
                if (locked) {
                    setLocked(false);
                    setHighlightedTargets(new Map());
                } else {
                    setLocked(true);
                    const targets = new Map<string, 'success' | 'fail'>();
                    if (todo.successStateId) targets.set(todo.successStateId, 'success');
                    if (todo.failStateId) targets.set(todo.failStateId, 'fail');
                    setHighlightedTargets(targets);
                }
            }}
            onMouseEnter={() => {
                if (!locked) {
                    const targets = new Map<string, 'success' | 'fail'>();
                    if (todo.successStateId) targets.set(todo.successStateId, 'success');
                    if (todo.failStateId) targets.set(todo.failStateId, 'fail');
                    setHighlightedTargets(targets);
                }
            }}
            onMouseLeave={() => {
                if (locked) {
                    const targets = new Map<string, 'success' | 'fail'>();
                    if (todo.successStateId) targets.set(todo.successStateId, 'success');
                    if (todo.failStateId) targets.set(todo.failStateId, 'fail');
                    setHighlightedTargets(targets);
                } else {
                    setHighlightedTargets(new Map());
                }
            }}
        >
            <CircleQuestionMark size={14} />
        </div>
    );
}

const TriggerMustNot = ({ todo, setHighlightedTargets }: { todo: Todo, setHighlightedTargets: any }) => {
    // MustNot Trigger logic (Ban)
    // MustNot usually implies a penalty or fail state.
    const [locked, setLocked] = useState(false);

    return (
        <div
            className="flex items-center text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 cursor-pointer hover:bg-red-100"
            onClick={(e) => {
                e.stopPropagation();
                if (locked) {
                    setLocked(false);
                    setHighlightedTargets(new Map());
                } else {
                    setLocked(true);
                    const targets = new Map<string, 'success' | 'fail'>();
                    // MustNot (Penalty) usually goes to failStateId if defined, or just penalty.
                    if (todo.failStateId) targets.set(todo.failStateId, 'fail');
                    setHighlightedTargets(targets);
                }
            }}
            onMouseEnter={() => {
                if (!locked) {
                    const targets = new Map<string, 'success' | 'fail'>();
                    if (todo.failStateId) targets.set(todo.failStateId, 'fail');
                    setHighlightedTargets(targets);
                }
            }}
            onMouseLeave={() => {
                if (locked) {
                    const targets = new Map<string, 'success' | 'fail'>();
                    if (todo.failStateId) targets.set(todo.failStateId, 'fail');
                    setHighlightedTargets(targets);
                } else {
                    setHighlightedTargets(new Map());
                }
            }}
        >
            <Ban size={14} />
        </div>
    );
}


// TriggerTodo component
const TriggerTodo = () => {
    return (
        <div className="flex items-center justify-center w-[22px] h-[22px] text-emerald-600 bg-emerald-50 rounded border border-emerald-100 shrink-0">
            <CheckCircle2 size={14} />
        </div>
    );
};

export const TriggerUnified: React.FC<TriggerProps> = (props) => {
    switch (props.variant) {
        case 'start':
            return props.event && props.getAllEvents ? <TriggerStart event={props.event} getAllEvents={props.getAllEvents} /> : null;
        case 'end':
            return props.event && props.allStateOptions && props.setHighlightedTargets ? <TriggerEnd event={props.event} allStateOptions={props.allStateOptions} setHighlightedTargets={props.setHighlightedTargets} /> : null;
        case 'decision':
            return props.todo && props.setHighlightedTargets ? <TriggerDecision todo={props.todo} setHighlightedTargets={props.setHighlightedTargets} /> : null;
        case 'mustnot':
            return props.todo && props.setHighlightedTargets ? <TriggerMustNot todo={props.todo} setHighlightedTargets={props.setHighlightedTargets} /> : null;
        case 'todo':
            return <TriggerTodo />;
        default:
            return null;
    }
};
