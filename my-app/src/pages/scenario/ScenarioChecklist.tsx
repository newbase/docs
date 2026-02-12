import React, { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/shared/ui';
import { ScenarioState } from '../../types/index';
// @ts-ignore
import { ChecklistItem } from '../../data/scenarioDetails';

interface ScenarioChecklistProps {
    items: ChecklistItem[];
    states?: ScenarioState[];
    isEditing?: boolean;
    showPerformance?: boolean;
    hideFilter?: boolean;
    onItemUpdate?: (id: string, field: keyof ChecklistItem, value: any) => void;
}

export default function ScenarioChecklist({ items, states = [], isEditing = false, showPerformance = false, hideFilter = false, onItemUpdate }: ScenarioChecklistProps) {
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const toggleExpand = (id: string) => {
        if (expandedItemId === id) {
            setExpandedItemId(null);
        } else {
            setExpandedItemId(id);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'To-do': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'Decision': return 'text-pink-600 bg-pink-50 border-pink-200';
            case 'Must-not': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatScore = (score: number) => (score >= 0 ? `+${score}` : String(score));

    const handlePrev = () => {
        if (activeIndex > 0) setActiveIndex(activeIndex - 1);
    };

    const handleNext = () => {
        if (activeIndex < filterOptions.length - 1) setActiveIndex(activeIndex + 1);
    };

    // Filter options for navigationbar
    const filterOptions = React.useMemo(() => {
        if (states && states.length > 0) {
            return [{ id: 'all', title: '전체' }, ...states.map(s => ({ id: s.id, title: s.title }))];
        }

        // Fallback: derive unique state IDs from items
        if (!items) return [{ id: 'all', title: '전체' }];

        const uniqueStateIds = Array.from(new Set(items.map(item => item.stateId).filter(id => id)));
        return [
            { id: 'all', title: '전체' },
            ...uniqueStateIds.map(id => ({ id: id as string, title: id as string }))
        ];
    }, [items, states]);

    const currentOption = filterOptions[activeIndex] || filterOptions[0];

    // Find the actual state object if selected
    const currentState = React.useMemo(() => {
        if (currentOption.id === 'all') return null;
        return states.find(s => s.id === currentOption.id) || null;
    }, [currentOption, states]);

    const renderRow = (item: ChecklistItem) => (
        <React.Fragment key={item.id}>
            <tr
                className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedItemId === item.id ? 'bg-gray-50' : ''}`}
                onClick={() => toggleExpand(item.id)}
            >
                <td className="px-4 py-3 text-center text-gray-500">{item.order}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{item.eventName}</td>
                <td className="hidden">{item.stateId}</td>
                <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className={`inline-block shrink-0 text-center px-2 py-1 rounded text-xs font-medium border ${getTypeColor(item.taskType)}`}>
                                {item.taskType}
                            </span>
                            <span className="text-gray-900 font-medium">{item.taskName}</span>
                        </div>
                        {item.description && (
                            <p className="text-sm text-gray-600 pl-0">{item.description}</p>
                        )}
                    </div>
                </td>
                <td className="px-4 py-3 text-center font-medium text-gray-900">
                    {isEditing && onItemUpdate ? (
                        <input
                            type="number"
                            value={item.score}
                            className="w-16 p-1 text-center border rounded border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onItemUpdate(item.id, 'score', Number(e.target.value))}
                        />
                    ) : (
                        formatScore(item.score ?? 0)
                    )}
                </td>
                {showPerformance && (
                    <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${item.score > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {item.score > 0 ? 'SUCCESS' : 'FAIL'}
                        </span>
                    </td>
                )}
                <td className="px-4 py-3 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-10 w-10 p-0 transition-transform ${expandedItemId === item.id ? 'bg-gray-200' : ''}`}
                    >
                        {expandedItemId === item.id ? (
                            <ChevronUp size={16} className="text-gray-600" />
                        ) : (
                            <ChevronDown size={16} className="text-gray-500 hover:text-indigo-600" />
                        )}
                    </Button>
                </td>
            </tr>
            {expandedItemId === item.id && (
                <tr className="bg-gray-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    <td colSpan={showPerformance ? 7 : 6} className="px-4 pb-2 pt-0 border-b border-gray-100">
                        <div className="ml-12 mr-4 bg-white p-4 rounded-lg shadow-sm mt-2">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 bg-indigo-50 rounded-full text-indigo-600">
                                    <MessageSquare size={16} />
                                </div>
                                <div className="flex-1">
                                    {isEditing && onItemUpdate ? (
                                        <textarea
                                            className="w-full p-2 text-base text-gray-700 border rounded border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            rows={3}
                                            value={item.feedback}
                                            onChange={(e) => onItemUpdate(item.id, 'feedback', e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <p className="text-gray-600 text-base leading-relaxed">
                                            {item.feedback}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );

    if (!items || items.length === 0) return null;

    return (
        <div className="w-full space-y-4">
            {/* Filter Navigation */}
            {!hideFilter && (
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrev}
                        disabled={activeIndex === 0}
                        className="flex items-center gap-1"
                    >
                        <ChevronLeft size={16} />
                        이전
                    </Button>

                    <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                            {currentOption.id === 'all' ? '필터' : '현재 스테이트'}
                        </span>
                        <span className="text-base font-bold text-gray-900">{currentOption.title}</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNext}
                        disabled={activeIndex === filterOptions.length - 1}
                        className="flex items-center gap-1"
                    >
                        다음
                        <ChevronRight size={16} />
                    </Button>
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-base text-left">
                    <thead className="text-sm text-gray-700 bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-center w-12">NO</th>
                            <th className="px-4 py-3 w-40">이벤트</th>
                            <th className="hidden">스테이트</th>
                            <th className="px-4 py-3 min-w-[280px]">태스크</th>
                            <th className="px-4 py-3 text-center w-24">획득 점수</th>
                            {showPerformance && <th className="px-4 py-3 text-center w-24">수행결과</th>}
                            <th className="px-4 py-3 text-center w-20">피드백</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {currentOption.id === 'all' ? (
                            // Flat list for "All" view
                            [...items].sort((a, b) => a.order - b.order).map((item) => renderRow(item))
                        ) : currentState ? (
                            // Event-centric view for specific state
                            currentState.events.map((event) => {
                                const eventItems = items.filter(item =>
                                    item.stateId === currentState.id &&
                                    item.eventName === event.title
                                ).sort((a, b) => a.order - b.order);

                                if (eventItems.length > 0) {
                                    return eventItems.map(item => renderRow(item));
                                } else {
                                    // Placeholder for empty event
                                    return (
                                        <tr key={`empty-${event.id}`} className="bg-gray-50/30">
                                            <td className="px-4 py-3 text-center text-gray-400 italic"> - </td>
                                            <td className="px-4 py-3 font-medium text-gray-500">{event.title}</td>
                                            <td className="hidden">{currentState.id}</td>
                                            <td colSpan={1} className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-block w-[72px] text-center px-2 py-1 rounded text-xs font-medium border shrink-0 text-gray-400 bg-gray-50 border-gray-200">
                                                        No Task
                                                    </span>
                                                    <span className="text-gray-400 italic font-medium">태스크가 없습니다.</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium text-gray-400">0</td>
                                            {showPerformance && <td className="px-4 py-3 text-center text-gray-400 italic">-</td>}
                                            <td className="px-4 py-3 text-center text-gray-400 italic">-</td>
                                        </tr>
                                    );
                                }
                            })
                        ) : (
                            <tr>
                                <td colSpan={showPerformance ? 7 : 6} className="px-4 py-12 text-center text-gray-500 bg-white">
                                    해당 스테이트에 등록된 체크리스트 항목이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
