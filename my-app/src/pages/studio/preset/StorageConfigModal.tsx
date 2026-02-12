import React, { useRef, useState } from 'react';
import { Pill, Package, Stethoscope, Box, ChevronRight, ChevronLeft, LayoutGrid, RefreshCcw, Archive, X as XIcon, Tag, Ruler, Image as ImageIcon, Search, Plus, RotateCw } from 'lucide-react';
import { Modal } from '@/components/shared/ui';
import { Button } from '@/components/shared/ui';
import { ITEM_OPTIONS } from '../../../data/studioPresets';
import { ScenarioEnvironment, StorageItem, PlacedItem } from '../../../types';
import { v4 as uuidv4 } from 'uuid';
import { getRotatedDimensions, checkCollision } from '../../../utils/studioUtils';

interface StorageConfigModalProps {
    configuringStorageId: string | null;
    setConfiguringStorageId: (id: string | null) => void;
    data: { environment: ScenarioEnvironment };
    setData: React.Dispatch<React.SetStateAction<any>>;
    supplyDatabase: StorageItem[];
    setSupplyDatabase: React.Dispatch<React.SetStateAction<StorageItem[]>>;
    supplySearchTerm: string;
    setSupplySearchTerm: (term: string) => void;
    activeStorageSection: string | null;
    setActiveStorageSection: (id: string | null) => void;
    isCreatingSupply: boolean;
    setIsCreatingSupply: (isCreating: boolean) => void;
    newSupplyItem: Partial<StorageItem>;
    setNewSupplyItem: (item: Partial<StorageItem>) => void;
    dragState: { itemUid: string, offsetX: number, offsetY: number } | null;
    setDragState: (state: { itemUid: string, offsetX: number, offsetY: number } | null) => void;
    collisions: Set<string>;
    setCollisions: React.Dispatch<React.SetStateAction<Set<string>>>;
    containerRef: React.RefObject<HTMLDivElement>;
}

export const StorageConfigModal: React.FC<StorageConfigModalProps> = ({
    configuringStorageId,
    setConfiguringStorageId,
    data,
    setData,
    supplyDatabase,
    setSupplyDatabase,
    supplySearchTerm,
    setSupplySearchTerm,
    activeStorageSection,
    setActiveStorageSection,
    isCreatingSupply,
    setIsCreatingSupply,
    newSupplyItem,
    setNewSupplyItem,
    dragState,
    setDragState,
    collisions,
    setCollisions,
    containerRef
}) => {

    const [selectedListCategory, setSelectedListCategory] = useState<'medication' | 'supply' | 'equipment'>('medication');
    const [selectedListSubCategory, setSelectedListSubCategory] = useState<string>('all');

    const renderItemIcon = (category: string) => {
        switch (category) {
            case 'medication': return <Pill size={16} className="text-pink-600" />;
            case 'supply': return <Package size={16} className="text-blue-600" />;
            case 'equipment': return <Stethoscope size={16} className="text-slate-600" />;
            default: return <Box size={16} />;
        }


    };

    const handleSaveNewSupply = () => {
        if (!newSupplyItem.name) return;
        const newItem: StorageItem = {
            id: uuidv4(),
            name: newSupplyItem.name,
            category: newSupplyItem.category as any || 'supply',
            subCategory: newSupplyItem.subCategory,
            width: Number(newSupplyItem.width) || 50,
            height: Number(newSupplyItem.height) || 50,
            imageUrl: newSupplyItem.imageUrl,
            attributes: newSupplyItem.attributes
        };
        setSupplyDatabase(prev => [newItem, ...prev]);
        setIsCreatingSupply(false);
        setNewSupplyItem({ name: '', category: 'supply', subCategory: '', width: 50, height: 50, imageUrl: '', attributes: {} });
    };

    const CATEGORY_CONFIG: Record<string, { label: string; subCategories: { value: string; label: string; attrLabel: string; unit: string }[] }> = {
        medication: {
            label: '약품',
            subCategories: [
                { value: 'ampoule', label: '앰플', attrLabel: '용량', unit: 'cc' },
                { value: 'vial', label: '바이알', attrLabel: '용량', unit: 'ml' },
                { value: 'bag', label: '수액백', attrLabel: '용량', unit: 'ml' },
                { value: 'tablet', label: '알약', attrLabel: '함량', unit: 'mg' },
                { value: 'patch', label: '패치', attrLabel: '함량', unit: 'mg' },
                { value: 'spray', label: '스프레이', attrLabel: '횟수', unit: 'puff' },
                { value: 'other', label: '기타', attrLabel: '정보', unit: '' },
            ]
        },
        supply: {
            label: '물품',
            subCategories: [
                { value: 'syringe', label: '주사기', attrLabel: '용량', unit: 'cc' },
                { value: 'needle', label: '주사바늘', attrLabel: '규격', unit: 'G' },
                { value: 'catheter', label: '카테터', attrLabel: '크기', unit: 'Fr' },
                { value: 'tube', label: '튜브', attrLabel: '크기', unit: 'Fr' },
                { value: 'glove', label: '장갑', attrLabel: '사이즈', unit: '' },
                { value: 'gauze', label: '거즈', attrLabel: '규격', unit: 'cm' },
                { value: 'other', label: '기타', attrLabel: '정보', unit: '' },
            ]
        },
        equipment: {
            label: '장비',
            subCategories: [
                { value: 'device', label: '기기', attrLabel: '모델/정보', unit: '' },
                { value: 'monitor', label: '모니터', attrLabel: '크기', unit: '인치' },
                { value: 'other', label: '기타', attrLabel: '정보', unit: '' },
            ]
        }
    };

    const ensureSetsInitialized = (section: any) => {
        if (!section.sets || section.sets.length === 0) {
            return {
                ...section,
                sets: [{ id: 'default', name: '기본 세트', items: section.items || [] }],
                activeSetId: 'default',
                items: section.items || [] // Keep items for now as fallback
            };
        }
        if (!section.activeSetId) {
            return { ...section, activeSetId: section.sets[0].id };
        }
        return section;
    };

    const addSupplyToSection = (supply: StorageItem) => {
        if (!configuringStorageId || !activeStorageSection) return;
        setData((prev: any) => {
            const currentSetup = prev.environment.storageSetup[configuringStorageId] || [];
            const updatedSetup = currentSetup.map((section: any) => {
                if (section.id === activeStorageSection) {
                    const initializedSection = ensureSetsInitialized(section);
                    const updatedSets = initializedSection.sets.map((set: any) => {
                        if (set.id === initializedSection.activeSetId) {
                            const newItem: PlacedItem = { ...supply, uid: uuidv4(), x: 20, y: 20, rotation: 0 };
                            return { ...set, items: [newItem, ...set.items] };
                        }
                        return set;
                    });
                    return { ...initializedSection, sets: updatedSets };
                }
                return section;
            });
            return { ...prev, environment: { ...prev.environment, storageSetup: { ...prev.environment.storageSetup, [configuringStorageId]: updatedSetup } } };
        });
    };

    const removeSupplyFromSection = (sectionId: string, itemUid: string) => {
        if (!configuringStorageId) return;
        setData((prev: any) => {
            const currentSetup = prev.environment.storageSetup[configuringStorageId] || [];
            const updatedSetup = currentSetup.map((section: any) => {
                if (section.id === sectionId) {
                    const initializedSection = ensureSetsInitialized(section);
                    const updatedSets = initializedSection.sets.map((set: any) => {
                        if (set.id === initializedSection.activeSetId) {
                            return { ...set, items: set.items.filter((i: any) => i.uid !== itemUid) };
                        }
                        return set;
                    });
                    return { ...initializedSection, sets: updatedSets };
                }
                return section;
            });
            return { ...prev, environment: { ...prev.environment, storageSetup: { ...prev.environment.storageSetup, [configuringStorageId]: updatedSetup } } };
        });
    };

    const updatePlacedItem = (sectionId: string, itemUid: string, updates: Partial<PlacedItem>) => {
        if (!configuringStorageId) return;
        setData((prev: any) => {
            const currentSetup = prev.environment.storageSetup[configuringStorageId] || [];
            const updatedSetup = currentSetup.map((section: any) => {
                if (section.id === sectionId) {
                    const initializedSection = ensureSetsInitialized(section);
                    const updatedSets = initializedSection.sets.map((set: any) => {
                        if (set.id === initializedSection.activeSetId) {
                            return { ...set, items: set.items.map((item: any) => item.uid === itemUid ? { ...item, ...updates } : item) };
                        }
                        return set;
                    });
                    return { ...initializedSection, sets: updatedSets };
                }
                return section;
            });
            return { ...prev, environment: { ...prev.environment, storageSetup: { ...prev.environment.storageSetup, [configuringStorageId]: updatedSetup } } };
        });
    };

    const handleClearSection = () => {
        if (!configuringStorageId || !activeStorageSection) return;
        if (!window.confirm("현재 세트의 모든 아이템을 삭제하시겠습니까?")) return;
        setData((prev: any) => {
            const currentSetup = prev.environment.storageSetup[configuringStorageId] || [];
            const updatedSetup = currentSetup.map((section: any) => {
                if (section.id === activeStorageSection) {
                    const initializedSection = ensureSetsInitialized(section);
                    const updatedSets = initializedSection.sets.map((set: any) => {
                        if (set.id === initializedSection.activeSetId) {
                            return { ...set, items: [] };
                        }
                        return set;
                    });
                    return { ...initializedSection, sets: updatedSets };
                }
                return section;
            });
            return { ...prev, environment: { ...prev.environment, storageSetup: { ...prev.environment.storageSetup, [configuringStorageId]: updatedSetup } } };
        });
    };

    const createNewSet = (sectionId: string) => {
        if (!configuringStorageId) return;
        const setName = prompt("새 세트 이름을 입력하세요:", "새 세트");
        if (!setName) return;
        setData((prev: any) => {
            const currentSetup = prev.environment.storageSetup[configuringStorageId] || [];
            const updatedSetup = currentSetup.map((section: any) => {
                if (section.id === sectionId) {
                    const initializedSection = ensureSetsInitialized(section);
                    const newSet = { id: uuidv4(), name: setName, items: [] };
                    return { ...initializedSection, sets: [...initializedSection.sets, newSet], activeSetId: newSet.id };
                }
                return section;
            });
            return { ...prev, environment: { ...prev.environment, storageSetup: { ...prev.environment.storageSetup, [configuringStorageId]: updatedSetup } } };
        });
    };

    const setActiveSet = (sectionId: string, setId: string) => {
        if (!configuringStorageId) return;
        setData((prev: any) => {
            const currentSetup = prev.environment.storageSetup[configuringStorageId] || [];
            const updatedSetup = currentSetup.map((section: any) => {
                if (section.id === sectionId) {
                    const initializedSection = ensureSetsInitialized(section);
                    return { ...initializedSection, activeSetId: setId };
                }
                return section;
            });
            return { ...prev, environment: { ...prev.environment, storageSetup: { ...prev.environment.storageSetup, [configuringStorageId]: updatedSetup } } };
        });
    };

    const deleteSet = (sectionId: string, setId: string) => {
        if (!configuringStorageId) return;
        if (!window.confirm("이 세트를 삭제하시겠습니까?")) return;
        setData((prev: any) => {
            const currentSetup = prev.environment.storageSetup[configuringStorageId] || [];
            const updatedSetup = currentSetup.map((section: any) => {
                if (section.id === sectionId) {
                    const initializedSection = ensureSetsInitialized(section);
                    if (initializedSection.sets.length <= 1) {
                        alert("최소 하나의 세트는 유지해야 합니다.");
                        return initializedSection;
                    }
                    const updatedSets = initializedSection.sets.filter((s: any) => s.id !== setId);
                    const newActiveId = initializedSection.activeSetId === setId ? updatedSets[0].id : initializedSection.activeSetId;
                    return { ...initializedSection, sets: updatedSets, activeSetId: newActiveId };
                }
                return section;
            });
            return { ...prev, environment: { ...prev.environment, storageSetup: { ...prev.environment.storageSetup, [configuringStorageId]: updatedSetup } } };
        });
    };

    const handleMouseDown = (e: React.MouseEvent, item: PlacedItem) => {
        e.stopPropagation();
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const mouseXInContainer = e.clientX - containerRect.left;
        const mouseYInContainer = e.clientY - containerRect.top;
        setDragState({ itemUid: item.uid, offsetX: mouseXInContainer - item.x, offsetY: mouseYInContainer - item.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragState || !configuringStorageId || !activeStorageSection || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        let newX = e.clientX - containerRect.left - dragState.offsetX;
        let newY = e.clientY - containerRect.top - dragState.offsetY;
        newX = Math.round(newX / 10) * 10;
        newY = Math.round(newY / 10) * 10;
        newX = Math.max(0, Math.min(newX, containerRect.width - 20));
        newY = Math.max(0, Math.min(newY, containerRect.height - 20));
        const currentSection = data.environment.storageSetup[configuringStorageId]?.find(s => s.id === activeStorageSection);
        if (currentSection) {
            const movingItem = currentSection.items.find(i => i.uid === dragState.itemUid);
            if (movingItem) {
                const isColliding = checkCollision(dragState.itemUid, newX, newY, movingItem.width, movingItem.height, movingItem.rotation, currentSection.items);
                setCollisions(prev => {
                    const next = new Set(prev);
                    if (isColliding) next.add(dragState.itemUid);
                    else next.delete(dragState.itemUid);
                    return next;
                });
            }
        }
        updatePlacedItem(activeStorageSection, dragState.itemUid, { x: newX, y: newY });
    };

    const handleMouseUp = () => { setDragState(null); setCollisions(new Set()); };

    const updateSectionName = (newName: string) => {
        if (!configuringStorageId || !activeStorageSection) return;
        setData((prev: any) => {
            const currentSetup = prev.environment.storageSetup[configuringStorageId] || [];
            const updatedSetup = currentSetup.map((section: any) => {
                if (section.id === activeStorageSection) {
                    return { ...section, name: newName };
                }
                return section;
            });
            return { ...prev, environment: { ...prev.environment, storageSetup: { ...prev.environment.storageSetup, [configuringStorageId]: updatedSetup } } };
        });
    };

    return (
        <Modal isOpen={configuringStorageId !== null} onClose={() => setConfiguringStorageId(null)} title={`${ITEM_OPTIONS.find(i => i.id === configuringStorageId)?.name || 'Storage'} 설정`} maxWidth="max-w-[95vw]">
            <div className="flex h-[80vh] w-full space-x-4">
                <div className="w-52 flex flex-col border-r border-slate-200 pr-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">보관 구역</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                        {configuringStorageId && data.environment.storageSetup[configuringStorageId]?.map((section) => (
                            <div key={section.id} onClick={() => setActiveStorageSection(section.id)} className={`cursor-pointer rounded-lg p-3 transition-all border flex justify-between items-center group ${activeStorageSection === section.id ? 'bg-brand-50 border-brand-500 shadow-sm' : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50'}`}>
                                <div> <div className={`font-medium text-sm ${activeStorageSection === section.id ? 'text-brand-900' : 'text-slate-700'}`}>{section.name}</div> <div className="text-xs text-slate-400 mt-0.5">{section.items.length}개 아이템</div> </div>
                                {activeStorageSection === section.id && <ChevronRight size={16} className="text-brand-500" />}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 flex flex-col">
                    {/* Header Area */}
                    <div className="flex flex-col bg-white rounded-xl pb-2">
                        {/* Sets Bar */}
                        {activeStorageSection && (() => {
                            const section = data.environment.storageSetup[configuringStorageId!]?.find(s => s.id === activeStorageSection);
                            if (!section) return null;
                            const sets = section.sets || [{ id: 'default', name: '기본 세트' }];
                            const activeSetId = section.activeSetId || sets[0].id;

                            return (
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 px-1 border-b border-slate-100 mb-2">
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">세트구성</div>
                                    {sets.map((set: any) => (
                                        <div key={set.id} onClick={() => setActiveSet(activeStorageSection, set.id)} className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all border ${activeSetId === set.id ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                                            {set.name}
                                            {sets.length > 1 && (
                                                <button onClick={(e) => { e.stopPropagation(); deleteSet(activeStorageSection, set.id); }} className="ml-1.5 p-1 rounded-full hover:bg-blue-100 text-slate-400 hover:text-blue-500">
                                                    <XIcon size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => createNewSet(activeStorageSection)} className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 border border-slate-200 transition-colors" title="세트 추가">
                                        <Plus size={14} />
                                    </button>
                                </div>
                            );
                        })()}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                                {activeStorageSection ? (
                                    <input
                                        type="text"
                                        className="text-sm font-medium text-slate-800 w-60 bg-transparent border-none hover:ring-slate-200 hover:ring-1 focus:ring-slate-100 focus:ring-1 p-1 w-60 hover:bg-slate-100 rounded transition-colors focus:bg-slate-50"
                                        value={data.environment.storageSetup[configuringStorageId!]?.find(s => s.id === activeStorageSection)?.name || ''}
                                        onChange={(e) => updateSectionName(e.target.value)}
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-slate-800">구역 선택</span>
                                )}
                            </div>
                            {activeStorageSection && (<div className="flex items-center space-x-1 shrink-0"> <Button variant="secondary" size="sm" onClick={handleClearSection} title="현재 세트 초기화"><RefreshCcw size={14} className="mr-1.5" /> 초기화</Button> </div>)}
                        </div>
                    </div>
                    <div className="flex-1 relative overflow-hidden select-none bg-slate-100 border border-slate-200 rounded-xl shadow-inner" ref={containerRef} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                        {activeStorageSection ? (
                            <div className="absolute inset-0">
                                {(() => { const section = data.environment.storageSetup[configuringStorageId!]?.find(s => s.id === activeStorageSection); const bgUrl = section?.backgroundImageUrl; return bgUrl ? (<div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center"> <img src={bgUrl} className="w-full h-full object-contain opacity-90" alt="Shelf Background" /> <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} /> </div>) : (<div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '10px 10px' }} />); })()}
                                {(() => {
                                    const section = data.environment.storageSetup[configuringStorageId!]?.find(s => s.id === activeStorageSection);
                                    if (!section) return null;
                                    const activeSet = section.sets?.find((s: any) => s.id === section.activeSetId) || { items: section.items || [] };

                                    return activeSet.items?.map((item: any) => {
                                        const dim = getRotatedDimensions(item.width, item.height, item.rotation);
                                        const isColliding = collisions.has(item.uid);
                                        const isDragging = dragState?.itemUid === item.uid;
                                        return (<div key={item.uid} onMouseDown={(e) => handleMouseDown(e, item)} onDoubleClick={(e) => { e.stopPropagation(); updatePlacedItem(activeStorageSection, item.uid, { rotation: (item.rotation + 90) % 360 }); }} className={`absolute flex flex-col items-center justify-center rounded shadow-sm border transition-all cursor-move active:cursor-grabbing group ${isColliding ? 'bg-red-50/90 border-red-500 shadow-red-200 ring-2 ring-red-200 z-20' : 'bg-white/80 backdrop-blur-sm border-slate-300 hover:border-brand-500 hover:shadow-md hover:z-10'} ${isDragging ? 'shadow-lg scale-[1.02] z-30' : ''}`} style={{ left: item.x, top: item.y, width: `${dim.w}px`, height: `${dim.h}px` }}> {item.imageUrl ? (<img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1 pointer-events-none select-none" style={{ transform: item.rotation % 180 !== 0 ? 'rotate(-90deg)' : 'none' }} />) : (<div className="flex flex-col items-center justify-center w-full h-full p-1"> <div className="mb-0.5 pointer-events-none">{renderItemIcon(item.category)}</div> <span className="text-[9px] text-center font-medium leading-tight line-clamp-2 pointer-events-none text-slate-700 select-none">{item.name}</span> </div>)}
                                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-[2px] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 font-medium tracking-wide shadow-sm">{item.name}</div>
                                            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                                                <button onClick={(e) => { e.stopPropagation(); updatePlacedItem(activeStorageSection, item.uid, { rotation: (item.rotation + 90) % 360 }); }} className="pointer-events-auto bg-indigo-100 text-indigo-600 rounded-full p-1 border border-indigo-200 hover:bg-indigo-200 shadow-sm" title="회전"><RotateCw size={12} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); removeSupplyFromSection(activeStorageSection, item.uid); }} className="pointer-events-auto bg-red-100 text-red-600 rounded-full p-1 border border-red-200 hover:bg-red-200 shadow-sm" title="삭제"><XIcon size={12} /></button>
                                            </div>
                                        </div>)
                                    });
                                })()}
                            </div>
                        ) : (<div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400"> <Archive size={48} className="mb-3 opacity-20" /> <p className="text-sm">내용을 보려면 왼쪽에서 보관 구역을 선택하세요</p> </div>)}
                    </div>
                </div>
                <div className="w-64 flex flex-col border-l border-slate-100 pl-4 relative">
                    {isCreatingSupply ? (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-2 duration-200 overflow-hidden">
                            <div className="flex items-center mb-1 pb-2 shrink-0">
                                <button onClick={() => setIsCreatingSupply(false)} className="mr-2 text-slate-400 hover:text-slate-600 p-1 -ml-1 rounded-full hover:bg-slate-100">
                                    <ChevronLeft size={18} />
                                </button>
                                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">아이템 생성</h3>
                            </div>
                            <div className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
                                <div>
                                    <div className="grid grid-cols-1 gap-1 mb-2">
                                        {/* Category Selection Removed - Inherits from parent view */}
                                    </div>
                                    <select className="w-full p-2 border border-slate-300 rounded text-sm focus:border-brand-300 outline-none" value={newSupplyItem.subCategory || ''} onChange={(e) => setNewSupplyItem({ ...newSupplyItem, subCategory: e.target.value, attributes: {} })}>
                                        {CATEGORY_CONFIG[newSupplyItem.category || 'supply']?.subCategories.map(sub => (
                                            <option key={sub.value} value={sub.value}>{sub.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div> <input className="w-full p-2 border border-slate-300 rounded text-sm focus:border-brand-300 outline-none" placeholder="아이템 이름 입력" value={newSupplyItem.name || ''} onChange={(e) => setNewSupplyItem({ ...newSupplyItem, name: e.target.value })} autoFocus /> </div>
                                {(() => {
                                    const categoryConfig = CATEGORY_CONFIG[newSupplyItem.category || 'supply'];
                                    const subConfig = categoryConfig?.subCategories.find(s => s.value === newSupplyItem.subCategory) || categoryConfig?.subCategories[0];
                                    return (
                                        <div>
                                            <div className="relative">
                                                <input className="w-full p-2 border border-slate-300 rounded text-sm focus:border-brand-300 outline-none pr-8" placeholder={`${subConfig?.attrLabel || '속성'} 입력`} value={newSupplyItem.attributes?.value || ''} onChange={(e) => setNewSupplyItem({ ...newSupplyItem, attributes: { ...newSupplyItem.attributes, value: e.target.value } })} />
                                                {subConfig?.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium select-none">{subConfig.unit}</span>}
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div>
                                    <label className="flex items-center text-xs font-medium text-slate-500 mb-2"><ImageIcon size={12} className="mr-1" /> 이미지 선택</label>
                                    <div className="h-40 overflow-y-auto custom-scrollbar border border-slate-200 rounded p-1 mb-2">
                                        <div className="grid grid-cols-4 gap-2">
                                            {Array.from(new Set(supplyDatabase.map(i => i.imageUrl).filter(Boolean))).map((url, idx) => (
                                                <button key={idx} onClick={() => setNewSupplyItem({ ...newSupplyItem, imageUrl: url })} className={`aspect-square rounded border overflow-hidden relative ${newSupplyItem.imageUrl === url ? 'ring-2 ring-brand-500 border-brand-500' : 'border-slate-200 hover:border-slate-300'}`}>
                                                    <img src={url} className="w-full h-full object-contain p-1" alt="preset" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded flex flex-col items-center justify-center min-h-[100px]">
                                    <div className="border border-slate-300 bg-white shadow-sm flex items-center justify-center overflow-hidden relative" style={{ width: '100%', height: '160px' }}>
                                        {newSupplyItem.imageUrl ? (<img src={newSupplyItem.imageUrl} className="w-full h-full object-contain p-1" alt="Preview" onError={(e) => (e.currentTarget.style.display = 'none')} />) : (renderItemIcon(newSupplyItem.category || 'supply'))}
                                    </div>
                                </div>
                            </div>
                            <Button variant="primary" size="md" onClick={handleSaveNewSupply} className="w-full" disabled={!newSupplyItem.name}> 아이템 생성 </Button> </div>

                    ) : (
                        <>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">아이템 추가</h3>
                            {activeStorageSection ? (
                                <>
                                    {/* Category Tabs */}
                                    <div className="flex border-b border-slate-200 mb-2">
                                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                            <button
                                                key={key}
                                                onClick={() => { setSelectedListCategory(key as any); setSelectedListSubCategory('all'); }}
                                                className={`flex-1 pb-2 text-xs font-medium text-center transition-colors relative ${selectedListCategory === key ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {config.label}
                                                {selectedListCategory === key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full" />}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Sub Category Dropdown & Actions */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="relative flex-1">
                                            <select
                                                className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-brand-500 hover:border-slate-300 transition-colors appearance-none cursor-pointer"
                                                value={selectedListSubCategory}
                                                onChange={(e) => setSelectedListSubCategory(e.target.value)}
                                            >
                                                <option value="all">전체</option>
                                                {CATEGORY_CONFIG[selectedListCategory]?.subCategories.map((sub: any) => (
                                                    <option key={sub.value} value={sub.value}>{sub.label}</option>
                                                ))}
                                            </select>
                                            <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={14} />
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                setNewSupplyItem({
                                                    ...newSupplyItem,
                                                    category: selectedListCategory,
                                                    subCategory: selectedListSubCategory === 'all' ? CATEGORY_CONFIG[selectedListCategory].subCategories[0].value : selectedListSubCategory,
                                                    attributes: {}
                                                });
                                                setIsCreatingSupply(true);
                                            }}
                                            className="shrink-0 h-[28px] px-2 text-xs bg-brand-50 text-brand-600 border-brand-200 hover:bg-brand-100"
                                            title="맞춤 아이템 생성"
                                        >
                                            <Plus size={14} className="mr-1" /> 생성
                                        </Button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                                        {supplyDatabase
                                            .filter(i => i.category === selectedListCategory)
                                            .filter(i => selectedListSubCategory === 'all' || i.subCategory === selectedListSubCategory)
                                            .filter(i => i.name.toLowerCase().includes(supplySearchTerm.toLowerCase())).map(item => (
                                                <button key={item.id} onClick={() => addSupplyToSection(item)} className="w-full flex items-center p-2 rounded hover:bg-slate-50 text-left group border border-transparent hover:border-slate-200 transition-all">
                                                    <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-slate-100 rounded border border-slate-200 overflow-hidden">{item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : renderItemIcon(item.category)}</div>
                                                    <div className="ml-2 flex-1 min-w-0"> <div className="text-xs font-medium text-slate-700 truncate">{item.name}</div> <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">{item.width}x{item.height}px</div> </div>
                                                    <Plus size={14} className="text-slate-300 group-hover:text-brand-600 opacity-0 group-hover:opacity-100" />
                                                </button>
                                            ))}
                                        {supplyDatabase
                                            .filter(i => i.category === selectedListCategory)
                                            .filter(i => selectedListSubCategory === 'all' || i.subCategory === selectedListSubCategory)
                                            .filter(i => i.name.toLowerCase().includes(supplySearchTerm.toLowerCase())).length === 0 && (<div className="text-center text-xs text-slate-400 py-4">아이템이 없습니다.</div>)}
                                    </div>
                                </>
                            ) : (<div className="h-full flex items-center justify-center text-slate-300 text-sm italic p-4 text-center"> 아이템을 추가하려면 구역을 선택하세요 </div>)}
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};
