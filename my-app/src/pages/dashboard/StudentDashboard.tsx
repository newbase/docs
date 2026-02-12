/**
 * StudentDashboard - 학생 대시보드 컴포넌트
 * 
 * 데이터를 가져와서 UI를 렌더링합니다.
 * mock ↔ real API 스위칭은 useStudentDashboard 훅에서 처리됩니다.
 */
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, PlayCircle, TrendingUp, UserCheck, Calendar, List, Clock, BarChart2, LayoutGrid, School, Trophy, Star } from 'lucide-react';
import { StatsGrid, SearchBar, TimelineFeed, TimelineItem, GradeBadge, getGrade, FilterGroup, DateRangeFilter, PageHeader, Pagination, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, ViewModeToggle, Badge } from '@/components/shared/ui';
import { Patient, DashboardActivity } from '../../types/dashboard';
import { ROUTES } from '../../lib/constants/routes';
import { useStudentDashboard } from '../../data/queries/useDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { studentMockData } from '../../data/mock/dashboard';

// Patient Card Component
interface PatientCardProps {
    patient: Patient;
    index: number;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, index }) => (
    <TimelineItem
        date={patient.dateEncountered}
        label={patient.scenarioTitle}
        index={index}
    >
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {patient.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{patient.age}세 / {patient.gender}</span>
                        <span>•</span>
                        <span>{patient.diagnosis}</span>
                    </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.status === 'stable' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    } `}>
                    {patient.status === 'stable' ? 'Stable' : 'Critical'}
                </span>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
                {patient.chiefComplaint}
            </p>

            <div className="flex gap-8 pt-4 border-t border-gray-100">
                <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Care Score</div>
                    <div className="text-lg font-bold text-blue-600">{patient.careScore}점</div>
                </div>
                <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Duration</div>
                    <div className="text-sm font-semibold text-gray-700 mt-1">{patient.careDuration}</div>
                </div>
            </div>
        </div>
    </TimelineItem>
);

export interface StudentDashboardData {
    userStats: {
        patientsCared: number;
        simulationCount: number;
        skills: { count: number; avgScore: number; label: string; sub: string };
        diseases: { count: number; avgScore: number; label: string; sub: string };
        symptoms: { count: number; avgScore: number; label: string; sub: string };
        diagnosis: { count: number; avgScore: number; label: string; sub: string };
    };
    recentClasses: DashboardActivity[];
    patientsList: Patient[];
    fullHistoryData: DashboardActivity[];
}

export default function StudentDashboard(): React.ReactElement {
    const { user } = useAuth();
    const userId = user?.id;
    const { data, loading, error } = useStudentDashboard(userId);

    // 데이터가 없으면 목업 데이터로 폴백
    const dashboardData = data || studentMockData;
    const { userStats, recentClasses, patientsList, fullHistoryData } = dashboardData;

    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [listSearch, setListSearch] = useState<string>('');
    const [listPage, setListPage] = useState<number>(1);
    const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

    // Initial Date Range: 3 months ago ~ Today
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const [startDate, setStartDate] = useState<string>(formatDate(threeMonthsAgo));
    const [endDate, setEndDate] = useState<string>(formatDate(today));

    // 기간 내 데이터 필터링 헬퍼 함수
    const isDateInRange = (dateStr: string | undefined | null): boolean => {
        if (!dateStr) return false;
        if (!startDate && !endDate) return true; // 기간이 설정되지 않으면 모든 데이터 포함
        
        // 날짜 형식 변환 (YYYY.MM.DD -> YYYY-MM-DD)
        const normalizedDate = dateStr.replace(/\./g, '-');
        const date = new Date(normalizedDate);
        date.setHours(0, 0, 0, 0);
        
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (date < start) return false;
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (date > end) return false;
        }
        return true;
    };

    // 시뮬레이션 수: 기간 내 본인 시뮬레이션 회수 합계 (0점 제외)
    const getSimulationCount = (): number => {
        return fullHistoryData.filter(item => {
            if (!isDateInRange(item.createdDate)) return false;
            // 0점 제외
            const score = item.score ?? 0;
            return score > 0;
        }).length;
    };

    // 시뮬레이션 시간: 기간 내 본인 시뮬레이션 시간 합계 (0점 제외)
    const getSimulationTime = (): string => {
        let totalMinutes = 0;
        fullHistoryData
            .filter(item => {
                if (!isDateInRange(item.createdDate)) return false;
                // 0점 제외
                const score = item.score ?? 0;
                return score > 0;
            })
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

    // 클래스 이수: 기간 내 이수완료한 클래스 수
    const getCompletedClassCount = (): number => {
        const completedClasses = new Set<string>();
        recentClasses
            .filter(item => {
                if (!isDateInRange(item.lastAccess || item.createdDate)) return false;
                // 이수완료: progress === 100 또는 status === 'completed'
                return (item.progress !== undefined && item.progress >= 100) || item.status === 'completed';
            })
            .forEach(item => {
                if (item.classId) {
                    completedClasses.add(item.classId);
                }
            });
        return completedClasses.size;
    };

    // 참여 시나리오 수: 기간 내 시뮬레이션 이력이 있는 시나리오 수 (0점 제외)
    const getParticipatedScenarioCount = (): number => {
        const uniqueScenarios = new Set<string | number>();
        fullHistoryData
            .filter(item => {
                if (!isDateInRange(item.createdDate)) return false;
                // 0점 제외
                const score = item.score ?? 0;
                return score > 0;
            })
            .forEach(item => {
                // 시나리오 ID로 고유성 판단 (id 또는 title을 기준으로)
                if (item.id) {
                    uniqueScenarios.add(item.id);
                }
            });
        return uniqueScenarios.size;
    };

    // Perfect 획득: 기간 내 본인이 Perfect 레벨(100점) 획득한 시나리오 수
    const getPerfectCount = (): number => {
        const perfectScenarios = new Set<string | number>();
        fullHistoryData
            .filter(item => {
                if (!isDateInRange(item.createdDate)) return false;
                // Perfect는 100점
                const score = item.score ?? 0;
                return score === 100;
            })
            .forEach(item => {
                // 시나리오 ID로 고유성 판단
                if (item.id) {
                    perfectScenarios.add(item.id);
                }
            });
        return perfectScenarios.size;
    };

    const statsData = [
        {
            label: "시뮬레이션 수",
            value: getSimulationCount().toLocaleString(),
            sub: "회",
            icon: PlayCircle,
            color: "brand",
            isActive: false,
            onClick: () => { }
        },
        {
            label: "시뮬레이션 시간",
            value: getSimulationTime(),
            sub: "",
            icon: Clock,
            color: "brand",
            isActive: false,
            onClick: () => { }
        },
        {
            label: "클래스 이수",
            value: getCompletedClassCount().toLocaleString(),
            sub: "개",
            icon: School,
            color: "brand",
            isActive: false,
            onClick: () => { }
        },
        {
            label: "참여 시나리오 수",
            value: getParticipatedScenarioCount().toLocaleString(),
            sub: "개",
            icon: LayoutGrid,
            color: "brand",
            isActive: false,
            onClick: () => { }
        },
        {
            label: "Perfect 획득",
            value: getPerfectCount().toLocaleString(),
            sub: "개",
            icon: Star,
            color: "brand",
            isActive: false,
            onClick: () => { }
        }
    ];

    const filteredClasses = (activeFilter === 'all'
        ? recentClasses
        : recentClasses.filter(item => item.type === activeFilter)
    ).filter(item => {
        // Date Filter for recentClasses (assuming 'lastAccess' is 'YYYY.MM.DD')
        if (!startDate && !endDate) return true;
        if (!item.lastAccess) return false;

        const dateStr = item.lastAccess.replace(/\./g, '-');
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

    const filteredList = fullHistoryData.filter(item => {
        // Search Filter
        const query = listSearch.toLowerCase();
        const matchesSearch = item.title.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        // Date Filter
        if (!startDate && !endDate) return true;
        if (!item.createdDate) return false;

        // Handle date parsing (assuming 'YYYY.MM.DD' format for fullHistoryData)
        const dateStr = item.createdDate.replace(/\./g, '-');
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

    const getFilterTitle = () => {
        switch (activeFilter) {
            case 'skill': return 'Skill Scenarios';
            case 'knowledge': return 'Disease Scenarios';
            case 'diagnosis': return 'Symptom Scenarios';
            case 'patients': return 'Patients I Cared For';
            default: return '최근 활동';
        }
    };

    // 최근 참여한 클래스 (useMemo를 최상위에서 호출)
    const recentParticipatedClasses = useMemo(() => {
        return recentClasses
            .filter(item => item.classId)
            .sort((a, b) => {
                const dateA = new Date(a.lastAccess?.replace(/\./g, '-') || '').getTime();
                const dateB = new Date(b.lastAccess?.replace(/\./g, '-') || '').getTime();
                return dateB - dateA;
            })
            .slice(0, 5);
    }, [recentClasses]);

    // 최근 시뮬레이션 (useMemo를 최상위에서 호출)
    const recentSimulations = useMemo(() => {
        return fullHistoryData
            .filter(item => item.classId && item.sessionId)
            .sort((a, b) => {
                const dateA = new Date(a.createdDate?.replace(/\./g, '-') || '').getTime();
                const dateB = new Date(b.createdDate?.replace(/\./g, '-') || '').getTime();
                return dateB - dateA;
            })
            .slice(0, 5);
    }, [fullHistoryData]);

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="text-2xl mb-4">Loading...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="text-2xl mb-4 text-red-600">Error loading dashboard</div>
                    <p className="text-gray-500">{error.message}</p>
                </div>
            </div>
        );
    }

    // Render Props
    const renderTimeline = () => (
        <>
            {activeFilter === 'patients' ? (
                patientsList.length > 0 ? patientsList.map((patient, index) => (
                    <PatientCard key={patient.id} patient={patient} index={index} />
                )) : (
                    <div className="py-12 text-center text-gray-400">
                        <p>No patients found.</p>
                    </div>
                )
            ) : (
                filteredClasses.length > 0 ? filteredClasses.map((item, index) => (
                    <TimelineItem
                        key={item.id}
                        date={item.lastAccess}
                        label={
                            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                } `}>
                                {item.status === 'in-progress' ? 'In Progress' :
                                    item.status === 'completed' ? 'Completed' : 'Not Started'}
                            </div>
                        }
                        index={index}
                    >
                        <div 
                            className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${item.classId ? 'cursor-pointer' : ''}`}
                            onClick={() => {
                                if (item.classId) {
                                    navigate(ROUTES.COMMON.CLASS_CURRICULUM(item.classId));
                                }
                            }}
                        >
                            <div className="mb-2 text-sm text-gray-500 font-medium">
                                <span>
                                    {item.category}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {item.title}
                            </h3>

                            <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                {item.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                                {item.mode === 'training' ? (
                                    <span className="text-gray-500 font-medium">학습모드</span>
                                ) : (
                                    <span className="text-blue-600 font-medium">평가모드</span>
                                )}
                                <div className="flex items-center gap-1">
                                    <Clock size={16} />
                                    <span>{item.duration || '00:00'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BarChart2 size={16} />
                                    <span className="font-semibold text-gray-900">
                                        Score: {item.score || 0}
                                    </span>
                                    <GradeBadge score={item.score} />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                {item.classId ? (
                                    <Link 
                                        to={ROUTES.COMMON.CLASS_CURRICULUM(item.classId)} 
                                        className="text-blue-600 font-semibold hover:text-blue-700 text-sm flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {item.status === 'not-started' ? '클래스 참여하기' : '클래스 계속하기'}
                                        <ChevronRight size={16} />
                                    </Link>
                                ) : (
                                    <Link 
                                        to={ROUTES.COMMON.SCENARIO_DETAIL(item.id.toString())} 
                                        className="text-blue-600 font-semibold hover:text-blue-700 text-sm flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {item.status === 'not-started' ? 'Start Learning' : 'Continue Learning'}
                                        <ChevronRight size={16} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </TimelineItem>
                )) : (
                    <div className="py-12 text-center text-gray-400">
                        <p>No activity found for this category.</p>
                    </div>
                )
            )}
        </>
    );

    const renderTable = () => (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Scenario</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Grade</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredList.slice((listPage - 1) * 5, listPage * 5).map((item) => {
                        // 평가결과 페이지 링크 생성
                        const resultsLink = item.classId && item.sessionId 
                            ? ROUTES.COMMON.CLASS_RESULTS(item.classId, item.sessionId)
                            : null;
                        
                        return (
                            <TableRow 
                                key={item.id} 
                                className={`hover:bg-gray-50/50 transition-colors ${resultsLink ? 'cursor-pointer' : ''}`}
                                onClick={() => {
                                    if (resultsLink) {
                                        navigate(resultsLink);
                                    }
                                }}
                            >
                                <TableCell className="text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        {item.createdDate}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div 
                                        className={`font-semibold ${resultsLink ? 'text-blue-600 hover:text-blue-700' : 'text-gray-900'}`}
                                    >
                                        {item.title}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-500 font-medium">{item.category}</span>
                                </TableCell>
                                <TableCell>
                                    {item.mode === 'training' ? (
                                        <span className="text-sm text-gray-500">학습모드</span>
                                    ) : (
                                        <span className="text-sm font-medium text-blue-600">평가모드</span>
                                    )}
                                </TableCell>
                                <TableCell className="font-semibold text-gray-900">
                                    {item.score}/100
                                </TableCell>
                                <TableCell className="text-sm text-gray-500 font-mono">
                                    {item.duration}
                                </TableCell>
                                <TableCell>
                                    {getGrade(item.score ?? 0) ? (
                                        <span className="flex items-center gap-1.5 font-medium text-sm">
                                            <GradeBadge score={item.score ?? 0} />
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">최근 활동</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 왼쪽 칼럼: 최근 참여한 클래스 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <School size={20} className="text-blue-600" />
                                최근 참여 클래스
                            </h3>
                            <button
                                onClick={() => navigate(ROUTES.COMMON.CLASS_LIST)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                            >
                                더보기
                                <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentParticipatedClasses.length > 0 ? (
                                recentParticipatedClasses.map((item, index) => (
                                    <div 
                                        key={item.id} 
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => {
                                            if (item.classId) {
                                                navigate(ROUTES.COMMON.CLASS_CURRICULUM(item.classId));
                                            }
                                        }}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <div className="font-medium text-gray-900 truncate">{item.title}</div>
                                            </div>
                                            {/* 진행바 및 이수율 */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">이수율</span>
                                                    <span className="font-medium text-gray-900">
                                                        {item.progress !== undefined ? item.progress : 0}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            (item.progress !== undefined ? item.progress : 0) >= 100 
                                                                ? 'bg-green-500' 
                                                                : 'bg-blue-500'
                                                        }`}
                                                        style={{ width: `${Math.min(item.progress !== undefined ? item.progress : 0, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                                <Calendar size={12} />
                                                <span>{item.lastAccess || item.createdDate}</span>
                                                {item.duration && (
                                                    <>
                                                        <span>·</span>
                                                        <Clock size={12} />
                                                        <span>{item.duration}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500 text-center py-4">최근 참여한 클래스가 없습니다.</div>
                            )}
                        </div>
                    </div>

                    {/* 오른쪽 칼럼: 최근 시뮬레이션 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Trophy size={20} className="text-orange-600" />
                                최근 시뮬레이션
                            </h3>
                            <button
                                onClick={() => {
                                    // 전체 히스토리로 이동하거나 클래스 리스트로 이동
                                    navigate(ROUTES.COMMON.CLASS_LIST);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                            >
                                더보기
                                <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentSimulations.length > 0 ? (
                                recentSimulations.map((item, index) => {
                                    const resultsLink = item.classId && item.sessionId 
                                        ? ROUTES.COMMON.CLASS_RESULTS(item.classId, item.sessionId)
                                        : null;
                                    
                                    return (
                                        <div 
                                            key={item.id} 
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => {
                                                if (resultsLink) {
                                                    navigate(resultsLink);
                                                }
                                            }}
                                        >
                                            <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-900 truncate mb-1">{item.title}</div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar size={12} />
                                                        <span>{item.createdDate}</span>
                                                        {item.duration && (
                                                            <>
                                                                <span>·</span>
                                                                <Clock size={12} />
                                                                <span>{item.duration}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-blue-500 flex items-center gap-2 flex-shrink-0">
                                                    <Badge variant="outline" className="text-sm border-blue-500 border">
                                                        {item.mode === 'training' ? '학습모드' : item.mode === 'evaluation' ? '평가모드' : item.mode || 'N/A'}
                                                    </Badge>
                                                    {item.score !== undefined && item.score !== null && (
                                                        <>
                                                            <span>·</span>
                                                            <span className="font-medium text-gray-900">{item.score}점</span>
                                                            <GradeBadge score={item.score} className="w-24 justify-center" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-base text-gray-500 text-center py-4">최근 시뮬레이션이 없습니다.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
