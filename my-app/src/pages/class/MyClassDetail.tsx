import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Share2, Users, Edit, Calendar, Info, Globe, Building, CheckCircle, Lock, Key, PlayCircle, Copy, Settings, Award, Download, Loader2, ArrowLeft } from 'lucide-react';
import { PageHeader, Button, Badge, Input, Modal } from '@/components/shared/ui';
import { ClassItem } from '../../data/classes';
import { useAuth } from '../../contexts/AuthContext';
import ClassParticipantModal from './ClassParticipantModal';
import { useClass } from '../../data/queries/useClasses';
import { getMyClassStatusMap, setMyClassStatus, getDisplayStatus, DISPLAY_STATUS_LABELS, type MyClassStoredStatus } from '../../utils/myClassStatus';

export default function MyClassDetail(): React.ReactElement {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { id } = useParams<{ id: string }>();
    const { getCurrentRole, isPremiumUser, user } = useAuth();
    const role = getCurrentRole();
    const isPremium = isPremiumUser();

    // Find class data - support both URL params and search params
    const classId = id || searchParams.get('tab') || '001';
    const { classData, loading, error } = useClass(classId);

    // All hooks must be called before any early returns
    const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState((!classData?.password) || role === 'admin');
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPasswordInput, setNewPasswordInput] = useState('');

    // 마이클래스 상태 (eligible | participating | completed). 기존 participatingClasses만 있으면 'participating'으로 간주
    const [myClassStoredStatus, setMyClassStoredStatus] = useState<MyClassStoredStatus | null>(() => {
        const stored = getMyClassStatusMap()[classId];
        if (stored) return stored;
        const participating = (JSON.parse(localStorage.getItem('participatingClasses') || '{}') as Record<string, boolean>)[classId];
        return participating ? 'participating' : null;
    });
    const isParticipating = myClassStoredStatus === 'participating' || myClassStoredStatus === 'completed';

    useEffect(() => {
        setIsUnlocked((!classData?.password) || role === 'admin');
        setPasswordInput('');
        setPasswordError(false);
    }, [classData, role]);

    // 수강기간 만료 확인
    const isExpired = useMemo(() => {
        if (!classData?.participationPeriod) return false;
        const today = new Date();
        const endDate = new Date(classData.participationPeriod.endDate);
        return today > endDate;
    }, [classData?.participationPeriod]);

    // Mock: 이수목표 달성율 계산 (실제로는 API에서 가져와야 함)
    const completionRate = useMemo(() => {
        if (!classData?.completionRequirements) return 0;
        // 실제로는 사용자의 클래스 완료 상태를 확인해야 함
        return Math.floor(Math.random() * 100);
    }, [classData?.completionRequirements]);

    // 이수완료: 이수조건 도달 시 true (실제로는 API/진행률 기반)
    const isCompleted = completionRate >= 100; // completionRate 100% 달성 시 이수완료

    // 참여 시작 핸들러 (세션 시작 클릭 → 참여중)
    const handleStartParticipation = () => {
        setMyClassStatus(classId, 'participating');
        setMyClassStoredStatus('participating');
    };

    // 이수조건 도달 시 상태를 이수완료로 저장
    useEffect(() => {
        if (!isCompleted) return;
        const current = getMyClassStatusMap()[classId];
        if (current !== 'completed') {
            setMyClassStatus(classId, 'completed');
            setMyClassStoredStatus('completed');
        }
    }, [classId, isCompleted]);

    // Early return after all hooks
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-gray-500">클래스 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Info className="w-12 h-12 text-gray-400" />
                <h2 className="text-xl font-bold text-gray-900">클래스를 찾을 수 없습니다.</h2>
                <Button variant="outline" onClick={() => navigate(-1)}>뒤로가기</Button>
            </div>
        );
    }

    const handleUnlock = () => {
        if (passwordInput === classData.password) {
            setIsUnlocked(true);
            setPasswordError(false);
        } else {
            setPasswordError(true);
        }
    };

    if (!isUnlocked) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="text-gray-500" size={32} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900">비공개 클래스</h2>
                        <p className="text-gray-500">
                            이 클래스는 비공개로 설정되어 있습니다.<br />
                            접근하려면 비밀번호를 입력해주세요.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-gray-700 ml-1">비밀번호</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    type="password"
                                    placeholder="비밀번호 입력"
                                    className={`pl-10 ${passwordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                                />
                            </div>
                            {passwordError && (
                                <p className="text-xs text-red-500 ml-1">비밀번호가 일치하지 않습니다.</p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                                뒤로가기
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleUnlock}
                            >
                                확인
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const {
        title,
        thumbnail,
        description,
        participationPeriod,
        completionRequirements,
        maxParticipants = 0,
        currentParticipants = 0,
        curriculum: rawCurriculum
    } = classData;
    const curriculum = rawCurriculum ?? [];

    const isFull = currentParticipants >= maxParticipants;

    // 이수증 다운로드 핸들러
    const handleDownloadCertificate = () => {
        console.log('이수증 다운로드:', classData.id);
        alert('이수증 다운로드 기능은 준비 중입니다.');
    };

    return (
        <div className="pb-12">
            <PageHeader
                title={title}
                description={description}
                align="center"
                withBackground
                breadcrumbs={[
                    { label: "마이 클래스", link: "/student/my-classes" },
                    { label: title }
                ]}
                actions={
                    <div className="flex items-center gap-3">
                        {(() => {
                            const displayStatus = getDisplayStatus(myClassStoredStatus ?? undefined, classData?.participationPeriod?.endDate);
                            const badgeClass = displayStatus === 'eligible' ? 'bg-blue-500' : displayStatus === 'participating' ? 'bg-green-500' : displayStatus === 'completed' ? 'bg-amber-500' : 'bg-gray-500';
                            return (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${badgeClass} text-white`}>
                                    {DISPLAY_STATUS_LABELS[displayStatus]}
                                </span>
                            );
                        })()}
                    </div>
                }
            />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column */}
                <div className="flex-1 space-y-6">
                    <div className="space-y-4">

                        {/* Thumbnail */}
                        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                            {thumbnail ? (
                                <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span>No Thumbnail</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">커리큘럼</h3>
                            <span className="text-sm text-gray-500">
                                총 {curriculum.length}개 세션
                                <span className="mx-2">/</span>
                                {(() => {
                                    const totalMinutes = curriculum.reduce((acc, item) => {
                                        const match = item.duration?.match(/(\d+)분/);
                                        return match ? acc + parseInt(match[1], 10) : acc;
                                    }, 0);
                                    const hours = Math.floor(totalMinutes / 60);
                                    const minutes = totalMinutes % 60;
                                    return hours > 0 ? `${hours}시간 ${minutes > 0 ? `${minutes}분` : ''}` : `${totalMinutes}분`;
                                })()}
                            </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {curriculum.map((item, index) => (
                                <div key={item.id} className="p-4 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                                    <span className="text-gray-500 text-sm font-medium w-10 text-center">{index + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant="outline"
                                                className={`text-sm w-24 justify-center ${item.type === 'video'
                                                    ? 'text-green-500 border-green-500'
                                                    : 'text-blue-500 border-blue-500'
                                                    }`}
                                            >
                                                {item.type === 'video' ? '동영상' : '시뮬레이션'}
                                            </Badge>
                                            <h4 className="text-base font-medium text-gray-900">
                                                {item.name}
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-base text-gray-500 w-16 text-right">
                                            {item.duration}
                                        </span>
                                        {item.type === 'scenario' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-sm"
                                                onClick={() => navigate(`/class/${classId}/results/${item.id}`)}
                                            >
                                                결과보기
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-full lg:w-1/3 space-y-6">

                    <div className="bg-white rounded-xl border border-blue-400 p-6 shadow-sm space-y-4">
                        {(classData.organizationLogo || classData.organizationName) && (
                            <div className="flex items-center justify-between text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-2">
                                {classData.organizationLogo ? (
                                    <img
                                        src={classData.organizationLogo}
                                        alt={classData.organizationName || '기관 로고'}
                                        className="h-6 object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentElement;
                                            if (parent && classData.organizationName) {
                                                const text = document.createElement('div');
                                                text.className = 'text-sm text-gray-600 font-medium';
                                                text.textContent = classData.organizationName;
                                                parent.appendChild(text);
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="text-xl font-bold text-blue-500 py-3">
                                        {classData.organizationName}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            {classData.participationMethod && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700 text-sm flex items-center gap-2">
                                        <Globe size={16} className="text-gray-400" /> 참여방법
                                    </span>
                                    <span className="font-medium text-gray-900 text-sm">
                                        {classData.participationMethod}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 text-sm flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" /> 수강기간
                                </span>
                                <span className="font-medium text-gray-900 text-sm">
                                    {participationPeriod
                                        ? `${participationPeriod.startDate} ~ ${participationPeriod.endDate}`
                                        : '30일'}
                                </span>
                            </div>

                            <div className="flex items-start justify-between">
                                <span className="text-gray-700 text-sm flex items-center gap-2 mt-0.5 shrink-0">
                                    <CheckCircle size={16} className="text-gray-400" /> 이수목표
                                </span>
                                <span className="font-medium text-gray-900 text-sm text-right">
                                    {completionRequirements
                                        ? `${completionRequirements.requireAllScenarios ? '모든 시나리오' : `시나리오 ${completionRequirements.minScenarios}개`} 최소 ${completionRequirements.minPassingScore}점`
                                        : '이수 목표 없음'
                                    }
                                </span>
                            </div>
                        </div>

                        {/* 참여안내 */}
                        {classData.participationInfo && (
                            <div className="pt-3 pb-2 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-2">참여안내</h4>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {classData.participationInfo}
                                </p>
                            </div>
                        )}

                        {/* 이수율 (MyClass Special Section) */}
                        <div className="py-6 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-base font-semibold text-gray-900">이수율</h4>
                                <span className="font-bold text-lg text-blue-600">{completionRate || 0}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ease-out ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ width: `${Math.min(completionRate || 0, 100)}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-800 font-medium mt-2 text-right">
                                {isCompleted ? '이수 목표를 달성했습니다!' : '열심히 학습하여 목표를 달성해보세요.'}
                            </p>
                        </div>

                        {/* 마이클래스 전용 액션: 세션 참여, 이수증 다운로드 (수강신청/장바구니/견적문의 없음) */}
                        <div className="pt-2 flex flex-col gap-2">
                            {isExpired ? (
                                <Button variant="outline" size="lg" className="w-full" disabled>
                                    클래스 종료됨
                                </Button>
                            ) : isParticipating ? (
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full shadow-md hover:shadow-lg transition-all"
                                    onClick={() => {
                                        const list = curriculum?.length ? curriculum : [];
                                        if (list.length > 0) {
                                            navigate(`/class/${classId}/curriculum/${list[0].id}`);
                                        } else {
                                            alert('참여 가능한 세션이 없습니다.');
                                        }
                                    }}
                                >
                                    세션 참여
                                </Button>
                            ) : (
                                <Button variant="primary" size="lg" className="w-full shadow-md hover:shadow-lg transition-all" onClick={handleStartParticipation}>
                                    세션 시작
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="lg"
                                className={`w-full ${isCompleted ? 'border-blue-200 text-blue-600 hover:bg-blue-50' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-50 hover:text-gray-800'}`}
                                onClick={handleDownloadCertificate}
                                disabled={!isCompleted}
                            >
                                <Download size={16} className="mr-2" />
                                이수증 다운로드
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
