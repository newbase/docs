import React from 'react';
import { Timer, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { Todo, Event } from '../../../types';
import { Button } from '@/components/shared/ui';
import { TriggerUnified } from '../event/Trigger';

interface TaskItemProps {
    task: Todo;
    stateId: string;
    eventId: string;
    event: Event;
    setEditingTodo: (data: { stateId: string, eventId: string, todo: Todo } | null) => void;
    setEditingEvent: (data: { stateId: string, event: Event, initialTab?: string } | null) => void;
    setHighlightedTargets: (targets: Map<string, 'success' | 'fail'>) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
    task,
    stateId,
    eventId,
    event,
    setEditingTodo,
    setEditingEvent,
    setHighlightedTargets
}) => {
    const [isLocked, setIsLocked] = React.useState(false);

    const getTargets = () => {
        const targets = new Map<string, 'success' | 'fail'>();
        if (task.successStateId) targets.set(task.successStateId, 'success');
        if (task.failStateId) targets.set(task.failStateId, 'fail');
        return targets;
    };

    const handleMouseEnter = () => {
        if (!isLocked) {
            setHighlightedTargets(getTargets());
        }
    };

    const handleMouseLeave = () => {
        if (!isLocked) {
            setHighlightedTargets(new Map());
        }
    };

    const toggleLock = (e: React.MouseEvent) => {
        e.stopPropagation();

        const targets = getTargets();
        if (targets.size === 0) {
            setEditingTodo({ stateId, eventId, todo: task });
            return;
        }

        if (isLocked) {
            setIsLocked(false);
            setHighlightedTargets(new Map());
        } else {
            setIsLocked(true);
            setHighlightedTargets(targets);
        }
    };

    return (
        <div
            onClick={() => setEditingTodo({ stateId, eventId, todo: task })}
            className={`p-2 rounded border text-sm shadow-sm bg-white cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-2 relative group/task ${task.type === 'todo' ? 'border-slate-100' : task.type === 'decision' ? 'border-slate-100' : 'border-slate-100'}`}
        >
            {task.type === 'todo' && <TriggerUnified variant="todo" />}
            {task.type === 'decision' && <TriggerUnified variant="decision" todo={task} setHighlightedTargets={setHighlightedTargets} />}
            {task.type === 'must-not' && <TriggerUnified variant="mustnot" todo={task} setHighlightedTargets={setHighlightedTargets} />}
            <div className="flex-1">
                <span className={`text-xs ${task.type === 'must-not' ? 'text-red-700' : 'text-slate-700'}`}>{task.content}</span>
            </div>
            {
                task.type !== 'todo' && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`p-1 h-auto ${isLocked ? (task.type === 'must-not' ? 'text-red-600 bg-red-100 ring-1 ring-red-400' : 'text-indigo-600 bg-indigo-100 ring-1 ring-indigo-400') : (task.type === 'must-not' ? 'text-slate-400 hover:text-red-600' : 'text-slate-400 hover:text-indigo-600')} visible`}
                        onClick={toggleLock}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        title={isLocked ? "경로 강조 끄기" : "경로 강조 고정"}
                    >
                        <LinkIcon size={12} />
                    </Button>
                )
            }
        </div >
    );
};
