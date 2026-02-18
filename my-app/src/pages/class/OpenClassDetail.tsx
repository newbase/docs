/**
 * 오픈클래스 상세 페이지 (product-detail, open-class/:id, class-management/:id, products/:id)
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Users, Edit, Calendar, Info, Globe, Building, CheckCircle, PlayCircle, Copy, Settings, Award, Download, Loader2, ShoppingCart } from 'lucide-react';
import {
    PageHeader,
    Button,
    Badge,
    Input,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/shared/ui';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/shared/ui';
import JoinByCodeModal from './JoinByCodeModal';
import { ClassItem } from '../../data/classes';
import { useAuth } from '../../contexts/AuthContext';
import ClassParticipantModal from './ClassParticipantModal';
import { useClass } from '../../data/queries/useClasses';
import { getUsersByOrgId } from '../../data/organizationUsers';

// 수강일수 계산 헬퍼 함수
const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export default function OpenClassDetail(): React.ReactElement {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { id } = useParams<{ id: string }>();
    const { getCurrentRole, isPremiumUser, user } = useAuth();
    const role = getCurrentRole();
    const isPremium = isPremiumUser();
    const basePath = role === 'master' ? '/master' : role === 'admin' ? '/admin' : '';

    // Find class data - support both URL params (management routes) and search params (user routes)
    const classId = id || searchParams.get('tab') || '001';
    const { classData, loading, error } = useClass(classId);

    const isManagerPath = basePath.includes('master') || basePath.includes('admin');
    const isLicensedManager = isManagerPath && isPremium;
    const isLicensedParticipant = !isManagerPath && isPremium;

    const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
    const [isJoinByCodeModalOpen, setIsJoinByCodeModalOpen] = useState(false);
    const [adminActiveTab, setAdminActiveTab] = useState<'curriculum' | 'participants'>('curriculum');

    useEffect(() => {
        const raw = localStorage.getItem('participatingClasses') || '{}';
        const participatingClasses = JSON.parse(raw) as Record<string, boolean>;
        if (classId === '001' || classId === '01') {
            if (participatingClasses[classId]) {
                delete participatingClasses[classId];
                localStorage.setItem('participatingClasses', JSON.stringify(participatingClasses));
            }
        } else if (participatingClasses[classId] && !isManagerPath) {
            navigate(`/student/my-classes/${classId}`, { replace: true });
        }
    }, [classId, navigate, isManagerPath]);

    // 어드민 참가자 목록 (이름, ID, 소속기관, 직무, 직책, 이수율) — 목업. 훅 규칙 준수를 위해 early return 이전에 호출.
    // 직무: 간호사, 의사, 구급대원 / 참가자 역할: Master, Student, Guest
    const JOB_TYPES = ['의사', '간호사', '구급대원'] as const;
    const adminParticipantList = useMemo(() => {
        if ((role !== 'admin' && role !== 'master') || !classData) return [];
        const orgId = (classData as ClassItem & { organizationId?: number })?.organizationId != null
            ? `ORG${String((classData as ClassItem & { organizationId?: number }).organizationId).padStart(3, '0')}`
            : 'ORG001';
        const users = getUsersByOrgId(orgId).slice(0, 10);
        return users.map((u, i) => ({
            name: u.name,
            id: String(u.id),
            organizationName: u.organizationName ?? '메디크루 의원',
            jobType: (u.specialty && JOB_TYPES.includes(u.specialty as typeof JOB_TYPES[number]) ? u.specialty : JOB_TYPES[i % 3]),
            position: u.position ?? u.department ?? '—',
            participantRole: u.role ?? '—',
            completionRate: [0, 25, 50, 75, 100][i % 5],
        }));
    }, [role, classData]);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !classData) {
        return (
            <div className="flex h-[400px] items-center justify-center text-gray-500">
                클래스 정보를 찾을 수 없습니다.
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
        completionRate = 0,
        curriculum: rawCurriculum
    } = classData;
    const curriculum = rawCurriculum ?? [];

    const isInPerson = !!(classData.educationVenue || classData.educationSchedule);
    const participationDays = participationPeriod
        ? calculateDays(participationPeriod.startDate, participationPeriod.endDate)
        : 30;

    const isFull = currentParticipants >= maxParticipants;
    const isExpired = participationPeriod && new Date(participationPeriod.endDate) < new Date();
    const isCompleted = completionRate >= 100;

    const handleDownloadCertificate = () => {
        alert('이수증 발급 기능은 준비 중입니다.');
    };

    return (
        <div className="pb-12">
            <PageHeader
                title={title}
                description={description}
                align="center"
                withBackground
                breadcrumbs={[
                    { label: isManagerPath ? '오픈클래스 관리' : '오픈클래스', link: isManagerPath ? `${basePath}/product-management` : '/open-class-list' },
                    { label: title }
                ]}
                actions={isExpired ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-500 text-white">
                        종료됨
                    </span>
                ) : undefined}
            />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column */}
                <div className="flex-1 space-y-6">
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

                    {(role === 'admin' || role === 'master') ? (
                        <Tabs value={adminActiveTab} onValueChange={(v) => setAdminActiveTab(v as 'curriculum' | 'participants')} className="w-full">
                            <TabsList className="w-full grid grid-cols-2 rounded-lg bg-gray-100 p-1">
                                <TabsTrigger value="curriculum" className="rounded-md">커리큘럼</TabsTrigger>
                                <TabsTrigger value="participants" className="rounded-md">참가자</TabsTrigger>
                            </TabsList>
                            <TabsContent value="curriculum" className="mt-4">
                                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                        <h3 className="font-bold text-gray-900">커리큘럼</h3>
                                        <span className="text-sm text-gray-700">
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
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            {item.name}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-gray-500 w-16 text-right">
                                                        {item.duration}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="participants" className="mt-4">
                                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                        <h3 className="font-bold text-gray-900">참가자</h3>
                                        <span className="text-sm text-gray-700">
                                            총 {adminParticipantList.length}명
                                        </span>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="px-4 py-3">이름</TableHead>
                                                <TableHead className="px-4 py-3">ID</TableHead>
                                                <TableHead className="px-4 py-3">소속기관</TableHead>
                                                <TableHead className="px-4 py-3">직무</TableHead>
                                                <TableHead className="px-4 py-3">직책</TableHead>
                                                <TableHead className="px-4 py-3">이수율</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {adminParticipantList.map((row, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="px-4 py-2 font-medium text-gray-900">{row.name}</TableCell>
                                                    <TableCell className="px-4 py-2 text-gray-600">{row.id}</TableCell>
                                                    <TableCell className="px-4 py-2 text-gray-600">{row.organizationName}</TableCell>
                                                    <TableCell className="px-4 py-2 text-gray-600">{row.jobType}</TableCell>
                                                    <TableCell className="px-4 py-2 text-gray-600">{row.position}</TableCell>
                                                    <TableCell className="px-4 py-2">
                                                        {row.participantRole === 'Master' ? (
                                                            <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                                                                Master
                                                            </Badge>
                                                        ) : (
                                                            <span className={row.completionRate >= 100 ? 'text-green-600 font-medium' : 'text-gray-700'}>
                                                                {row.completionRate}%
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {adminParticipantList.length === 0 && (
                                        <div className="p-8 text-center text-gray-500 text-sm">참가자가 없습니다.</div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-900">커리큘럼</h3>
                                <span className="text-sm text-gray-700">
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
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {item.name}
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-500 w-16 text-right">
                                                {item.duration}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <div className="bg-white rounded-xl border border-blue-400 p-6 shadow-sm space-y-4">
                        {(classData.organizationLogo || classData.organizationName) && (
                            <div className="flex items-center justify-between text-lg font-bold text-gray-900">
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
                            {isInPerson ? (
                                /* 대면교육: 모집기간, 모집인원, 수강기간, 참여정보, 이수목표, 수강료/할인가/할인정보 */
                                <>
                                    {classData.recruitmentPeriod && (
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-gray-500 text-sm flex items-center gap-2 shrink-0">
                                                <Calendar size={16} className="text-gray-400" />
                                                모집기간
                                            </span>
                                            <span className="font-medium text-gray-900 text-sm text-right">
                                                {classData.recruitmentPeriod.startDate} ~ {classData.recruitmentPeriod.endDate}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-gray-500 text-sm flex items-center gap-2 shrink-0">
                                            <Users size={16} className="text-gray-400" />
                                            모집인원
                                        </span>
                                        <span className="font-medium text-gray-900 text-sm">
                                            {currentParticipants} / {maxParticipants}명
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-gray-500 text-sm flex items-center gap-2 shrink-0">
                                            <Calendar size={16} className="text-gray-400" />
                                            수강기간
                                        </span>
                                        <span className="font-medium text-gray-900 text-sm text-right">
                                            {participationPeriod
                                                ? `${participationPeriod.startDate} ~ ${participationPeriod.endDate}`
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-gray-500 text-sm flex items-center gap-2 shrink-0">
                                            <CheckCircle size={16} className="text-gray-400" />
                                            이수목표
                                        </span>
                                        <span className="font-medium text-gray-900 text-sm text-right">
                                            {completionRequirements
                                                ? `${completionRequirements.requireAllScenarios ? '모든 시나리오' : `시나리오 ${completionRequirements.minScenarios}개`} 최소 ${completionRequirements.minPassingScore}점`
                                                : '—'}
                                        </span>
                                    </div>
                                    {classData.participationInfo ? (
                                        <div className="pt-2 border-t border-gray-100">
                                            <h4 className="text-sm font-bold text-gray-900 mb-1.5">참여정보</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                {classData.participationInfo}
                                            </p>
                                        </div>
                                    ) : null}
                                </>
                            ) : (
                                /* 온라인교육: 수강기간(00일, 디폴트 30일), 이수목표 */
                                <>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-gray-500 text-sm flex items-center gap-2 shrink-0">
                                            <Calendar size={16} className="text-gray-400" />
                                            수강기간
                                        </span>
                                        <span className="font-medium text-gray-900 text-sm text-right">
                                            {participationDays}일
                                        </span>
                                    </div>
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-gray-500 text-sm flex items-center gap-2 shrink-0">
                                            <CheckCircle size={16} className="text-gray-400" />
                                            이수목표
                                        </span>
                                        <span className="font-medium text-gray-900 text-sm text-right">
                                            {completionRequirements
                                                ? `${completionRequirements.requireAllScenarios ? '모든 시나리오' : `시나리오 ${completionRequirements.minScenarios}개`} 최소 ${completionRequirements.minPassingScore}점`
                                                : '—'}
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* 수강료, 할인가, 할인정보 (대면/온라인 공통) */}
                            <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-right">
                                        {classData.discountPrice !== undefined ? (
                                            <>
                                                {classData.price !== undefined && (
                                                    <span className="font-medium text-sm text-gray-400 line-through mr-1.5">
                                                        {classData.price.toLocaleString()}원
                                                    </span>
                                                )}
                                                <span className="font-semibold text-base text-blue-600">
                                                    {classData.discountPrice.toLocaleString()}원
                                                </span>
                                            </>
                                        ) : classData.price !== undefined ? (
                                            <span className="font-medium text-sm text-gray-900">{classData.price.toLocaleString()}원</span>
                                        ) : (
                                            '—'
                                        )}
                                    </span>
                                </div>
                                {classData.discountInfo && (
                                    <div className="text-xs text-red-500 text-right">
                                        {classData.discountInfo}
                                    </div>
                                )}
                            </div>
                        </div>

                        
                        {/* Manager: 역할별 버튼 (견적 문의, 주문조회 등) */}
                        <div className="pt-2 flex flex-col gap-2">
                            {isManagerPath ? (
                                (isLicensedManager && (
                                    <div className="flex gap-2">
                                        {role === 'master' ? (
                                            <>
                                                <Button variant="primary" size="md" className="flex-1" onClick={() => alert('견적 문의 기능은 준비 중입니다.')}>
                                                    견적 문의
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="md"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        const savedCart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')!) : [];
                                                        if (!savedCart.includes(classId)) {
                                                            savedCart.push(classId);
                                                            localStorage.setItem('cart', JSON.stringify(savedCart));
                                                            alert('장바구니에 담았습니다.');
                                                        } else {
                                                            alert('이미 장바구니에 담긴 클래스입니다.');
                                                        }
                                                    }}
                                                >
                                                    <ShoppingCart size={16} className="mr-2" />
                                                    장바구니 담기
                                                </Button>
                                            </>
                                        ) : role === 'admin' ? (
                                            <Button variant="primary" size="md" className="flex-1" onClick={() => navigate(`${basePath}/order-management`)}>
                                                주문조회
                                            </Button>
                                        ) : null}
                                    </div>
                                ))
                            ) : (
                                /* Student: 수강신청하기, 장바구니 담기, 초대코드 등록 */
                                <>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="primary"
                                            size="md"
                                            className="flex-1"
                                            onClick={() => {
                                                const finalPrice = classData.discountPrice !== undefined ? classData.discountPrice : (classData.price || 0);
                                                navigate('/order-confirm', { state: { selectedClassIds: [classId], totalPrice: finalPrice } });
                                            }}
                                            disabled={isExpired}
                                        >
                                            수강신청하기
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="md"
                                            className="flex-1"
                                            onClick={() => {
                                                const savedCart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')!) : [];
                                                if (!savedCart.includes(classId)) {
                                                    savedCart.push(classId);
                                                    localStorage.setItem('cart', JSON.stringify(savedCart));
                                                    alert('장바구니에 담았습니다.');
                                                } else {
                                                    alert('이미 장바구니에 담긴 클래스입니다.');
                                                }
                                            }}
                                        >
                                            <ShoppingCart size={16} className="mr-2" />
                                            장바구니 담기
                                        </Button>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="md"
                                        className="w-full text-gray-600 border border-gray-200 hover:bg-gray-50"
                                        onClick={() => setIsJoinByCodeModalOpen(true)}
                                    >
                                        초대코드 등록
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {isLicensedManager && (
                        <div className="bg-white rounded-xl border border-blue-400 p-6 shadow-sm space-y-6">
                            <h3 className="font-semibold text-gray-900 text-base">클래스 현황</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">참여자 수</span>
                                    <span className="font-medium text-gray-900 text-sm">
                                        <span className={isFull ? "text-red-600" : ""}>{currentParticipants}</span>
                                        <span className="text-gray-400 mx-1">/</span>
                                        {maxParticipants}명
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min((currentParticipants / maxParticipants) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">이수율</span>
                                    <span className="font-medium text-gray-900">{completionRate}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-green-500"
                                        style={{ width: `${Math.min(completionRate, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="md"
                                        className="w-full"
                                        onClick={() => {
                                            const firstSessionId = classData.curriculum?.[0]?.id;
                                            if (firstSessionId) {
                                                navigate(`${basePath}/class-management/${classData.id}/results/${firstSessionId}`);
                                            } else {
                                                setIsParticipantModalOpen(true);
                                            }
                                        }}
                                    >
                                        <Users size={16} className="mr-2" />
                                        참가자 평가관리
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="md"
                                        className="flex-1 text-gray-600"
                                        onClick={() => navigate(`${basePath}/class/edit/${classData.id}`)}
                                    >
                                        <Edit size={14} className="mr-1.5" />
                                        클래스 변경
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="md"
                                        className="flex-1 text-gray-600"
                                        onClick={() => navigate(`${basePath}/open-class/create`, { state: { duplicateFrom: classData } })}
                                    >
                                        <Copy size={14} className="mr-1.5" />
                                        클래스 복제
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ClassParticipantModal
                isOpen={isParticipantModalOpen}
                onClose={() => setIsParticipantModalOpen(false)}
                classData={classData}
                currentUserOrgId="ORG001"
            />

            <JoinByCodeModal
                isOpen={isJoinByCodeModalOpen}
                onClose={() => setIsJoinByCodeModalOpen(false)}
            />
        </div>
    );
}
