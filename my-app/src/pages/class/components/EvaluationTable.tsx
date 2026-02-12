import React from 'react';
import { MessageSquare, ChevronUp, ChevronDown, CheckCircle } from 'lucide-react';
import { ChecklistItem, EvaluationType } from '../../../types/admin';

interface EvaluationTableProps {
    title: string;
    type: EvaluationType;
    items: ChecklistItem[];
    expandedFeedback: Set<string>;
    onToggleFeedback: (id: string) => void;
}

export const EvaluationTable: React.FC<EvaluationTableProps> = ({
    title,
    type,
    items,
    expandedFeedback,
    onToggleFeedback
}) => {
    if (items.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <CheckCircle size={20} className="text-blue-600" />
                    </div>
                    {title}
                </h3>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white">
                <table className="w-full text-base text-left border-collapse">
                    <thead className="text-sm text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 w-16 text-center">NO</th>
                            {type === 'performance' && (
                                <>
                                    <th className="px-4 py-3 w-40">이벤트</th>
                                    <th className="px-4 py-3 w-64">태스크</th>
                                    <th className="px-4 py-3">내용</th>
                                </>
                            )}
                            {type === 'assessment' && (
                                <>
                                    <th className="px-4 py-3 w-40">평가 항목</th>
                                    <th className="px-4 py-3">내용</th>
                                    <th className="px-4 py-3 w-24 text-center">정답</th>
                                    <th className="px-4 py-3 w-24 text-center">선택</th>
                                </>
                            )}
                            {type === 'equipment' && (
                                <>
                                    <th className="px-4 py-3 w-48">도구 명칭</th>
                                    <th className="px-4 py-3">분류/상태</th>
                                    <th className="px-4 py-3 w-28 text-center">필수 여부</th>
                                </>
                            )}
                            {type === 'procedure' && (
                                <>
                                    <th className="px-4 py-3 w-56">절차명</th>
                                    <th className="px-4 py-3">수행지침</th>
                                </>
                            )}
                            <th className="px-4 py-3 w-28 text-center border-l border-gray-100 bg-gray-50/30">획득 점수</th>
                            <th className="px-4 py-3 w-20 text-center">수행결과</th>
                            <th className="px-4 py-3 w-20 text-center">피드백</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.map((item, idx) => (
                            <React.Fragment key={item.id}>
                                <tr className={`hover:bg-gray-50 transition-colors cursor-pointer break-inside-avoid ${expandedFeedback.has(item.id) ? 'bg-gray-50' : ''}`}
                                    onClick={() => onToggleFeedback(item.id)}>
                                    <td className="px-4 py-3 text-center text-gray-500 font-medium">{idx + 1}</td>

                                    {type === 'performance' && (
                                        <>
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.eventName}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={`inline-block w-20 text-center px-2 py-0.5 rounded text-sm font-medium border shrink-0 ${item.taskType === 'Must-not' ? 'text-red-600 bg-red-50 border-red-200' :
                                                        item.taskType === 'Decision' ? 'text-purple-600 bg-purple-50 border-purple-200' :
                                                            'text-blue-600 bg-blue-50 border-blue-200'
                                                        }`}>
                                                        {item.taskType}
                                                    </span>
                                                    <span className="font-medium text-gray-900">{item.taskName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 leading-relaxed">{item.description}</td>
                                        </>
                                    )}

                                    {type === 'assessment' && (
                                        <>
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.taskName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{item.description}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-semibold text-blue-600 bg-blue-50 px-1 py-0.5 rounded text-sm border border-blue-100 inline-block min-w-[80px]">
                                                    {item.correctValue || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-gray-700 font-semibold bg-gray-50 px-1 py-0.5 rounded-lg border border-gray-100 inline-block min-w-[80px]">
                                                    {item.value || '-'}
                                                </span>
                                            </td>
                                        </>
                                    )}

                                    {type === 'equipment' && (
                                        <>
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.taskName}</td>
                                            <td className="px-4 py-3">
                                                <div className="text-gray-700 font-semibold">{item.value || '-'}</div>
                                                <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-[10px] font-semibold px-2 py-1 rounded bg-orange-50 text-orange-600 border border-orange-200 uppercase">Required</span>
                                            </td>
                                        </>
                                    )}

                                    {type === 'procedure' && (
                                        <>
                                            <td className="px-4 py-3 font-medium text-gray-900 text-sm">{item.taskName}</td>
                                            <td className="px-4 py-3 text-gray-600 font-normal leading-relaxed">{item.description}</td>
                                        </>
                                    )}

                                    <td className="px-4 py-3 text-center font-semibold border-l border-gray-100 bg-gray-50/10">
                                        <span className={`text-sm ${item.score < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                            {item.score > 0 ? `+${item.score}` : item.score}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block w-20 py-1 rounded text-xs font-semibold ${item.status === 'success' ? 'bg-green-100 text-green-700' :
                                            item.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {item.status === 'success' ? 'SUCCESS' :
                                                item.status === 'partial' ? 'PARTIAL' : 'FAIL'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className={`h-10 w-10 p-0 inline-flex items-center justify-center rounded-md transition-all ${expandedFeedback.has(item.id) ? 'bg-gray-200' : ''}`}>
                                            {expandedFeedback.has(item.id) ? (
                                                <ChevronUp size={16} className="text-gray-600" />
                                            ) : (
                                                <ChevronDown size={16} className="text-gray-500" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {expandedFeedback.has(item.id) && (
                                    <tr className="bg-gray-50 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <td colSpan={10} className="px-4 pb-2 pt-0 border-b border-gray-100">
                                            <div className="ml-12 mr-4 bg-white p-4 rounded-lg shadow-sm mt-2">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 p-1.5 bg-indigo-50 rounded-full text-indigo-600">
                                                        <MessageSquare size={16} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-gray-600 text-sm leading-relaxed">
                                                            {item.feedback}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
