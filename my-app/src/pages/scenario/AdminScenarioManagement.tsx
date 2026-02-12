import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
    FileText, PlayCircle, Users, Settings, Plus,
} from 'lucide-react';
import {
    PageHeader, StatsGrid, ListHeader, Pagination,
    FilterGroup, FilterSelect, SearchBar, DateRangeFilter,
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button
} from '@/components/shared/ui';
import AlertDialog from '@/components/shared/ui/AlertDialog';
import { Scenario } from '../../types/admin';
import ScenarioAddModal from './ScenarioAddModal';
import { ScenarioData } from '../../types';
import { INITIAL_DATA } from '../../data/initialScenarioData';
import { useScenarioListByUserId, scenarioKeys } from '@/hooks/useScenario';
import { convertScenarioListDtoToScenario } from '@/utils/scenarioUtils';
import { 
    createScenario,
    getScenarioCategoryList,
    getCharacterList,
    getScenarioTypeList,
    getDeviceTypeList,
    getMapItemList
} from '../../services/scenarioService';
import { uploadFileViaPresignedUrl } from '../../services/fileService';

export default function AdminScenarioManagement(): React.ReactElement {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const basePath = '/admin';

    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [filteredScenarios, setFilteredScenarios] = useState<Scenario[]>([]);

    // Alert 상태
    const [alertState, setAlertState] = useState({ isOpen: false, message: '' });
    const showAlert = (message: string) => {
        setAlertState({ isOpen: true, message });
    };
    const closeAlert = () => {
        setAlertState({ isOpen: false, message: '' });
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 20;

    // Filter states
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [platformFilter, setPlatformFilter] = useState<string>('all');
    
    // Date range: 디폴트로 오늘부터 6개월 전
    const getDefaultDateRange = () => {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        return {
            start: formatDate(sixMonthsAgo),
            end: formatDate(today)
        };
    };
    const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>(getDefaultDateRange());
    // 날짜 범위 유효성: start > end 이면 true (UI 안내용)
    const dateRangeInvalid = Boolean(
        dateRange.start && dateRange.end && dateRange.start > dateRange.end
    );

    // 🌐 Real API 조회 - 본인이 생성한 시나리오만 조회 (백엔드 제약)
    // ⚠️ GET /scenario/admin/list 엔드포인트가 존재하지 않아 GET /scenario/list 사용
    const {
        data: apiData,
        isLoading,
        error,
    } = useScenarioListByUserId(
        {
            page: currentPage,
            pageSize: itemsPerPage,
        }
    );

    // 클라이언트 사이드 필터링: API 유무와 관계없이 항상 적용 (날짜/검색/필터)
    useEffect(() => {
        let result = scenarios;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.title.toLowerCase().includes(query) ||
                s.category?.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(s => s.status === statusFilter);
        }

        if (categoryFilter !== 'all') {
            result = result.filter(s => s.category === categoryFilter);
        }

        if (platformFilter !== 'all') {
            result = result.filter(s => s.platform === platformFilter);
        }

        // 날짜 범위 필터: start/end 모두 있고 start ≤ end 일 때만 적용 (엄격)
        if (dateRange.start && dateRange.end) {
            const startStr = dateRange.start;
            const endStr = dateRange.end;
            if (startStr <= endStr) {
                result = result.filter(s => {
                    const itemDateStr = (s.createdDate || '').split('T')[0];
                    if (!itemDateStr) return false;
                    return itemDateStr >= startStr && itemDateStr <= endStr;
                });
            }
            // start > end 이면 날짜 필터 미적용 (아래 dateRangeInvalid 메시지로 안내)
        }

        // 등록일 기준 내림차순 정렬 (최신순)
        result.sort((a, b) => {
            const dateA = new Date(a.createdDate).getTime();
            const dateB = new Date(b.createdDate).getTime();
            return dateB - dateA;
        });

        setFilteredScenarios(result);
    }, [scenarios, searchQuery, statusFilter, categoryFilter, platformFilter, dateRange]);

    // 필터 변경 시에만 1페이지로 리셋 (apiData 변경 시에는 리셋하지 않음 → 페이지 이동 유지)
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, categoryFilter, platformFilter, dateRange.start, dateRange.end]);

    // Modal state
    const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
    const [newScenarioData, setNewScenarioData] = useState<ScenarioData>(() => ({
        ...INITIAL_DATA,
        metadata: {
            title: '',
            handover: '',
            mission: ''
        }
    }));

    // Real API 데이터 처리
    // ⚠️ 주의: GET /scenario/list는 본인이 생성한 시나리오만 반환
    // 목록은 서버 데이터만 표시 (빈 응답/실패 시 목 데이터 넣지 않음 → 클릭 시 404 방지)
    useEffect(() => {
        if (apiData) {
            if (apiData.scenarioList && apiData.scenarioList.length > 0) {
                const convertedScenarios = apiData.scenarioList.map(convertScenarioListDtoToScenario);
                const sortedScenarios = convertedScenarios.sort((a, b) => {
                    const dateA = new Date(a.createdDate).getTime();
                    const dateB = new Date(b.createdDate).getTime();
                    return dateB - dateA;
                });
                setScenarios(sortedScenarios);
            } else {
                setScenarios([]);
            }
        } else if (error && !isLoading) {
            setScenarios([]);
        } else {
            setScenarios([]);
        }
    }, [apiData, error, isLoading]);

    // Derived Stats (클라이언트 사이드 계산)
    // ⚠️ API 응답에 stats가 없으므로 로컬 scenarios 데이터로 계산
    const stats = useMemo(() => {
        if (scenarios.length > 0) {
            const activeCount = scenarios.filter(s => s.status === 'active').length;
            const inactiveCount = scenarios.filter(s => s.status === 'inactive').length;
            const totalViews = scenarios.reduce((acc, curr) => acc + (curr.views || 0), 0);

            return [
                {
                    id: 'totalScenarios',
                    label: '총 시나리오 수',
                    value: (apiData?.totalCount || scenarios.length).toLocaleString(),
                    sub: '개',
                    icon: FileText,
                    color: "brand",
                    isActive: false,
                    onClick: () => { }
                },
                {
                    id: 'activeScenarios',
                    label: '활성 시나리오 수',
                    value: activeCount.toLocaleString(),
                    sub: '개',
                    icon: PlayCircle,
                    color: "brand",
                    isActive: false,
                    onClick: () => { }
                },
                {
                    id: 'inactiveScenarios',
                    label: '비활성 시나리오 수',
                    value: inactiveCount.toLocaleString(),
                    sub: '개',
                    icon: Users,
                    color: "brand",
                    isActive: false,
                    onClick: () => { }
                },
                {
                    id: 'totalCount',
                    label: '전체 조회 수',
                    value: totalViews.toLocaleString(),
                    sub: '개',
                    icon: Settings,
                    color: "brand",
                    isActive: false,
                    onClick: () => { }
                }
            ];
        }

        // 데이터 없을 때 기본값
        return [
            {
                id: 'totalScenarios',
                label: '총 시나리오 수',
                value: '0',
                sub: '개',
                icon: FileText,
                color: "brand",
                isActive: false,
                onClick: () => { }
            },
            {
                id: 'activeScenarios',
                label: '활성 시나리오 수',
                value: '0',
                sub: '개',
                icon: PlayCircle,
                color: "brand",
                isActive: false,
                onClick: () => { }
            },
            {
                id: 'inactiveScenarios',
                label: '비활성 시나리오 수',
                value: '0',
                sub: '개',
                icon: Users,
                color: "brand",
                isActive: false,
                onClick: () => { }
            },
            {
                id: 'totalCount',
                label: '전체 조회 수',
                value: '0',
                sub: '개',
                icon: Settings,
                color: "brand",
                isActive: false,
                onClick: () => { }
            }
        ];
    }, [scenarios, apiData]);

    // Pagination: API 사용 시 서버가 현재 페이지만 반환 → 해당 페이지를 필터링한 filteredScenarios 사용
    const hasApiData = apiData && apiData.scenarioList && apiData.scenarioList.length > 0;
    const scenarioTotalCount = hasApiData ? (apiData?.totalCount ?? 0) : filteredScenarios.length;

    const { totalPages, paginatedItems } = useMemo(() => {
        const total = scenarioTotalCount;
        const pages = Math.max(1, Math.ceil(total / itemsPerPage));
        // API 사용 시: 현재 페이지 데이터를 날짜/검색/필터 적용한 filteredScenarios로 표시
        const items = hasApiData
            ? filteredScenarios
            : filteredScenarios.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
            );
        return { totalPages: pages, paginatedItems: items };
    }, [hasApiData, scenarioTotalCount, filteredScenarios, currentPage, itemsPerPage]);

    // Filter Options
    const categoryOptions = [
        { value: 'all', label: '전체 카테고리' },
        { value: 'Essential Skills', label: 'Essential Skills' },
        { value: 'Disease Care', label: 'Disease Care' },
        { value: 'Diagnosis', label: 'Diagnosis' },
        { value: 'Procedure', label: 'Procedure' }
    ];

    const platformOptions = [
        { value: 'all', label: '전체 플랫폼' },
        { value: 'VR', label: 'VR' },
        { value: 'Mobile/PC', label: 'Mobile/PC' }
    ];

    const statusOptions = [
        { value: 'all', label: '전체 상태' },
        { value: 'active', label: '발행완료' },
        { value: 'inactive', label: '비공개' },
        { value: 'draft', label: '작성중' }
    ];

    const formatPlatform = (platformString: any) => {
        return platformString;
    };

    const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
        if (status === 'active') return 'default';
        if (status === 'draft') return 'secondary';
        return 'destructive';
    };

    const handleOpenScenarioModal = () => {
        setNewScenarioData({
            ...INITIAL_DATA,
            metadata: {
                title: '',
                handover: '',
                mission: ''
            }
        });
        setIsScenarioModalOpen(true);
    };

    const handleCloseScenarioModal = () => {
        setIsScenarioModalOpen(false);
    };

    const handleUpdateMetadata = (field: keyof ScenarioData['metadata'], value: string) => {
        setNewScenarioData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                [field]: value
            }
        }));
    };

    // 시나리오 추가: POST /scenario(createScenario) 연동됨. 보조 API(카테고리/캐릭터 등) 응답 구조에 따라 실패 시 위 파싱 수정.
    const handleSaveScenario = async (saveData: {
        scenarioId: string;
        thumbnail: string | null;
        thumbnailFile: File | null;
        category: string;
        platform: string;
        metadata: ScenarioData['metadata'];
    }) => {
        try {
            // 필수 필드 검증
            if (!saveData.metadata.title?.trim()) {
                showAlert('시나리오 제목을 입력해주세요.');
                return;
            }

            // 백엔드에서 유효한 값들 조회 (apiClient는 body 직접 반환 → .data 래핑 없을 수 있음)
            const [categoryList, characterList, scenarioTypeList, deviceTypeList, mapItemList] = await Promise.all([
                getScenarioCategoryList(),
                getCharacterList('PATIENT'),
                getScenarioTypeList(),
                getDeviceTypeList(),
                getMapItemList()
            ]);

            const catList = (categoryList as any)?.scenarioCategoryList ?? (categoryList as any)?.data?.scenarioCategoryList;
            const typeList = (scenarioTypeList as any)?.scenarioTypeList ?? (scenarioTypeList as any)?.data?.scenarioTypeList;
            const itemList = (mapItemList as any)?.itemList ?? (mapItemList as any)?.data?.itemList;
            const devList = (deviceTypeList as any)?.deviceTypeList ?? (deviceTypeList as any)?.data?.deviceTypeList;
            const charList = (characterList as any)?.characterList ?? (characterList as any)?.data?.characterList;

            // 백엔드가 number 타입을 기대하므로 엄격하게 숫자로 변환 (API가 string 반환 시 400 방지)
            const categoryIds = (catList?.map((c: any) => Number(c.scenarioCategoryId ?? c.id)) ?? []).filter((id: number) => !Number.isNaN(id));
            const scenarioTypeId = Number(typeList?.[0]?.scenarioTypeId ?? typeList?.[0]?.id ?? 1);
            const mapItemId = Number(itemList?.[0]?.itemId ?? itemList?.[0]?.id ?? 1);
            const deviceTypeIds = (devList?.map((d: any) => Number(d.deviceTypeId ?? d.id)) ?? []).filter((id: number) => !Number.isNaN(id));
            const characterId = Number(charList?.[0]?.characterId ?? charList?.[0]?.id ?? 1);
            const characterName = charList?.[0]?.name ?? '환자';

            // 유효한 값이 없으면 에러
            if (categoryIds.length === 0) {
                showAlert('시나리오 카테고리를 불러올 수 없습니다.');
                return;
            }
            if (deviceTypeIds.length === 0) {
                showAlert('장치 타입을 불러올 수 없습니다.');
                return;
            }
            if (!typeList?.length) {
                showAlert('시나리오 타입을 불러올 수 없습니다.');
                return;
            }
            if (!itemList?.length) {
                showAlert('맵 아이템을 불러올 수 없습니다.');
                return;
            }
            if (!charList?.length) {
                showAlert('캐릭터(환자) 목록을 불러올 수 없습니다.');
                return;
            }
            if (Number.isNaN(scenarioTypeId) || Number.isNaN(mapItemId) || Number.isNaN(characterId)) {
                showAlert('시나리오 타입/맵/캐릭터 ID가 유효하지 않습니다.');
                return;
            }

            // 썸네일 파일 업로드 처리
            let thumbnailImageUrl = saveData.thumbnail?.trim() || 'https://example.com/thumbnail.png';
            
            if (saveData.thumbnailFile) {
                try {
                    // 엄격하게: POST /file/presigned-url → S3 직접 업로드
                    thumbnailImageUrl = await uploadFileViaPresignedUrl(saveData.thumbnailFile);
                } catch (error) {
                    console.error('썸네일 업로드 실패:', error);
                    // API 미구현(404) 등 실패 시 기본 URL로 진행
                    thumbnailImageUrl = thumbnailImageUrl || 'https://example.com/thumbnail.png';
                    showAlert('썸네일 이미지 업로드에 실패했습니다.\n기본 이미지로 진행합니다.');
                }
            }

            // 백엔드 스펙: Swagger CreateScenarioRequestDto 기준 최소 필드만 전송 (미정의 필드 추가 시 400 가능)
            const requestData = {
                scenarioCategoryIdList: categoryIds.slice(0, 2),
                version: "0.1",
                scenarioTypeId,
                mapItemId,
                difficulty: 1,
                title: saveData.metadata.title.trim(),
                handoverNote: saveData.metadata.handover?.trim() || '',
                thumbnailImageUrl,
                expectedPlayTimeSeconds: 900,
                deviceTypeIdList: deviceTypeIds.slice(0, 2),
                learningObjectiveList: saveData.metadata.mission?.trim() ? [{
                    order: 1,
                    title: saveData.metadata.mission.trim()
                }] : [{
                    order: 1,
                    title: "기본 학습 목표"
                }],
                patient: {
                    characterId,
                    name: characterName
                },
            };

            // API 호출
            await createScenario(requestData);

            showAlert('시나리오가 저장되었습니다.');
            setIsScenarioModalOpen(false);
            // 목록 갱신: 쿼리 무효화로 useScenarioListByUserId 재조회 (SPA 유지)
            queryClient.invalidateQueries({ queryKey: scenarioKeys.lists() });
        } catch (error: any) {
            console.error('시나리오 저장 실패:', error);
            console.error('에러 상세:', error.response?.data || error.message);
            showAlert(error.message || '시나리오 저장에 실패했습니다.\n다시 시도해주세요.');
        }
    };

    return (
        <>
            <PageHeader
                title="시나리오 관리"
                breadcrumbs={[
                    { label: '시나리오 관리' }
                ]}
                actions={
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-4">
                            <DateRangeFilter
                                startDate={dateRange.start || ''}
                                endDate={dateRange.end || ''}
                                onStartDateChange={(val) => setDateRange(prev => ({ ...prev, start: val }))}
                                onEndDateChange={(val) => setDateRange(prev => ({ ...prev, end: val }))}
                            />
                            <Button 
                                onClick={handleOpenScenarioModal}
                                variant="lightdark"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                기존 시나리오 추가
                            </Button>
                        </div>
                        {dateRangeInvalid && (
                            <p className="text-sm text-amber-600" role="alert">
                                종료일은 시작일 이후로 선택해주세요. 날짜 필터가 적용되지 않습니다.
                            </p>
                        )}
                    </div>
                }
            />

            {/* 로딩 상태 */}
            {isLoading && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">시나리오 목록을 불러오는 중...</p>
                </div>
            )}

            {/* Stats Section */}
            <div className="mb-6">
                <StatsGrid items={stats} />
            </div>

            {/* List Header & Filters */}
            <ListHeader
                totalCount={scenarioTotalCount}
                rightContent={
                    <FilterGroup>
                        <FilterSelect
                            options={categoryOptions}
                            value={categoryFilter}
                            onValueChange={(val) => setCategoryFilter(val)}
                        />
                        <FilterSelect
                            options={platformOptions}
                            value={platformFilter}
                            onValueChange={(val) => setPlatformFilter(val)}
                        />
                        <FilterSelect
                            options={statusOptions}
                            value={statusFilter}
                            onValueChange={(val) => setStatusFilter(val)}
                        />
                        <SearchBar
                            placeholder="시나리오 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </FilterGroup>
                }
            />

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[60px]">No.</TableHead>
                            <TableHead>카테고리</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead>플랫폼</TableHead>
                            <TableHead className="text-right">환자수</TableHead>
                            <TableHead className="text-right">시뮬레이션</TableHead>
                            <TableHead className="text-center">상태</TableHead>
                            <TableHead>등록일</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedItems.map((item, index) => {
                            // 전체 건수 기준 역순 번호: 1페이지 40→21, 2페이지 20→1 (users와 동일)
                            const globalIndex = (currentPage - 1) * itemsPerPage + index;
                            const rowNo = scenarioTotalCount - globalIndex;
                            return (
                                <TableRow key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer text-base">
                                    <TableCell>{rowNo}</TableCell>
                                    <TableCell>
                                        <span className="text-gray-900">{item.category}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div
                                            className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                                            onClick={() => navigate(`${basePath}/scenarios/${item.id}`)}
                                        >
                                            {item.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {formatPlatform(item.platform)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.userCount?.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.simulationCount?.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusVariant(item.status)}>
                                            {item.status === 'active' ? '발행완료' : item.status === 'draft' ? '작성중' : '비공개'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{item.createdDate}</TableCell>
                                </TableRow>
                            );
                        })}
                        {paginatedItems.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                                    데이터가 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={scenarioTotalCount}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                />
            )}

            {/* Scenario Add Modal */}
            <ScenarioAddModal
                isOpen={isScenarioModalOpen}
                onClose={handleCloseScenarioModal}
                onSave={handleSaveScenario}
                data={newScenarioData}
                updateMetadata={handleUpdateMetadata}
                showAlert={showAlert}
            />

            {/* Alert Dialog */}
            <AlertDialog
                isOpen={alertState.isOpen}
                onClose={closeAlert}
                message={alertState.message}
            />
        </>
    );
}
