import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { masterData } from '../../data/masterData';
import { adminActivities, activityTypes } from '../../data/adminActivities';
import { Users, Calendar, List, Building, LayoutGrid, Clock, Share, EyeIcon, Play, User2, School, Activity, PlayCircle, TrendingUp, UserCheck, BarChart2, ChevronRight } from 'lucide-react';
import { StatsGrid, SearchBar, TimelineFeed, TimelineItem, FilterGroup, FilterSelect, DateRangeFilter, PageHeader, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination, ViewModeToggle, EmptyState, Badge } from '@/components/shared/ui';
import { DashboardActivity } from '../../types/dashboard';
import { classesData, ClassItem } from '../../data/classes';
import { scenarioDetails } from '../../data/scenarioDetails';
import { Scenario } from '../../types/admin';
import { ROUTES } from '../../lib/constants/routes';
import { organizationsData } from '../../data/organizations';

// Chart.js 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

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
        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${activity.status === 'active' || activity.status === 'completed'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
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
                </h3>
                <div className="mt-2 text-sm text-gray-500">
                    <span>Contributed by <strong>{activity.ContributedBy}</strong></span>
                </div>
                {activity.description && (
                    <div className="mt-3 text-sm text-gray-600">
                        {activity.description}
                    </div>
                )}
            </div>
        </TimelineItem>
    );
};

export default function AdminDashboard(): React.ReactElement {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [listSearch, setListSearch] = useState<string>('');
    const [listPage, setListPage] = useState<number>(1);
    const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
    const [popularScenarioPeriod, setPopularScenarioPeriod] = useState<string>('1month'); // 1month, 3months, 6months, 1year
    const [popularScenarioSortBy, setPopularScenarioSortBy] = useState<string>('simulationCount'); // views, simulationCount

    // Initial Date Range: 6 months ago ~ Today
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const [startDate, setStartDate] = useState<string>(formatDate(sixMonthsAgo));
    const [endDate, setEndDate] = useState<string>(formatDate(today));

    const recentActivities: DashboardActivity[] = adminActivities.map(activity => {
        let mappedStatus: 'active' | 'completed' | 'in-progress' | 'failed' | 'not-started' = 'active';

        switch (activity.status) {
            case 'completed': mappedStatus = 'completed'; break;
            case 'active': mappedStatus = 'active'; break;
            case 'published': mappedStatus = 'completed'; break;
            case 'in_progress': mappedStatus = 'in-progress'; break;
            case 'resolved': mappedStatus = 'completed'; break;
            case 'warning': mappedStatus = 'in-progress'; break;
            default: mappedStatus = 'active';
        }

        return {
            id: activity.id,
            title: activity.title,
            category: activityTypes[activity.type] || activity.type,
            type: activity.type,
            createdDate: activity.createdDate,
            status: mappedStatus,
            version: '1.0',
            views: 0,
            simulationCount: 0,
            userCount: 0,
            ContributedBy: activity.userName || activity.instructorName || activity.masterName || activity.organizationName || 'System',
            description: activity.description
        };
    });

    // Calculate Stats dynamically based on filtered activities
    const statsActivities = recentActivities.filter(activity => {
        if (!activity || !activity.createdDate) return false;
        if (!startDate && !endDate) return true;

        const dateStr = String(activity.createdDate).replace(' ', 'T');
        const activityDate = new Date(dateStr);
        activityDate.setHours(0, 0, 0, 0);

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (activityDate < start) return false;
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (activityDate > end) return false;
        }
        return true;
    });

    const totalViews = statsActivities.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalSimulationCount = statsActivities.reduce((acc, curr) => acc + (curr.simulationCount || 0), 0);
    const totalUserCount = statsActivities.reduce((acc, curr) => acc + (curr.userCount || 0), 0);

    // Calculate total duration from all participations
    const calculateTotalDuration = (): string => {
        let totalMinutes = 0;
        masterData.classParticipation.forEach(item => {
            if (item.duration) {
                const [hours, minutes] = item.duration.split(':').map(Number);
                totalMinutes += (hours * 60) + minutes;
            }
        });
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${hours}h ${mins}m`;
    };

    // Calculate count of skill scenarios with 90+ score
    const calculateSkillMasteryCount = (): number => {
        return masterData.classParticipation.filter(item =>
            item.category &&
            item.category.includes('Skill') &&
            item.score !== null &&
            item.score !== undefined &&
            item.score >= 90
        ).length;
    };

    // Calculate count of disease scenarios
    const calculatePatientCareCount = (): number => {
        return masterData.classParticipation.filter(item =>
            item.category &&
            item.category.includes('Disease')
        ).length;
    };

    // Calculate count of symptom scenarios
    const calculateDiagnosisCount = (): number => {
        return masterData.classParticipation.filter(item =>
            item.category &&
            (item.category.includes('Symptom') || item.category.includes('Clinical'))
        ).length;
    };

    // 조회기간 내 활성 기관고객 수
    const getActiveOrganizationsCount = (): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        return organizationsData.filter(org => {
            if (org.status !== 'active') return false;
            if (!org.registeredDate) return true; // 날짜 정보가 없으면 포함
            const registeredDate = new Date(org.registeredDate);
            return registeredDate >= start && registeredDate <= end;
        }).length;
    };

    // 조회기간 내 활성 사용자 수 (정회원, 게스트 포함)
    const getActiveUsersCount = (): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        return masterData.users.filter((user: any) => {
            if (user.status !== 'active') return false;
            const createdDate = user.createdDate ? new Date(user.createdDate) : null;
            if (!createdDate) return true; // 날짜 정보가 없으면 포함
            return createdDate >= start && createdDate <= end;
        }).length;
    };

    // 만료임박 라이선스 수 (30일 이내)
    const getExpiringLicensesCount = (): number => {
        if (!masterData.licenses) return 0;
        const today = new Date();
        const activeLicenses = masterData.licenses.filter((l: any) => l.status === 'active');

        return activeLicenses.filter((license: any) => {
            const endDate = new Date(license.endDate);
            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 30;
        }).length;
    };

    // 조회기간 내 활성 클래스 수
    const getActiveClassesCount = (): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        return Object.values(classesData).filter(cls => {
            // ClassItem에는 status가 없으므로 모든 클래스를 활성으로 간주
            const createdDate = cls.createdDate ? new Date(cls.createdDate) : null;
            if (!createdDate) return true; // 날짜 정보가 없으면 포함
            return createdDate >= start && createdDate <= end;
        }).length;
    };

    // 조회기간 내 활성 시나리오 수
    const getActiveScenariosCount = (): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        return Object.values(scenarioDetails).filter(scenario => {
            if (scenario.status !== 'active') return false;
            const createdDate = scenario.createdDate ? new Date(scenario.createdDate) : null;
            if (!createdDate) return true; // 날짜 정보가 없으면 포함
            return createdDate >= start && createdDate <= end;
        }).length;
    };

    // 누적 시뮬레이션 회수 (전체 시나리오의 누적 시뮬레이션 회수 합계)
    const getTotalSimulationCount = (): number => {
        return Object.values(scenarioDetails).reduce((sum, scenario) => {
            return sum + (scenario.simulationCount || 0);
        }, 0);
    };

    // 누적 시뮬레이션 시간 (전체 시나리오의 누적 시뮬레이션 시간 합계)
    const getTotalSimulationDuration = (): string => {
        // 시나리오의 averageDuration을 사용하여 계산 (예시)
        // 실제로는 시뮬레이션 실행 시간 데이터가 필요
        let totalMinutes = 0;
        Object.values(scenarioDetails).forEach(scenario => {
            if (scenario.averageDuration) {
                // "5분 30초" 형식 파싱
                const durationMatch = scenario.averageDuration.match(/(\d+)분\s*(\d+)초?/);
                if (durationMatch) {
                    const minutes = parseInt(durationMatch[1]) || 0;
                    const seconds = parseInt(durationMatch[2]) || 0;
                    totalMinutes += minutes + (seconds / 60);
                } else {
                    // "7분" 형식 파싱
                    const minutesMatch = scenario.averageDuration.match(/(\d+)분/);
                    if (minutesMatch) {
                        totalMinutes += parseInt(minutesMatch[1]) || 0;
                    }
                }
            }
        });
        const hours = Math.floor(totalMinutes / 60);
        const mins = Math.floor(totalMinutes % 60);
        return `${hours}h ${mins}m`;
    };

    // 누적 술기 시뮬레이션 회수 (Essential Skills 카테고리)
    const getSkillSimulationCount = (): number => {
        return Object.values(scenarioDetails)
            .filter(scenario => scenario.category === 'Essential Skills')
            .reduce((sum, scenario) => sum + (scenario.simulationCount || 0), 0);
    };

    // 누적 처치 시뮬레이션 회수 (Disease, Nursing Practice 카테고리)
    const getTreatmentSimulationCount = (): number => {
        return Object.values(scenarioDetails)
            .filter(scenario => 
                scenario.category === 'Disease' || 
                scenario.category === 'Nursing Practice'
            )
            .reduce((sum, scenario) => sum + (scenario.simulationCount || 0), 0);
    };

    // 누적 진단 시뮬레이션 회수 (Symptom, Clinical 카테고리)
    const getDiagnosisSimulationCount = (): number => {
        return Object.values(scenarioDetails)
            .filter(scenario => 
                scenario.category === 'Symptom' || 
                scenario.category === 'Clinical'
            )
            .reduce((sum, scenario) => sum + (scenario.simulationCount || 0), 0);
    };

    const statsData = [
        // First Row: 기관고객 수, 사용자 수, 만료임박 라이선스, 클래스 수, 시나리오 수
        {
            label: "기관고객 수",
            value: getActiveOrganizationsCount(),
            sub: "기관",
            icon: Building,
            color: "brand",
            isActive: false,
            onClick: () => navigate(ROUTES.ADMIN.ORGANIZATIONS)
        },
        {
            label: "사용자 수",
            value: getActiveUsersCount(),
            sub: "명",
            icon: Users,
            color: "brand",
            isActive: false,
            onClick: () => navigate(ROUTES.ADMIN.USERS)
        },
        {
            label: "만료임박 라이선스",
            value: getExpiringLicensesCount(),
            sub: "30일 이내",
            icon: Clock,
            color: "brand",
            isActive: false,
            onClick: () => navigate(ROUTES.ADMIN.ORGANIZATIONS) // 만료임박 기관 목록은 기관 관리 페이지로 이동
        },
        {
            label: "클래스 수",
            value: getActiveClassesCount(),
            sub: "클래스",
            icon: School,
            color: "brand",
            isActive: false,
            onClick: () => navigate(ROUTES.ADMIN.CLASS_MANAGEMENT)
        },
        {
            label: "시나리오 수",
            value: getActiveScenariosCount(),
            sub: "시나리오",
            icon: Share,
            color: "brand",
            isActive: false,
            onClick: () => navigate(ROUTES.ADMIN.SCENARIOS)
        },
        // Second Row: 누적 시뮬레이션 회수, 누적 시뮬레이션 시간, 누적 술기/처치/진단 시뮬레이션 회수
        {
            label: "누적 시뮬레이션",
            value: getTotalSimulationCount(),
            sub: "회",
            icon: PlayCircle,
            color: "brand",
            isActive: activeFilter === 'all',
            onClick: () => {
                setActiveFilter('all');
                navigate(ROUTES.ADMIN.SCENARIOS);
            }
        },
        {
            label: "누적 시뮬레이션 시간",
            value: getTotalSimulationDuration(),
            sub: "",
            icon: Clock,
            color: "brand",
            isActive: false,
            onClick: () => navigate(ROUTES.ADMIN.SCENARIOS)
        },
        {
            label: "누적 술기 시뮬레이션",
            value: getSkillSimulationCount(),
            sub: "회",
            icon: TrendingUp,
            color: "brand",
            isActive: activeFilter === 'skill',
            onClick: () => {
                setActiveFilter('skill');
                navigate(ROUTES.ADMIN.SCENARIOS);
            }
        },
        {
            label: "누적 처치 시뮬레이션",
            value: getTreatmentSimulationCount(),
            sub: "회",
            icon: UserCheck,
            color: "brand",
            isActive: activeFilter === 'disease',
            onClick: () => {
                setActiveFilter('disease');
                navigate(ROUTES.ADMIN.SCENARIOS);
            }
        },
        {
            label: "누적 진단 시뮬레이션",
            value: getDiagnosisSimulationCount(),
            sub: "회",
            icon: BarChart2,
            color: "brand",
            isActive: activeFilter === 'symptom',
            onClick: () => {
                setActiveFilter('symptom');
                navigate(ROUTES.ADMIN.SCENARIOS);
            }
        }
    ];

    const filteredActivities = recentActivities.filter(activity => {
        // Search Filter
        if (!activity || !activity.createdDate) return false;

        const query = listSearch.toLowerCase();
        const matchesSearch = (activity.title || '').toLowerCase().includes(query) ||
            (activity.category || '').toLowerCase().includes(query) ||
            (activity.ContributedBy || '').toLowerCase().includes(query);

        if (!matchesSearch) return false;

        if (!startDate && !endDate) return true;

        const dateStr = String(activity.createdDate).replace(' ', 'T');
        const activityDate = new Date(dateStr);
        // Reset time part for date comparison
        activityDate.setHours(0, 0, 0, 0);

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (activityDate < start) return false;
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (activityDate > end) return false;
        }

        return true;
    });

    const itemsPerPage = 20;

    // Pagination Logic
    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const paginatedActivities = filteredActivities.slice(
        (listPage - 1) * itemsPerPage,
        listPage * itemsPerPage
    );

    const getFilterTitle = () => {
        switch (activeFilter) {
            default: return '최근 운영현황';
        }
    };

    // Render Props
    const renderTimeline = () => (
        <>
            {paginatedActivities.length > 0 ? (
                paginatedActivities.map((activity, index) => (
                    <ActivityTimelineCard key={activity.id} activity={activity} index={index} />
                ))
            ) : (
                <EmptyState
                    icon={<Activity size={48} />}
                    title="활동 내역이 없습니다."
                    description="선택한 기간 동안의 활동이 없습니다."
                />
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
                        <TableHead>Contributed By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedActivities.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="font-semibold text-gray-900">{item.title}</TableCell>
                            <TableCell className="text-sm text-gray-500">{item.category}</TableCell>
                            <TableCell className="text-sm text-gray-500">{item.ContributedBy}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' || item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {item.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-900 max-w-xs truncate" title={item.description}>{item.description || '-'}</TableCell>
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
                rightContent={
                    <div className="flex justify-end">
                        <FilterGroup>
                            <DateRangeFilter
                                startDate={startDate}
                                endDate={endDate}
                                onStartDateChange={(val) => setStartDate(val)}
                                onEndDateChange={(val) => setEndDate(val)}
                            />
                        </FilterGroup>
                    </div>
                }
            />

            <StatsGrid items={statsData} columns={5} />

            {/* 최근활동 영역 - 2개 칼럼 레이아웃 */}
            <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6">최근 운영현황</h2>
                
                {/* 주간 통계 차트 - 2개 칼럼 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* 좌측: 주간 참가자 수 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Users size={20} className="text-green-600" />
                                주간 참가자 수
                            </h3>
                        </div>
                        {useMemo(() => {
                            // 최근 12주 데이터 생성
                            const weeks: string[] = [];
                            const participantCounts: number[] = [];
                            
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            
                            for (let i = 11; i >= 0; i--) {
                                const weekEnd = new Date(today);
                                weekEnd.setDate(today.getDate() - (i * 7));
                                
                                // 주의 시작일 (월요일)
                                const weekStart = new Date(weekEnd);
                                const dayOfWeek = weekEnd.getDay();
                                const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                                weekStart.setDate(weekEnd.getDate() - diff);
                                
                                // 주의 종료일 (일요일)
                                const weekEndDate = new Date(weekStart);
                                weekEndDate.setDate(weekStart.getDate() + 6);
                                
                                // 주 레이블
                                const weekLabel = `${String(weekStart.getMonth() + 1).padStart(2, '0')}/${String(weekStart.getDate()).padStart(2, '0')} ~ ${String(weekEndDate.getMonth() + 1).padStart(2, '0')}/${String(weekEndDate.getDate()).padStart(2, '0')}`;
                                weeks.push(weekLabel);
                                
                                // 해당 주의 참가자 수 계산
                                // classesData의 currentParticipants를 기반으로 집계
                                const weekParticipants = Object.values(classesData).reduce((sum, cls) => {
                                    if (!cls.createdDate) return sum;
                                    const classDate = new Date(cls.createdDate);
                                    classDate.setHours(0, 0, 0, 0);
                                    // 클래스가 해당 주에 생성되었거나 활성화된 경우
                                    if (classDate >= weekStart && classDate <= weekEndDate) {
                                        return sum + (cls.currentParticipants || 0);
                                    }
                                    return sum;
                                }, 0);
                                
                                // 사용자 등록 데이터도 고려
                                const weekUsers = masterData.users.filter((user: any) => {
                                    if (!user.createdDate) return false;
                                    const userDate = new Date(user.createdDate);
                                    userDate.setHours(0, 0, 0, 0);
                                    return userDate >= weekStart && userDate <= weekEndDate;
                                }).length;
                                
                                participantCounts.push(weekParticipants + weekUsers);
                            }
                            
                            const chartData = {
                                labels: weeks,
                                datasets: [
                                    {
                                        label: '참가자 수',
                                        data: participantCounts,
                                        backgroundColor: 'rgba(34, 197, 94, 0.5)',
                                        borderColor: 'rgba(34, 197, 94, 1)',
                                        borderWidth: 1,
                                    },
                                ],
                            };
                            
                            const chartOptions = {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    tooltip: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        padding: 12,
                                        titleFont: {
                                            size: 14,
                                        },
                                        bodyFont: {
                                            size: 13,
                                        },
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1,
                                        },
                                        grid: {
                                            color: 'rgba(0, 0, 0, 0.05)',
                                        },
                                    },
                                    x: {
                                        grid: {
                                            display: false,
                                        },
                                    },
                                },
                            };
                            
                            return (
                                <div className="h-64">
                                    <Bar data={chartData} options={chartOptions} />
                                </div>
                            );
                        }, [])}
                    </div>
                    
                    {/* 우측: 주간 시뮬레이션 수 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <BarChart2 size={20} className="text-blue-600" />
                                주간 시뮬레이션 수
                            </h3>
                        </div>
                        {useMemo(() => {
                            // 최근 12주 데이터 생성
                            const weeks: string[] = [];
                            const simulationCounts: number[] = [];
                            
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            
                            for (let i = 11; i >= 0; i--) {
                                const weekEnd = new Date(today);
                                weekEnd.setDate(today.getDate() - (i * 7));
                                
                                // 주의 시작일 (월요일)
                                const weekStart = new Date(weekEnd);
                                const dayOfWeek = weekEnd.getDay();
                                const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                                weekStart.setDate(weekEnd.getDate() - diff);
                                
                                // 주의 종료일 (일요일)
                                const weekEndDate = new Date(weekStart);
                                weekEndDate.setDate(weekStart.getDate() + 6);
                                
                                // 주 레이블
                                const weekLabel = `${String(weekStart.getMonth() + 1).padStart(2, '0')}/${String(weekStart.getDate()).padStart(2, '0')} ~ ${String(weekEndDate.getMonth() + 1).padStart(2, '0')}/${String(weekEndDate.getDate()).padStart(2, '0')}`;
                                weeks.push(weekLabel);
                                
                                // 해당 주의 시뮬레이션 수 계산
                                const weekSimulations = masterData.classParticipation.filter((item: any) => {
                                    if (!item.date) return false;
                                    const itemDate = new Date(item.date);
                                    itemDate.setHours(0, 0, 0, 0);
                                    return itemDate >= weekStart && itemDate <= weekEndDate;
                                }).length;
                                
                                // 시나리오의 simulationCount도 고려
                                const scenarioTotal = Object.values(scenarioDetails).reduce((sum, scenario) => {
                                    return sum + (scenario.simulationCount || 0);
                                }, 0);
                                
                                const estimatedCount = Math.floor(scenarioTotal / 12) + weekSimulations;
                                simulationCounts.push(estimatedCount);
                            }
                            
                            const chartData = {
                                labels: weeks,
                                datasets: [
                                    {
                                        label: '시뮬레이션 수',
                                        data: simulationCounts,
                                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                        borderColor: 'rgba(59, 130, 246, 1)',
                                        borderWidth: 1,
                                    },
                                ],
                            };
                            
                            const chartOptions = {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    tooltip: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        padding: 12,
                                        titleFont: {
                                            size: 14,
                                        },
                                        bodyFont: {
                                            size: 13,
                                        },
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1,
                                        },
                                        grid: {
                                            color: 'rgba(0, 0, 0, 0.05)',
                                        },
                                    },
                                    x: {
                                        grid: {
                                            display: false,
                                        },
                                    },
                                },
                            };
                            
                            return (
                                <div className="h-64">
                                    <Bar data={chartData} options={chartOptions} />
                                </div>
                            );
                        }, [])}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 왼쪽 칼럼 */}
                    <div className="space-y-6">
                        {/* 최근 클래스 개설 */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <School size={20} className="text-blue-600" />
                                    최근 클래스 개설
                                </h3>
                                <button
                                    onClick={() => navigate(ROUTES.ADMIN.CLASS_MANAGEMENT)}
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
                                        recentClasses.map((cls, index) => {
                                            // creatorId를 기반으로 기관 찾기
                                            const getOrganizationName = () => {
                                                if (cls.creatorId) {
                                                    // creatorId가 Admin으로 시작하면 organizationsData에서 찾기
                                                    const org = organizationsData.find(org => 
                                                        org.id === 'ORG001' || org.id === 'ORG002' || org.id === 'ORG003'
                                                    );
                                                    if (org) return org.name;
                                                }
                                                return masterData.organization?.name || organizationsData[0]?.name || '기관명 없음';
                                            };
                                            
                                            return (
                                                <div 
                                                    key={cls.id} 
                                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                                    onClick={() => navigate(ROUTES.ADMIN.CLASS_DETAIL(cls.id))}
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
                                                        {/* 기관명 및 참여기간 */}
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <div className="flex items-center gap-1.5">
                                                                <Building size={12} />
                                                                <span>{getOrganizationName()}</span>
                                                            </div>
                                                            <span className="w-px h-3 bg-gray-300" />
                                                            <div className="flex items-center gap-1.5">
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
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-sm text-gray-500 text-center py-4">최근 개설된 클래스가 없습니다.</div>
                                    );
                                }, [])}
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽 칼럼 */}
                    <div className="space-y-6">
                        {/* 신규 시나리오 */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Share size={20} className="text-green-600" />
                                    신규 시나리오
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {useMemo(() => {
                                    const newScenarios = Object.values(scenarioDetails)
                                        .filter(scenario => scenario.createdDate)
                                        .sort((a, b) => {
                                            const dateA = new Date(a.createdDate || '').getTime();
                                            const dateB = new Date(b.createdDate || '').getTime();
                                            return dateB - dateA;
                                        })
                                        .slice(0, 4);
                                    
                                    return newScenarios.length > 0 ? (
                                        newScenarios.map((scenario) => (
                                            <div 
                                                key={scenario.id} 
                                                className="px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => navigate(ROUTES.ADMIN.SCENARIO_DETAIL(scenario.id.toString()))}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="font-medium text-gray-900 truncate flex-1 min-w-0">{scenario.title}</div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-800 flex-shrink-0">
                                                        <Badge variant="outline" className="text-xs text-green-600 border-green-300 w-16 justify-center">
                                                            {scenario.platform || 'N/A'}
                                                        </Badge>
                                                        <span>·</span>
                                                        <span className="flex items-center gap-1">
                                                            <EyeIcon size={14} />
                                                            {scenario.views || 0}
                                                        </span>
                                                        <span>·</span>
                                                        <span className="flex items-center gap-1">
                                                            <PlayCircle size={14} />
                                                            {scenario.simulationCount || 0}회
                                                        </span>
                                                        <span>·</span>
                                                        <span>{scenario.createdDate || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-500 text-center py-4">신규 시나리오가 없습니다.</div>
                                    );
                                }, [])}
                            </div>
                        </div>

                        {/* 인기 시나리오 */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-orange-600" />
                                    인기 시나리오
                                </h3>
                                <div className="flex items-center gap-2">
                                    <FilterSelect
                                        value={popularScenarioSortBy}
                                        onValueChange={setPopularScenarioSortBy}
                                        options={[
                                            { value: 'views', label: '조회수' },
                                            { value: 'simulationCount', label: '실습회수' }
                                        ]}
                                        className="min-w-[120px]"
                                    />
                                    <FilterSelect
                                        value={popularScenarioPeriod}
                                        onValueChange={setPopularScenarioPeriod}
                                        options={[
                                            { value: '1month', label: '최근 1개월' },
                                            { value: '3months', label: '최근 3개월' },
                                            { value: '6months', label: '최근 6개월' },
                                            { value: '1year', label: '최근 1년' }
                                        ]}
                                        className="min-w-[140px]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                {useMemo(() => {
                                    const today = new Date();
                                    let cutoffDate = new Date();
                                    
                                    // 조회기간 필터에 따라 날짜 계산
                                    switch (popularScenarioPeriod) {
                                        case '1month':
                                            cutoffDate.setMonth(today.getMonth() - 1);
                                            break;
                                        case '3months':
                                            cutoffDate.setMonth(today.getMonth() - 3);
                                            break;
                                        case '6months':
                                            cutoffDate.setMonth(today.getMonth() - 6);
                                            break;
                                        case '1year':
                                            cutoffDate.setFullYear(today.getFullYear() - 1);
                                            break;
                                        default:
                                            cutoffDate.setMonth(today.getMonth() - 1);
                                    }
                                    
                                    const popularScenarios = Object.values(scenarioDetails)
                                        .filter(scenario => {
                                            // createdDate 또는 updatedDate가 조회기간 내에 있는지 확인
                                            const scenarioDate = scenario.updatedDate 
                                                ? new Date(scenario.updatedDate) 
                                                : scenario.createdDate 
                                                    ? new Date(scenario.createdDate) 
                                                    : null;
                                            if (!scenarioDate) return true; // 날짜 정보가 없으면 포함
                                            return scenarioDate >= cutoffDate;
                                        })
                                        .sort((a, b) => {
                                            // 정렬 기준에 따라 정렬
                                            if (popularScenarioSortBy === 'views') {
                                                return (b.views || 0) - (a.views || 0);
                                            } else {
                                                return (b.simulationCount || 0) - (a.simulationCount || 0);
                                            }
                                        })
                                        .slice(0, 6);
                                    
                                    // 플랫폼 뱃지 색상 매핑
                                    const getPlatformBadgeVariant = (platform: string | string[] | undefined) => {
                                        const platformValue = Array.isArray(platform) 
                                            ? platform[0] 
                                            : platform || 'VR';
                                        const platformLower = platformValue.toLowerCase();
                                        if (platformLower === 'vr' || platformLower === 'hmd') return 'default';
                                        if (platformLower === 'web' || platformLower === 'pc') return 'secondary';
                                        if (platformLower === 'mobile') return 'outline';
                                        return 'default';
                                    };
                                    
                                    // 플랫폼 표시 텍스트 추출
                                    const getPlatformText = (platform: string | string[] | undefined): string => {
                                        if (Array.isArray(platform)) {
                                            return platform.join(', ');
                                        }
                                        return platform || 'VR';
                                    };
                                    
                                    return popularScenarios.length > 0 ? (
                                        popularScenarios.map((scenario, index) => (
                                            <div 
                                                key={scenario.id} 
                                                className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => navigate(ROUTES.ADMIN.SCENARIO_DETAIL(scenario.id.toString()))}
                                            >
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                                    <div className="font-medium text-gray-900 truncate">{scenario.title}</div>
                                                    <div className="text-sm text-gray-800 flex items-center gap-2 flex-shrink-0">
                                                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-300 w-16 justify-center">
                                                            {getPlatformText(scenario.platform)}
                                                        </Badge>
                                                        <span>·</span>
                                                        <span className="flex items-center gap-1">
                                                            <EyeIcon size={16} />
                                                            {scenario.views || 0}
                                                        </span>
                                                        <span>·</span>
                                                        <span className="flex items-center gap-1">
                                                            <PlayCircle size={16} />
                                                            {scenario.simulationCount || 0}회
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-base text-gray-800 text-center py-4">인기 시나리오가 없습니다.</div>
                                    );
                                }, [popularScenarioPeriod, popularScenarioSortBy])}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
