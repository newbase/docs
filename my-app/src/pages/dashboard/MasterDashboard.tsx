import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { masterData } from '../../data/masterData';
import { scenarioDetails } from '../../data/scenarioDetails';
import { Badge, Button, StatsGrid, SearchBar, TimelineFeed, TimelineItem, PageHeader, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, ViewModeToggle, Pagination, GradeBadge, DateRangeFilter } from '@/components/shared/ui';
import { DashboardActivity } from '../../types/dashboard';
import {
    ChevronRight,
    Users,
    Calendar,
    Share,
    EyeIcon,
    Play,
    Building,
    School,
    Clock,
    LayoutGrid,
    List,
    User2,
    PlayCircle,
    TrendingUp,
    UserCheck,
    BarChart2,
    Trophy,
    Key
} from 'lucide-react';
import { classesData } from '../../data/classes';
import { simulations } from '../../data/simulations';
import { ROUTES } from '../../lib/constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { getLicensesByOrgId } from '../../data/organizationLicenses';

// Activity Timeline Card Component
interface ActivityTimelineCardProps {
    activity: DashboardActivity;
    index: number;
}

const ActivityTimelineCard: React.FC<ActivityTimelineCardProps> = ({ activity, index }) => {
    // Format date to show only date part (YYYY-MM-DD)
    const formattedDate = activity.createdDate ? activity.createdDate.split(' ')[0] : '';

    // Create status badge for label
    const statusLabel = (
        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${activity.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
            {activity.status}
        </div>
    );

    return (
        <TimelineItem
            date={formattedDate}
            label={statusLabel}
            index={index}
        >
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-2 text-sm text-gray-500 font-medium">
                    <span>{activity.category}</span>
                </div>
                <h3 className="text-lg font-bold text-blue-600 mb-2">
                    {activity.title}
                    <span className="text-gray-500 font-medium text-base ml-2">
                        ({activity.mode === 'training' ? '학습모드' : '평가모드'})
                    </span>
                </h3>
                <div className="mt-2 text-sm text-gray-500">
                    <span>User: <strong>{activity.ContributedBy}</strong></span>
                </div>
            </div>
        </TimelineItem>
    );
};

export default function MasterDashboard(): React.ReactElement {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [listSearch, setListSearch] = useState<string>('');
    const [listPage, setListPage] = useState<number>(1);
    const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
    const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

    // 기간 내 데이터 필터링 헬퍼 함수
    const isDateInRange = (dateStr: string | undefined | null): boolean => {
        if (!dateStr) return false;
        if (!dateRange.start || !dateRange.end) return true; // 기간이 설정되지 않으면 모든 데이터 포함
        
        const date = new Date(dateStr);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999); // 하루 끝까지 포함
        
        return date >= start && date <= end;
    };

    // 시뮬레이션 수: 기간 내 기관 참가자 시뮬레이션 회수 합계
    const getSimulationCount = (): number => {
        return masterData.classParticipation.filter(item => 
            isDateInRange(item.date)
        ).length;
    };

    // 시뮬레이션 시간: 기간 내 기관 참가자 시뮬레이션 시간 합계
    const getSimulationTime = (): string => {
        let totalMinutes = 0;
        masterData.classParticipation
            .filter(item => isDateInRange(item.date))
            .forEach(item => {
                if (item.duration) {
                    const [hours, minutes] = item.duration.split(':').map(Number);
                    totalMinutes += (hours * 60) + minutes;
                }
            });
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        if (hours > 0) {
            return `${hours}시간 ${mins}분`;
        }
        return `${mins}분`;
    };

    // 클래스 수: 기간 내 활성 클래스 수 합계
    const getClassCount = (): number => {
        return Object.values(classesData).filter(cls => {
            if (!cls.createdDate) return false;
            return isDateInRange(cls.createdDate);
        }).length;
    };

    // 라이선스 수: 기간 내 활성 라이선스 수 합계
    const getLicenseCount = (): number => {
        const orgId = user?.currentAccount?.organizationId;
        if (!orgId) return 0;
        
        // organizationId를 정규화 (org_XXX -> ORGXXX)
        const normalizedOrgId = orgId.startsWith('ORG') 
            ? orgId 
            : orgId.replace(/^org_/i, 'ORG').toUpperCase();
        
        const licenses = getLicensesByOrgId(normalizedOrgId);
        
        // 기간 필터링
        if (!dateRange.start || !dateRange.end) {
            return licenses.filter(l => l.status === 'active').length;
        }
        
        return licenses.filter(license => {
            if (license.status !== 'active') return false;
            
            // 기간이 설정되지 않았으면 모든 활성 라이선스 포함
            if (!dateRange.start || !dateRange.end) return true;
            
            // 라이선스 시작일 또는 종료일이 기간 내에 있는지 확인
            const startDate = license.startDate ? new Date(license.startDate) : null;
            const endDate = license.endDate ? new Date(license.endDate) : null;
            
            const rangeStart = new Date(dateRange.start);
            const rangeEnd = new Date(dateRange.end);
            rangeEnd.setHours(23, 59, 59, 999);
            
            if (startDate && endDate) {
                // 라이선스 기간이 조회 기간과 겹치는지 확인
                return (startDate <= rangeEnd && endDate >= rangeStart);
            }
            return false;
        }).length;
    };

    // 시나리오 수: 기간 내 사용가능 시나리오 수 합계
    const getScenarioCount = (): number => {
        return Object.values(scenarioDetails).filter(scenario => {
            if (!scenario.createdDate) return false;
            return isDateInRange(scenario.createdDate) && scenario.isPublic !== false;
        }).length;
    };

    const statsData = [
        {
            label: "시뮬레이션 수",
            value: getSimulationCount().toLocaleString(),
            sub: "회",
            icon: PlayCircle,
            color: "brand",
            isActive: false,
            onClick: () => navigate(ROUTES.MASTER.SCENARIOS)
        },
        {
            label: "시뮬레이션 시간",
            value: getSimulationTime(),
            sub: "",
            icon: Clock,
            color: "brand",
            isActive: false,
            onClick: () => navigate(ROUTES.MASTER.SCENARIOS)
        },
        {
            label: "클래스 수",
            value: getClassCount().toLocaleString(),
            sub: "개",
            icon: School,
            color: "brand",
            isActive: false,
            onClick: () => navigate(ROUTES.MASTER.CLASS_MANAGEMENT)
        },
        {
            label: "라이선스 수",
            value: getLicenseCount().toLocaleString(),
            sub: "개",
            icon: Key,
            color: "brand",
            isActive: false,
            onClick: () => navigate(ROUTES.MASTER.ORGANIZATION)
        },
        {
            label: "시나리오 수",
            value: getScenarioCount().toLocaleString(),
            sub: "개",
            icon: LayoutGrid,
            color: "brand",
            isActive: false,
            onClick: () => navigate(ROUTES.MASTER.SCENARIOS)
        }
    ];

    const allItems: DashboardActivity[] = masterData.classParticipation.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        type: 'simulation',
        createdDate: item.date,
        status: item.status,
        version: '1.0',
        views: 0,
        simulationCount: 1,
        userCount: 1,
        ContributedBy: item.studentName,
        mode: item.mode,
        score: item.score
    }));

    const filteredItems = allItems.filter(item => {
        const query = listSearch.toLowerCase();
        return (item.title || '').toLowerCase().includes(query) || (item.category || '').toLowerCase().includes(query);
    });

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((listPage - 1) * itemsPerPage, listPage * itemsPerPage);

    // 최신 시뮬레이션 계산 (더보기 버튼용)
    const latestSimulation = useMemo(() => {
        const sorted = [...simulations]
            .sort((a, b) => {
                const dateA = new Date(a.createdDate || '').getTime();
                const dateB = new Date(b.createdDate || '').getTime();
                return dateB - dateA;
            });
        return sorted.length > 0 ? sorted[0] : null;
    }, []);


    const getFilterTitle = () => {
        switch (activeFilter) {
            default: return '전체 현황';
        }
    };

    const renderTimeline = () => (
        <>
            {paginatedItems.length > 0 ? (
                paginatedItems.map((activity, index) => (
                    <ActivityTimelineCard key={activity.id} activity={activity} index={index} />
                ))
            ) : (
                <div className="py-12 text-center text-gray-400">
                    <p>활동 내역이 없습니다.</p>
                </div>
            )}
        </>
    );

    const renderTable = () => (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/50">
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="font-semibold text-gray-900">{item.title}</TableCell>
                            <TableCell className="text-sm text-gray-500">{item.category}</TableCell>
                            <TableCell className="text-sm text-gray-500">{item.ContributedBy}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    } `}>
                                    {item.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-900">{item.score || '-'}</TableCell>
                            <TableCell className="text-sm text-gray-500">{item.mode}</TableCell>
                            <TableCell className="text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    {item.createdDate}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
    const title = "대시보드";

    return (
        <>
            <PageHeader
                title={title}
                breadcrumbs={[{ label: title }]}
                actions={
                    <DateRangeFilter
                        startDate={dateRange.start || ''}
                        endDate={dateRange.end || ''}
                        onStartDateChange={(val) => setDateRange(prev => ({ ...prev, start: val }))}
                        onEndDateChange={(val) => setDateRange(prev => ({ ...prev, end: val }))}
                    />
                }
            />

            <StatsGrid items={statsData} columns={5} />

            {/* 최근활동 영역 - 2개 칼럼 레이아웃 */}
            <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6">최근 운영현황</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 왼쪽 칼럼: 최근 개설된 클래스 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <School size={20} className="text-blue-600" />
                                최근 개설된 클래스
                            </h3>
                            <button
                                onClick={() => navigate(ROUTES.MASTER.CLASS_MANAGEMENT)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                            >
                                더보기
                                <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {useMemo(() => {
                                const recentClasses = Object.values(classesData)
                                    .filter(cls => cls.createdDate)
                                    .sort((a, b) => {
                                        const dateA = new Date(a.createdDate || '').getTime();
                                        const dateB = new Date(b.createdDate || '').getTime();
                                        return dateB - dateA;
                                    })
                                    .slice(0, 5);
                                
                                return recentClasses.length > 0 ? (
                                    recentClasses.map((cls, index) => (
                                        <div 
                                            key={cls.id} 
                                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(ROUTES.MASTER.CLASS_DETAIL(cls.id))}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <div className="font-medium text-gray-900 truncate">{cls.title}</div>
                                                    {(cls.maxParticipants !== undefined && cls.maxParticipants > 0) && (
                                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                                            <Users size={14} className="text-blue-600" />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                참가인원 {cls.currentParticipants || 0} 명
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {cls.completionRate !== undefined && (
                                                    <div className="space-y-2 mb-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-blue-500">
                                                                참가자 이수완료율
                                                            </span>
                                                            <span className="font-medium text-lg text-blue-500">
                                                                {cls.completionRate}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${
                                                                    cls.completionRate >= 100 
                                                                        ? 'bg-green-500' 
                                                                        : 'bg-blue-500'
                                                                }`}
                                                                style={{ width: `${Math.min(cls.completionRate, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                                                    <Calendar size={12} />
                                                    <span>
                                                        {cls.participationPeriod 
                                                            ? `${cls.participationPeriod.startDate} ~ ${cls.participationPeriod.endDate}`
                                                            : cls.createdDate || '기간 설정 없음'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500 text-center py-4">최근 개설된 클래스가 없습니다.</div>
                                );
                            }, [])}
                        </div>
                    </div>

                    {/* 오른쪽 칼럼: 최근 시뮬레이션 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Trophy size={20} className="text-orange-600" />
                                최근 시뮬레이션
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {useMemo(() => {
                                const recentSimulations = [...simulations]
                                    .sort((a, b) => {
                                        const dateA = new Date(a.createdDate || '').getTime();
                                        const dateB = new Date(b.createdDate || '').getTime();
                                        return dateB - dateA;
                                    })
                                    .slice(0, 5);
                                
                                return recentSimulations.length > 0 ? (
                                    recentSimulations.map((sim, index) => (
                                        <div 
                                            key={sim.id} 
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(ROUTES.MASTER.CLASS_RESULTS(sim.classId.replace('CLASS_', ''), sim.id.toString()))}
                                        >
                                            {/* 순위 */}
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    {/* 윗줄: 참가자명 */}
                                                    <div className="font-medium text-gray-900 truncate mb-1">{sim.username}</div>
                                                    {/* 아래줄: 클래스명, 시나리오명 */}
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        {sim.className && (
                                                            <>
                                                                <span className="flex-shrink-0">{sim.className}</span>
                                                                <span className="flex-shrink-0">·</span>
                                                            </>
                                                        )}
                                                        <span className="truncate min-w-0">{sim.title}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {/* 점수, GradeBadge */}
                                                    {sim.score !== undefined && sim.score !== null && (
                                                        <>

                                                            <span className="font-medium text-gray-900">{sim.score}점</span>
                                                            <GradeBadge score={sim.score} className="w-24 justify-center" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-base text-gray-500 text-center py-4">시뮬레이션 내역이 없습니다.</div>
                                );
                            }, [])}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
