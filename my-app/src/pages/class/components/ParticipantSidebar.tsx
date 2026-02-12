import React from 'react';
import { User } from 'lucide-react';

interface Participant {
    id: string;
    name: string;
    department: string;
}

interface ParticipantSidebarProps {
    participants: Participant[];
    selectedParticipantId: string;
    onSelect: (id: string) => void;
}

export const ParticipantSidebar: React.FC<ParticipantSidebarProps> = ({
    participants,
    selectedParticipantId,
    onSelect
}) => {
    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
            <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">참가자</h3>
                <span className="text-sm font-medium text-blue-500">
                    Total <b>{participants.length}</b>
                </span>
            </div>

            <div className="flex-1">
                <div className="divide-y divide-gray-100">
                    {participants.map((p) => {
                        const isSelected = selectedParticipantId === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => onSelect(p.id)}
                                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors relative group ${isSelected ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
                            >
                                {isSelected && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                                )}
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                            {p.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-500 font-medium">{p.id}</span>
                                            <span className="text-xs text-gray-500">•</span>
                                            <span className="text-xs text-gray-500">{p.department}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
