import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, PlayCircle, Clock, Settings, Plus,
} from 'lucide-react';
import {
    PageHeader, StatsGrid, ListHeader, Pagination, Button,
    FilterGroup, FilterSelect, SearchBar, DateRangeFilter,
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge
} from '@/components/shared/ui';
import { useAuth } from '@/contexts/AuthContext';
import { hasStudioAccess } from '@/utils/roleUtils';
import { classesData } from '../../data/classes';
import { Scenario } from '../../types/admin';
import { scenarioDetails } from '../../data/scenarioDetails';

export default function MasterScenarioManagement(): React.ReactElement {
    const navigate = useNavigate();
    const { getCurrentRole, getCurrentLicense } = useAuth();
    const basePath = '/master';
    const canCreateScenario = hasStudioAccess(getCurrentRole() as 'guest' | 'student' | 'master' | 'admin', getCurrentLicense() as 'pro' | 'pro_class' | 'basic_personal' | 'basic_class' | 'pro_univ_student' | 'pro_univ_master');

    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [filteredScenarios, setFilteredScenarios] = useState<Scenario[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // Filter states
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [platformFilter, setPlatformFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

    // Load data
    useEffect(() => {
        const scenarioList: Scenario[] = Object.values(classesData).flatMap((classItem: any) =>
            classItem.curriculum.map((item: any) => {
                // Determine platform string from possible array or string and normalize for Admin filters
                let platformStr = 'All';
                const p = item.platform;

                if (p === 'vr' || p === 'hmd') {
                    platformStr = 'VR';
                } else if (p === 'mobile' || p === 'pc') {
                    platformStr = 'Mobile/PC';
                } else if (p === 'both') {
                    platformStr = 'VR, Mobile/PC';
                } else if (Array.isArray(p)) {
                    platformStr = p.join(', ');
                } else if (typeof p === 'string') {
                    platformStr = p;
                }

                if (platformStr.includes('VR')) platformStr = 'VR';
                else if (platformStr.includes('Mobile')) platformStr = 'Mobile/PC';

                const detail = (scenarioDetails as any)[item.id] || (scenarioDetails as any)[String(item.id)];

                // Map to Scenario interface
                return {
                    id: item.id,
                    title: item.name || 'Untitled',
                    category: classItem.title,
                    platform: platformStr,
                    classId: classItem.id,
                    status: (detail?.status as any) || (item.isPublic === false ? 'inactive' : 'active'),
                    createdDate: detail?.createdDate || classItem.createdDate || '2024-01-01',
                    updatedDate: detail?.updatedDate || classItem.createdDate || '2024-01-01',
                    views: detail?.views ?? Math.floor(Math.random() * 1000),
                    userCount: detail?.userCount ?? Math.floor(Math.random() * 500),
                    simulationCount: detail?.simulationCount ?? Math.floor(Math.random() * 200),
                    requiredPremium: detail?.requiredPremium ?? false,
                    ContributedBy: detail?.ContributedBy || classItem.creatorId || 'Admin',
                    learningObjectives: detail?.learningObjectives || [],
                    duration: detail?.duration || item.duration || '0분',
                    supportedDevices: detail?.supportedDevices || [],
                    videoUrl: detail?.videoUrl || '',
                    handover: detail?.handover || '',
                    keyTasks: detail?.keyTasks || [],
                    simulationExamples: detail?.simulationExamples || [],
                    isPublic: detail?.isPublic ?? true,
                    version: detail?.version || '1.0.0',
                    averageDuration: detail?.averageDuration || item.duration,
                    averageScore: detail?.averageScore ?? 85,
                    patient: detail?.patient || '정보 없음',
                    map: detail?.map || '정보 없음'
                } as Scenario;
            })
        );
        setScenarios(scenarioList);
    }, []);

    // Derived Stats
    const stats = useMemo(() => {
        // 총 시뮬레이션 시간 계산 (duration 파싱)
        const calculateTotalSimulationTime = (): string => {
            let totalMinutes = 0;
            scenarios.forEach(scenario => {
                const duration = scenario.duration || '0분';
                // "10분", "5분 30초", "1시간 30분" 등의 형식 파싱
                const minuteMatch = duration.match(/(\d+)분/);
                const hourMatch = duration.match(/(\d+)시간/);
                const secondMatch = duration.match(/(\d+)초/);
                
                if (hourMatch) {
                    totalMinutes += parseInt(hourMatch[1]) * 60;
                }
                if (minuteMatch) {
                    totalMinutes += parseInt(minuteMatch[1]);
                }
                if (secondMatch && !minuteMatch && !hourMatch) {
                    totalMinutes += Math.ceil(parseInt(secondMatch[1]) / 60);
                }
            });
            
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            
            if (hours > 0) {
                return `${hours}시간 ${minutes}분`;
            }
            return `${minutes}분`;
        };

        // 커스텀 시나리오 수 (소속기관에서 편집한 시나리오 수 - authorType이 'institution'인 것들)
        const customScenariosCount = Object.values(classesData).reduce((count, classItem) => {
            const institutionScenarios = classItem.curriculum.filter((item: any) => 
                item.authorType === 'institution'
            );
            return count + institutionScenarios.length;
        }, 0);

        return [
            {
                id: 'totalScenarios',
                label: '총 시나리오 수',
                value: scenarios.length.toLocaleString(),
                sub: '개',
                icon: FileText,
                color: "brand",
                isActive: false,
                onClick: () => { }
            },
            {
                id: 'totalSimulations',
                label: '총 시뮬레이션 수',
                value: scenarios.reduce((acc, curr) => acc + (curr.simulationCount || 0), 0).toLocaleString(),
                sub: '회',
                icon: PlayCircle,
                color: "brand",
                isActive: false,
                onClick: () => { }
            },
            {
                id: 'totalSimulationTime',
                label: '총 시뮬레이션 시간',
                value: calculateTotalSimulationTime(),
                sub: '',
                icon: Clock,
                color: "brand",
                isActive: false,
                onClick: () => { }
            },
            {
                id: 'customScenarios',
                label: '커스텀 시나리오 수',
                value: customScenariosCount.toLocaleString(),
                sub: '개',
                icon: Settings,
                color: "brand",
                isActive: false,
                onClick: () => { }
            }
        ];
    }, [scenarios]);

    // Filtering Logic
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

        if (dateRange.start && dateRange.end) {
            result = result.filter(s => {
                const date = new Date(s.createdDate);
                return dateRange.start && dateRange.end && date >= new Date(dateRange.start) && date <= new Date(dateRange.end);
            });
        }

        setFilteredScenarios(result);
        setCurrentPage(1);
    }, [scenarios, searchQuery, statusFilter, categoryFilter, platformFilter, dateRange]);

    // Pagination
    const totalPages = Math.ceil(filteredScenarios.length / itemsPerPage);
    const paginatedItems = filteredScenarios.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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

    return (
        <>
            <PageHeader
                title="시나리오 관리"
                breadcrumbs={[
                    { label: '시나리오 관리' }
                ]}
                actions={
                    <div className="flex items-center gap-3">
                        {canCreateScenario && (
                            <Button
                                variant="lightdark"
                                size="md"
                                onClick={() => navigate('/studio/edit')}
                            >
                                <Plus size={16} className="mr-2" />
                                시나리오 생성
                            </Button>
                        )}
                        <DateRangeFilter
                            startDate={dateRange.start || ''}
                            endDate={dateRange.end || ''}
                            onStartDateChange={(val) => setDateRange(prev => ({ ...prev, start: val }))}
                            onEndDateChange={(val) => setDateRange(prev => ({ ...prev, end: val }))}
                        />
                    </div>
                }
            />

            {/* Stats Section */}
            <div className="mb-6">
                <StatsGrid items={stats} />
            </div>

            {/* List Header & Filters */}
            <ListHeader
                totalCount={filteredScenarios.length}
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
                            <TableHead className="w-[60px]">ID</TableHead>
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
                        {paginatedItems.map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer text-base">
                                <TableCell>{item.id}</TableCell>
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
                        ))}
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

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredScenarios.length}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
            />
        </>
    );
}
