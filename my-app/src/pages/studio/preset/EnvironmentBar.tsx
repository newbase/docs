import React from 'react';
import { Map as MapIcon } from 'lucide-react';
import { MAP_OPTIONS, ITEM_OPTIONS } from '../../../data/studioPresets';
import { ScenarioData } from '../../../types';

interface EnvironmentBarProps {
    environment: ScenarioData['environment'];
    openStorageConfig: (itemId: string) => void;
    onOpenMapSettings: () => void;
}

export const EnvironmentBar: React.FC<EnvironmentBarProps> = ({ environment, openStorageConfig, onOpenMapSettings }) => {
    const currentMap = MAP_OPTIONS.find(m => m.id === environment.mapId);
    const activeItems = ITEM_OPTIONS.filter(i => environment.availableItemIds.includes(i.id));

    return (
        <div className="flex-none bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center text-slate-600">
                <MapIcon size={14} className="mr-2 text-brand-600" /> <span className="mr-2">환경:</span>
                <button onClick={onOpenMapSettings} className="bg-white px-2 py-1.5 rounded border border-slate-200 text-slate-800 flex items-center hover:border-brand-500 hover:text-brand-600 transition-colors cursor-pointer"> {currentMap?.icon && <span className="mr-1.5 text-brand-500 scale-90">{currentMap.icon}</span>} {currentMap?.name || '맵 선택'} </button>
            </div>
            <div className="flex items-center space-x-1">
                <span className="mr-2">사용 가능한 장비:</span>
                <div className="flex items-center space-x-1">
                    {activeItems.length > 0 ? activeItems.map(item => {
                        const isStorage = (item as any).isStorage;
                        return (
                            <div key={item.id} onClick={() => isStorage && openStorageConfig(item.id)} className={`flex items-center px-2 py-1.5 bg-white border border-slate-200 rounded text-xs transition-all group relative ${isStorage ? 'cursor-pointer hover:border-brand-500 hover:bg-brand-50 ring-1 ring-transparent hover:ring-brand-100' : 'text-slate-500'}`} title={isStorage ? `${item.name} 설정` : item.name}>
                                {item.icon && (<span className={`mr-1.5 transition-colors ${isStorage ? 'group-hover:text-brand-600 text-slate-400' : 'text-slate-300'}`}> {item.icon} </span>)}
                                <span className={`${isStorage ? 'font-semibold text-slate-700 group-hover:text-brand-700' : 'text-slate-600'}`}> {item.name} </span>
                                {isStorage && (<div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50"> 아이템 배치 설정 <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" /> </div>)}
                            </div>
                        );
                    }) : <span className="text-xs text-slate-400 italic">선택된 장비 없음</span>}
                </div>
            </div>
        </div>
    );
};
