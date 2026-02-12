import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Clock, Edit, Users, MapPin, BriefcaseMedical, Save, X, Monitor, Copy, Image as ImageIcon } from 'lucide-react';
import { classesData } from '../../data/classes';
import { scenarioDetails, ChecklistItem } from '../../data/scenarioDetails';
import { MAP_OPTIONS, ITEM_OPTIONS } from '../../data/studioPresets';
import { PageHeader, Button } from '@/components/shared/ui';
import { useAuth } from '../../contexts/AuthContext';
import { Scenario } from '../../types/admin';
import ScenarioChecklist from './ScenarioChecklist';
import { INITIAL_DATA } from '../../data/initialScenarioData';
import { useScenarioDetail } from '@/hooks/useScenario';
import { convertScenarioDetailDtoToScenario } from '@/utils/scenarioUtils';

interface ScenarioDetailProps {
    scenarioId?: string;
    hideBreadcrumbs?: boolean;
}

export default function ScenarioDetail({ scenarioId, hideBreadcrumbs = false }: ScenarioDetailProps): React.ReactElement {
    const { id: paramId } = useParams<{ id: string }>();
    const id = scenarioId || paramId;

    const location = useLocation();
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();

    // Real API만 사용
    const [dataSource] = useState<'mock' | 'real'>('real');

    // State for edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [scenarioData, setScenarioData] = useState<Scenario | null>(null);

    // 🌐 Real API 조회 (상세 조회는 바로 사용 가능)
    const scenarioIdNum = useMemo(() => {
        if (!id) return 0;
        const num = parseInt(id, 10);
        return isNaN(num) ? 0 : num;
    }, [id]);

    const {
        data: realApiData,
        isLoading: realLoading,
        error: realError,
    } = useScenarioDetail(scenarioIdNum, {
        enabled: scenarioIdNum > 0,
    });


    // Real API 데이터 처리 + scenarioDetails 병합 (체크리스트, 역할, 사용장비 등)
    useEffect(() => {
        if (realApiData) {
            const converted = convertScenarioDetailDtoToScenario(realApiData);
            const detail = (scenarioDetails as any)[realApiData.scenarioId] ?? (scenarioDetails as any)[String(realApiData.scenarioId)];
            const merged: Scenario = {
                ...converted,
                roles: detail?.roles ?? converted.roles,
                participatingRoles: detail?.participatingRoles ?? detail?.roles ?? converted.participatingRoles,
                availableItemIds: detail?.availableItemIds ?? converted.availableItemIds,
                checklist: detail?.checklist ?? converted.checklist,
                supportedDevices: (converted.supportedDevices?.length ? converted.supportedDevices : detail?.supportedDevices) ?? [],
                keyTasks: (converted.keyTasks?.length ? converted.keyTasks : detail?.keyTasks) ?? [],
                organization: detail?.organization ?? converted.organization,
                authors: detail?.authors ?? converted.authors,
            };
            setScenarioData(merged);
        }
    }, [realApiData]);

    // 목 데이터: API 404 시 목록에서 클릭한 ID가 서버에 없을 수 있으므로 로컬(classesData)에서 조회해 표시
    const mockScenarioById = useMemo((): Scenario | null => {
        if (!id && scenarioIdNum <= 0) return null;
        const seenIds = new Set<string | number>();
        for (const classItem of Object.values(classesData) as any[]) {
            for (const item of classItem.curriculum || []) {
                const itemId = item.id;
                if (seenIds.has(itemId)) continue;
                seenIds.add(itemId);
                if (Number(itemId) === scenarioIdNum || String(itemId) === id) {
                    const detail = (scenarioDetails as any)[itemId] ?? (scenarioDetails as any)[String(itemId)];
                    let platformStr = 'VR';
                    const p = item.platform;
                    if (p === 'mobile' || p === 'pc') platformStr = 'Mobile/PC';
                    const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0; return Math.abs(h); };
                    const itemHash = hash(String(itemId));
                    return {
                        id: item.id,
                        title: item.name || 'Untitled',
                        category: classItem.title,
                        platform: platformStr,
                        classId: classItem.id,
                        status: (detail?.status as any) ?? (item.isPublic === false ? 'inactive' : 'active'),
                        createdDate: detail?.createdDate ?? classItem.createdDate ?? '2024-01-01',
                        updatedDate: detail?.updatedDate ?? classItem.createdDate ?? '2024-01-01',
                        views: detail?.views ?? (itemHash % 1000),
                        userCount: detail?.userCount ?? (itemHash % 500),
                        simulationCount: detail?.simulationCount ?? (itemHash % 200),
                        requiredPremium: detail?.requiredPremium ?? false,
                        ContributedBy: detail?.ContributedBy ?? classItem.creatorId ?? 'Admin',
                        learningObjectives: detail?.learningObjectives ?? [],
                        duration: detail?.duration ?? item.duration ?? '0분',
                        supportedDevices: detail?.supportedDevices ?? [],
                        videoUrl: detail?.videoUrl ?? '',
                        handover: detail?.handover ?? '',
                        keyTasks: detail?.keyTasks ?? [],
                        simulationExamples: detail?.simulationExamples ?? [],
                        isPublic: detail?.isPublic ?? true,
                        version: detail?.version ?? '1.0.0',
                        averageDuration: detail?.averageDuration ?? item.duration,
                        averageScore: detail?.averageScore ?? 85,
                        patient: (detail && (detail as any).patient) ? (detail as any).patient : '정보 없음',
                        map: (detail && (detail as any).map) ? (detail as any).map : '정보 없음',
                        roles: (detail as any)?.roles,
                        participatingRoles: (detail as any)?.participatingRoles ?? (detail as any)?.roles,
                        availableItemIds: (detail as any)?.availableItemIds,
                        checklist: (detail as any)?.checklist,
                        organization: (detail as any)?.organization,
                        authors: (detail as any)?.authors,
                    } as Scenario;
                }
            }
        }
        return null;
    }, [id, scenarioIdNum]);

    // 404 폴백: 목 데이터가 있으면 scenarioData에 넣어서 편집 등이 동작하도록
    useEffect(() => {
        if (realError && mockScenarioById && !scenarioData) {
            setScenarioData(mockScenarioById);
        }
    }, [realError, mockScenarioById, scenarioData]);

    const isAdmin = location.pathname.startsWith('/admin');
    const isMaster = location.pathname.startsWith('/master');
    const isManagementView = isAdmin || isMaster;
    const basePath = isMaster ? '/master' : '/admin';

    // 표시할 데이터: API 성공 시 scenarioData, API 404지만 목 데이터 있으면 목 데이터
    const displayData = scenarioData ?? (realError && mockScenarioById ? mockScenarioById : null);

    // 로딩/에러/없음 순서로 처리
    if (realLoading) {
        return (
            <div className="p-8">
                <p className="text-gray-600">시나리오 정보를 불러오는 중...</p>
            </div>
        );
    }
    if (realError && !mockScenarioById) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">
                        시나리오 정보를 불러오는데 실패했습니다: {realError instanceof Error ? realError.message : '알 수 없는 오류'}
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                        페이지를 새로고침하거나 관리자에게 문의해주세요.
                    </p>
                </div>
            </div>
        );
    }
    if (!displayData) {
        return (
            <div className="p-8">
                <p className="text-gray-600">시나리오를 찾을 수 없습니다.</p>
                {scenarioIdNum > 0 && <p className="text-sm text-gray-500 mt-2">ID: {id}</p>}
            </div>
        );
    }

    const classData = (classesData as any)[displayData.classId];

    // Check edit permission
    // Check edit permission - Relaxed for testing
    // const isAuthor = user?.name === displayData.ContributedBy;
    const canEdit = hasRole('admin') || hasRole('master');

    // Handlers
    const handleSave = () => {
        // Here you would typically make an API call to save the data
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Re-load data to reset changes (simple way)
        window.location.reload();
    };

    const isMockFallback = Boolean(realError && mockScenarioById);

    const handleChecklistUpdate = (itemId: string, field: keyof ChecklistItem, value: any) => {
        if (!displayData.checklist) return;
        const updatedChecklist = displayData.checklist.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
        );
        setScenarioData({ ...displayData, checklist: updatedChecklist });
    };

    const handleKeyTasksChange = (text: string) => {
        const tasks = text.split('\n').filter(line => line.trim() !== '');
        setScenarioData({ ...displayData, keyTasks: tasks });
    };

    const breadcrumbs = isManagementView
        ? [
            { label: '시나리오 관리', to: `${basePath}/scenarios` },
            { label: displayData.title, active: true }
        ]
        : [
            { label: classData?.title || 'Class', to: `/ClassList?tab=${displayData.classId}` },
            { label: displayData.title, active: true }
        ];

    const roles = displayData.roles ?? displayData.participatingRoles ?? [];
    const checklistFromDetail = (scenarioDetails as any)[displayData.id] ?? (scenarioDetails as any)[String(displayData.id)];
    const effectiveChecklist = (displayData.checklist && displayData.checklist.length > 0)
        ? displayData.checklist
        : (checklistFromDetail?.checklist ?? []);
    const mapInfo = displayData.mapId
        ? MAP_OPTIONS.find(opt => opt.id === displayData.mapId)
        : MAP_OPTIONS.find(opt => opt.name === displayData.map);
    const displayMapName = mapInfo ? mapInfo.name : displayData.map ?? '';
    const equipmentNames = (displayData.availableItemIds ?? [])
        .map(itemId => ITEM_OPTIONS.find(opt => opt.id === itemId)?.name)
        .filter((name): name is string => Boolean(name));

    const relatedScenariosMock = [
        { id: '2', title: '활력징후 측정 (심화 - 응급 상황)', organization: '한국종합병원', authors: '김철수, 이영희', date: '2026-01-22', sourceType: 'customized' as const },
        { id: '3', title: '활력징후 측정 (소아 - 발열 환자)', organization: '서울어린이병원', authors: '박지민', date: '2026-01-26', sourceType: 'customized' as const },
    ];

    const pageBreadcrumbs = breadcrumbs.map(({ label, to }) => ({ label, link: to }));

    return (
        <div className="space-y-6 pb-20">
            {!hideBreadcrumbs && (
                <PageHeader
                    title={displayData.title}
                    breadcrumbs={pageBreadcrumbs}
                />
            )}

            {isMockFallback && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    서버에 해당 시나리오가 없어 로컬 데이터로 표시 중입니다. (ID: {id})
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                {/* 왼쪽: 메인 콘텐츠 */}
                <div className="space-y-6 min-w-0">
                    <div>
                        <div className="flex gap-2">
                            <span className="inline-flex px-2.5 py-1 rounded text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                {displayData.status === 'active' ? '활성' : displayData.status === 'draft' ? '작성중' : '비공개'}
                            </span>
                            <span className="inline-flex px-2.5 py-1 rounded text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                {displayData.isPublic ? 'PUBLIC' : 'PRIVATE'}
                            </span>
                        </div>
                    </div>

                    {/* 미디어 영역 - 항상 표시 */}
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-blue-50 border border-blue-100 flex items-center justify-center">
                        {displayData.thumbnail ? (
                            <img src={displayData.thumbnail} alt={displayData.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                                <ImageIcon size={48} className="mb-2" />
                                <span className="text-sm">이미지 없음</span>
                            </div>
                        )}
                    </div>

                    {/* 학습 목표 */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">학습 목표</h2>
                        <p className="text-gray-700 text-base leading-relaxed">
                            {(displayData.learningObjectives ?? []).length > 0
                                ? displayData.learningObjectives!.join(', ')
                                : '학습 목표가 없습니다.'}
                        </p>
                    </section>

                    {/* 인계 정보 */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">인계 정보</h2>
                        {isEditing ? (
                            <textarea
                                className="w-full h-32 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={displayData.handover}
                                onChange={(e) => setScenarioData({ ...displayData, handover: e.target.value })}
                            />
                        ) : (
                            <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                                {displayData.handover || '인계 정보가 없습니다.'}
                            </p>
                        )}
                    </section>

                    {/* 핵심 과제 */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">핵심 과제</h2>
                        {isEditing ? (
                            <textarea
                                className="w-full h-32 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={Array.isArray(displayData.keyTasks) ? displayData.keyTasks.join('\n') : (displayData.keyTasks ?? '')}
                                onChange={(e) => handleKeyTasksChange(e.target.value)}
                                placeholder="각 과제를 줄바꿈으로 구분하여 입력하세요."
                            />
                        ) : (
                            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-base">
                                {Array.isArray(displayData.keyTasks) && displayData.keyTasks.length > 0
                                    ? displayData.keyTasks.map((task, i) => <li key={i}>{task}</li>)
                                    : <li>등록된 핵심 과제가 없습니다.</li>}
                            </ul>
                        )}
                    </section>

                    {/* 체크리스트 */}
                    {effectiveChecklist.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">체크리스트</h2>
                            <ScenarioChecklist
                                items={effectiveChecklist}
                                states={INITIAL_DATA.states}
                                isEditing={isEditing}
                                onItemUpdate={handleChecklistUpdate}
                            />
                        </section>
                    )}
                </div>

                {/* 오른쪽: 사이드바 */}
                <aside className="lg:sticky lg:top-4 h-fit space-y-6">
                    {canEdit && (
                        <div className="flex justify-end">
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Button onClick={handleSave} size="sm" className="flex items-center gap-2">
                                        <Save size={14} />
                                        저장
                                    </Button>
                                    <Button variant="outline" onClick={handleCancel} size="sm" className="flex items-center gap-2">
                                        <X size={14} />
                                        취소
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                                    <Edit size={14} />
                                    정보 수정
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="rounded-lg border border-gray-200 p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <Clock size={18} className="text-gray-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-500">예상소요시간</p>
                                <p className="text-sm font-medium text-gray-900">{displayData.duration}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Monitor size={18} className="text-gray-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-500">지원장비</p>
                                <p className="text-sm font-medium text-gray-900">{(displayData.supportedDevices ?? []).join(', ') || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Users size={18} className="text-gray-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-500">참여 역할</p>
                                <p className="text-sm font-medium text-gray-900">{roles.length > 0 ? roles.join(', ') : '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-gray-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-500">배경</p>
                                <p className="text-sm font-medium text-gray-900">{displayMapName || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <BriefcaseMedical size={18} className="text-gray-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-500">사용 장비</p>
                                <p className="text-sm font-medium text-gray-900">{equipmentNames.length > 0 ? equipmentNames.join(', ') : '-'}</p>
                            </div>
                        </div>
                    </div>

                    {canEdit && isManagementView && (
                        <div className="flex gap-2">
                            <Button
                                variant="lightdark"
                                size="md"
                                className="w-full justify-center"
                                onClick={() => navigate(`/studio/edit${id ? `?scenarioId=${id}` : ''}`)}
                            >
                                <Edit size={16} className="mr-2" />
                                시나리오 편집
                            </Button>
                            <Button variant="outline" size="md" className="w-full justify-center">
                                <Copy size={16} className="mr-2" />
                                시나리오 복제
                            </Button>
                        </div>
                    )}

                    <div className="rounded-lg border border-gray-200 p-4 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-gray-900">{displayData.organization || 'Medicrew'}</p>
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                                {displayData.sourceType === 'customized' ? 'CUSTOMIZED' : 'ORIGINAL'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600">
                            저작자: {(displayData.authors && displayData.authors.length > 0)
                                ? displayData.authors.join(', ')
                                : (displayData.ContributedBy || 'Medicrew')}
                        </p>
                        <p className="text-xs text-gray-600">최근 업데이트: {displayData.updatedDate || displayData.createdDate || '-'}</p>
                        <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                            {displayData.licenseType || 'CC BY'} - 저작자를 표시하면 상업적 이용 및 수정이 모두 허용됩니다.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">관련 시나리오</h3>
                        <div className="space-y-3">
                            {relatedScenariosMock.map((rel) => (
                                <div
                                    key={rel.id}
                                    className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => navigate(`${basePath}/scenarios/${rel.id}`)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && navigate(`${basePath}/scenarios/${rel.id}`)}
                                >
                                    <div className="flex items-center">
                                        <p className="text-sm font-medium text-gray-900 truncate">{rel.title}</p>
                                    </div>
                                    <div className="flex items-center mt-1 mb-1">
                                        <p className="text-xs text-gray-500">{rel.organization} | {rel.authors}</p>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-2">
                                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                            {rel.sourceType === 'customized' ? 'CUSTOMIZED' : 'ORIGINAL'}
                                        </span>
                                        <span className="text-xs text-gray-400 shrink-0">{rel.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
