import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CurriculumSidebarProps {
    classId: string;
    curriculum: any[];
    activeSessionId: string | null;
    basePath: string;
    isManagerPath: boolean;
}

export default function CurriculumSidebar({
    classId,
    curriculum,
    activeSessionId,
    basePath,
    isManagerPath
}: CurriculumSidebarProps): React.ReactElement {
    const navigate = useNavigate();

    const handleSessionClick = (item: any) => {
        const sessionPath = isManagerPath
            ? `${basePath}/class-management/${classId}/curriculum/${item.id}`
            : `/class/${classId}/curriculum/${item.id}`;
        navigate(sessionPath);
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
            {/* List Header */}
            <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">커리큘럼</h3>
                <span className="text-sm font-medium text-blue-500">
                    Total <b>{curriculum.length}</b>
                </span>
            </div>

            {/* List */}
            <div className="flex-1">
                <div className="divide-y divide-gray-100">
                    {curriculum.map((item: any, index: number) => {
                        const isActive = activeSessionId === item.id.toString();
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleSessionClick(item)}
                                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors relative group ${isActive ? 'bg-blue-50 hover:bg-blue-50' : ''
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                                )}
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                                        <span className={`inline-block w-12 text-center text-xs font-medium px-1.5 py-0.5 rounded border ${item.type === 'video'
                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                            {item.type === 'video' ? 'Video' : 'Sim'}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-medium line-clamp-2 ${isActive ? 'text-blue-700' : 'text-gray-700'
                                            }`}>
                                            {item.name}
                                        </h4>
                                        <span className="text-xs text-gray-500">{item.duration}</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
