import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ScenarioData, Event, Role, Todo, ScenarioState, TriggerType } from '../../types/index';
import { INITIAL_DATA } from '../../data/initialScenarioData';
import { getRoleColor } from '../../utils/studioUtils';

// Preset Components
import { StudioHeader } from './preset/StudioHeader';
import { ScenarioBoard } from './preset/ScenarioBoard';
import { AIModal } from './preset/AIModal';
import { EnvironmentBar } from './preset/EnvironmentBar';
import { EnvironmentModal } from './preset/EnvironmentModal';
import { StorageConfigModal } from './preset/StorageConfigModal';
import { useStorageConfig } from './preset/storage/useStorageConfig';

// Event Components
import { EventSidePanel } from './event/EventSidePanel';
import { AddEventModal } from './event/AddEventModal';
import { RolesBar } from './event/RolesBar';
import { AddRoleModal } from './event/AddRoleModal';

// Action Components
import { TaskSidePanel } from './action/TaskSidePanel';
import { AddTaskModal } from './action/AddTaskModal';
import { DialogueSidePanel } from './action/DialogueSidePanel';

import { StorageItem } from '../../types';

export default function StudioEdit() {
    const navigate = useNavigate();
    const [data, setData] = useState<ScenarioData>(INITIAL_DATA);

    // UI State
    const [highlightedTargets, setHighlightedTargets] = useState<Map<string, 'success' | 'fail'>>(new Map());

    // Selection State
    const [editingEvent, setEditingEvent] = useState<{ stateId: string, event: Event, initialTab?: string } | null>(null);
    const [editingTodo, setEditingTodo] = useState<{ stateId: string, eventId: string, todo: Todo } | null>(null);
    const [editingDialogue, setEditingDialogue] = useState<{ stateId: string, event: Event } | null>(null);

    // Modal State
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false);
    const [isEnvironmentModalOpen, setIsEnvironmentModalOpen] = useState(false);

    // AI State
    const [aiPrompt, setAiPrompt] = useState("");
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    // Context for Add Modals
    const [addModalContext, setAddModalContext] = useState<any>(null);

    // Storage Config State - using custom hook
    const [storageConfigItemId, setStorageConfigItemId] = useState<string | null>(null);
    const storageConfig = useStorageConfig();

    const [isSaving, setIsSaving] = useState(false);

    // --- Actions ---

    const updateStateTitle = (id: string, title: string) => {
        setData(prev => ({
            ...prev,
            states: prev.states.map(s => s.id === id ? { ...s, title } : s)
        }));
    };

    const addState = () => {
        const newStateId = `state-${Date.now()}`;
        setData(prev => ({
            ...prev,
            states: [...prev.states, { id: newStateId, title: '새 단계', events: [] }]
        }));
    };

    const deleteState = (id: string) => {
        if (!window.confirm('단계를 삭제하시겠습니까? 포함된 모든 이벤트가 삭제됩니다.')) return;
        setData(prev => ({
            ...prev,
            states: prev.states.filter(s => s.id !== id)
        }));
    };

    const deleteEvent = (stateId: string, eventId: string) => {
        setData(prev => ({
            ...prev,
            states: prev.states.map(s => s.id === stateId ? {
                ...s,
                events: s.events.filter(e => e.id !== eventId)
            } : s)
        }));
        if (editingEvent?.event.id === eventId) setEditingEvent(null);
    };

    const updateEvent = (stateId: string, eventId: string, updates: Partial<Event>) => {
        setData(prev => ({
            ...prev,
            states: prev.states.map(s => s.id === stateId ? {
                ...s,
                events: s.events.map(e => e.id === eventId ? { ...e, ...updates } : e)
            } : s)
        }));

        // Update local editing state if needed
        if (editingEvent && editingEvent.event.id === eventId) {
            setEditingEvent(prev => prev ? { ...prev, event: { ...prev.event, ...updates } } : null);
        }
    };

    const updateTodo = (stateId: string, eventId: string, todoId: string, updates: Partial<Todo>) => {
        setData(prev => {
            const newState = prev.states.map(s => {
                if (s.id !== stateId) return s;
                return {
                    ...s,
                    events: s.events.map(e => {
                        if (e.id !== eventId) return e;
                        return {
                            ...e,
                            todos: e.todos.map(t => t.id === todoId ? { ...t, ...updates } : t)
                        };
                    })
                };
            });
            return { ...prev, states: newState };
        });

        if (editingTodo && editingTodo.todo.id === todoId) {
            setEditingTodo(prev => prev ? { ...prev, todo: { ...prev.todo, ...updates } } : null);
        }
    };

    const deleteTodo = (stateId: string, eventId: string, todoId: string) => {
        setData(prev => ({
            ...prev,
            states: prev.states.map(s => s.id === stateId ? {
                ...s,
                events: s.events.map(e => e.id === eventId ? {
                    ...e,
                    todos: e.todos.filter(t => t.id !== todoId)
                } : e)
            } : s)
        }));
        if (editingTodo?.todo.id === todoId) setEditingTodo(null);
    };

    // --- Helpers ---
    const getRole = (id: string) => data.roles.find(r => r.id === id);
    const getAllEvents = () => data.states.flatMap(s => s.events.map(e => ({ id: e.id, title: e.title, stateId: s.id })));
    const allStateOptions = data.states.map(s => ({ id: s.id, title: s.title }));

    const handleSaveToLocalStorage = () => {
        setIsSaving(true);
        setTimeout(() => {
            alert('저장되었습니다');
            setIsSaving(false);
        }, 500);
    };

    const openAddModal = (type: 'event' | 'task' | 'role', context?: any) => {
        setAddModalContext(context);
        if (type === 'event') setIsAddEventModalOpen(true);
        if (type === 'task') setIsAddTaskModalOpen(true);
        if (type === 'role') setIsAddRoleModalOpen(true);
    };

    // --- Specific Handlers for Modals ---

    const handleAddEvents = (items: any[], roleId?: string) => {
        const stateId = addModalContext?.stateId;
        if (!stateId) return;

        const newEvents: Event[] = items.map((item, idx) => ({
            id: `evt-${Date.now()}-${idx}`,
            roleId: roleId || (data.roles[0]?.id || 'unknown'),
            title: typeof item === 'string' ? item : item.title,
            description: typeof item === 'string' ? '' : (item.description || ''),
            triggerType: 'immediate',
            // ... populate from preset if available
            todos: [],
            vitalSigns: {
                bpSys: 120,
                bpDia: 80,
                hr: 80,
                rr: 16,
                bt: 36.5,
                spo2: 98
            },
            consciousness: 'E4V5M6'
        } as Event));

        setData(prev => ({
            ...prev,
            states: prev.states.map(s => s.id === stateId ? {
                ...s,
                events: [...s.events, ...newEvents]
            } : s)
        }));
    };

    const handleAddRoles = (items: any[]) => {
        const newRoles: Role[] = items.map((item, idx) => ({
            id: `role-${Date.now()}-${idx}`,
            name: typeof item === 'string' ? item : item.name,
            type: typeof item === 'string' ? 'Other' : (item.type || 'Other'),
            color: getRoleColor(typeof item === 'string' ? 'Other' : item.type)
        }));

        setData(prev => ({
            ...prev,
            roles: [...prev.roles, ...newRoles]
        }));
    };

    const handleAddTasks = (newTasks: Partial<Todo>[]) => {
        const stateId = addModalContext?.stateId;
        const eventId = addModalContext?.eventId;
        if (!stateId || !eventId) return;

        const tasks: Todo[] = newTasks.map((task, idx) => ({
            id: `task-${Date.now()}-${idx}`,
            content: task.content || '',
            type: task.type || 'todo',
            completed: false
        }));

        setData(prev => ({
            ...prev,
            states: prev.states.map(s => s.id === stateId ? {
                ...s,
                events: s.events.map(e => e.id === eventId ? {
                    ...e,
                    todos: [...e.todos, ...tasks]
                } : e)
            } : s)
        }));
    };

    const setDefaultRole = (id: string) => {
        // Implement default role logic if needed (e.g. reorder arrays or set flag)
        // For now, just move it to index 0
        setData(prev => {
            const role = prev.roles.find(r => r.id === id);
            if (!role) return prev;
            return {
                ...prev,
                roles: [role, ...prev.roles.filter(r => r.id !== id)]
            };
        });
    };

    const updateEnvironment = (mapId: string) => {
        setData(prev => ({
            ...prev,
            environment: { ...prev.environment, mapId }
        }));
    };

    const toggleEnvItem = (itemId: string) => {
        setData(prev => {
            const current = prev.environment.availableItemIds;
            const exists = current.includes(itemId);
            return {
                ...prev,
                environment: {
                    ...prev.environment,
                    availableItemIds: exists ? current.filter(i => i !== itemId) : [...current, itemId]
                }
            };
        });
    };

    const handleAIGenerate = () => {
        setIsAiGenerating(true);
        setTimeout(() => {
            setIsAiGenerating(false);
            setAiPrompt("");
            setIsAIModalOpen(false);
            alert("AI 시나리오 생성이 완료되었습니다 (Demo)");
        }, 2000);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            <StudioHeader
                data={data}
                onOpenGeneralSettings={() => setIsEnvironmentModalOpen(true)} // Linking to Environment for now as requested
                setIsAIModalOpen={setIsAIModalOpen}
                handleSaveToLocalStorage={handleSaveToLocalStorage}
                isSaving={isSaving}
            />

            <RolesBar
                roles={data.roles}
                openAddModal={(type) => openAddModal(type as any)}
                deleteRole={(id) => setData(prev => ({ ...prev, roles: prev.roles.filter(r => r.id !== id) }))}
                setDefaultRole={setDefaultRole}
            />

            <EnvironmentBar
                environment={data.environment}
                openStorageConfig={(itemId) => setStorageConfigItemId(itemId)}
                onOpenMapSettings={() => setIsEnvironmentModalOpen(true)}
            />

            <div className="flex-1 flex overflow-hidden">
                <ScenarioBoard
                    states={data.states}
                    highlightedTargets={highlightedTargets}
                    updateStateTitle={updateStateTitle}
                    deleteState={deleteState}
                    getRole={getRole}
                    getAllEvents={getAllEvents}
                    editingEvent={editingEvent}
                    setEditingEvent={setEditingEvent}
                    editingTodo={editingTodo}
                    setEditingTodo={setEditingTodo}
                    setEditingDialogue={setEditingDialogue}
                    setHighlightedTargets={setHighlightedTargets}
                    deleteEvent={deleteEvent}
                    openAddModal={openAddModal}
                    addState={addState}
                    allStateOptions={allStateOptions}
                />

                {/* Side Panels */}
                {editingEvent && (
                    <EventSidePanel
                        editingEvent={editingEvent}
                        setEditingEvent={setEditingEvent}
                        updateEvent={updateEvent}
                        updateTodo={updateTodo}
                        deleteTodo={deleteTodo}
                        roles={data.roles}
                        allStateOptions={allStateOptions}
                        getAllEvents={getAllEvents}
                        deleteEvent={deleteEvent}
                    />
                )}

                {editingTodo && (
                    <TaskSidePanel
                        editingTodo={editingTodo}
                        setEditingTodo={setEditingTodo}
                        updateTodo={updateTodo}
                        updateEvent={updateEvent}
                        deleteTodo={deleteTodo}
                        allStateOptions={allStateOptions}
                    />
                )}

                {editingDialogue && (
                    <DialogueSidePanel
                        editingDialogue={editingDialogue}
                        setEditingDialogue={setEditingDialogue}
                        updateEvent={updateEvent}
                    />
                )}
            </div>

            {/* Modals */}
            <AddEventModal
                isOpen={isAddEventModalOpen}
                onClose={() => setIsAddEventModalOpen(false)}
                handleAddEvents={handleAddEvents} // Correct prop name
                roles={data.roles}
            />

            <AddRoleModal
                isOpen={isAddRoleModalOpen}
                onClose={() => setIsAddRoleModalOpen(false)}
                handleAddRoles={handleAddRoles} // Correct prop name
            />

            <AddTaskModal
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
                handleAddTaskSubmit={handleAddTasks}
            />

            <AIModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                prompt={aiPrompt}
                setPrompt={setAiPrompt}
                onGenerate={handleAIGenerate}
                isGenerating={isAiGenerating}
            />

            <EnvironmentModal
                isOpen={isEnvironmentModalOpen}
                onClose={() => setIsEnvironmentModalOpen(false)}
                data={data}
                updateEnvironment={updateEnvironment}
                toggleEnvItem={toggleEnvItem}
            />

            <StorageConfigModal
                configuringStorageId={storageConfigItemId}
                setConfiguringStorageId={setStorageConfigItemId}
                data={data}
                setData={setData}
                supplyDatabase={storageConfig.supplyDatabase}
                setSupplyDatabase={storageConfig.setSupplyDatabase}
                supplySearchTerm={storageConfig.supplySearchTerm}
                setSupplySearchTerm={storageConfig.setSupplySearchTerm}
                activeStorageSection={storageConfig.activeStorageSection}
                setActiveStorageSection={storageConfig.setActiveStorageSection}
                isCreatingSupply={storageConfig.isCreatingSupply}
                setIsCreatingSupply={storageConfig.setIsCreatingSupply}
                newSupplyItem={storageConfig.newSupplyItem}
                setNewSupplyItem={storageConfig.setNewSupplyItem}
                dragState={storageConfig.dragState}
                setDragState={storageConfig.setDragState}
                collisions={storageConfig.collisions}
                setCollisions={storageConfig.setCollisions}
                containerRef={storageConfig.containerRef}
            />
        </div>
    );
}
