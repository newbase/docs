import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, GripVertical, Video, BookOpen, Play, GraduationCap, Pencil, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Checkbox } from '@/components/shared/ui';
import AddVideoModal from './AddVideoModal';
import { scenarioDetails, ScenarioDetail } from '../../data/scenarioDetails';
import { ClassItem } from '../../data/classes';
import { CurriculumItem, VideoLecture } from '../../types/curriculum';
import type { ScenarioPlatform } from '../../types/admin';

/** 플랫폼 표시용 정규화: "VR, Mobile/PC" 등 복합값을 VR | Mobile | PC 중 하나로 변환 */
function normalizePlatformDisplay(platform: string | undefined): ScenarioPlatform {
    if (!platform) return 'VR';
    const p = platform.trim();
    if (p === 'VR' || p === 'Mobile' || p === 'PC') return p;
    if (p.startsWith('VR') || p.includes('VR,')) return 'VR';
    if (p.startsWith('Mobile') || p === 'Mobile/PC') return 'Mobile';
    if (p.startsWith('PC')) return 'PC';
    return 'VR';
}

interface CurriculumSetupProps {
    items: CurriculumItem[];
    onItemsChange: (items: CurriculumItem[]) => void;
    error?: string;
    /** 구매한 프로덕트 목록 (카드 클릭 시 해당 프로덕트 커리큘럼 불러옴) */
    purchasedProducts?: ClassItem[];
    /** true면 편집 완료/초기화 버튼 숨김, 항상 편집 UI(시나리오·동영상 추가) 표시 */
    hideEditCompleteAndReset?: boolean;
    /** 클래스 생성 시 위저드에서 이미 프로덕트를 선택한 경우. 설정되면 프로덕트 선택 목록 대신 커리큘럼만 표시 */
    initialSelectedProductId?: string | null;
}

export default function CurriculumSetup({
    items,
    onItemsChange,
    error,
    purchasedProducts = [],
    hideEditCompleteAndReset = false,
    initialSelectedProductId = null
}: CurriculumSetupProps): React.ReactElement {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    /** 프로덕트 선택 전: 프로덕트 선택 섹션만 표시. 선택 후: 커리큘럼 조회/편집 */
    const [selectedProductId, setSelectedProductId] = useState<string | null>(initialSelectedProductId ?? null);
    /** 커리큘럼 편집 모드: false = 조회(읽기 전용), true = 편집(동영상 추가, 시나리오 추가, 순서 변경). hideEditCompleteAndReset면 항상 true */
    const [isEditMode, setIsEditMode] = useState(false);
    const effectiveEditMode = hideEditCompleteAndReset || isEditMode;
    /** 세션 선택 체크박스: 선택된 세션 ID 목록 */
    const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
    /** 세션 클릭 시 아래줄에 시나리오 소개/동영상 설명 표시 */
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

    useEffect(() => {
        if (initialSelectedProductId != null) {
            setSelectedProductId(initialSelectedProductId);
        }
    }, [initialSelectedProductId]);

    /** 이미 프로덕트가 선택된 상태(위저드 등)면 프로덕트 선택 목록 숨기고 커리큘럼만 표시 */
    const showProductSelection = purchasedProducts.length > 0 && selectedProductId === null && initialSelectedProductId == null;

    const itemIdsKey = useMemo(() => (items?.length ? [...items].map((i) => i.id).sort().join(',') : ''), [items]);
    useEffect(() => {
        if (items?.length) {
            setSelectedSessionIds(new Set(items.map((i) => i.id)));
        } else {
            setSelectedSessionIds(new Set());
        }
    }, [itemIdsKey]);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination || !items) return;

        const newItems = Array.from(items);
        const [reorderedItem] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, reorderedItem);

        onItemsChange(newItems);
    };

    const handleAddVideo = (video: VideoLecture) => {
        if (!video) return;
        const newItem: CurriculumItem = {
            id: video.id,
            type: 'video',
            data: video
        };
        onItemsChange([...(items || []), newItem]);
    };

    /** 프로덕트 커리큘럼을 폼용 CurriculumItem[]로 변환 */
    const mapProductCurriculumToItems = (product: ClassItem): CurriculumItem[] => {
        const rawCurriculum = product.curriculum || [];
        return rawCurriculum.map((entry) => {
            const itemId = `product-${product.id}-${entry.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            if (entry.type === 'video') {
                return {
                    id: itemId,
                    type: 'video',
                    data: {
                        id: String(entry.id),
                        title: entry.name,
                        url: (entry as { url?: string }).url || '',
                        duration: entry.duration,
                        author: {
                            name: entry.author || 'Unknown',
                            type: entry.authorType || 'individual'
                        },
                        description: ''
                    } as VideoLecture
                };
            }
            const detail = scenarioDetails[entry.id];
            return {
                id: itemId,
                type: 'scenario',
                data: (detail || {
                    id: entry.id,
                    title: entry.name,
                    duration: entry.duration,
                    platform: entry.platform,
                    ContributedBy: entry.author || 'Medicrew'
                }) as ScenarioDetail
            };
        });
    };

    const handleLoadProductCurriculum = (product: ClassItem) => {
        const mapped = mapProductCurriculumToItems(product);
        const existingScenarioIds = (items || [])
            .filter((i) => i?.type === 'scenario')
            .map((i) => (i?.data as ScenarioDetail)?.id);
        const existingVideoIds = (items || [])
            .filter((i) => i?.type === 'video')
            .map((i) => (i?.data as VideoLecture)?.id);
        const unique = mapped.filter((item) => {
            if (item.type === 'scenario') {
                return !existingScenarioIds.includes((item.data as ScenarioDetail)?.id);
            }
            return !existingVideoIds.includes((item.data as VideoLecture)?.id);
        });
        onItemsChange([...(items || []), ...unique]);
        setSelectedProductId(product.id);
    };

    const calculateTotalDuration = (): string => {
        const totalMinutes = (items || []).reduce((sum, item) => {
            const durationStr = item?.data?.duration || '0분';
            const match = durationStr.match(/(\d+)/);
            return sum + (match ? parseInt(match[1]) : 0);
        }, 0);

        if (totalMinutes === 0) return '0분';

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0 && minutes > 0) {
            return `${hours}시간 ${minutes}분`;
        } else if (hours > 0) {
            return `${hours}시간`;
        } else {
            return `${minutes}분`;
        }
    };

    return (
        <div>
            {/* 프로덕트 선택 이전: 섹션명 "프로덕트 선택", 프로덕트 카드 목록만 표시 */}
            {showProductSelection && (
                <>
                    <h3 className="text-sm font-medium text-gray-600 py-2">프로덕트 선택</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {purchasedProducts.map((product) => (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => handleLoadProductCurriculum(product)}
                                className="flex flex-col rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            >
                                <div className="aspect-video w-full rounded-md bg-gray-100 overflow-hidden mb-2">
                                    {product.thumbnail ? (
                                        <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <GraduationCap size={28} />
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-900 line-clamp-2">{product.title}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* 프로덕트 선택 후: 커리큘럼 조회(읽기) 또는 커리큘럼 편집 */}
            {!showProductSelection && (
                <>
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-4">
                            <h3 className="text-sm font-medium text-gray-600">
                                커리큘럼
                            </h3>
                            <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
                                <span>Total: <span className="text-brand-600">{(items?.length) || 0}</span></span>
                                <span className="text-gray-400">|</span>
                                <span>총 소요시간: <span className="text-brand-600">{calculateTotalDuration()}</span></span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {effectiveEditMode && (
                                <Button variant="outline" size="sm" onClick={() => setIsVideoModalOpen(true)}>
                                    <Plus size={16} className="mr-1" />
                                    동영상 추가
                                </Button>
                            )}
                            {!hideEditCompleteAndReset && (
                                <>
                                    {isEditMode ? (
                                        <Button variant="lightdark" size="sm" onClick={() => setIsEditMode(false)}>
                                            <Check size={16} className="mr-1" />
                                            편집 완료
                                        </Button>
                                    ) : (
                                        <Button variant="lightdark" size="sm" onClick={() => setIsEditMode(true)}>
                                            <Pencil size={16} className="mr-1" />
                                            편집
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedProductId(null);
                                            onItemsChange([]);
                                        }}
                                    >
                                        초기화
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 mb-4">{error}</p>
                    )}

                    {effectiveEditMode ? (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="curriculum">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-1"
                                    >
                                        {(items || []).map((item, index) => (
                                            <Draggable
                                                key={item.id}
                                                draggableId={item.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`bg-white border border-gray-200 rounded-lg p-2.5 transition-shadow ${snapshot.isDragging ? 'shadow-md ring-1 ring-blue-100' : 'hover:shadow-md'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {/* 세션 선택 체크박스 */}
                                                            <Checkbox
                                                                checked={selectedSessionIds.has(item.id)}
                                                                onCheckedChange={(checked) => {
                                                                    setSelectedSessionIds((prev) => {
                                                                        const next = new Set(prev);
                                                                        if (checked) next.add(item.id);
                                                                        else next.delete(item.id);
                                                                        return next;
                                                                    });
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="flex-shrink-0"
                                                            />
                                                            {/* Drag Handle */}
                                                            <div
                                                                {...provided.dragHandleProps}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                                            >
                                                                <GripVertical size={16} />
                                                            </div>

                                                            {/* Order Number */}
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-brand-600 flex items-center justify-center font-semibold text-xs">
                                                                {index + 1}
                                                            </div>

                                                            {/* Item Info - 세션 클릭 시 아래줄에 시나리오 소개/동영상 설명 표시 */}
                                                            <button
                                                                type="button"
                                                                onClick={() => setExpandedSessionId((prev) => (prev === item.id ? null : item.id))}
                                                                className="flex-1 min-w-0 text-left rounded focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                                            >
                                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                                    {/* Title and Badge - 플랫폼 배지를 세션명 앞에 표시 */}
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <span className={`flex-shrink-0 w-14 text-xs text-center rounded-md font-medium py-0.5 ${item.type === 'scenario' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-600'}`}>
                                                                            {item.type === 'scenario'
                                                                                ? normalizePlatformDisplay((item.data as ScenarioDetail).platform)
                                                                                : 'Video'}
                                                                        </span>
                                                                        <h4 className="text-sm font-semibold text-gray-800 truncate">
                                                                            {item.data.title}
                                                                        </h4>
                                                                    </div>

                                                                    {/* Metadata - Right Aligned */}
                                                                    <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
                                                                        {/* 저작자 */}
                                                                        <div className="flex items-center justify-end">
                                                                            <span className="w-max-60 text-xs text-right text-gray-700 font-medium">{item.type === 'scenario' ? (
                                                                                (item.data as ScenarioDetail).ContributedBy
                                                                            ) : (
                                                                                (item.data as VideoLecture).author.name
                                                                            )}</span>
                                                                        </div>
                                                                        {/* 소요시간 */}
                                                                        <div className="flex items-center justify-end">
                                                                            <span className="w-10 text-xs text-left text-brand-600 font-medium">{item.data.duration}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                            {/* Chevron - 맨 우측 */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); setExpandedSessionId((prev) => (prev === item.id ? null : item.id)); }}
                                                                className="flex-shrink-0 p-1 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                                            >
                                                                {expandedSessionId === item.id ? (
                                                                    <ChevronUp size={16} />
                                                                ) : (
                                                                    <ChevronDown size={16} />
                                                                )}
                                                            </button>
                                                        </div>
                                                        {/* 세션 클릭 시 아래줄: 시나리오 소개 / 동영상 설명 */}
                                                        {expandedSessionId === item.id && (
                                                            <div className="mt-3 px-8 py-2 border-t border-gray-100">
                                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                                    {item.type === 'scenario'
                                                                        ? (item.data as ScenarioDetail).handover || (item.data as ScenarioDetail).title || '소개 정보가 없습니다.'
                                                                        : (item.data as VideoLecture).description || (item.data as VideoLecture).title || '설명이 없습니다.'}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    ) : (
                        <div className="space-y-1">
                            {(items || []).map((item, index) => (
                                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-2.5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-semibold text-xs">
                                            {index + 1}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setExpandedSessionId((prev) => (prev === item.id ? null : item.id))}
                                            className="flex-1 min-w-0 text-left rounded focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className={`flex-shrink-0 w-14 text-xs text-center rounded-md font-medium py-0.5 ${item.type === 'scenario' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-600'}`}>
                                                        {item.type === 'scenario'
                                                            ? normalizePlatformDisplay((item.data as ScenarioDetail).platform)
                                                            : 'Video'}
                                                    </span>
                                                    <h4 className="text-sm font-semibold text-gray-800 truncate">{item.data.title}</h4>
                                                </div>
                                                <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
                                                    <span className="w-max-60 text-xs text-right text-gray-700 font-medium">
                                                        {item.type === 'scenario' ? (item.data as ScenarioDetail).ContributedBy : (item.data as VideoLecture).author.name}
                                                    </span>
                                                    <span className="w-10 text-xs text-left text-brand-600 font-medium">{item.data.duration}</span>
                                                </div>
                                            </div>
                                        </button>
                                        {/* Chevron - 맨 우측 */}
                                        <button
                                            type="button"
                                            onClick={() => setExpandedSessionId((prev) => (prev === item.id ? null : item.id))}
                                            className="flex-shrink-0 p-1 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                        >
                                            {expandedSessionId === item.id ? (
                                                <ChevronUp size={16} />
                                            ) : (
                                                <ChevronDown size={16} />
                                            )}
                                        </button>
                                    </div>
                                    {/* 세션 클릭 시 아래줄: 시나리오 소개 / 동영상 설명 */}
                                    {expandedSessionId === item.id && (
                                        <div className="mt-3 px-9 py-2 border-t border-gray-100">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                {item.type === 'scenario'
                                                    ? (item.data as ScenarioDetail).handover || (item.data as ScenarioDetail).title || '소개 정보가 없습니다.'
                                                    : (item.data as VideoLecture).description || (item.data as VideoLecture).title || '설명이 없습니다.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {effectiveEditMode && (
                        <p className="text-sm text-gray-500 mt-4">
                            💡 세션 선택, 동영상 추가, 드래그로 순서 변경이 가능합니다.
                        </p>
                    )}
                </>
            )}

            <AddVideoModal
                isOpen={isVideoModalOpen}
                onClose={() => setIsVideoModalOpen(false)}
                onAdd={handleAddVideo}
            />
        </div>
    );
}
