
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LockOpen, Key, Loader2 } from 'lucide-react';
import { ClassItem } from '../../data/classes';
import { PageHeader, Pagination, Button } from '@/components/shared/ui';
import JoinByCodeModal from './JoinByCodeModal';
import { useClasses } from '../../data/queries/useClasses';
import { useAuth } from '../../contexts/AuthContext';
import { getMyClassStatusMap, getDisplayStatus, setMyClassStatus, DISPLAY_STATUS_LABELS, type MyClassDisplayStatus } from '../../utils/myClassStatus';

const ITEMS_PER_PAGE = 6;

type StatusFilter = 'all' | 'eligible' | 'participating' | 'completed' | 'ended';

export default function MyClassList(): React.ReactElement {
    const navigate = useNavigate();
    const { user, getCurrentRole } = useAuth();
    const role = getCurrentRole();
    const basePath = role === 'master' ? '/master' : '/student';
    const organizationId = user?.currentAccount?.organizationId;

    const { classes, loading, error } = useClasses(organizationId);
    const [currentPage, setCurrentPage] = useState(1);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const allClasses = Object.values(classes) as ClassItem[];
    const myClassStatusMap = getMyClassStatusMap();
    const participatingClasses = JSON.parse(localStorage.getItem('participatingClasses') || '{}') as Record<string, boolean>;

    // Initialize mock myClassStatus for demo (참여중 2개, 참여가능 1개)
    useEffect(() => {
        const map = getMyClassStatusMap();
        if (Object.keys(map).length === 0) {
            setMyClassStatus('001', 'participating');
            setMyClassStatus('002', 'participating');
            setMyClassStatus('003', 'eligible');
        }
    }, []);

    // 마이클래스 목록 = myClassStatus 또는 기존 participatingClasses에 있는 클래스
    const myClassesList = allClasses.filter(item => myClassStatusMap[item.id] != null || participatingClasses[item.id]);

    const today = new Date();

    // 표시용 상태 (종료 = 수강기간 종료). 기존 participatingClasses만 있으면 'participating'으로 간주
    const getItemDisplayStatus = (item: ClassItem): MyClassDisplayStatus =>
        getDisplayStatus(myClassStatusMap[item.id] ?? (participatingClasses[item.id] ? 'participating' : undefined), item.participationPeriod?.endDate);

    // 참여중인 클래스 (상태=참여중, 수강기간 내) — 상단 요약용
    const activeClasses = myClassesList.filter(item => {
        if (getItemDisplayStatus(item) !== 'participating') return false;
        if (!item.participationPeriod) return false;
        const startDate = new Date(item.participationPeriod.startDate);
        const endDate = new Date(item.participationPeriod.endDate);
        return today >= startDate && today <= endDate;
    });

    // 상태별 필터
    const getFilteredClasses = (): ClassItem[] => {
        if (statusFilter === 'all') return myClassesList;
        return myClassesList.filter(item => getItemDisplayStatus(item) === statusFilter);
    };

    const filteredClasses = getFilteredClasses();

    const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);

    const currentClasses = filteredClasses.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-gray-500">클래스 목록을 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="pb-8">
            <PageHeader
                title="마이 클래스"
                description="참여 중인 클래스의 학습 현황을 확인하고 계속해서 학습을 이어가세요."
                align="center"
                withBackground
                breadcrumbs={[{ label: '마이 클래스' }]}
                actions={
                    <Button
                        variant="outline"
                        className="border-brand-500 text-brand-600"
                        onClick={() => setIsJoinModalOpen(true)}
                    >
                        초대코드 등록
                    </Button>
                }
            />

            {/* 마이클래스 목록 (상태별) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-wrap gap-2">
                        {(['all', 'eligible', 'participating', 'completed', 'ended'] as const).map((key) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setStatusFilter(key);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === key
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {key === 'all' ? '전체' : DISPLAY_STATUS_LABELS[key]}
                            </button>
                        ))}
                    </div>
                </div>
                {currentClasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                        <p className="text-lg">
                            {statusFilter === 'all' && '마이클래스가 없습니다.'}
                            {statusFilter !== 'all' && `${DISPLAY_STATUS_LABELS[statusFilter]} 클래스가 없습니다.`}
                        </p>
                    </div>
                ) : (
                    currentClasses.map((item) => {
                        const displayStatus = getItemDisplayStatus(item);
                        const isEnded = displayStatus === 'ended';

                        const statusBadgeClass: Record<MyClassDisplayStatus, string> = {
                            eligible: 'bg-blue-500 text-white',
                            participating: 'bg-green-500 text-white',
                            completed: 'bg-amber-500 text-white',
                            ended: 'bg-gray-500 text-white',
                        };

                        return (
                            <div
                                key={item.id}
                                onClick={() => navigate(`${basePath}/my-classes/${item.id}`)}
                                className={`flex flex-col md:flex-row rounded-xl border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group ${isEnded ? 'bg-gray-50 border-gray-300 opacity-75' : 'bg-white border-gray-200'
                                    }`}
                            >
                                {/* Thumbnail */}
                                <div className={`md:w-64 h-48 md:h-auto shrink-0 relative overflow-hidden ${isEnded ? 'bg-gray-200' : 'bg-gray-100'}`}>
                                    {item.thumbnail ? (
                                        <img
                                            src={item.thumbnail}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusBadgeClass[displayStatus]}`}>
                                            {DISPLAY_STATUS_LABELS[displayStatus]}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <h3 className={`text-xl font-bold transition-colors mb-2 ${isEnded ? 'text-gray-700 group-hover:text-gray-900' : 'text-gray-900 group-hover:text-gray-900'
                                            }`}>
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 text-base leading-relaxed line-clamp-2 mb-4">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 text-sm text-gray-500 pt-4 mt-auto">
                                        <div className="flex items-center gap-4">
                                            {item.participationPeriod && (
                                                <>
                                                    참여기간&nbsp;<span className="text-brand-600 font-medium">{item.participationPeriod.startDate} ~ {item.participationPeriod.endDate}</span>
                                                    <span className="w-px h-3 bg-gray-300" />
                                                </>
                                            )}
                                            <span>
                                                세션 수 &nbsp;<span className="text-brand-600 font-medium">{item.curriculum.length}</span>
                                            </span>
                                            {item.duration && (
                                                <>
                                                    <span className="w-px h-3 bg-gray-300" />
                                                    소요시간&nbsp;<span className="font-semibold text-brand-600">{item.duration}</span>
                                                </>
                                            )}
                                        </div>
                                        {item.password && (
                                            <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold min-w-20 text-gray-500 border border-gray-400">
                                                <Lock size={12} />
                                                비공개
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-8 mb-12">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            <JoinByCodeModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />
        </div>
    );
}
