import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from '@/components/shared/ui';
import { DateRangeFilter } from '@/components/shared/ui';
import { Plus, Users as UsersIcon, BookOpen } from 'lucide-react';
import { FullScreenLayout } from '../../routes/layouts/FullScreenLayout';
import { FullScreenHeader } from '@/components/shared/layout';
import { useAuth } from '../../contexts/AuthContext';
import { organizationsData } from '../../data/organizations';
import { getLicensesByOrgId } from '../../data/organizationLicenses';
import { getUsersByLicenseId } from '../../data/organizationUsers';
import { getDevicesByLicenseId } from '../../data/organizationDevices';
import UserList from '../users/UserList';
import DeviceList from '../devices/DeviceList';
import AddMemberModal from '../users/modals/AddMemberModal';
import CreateGuestModal from '../users/modals/CreateGuestModal';
import { Organization, License, User, Device } from '../../types/admin';
import { useLicenseDetail } from '@/hooks/useLicense';
import { DataSourceTabs, ApiStatusBox } from '@/components/shared/DataSourceTabs';
import { getScenarioListByLicense } from '../../services/scenarioService';
import type { ScenarioItemDto, GetScenarioListByLicenseResponseDto } from '../../types/api/scenario';
import { useRegisterOrganizationMembers, useBulkCreateUsers } from '@/hooks/useUserManagement';
import AlertDialog from '@/components/shared/ui/AlertDialog';

export default function LicenseDetail(): React.ReactElement {
    const { orgId, licenseId } = useParams<{ orgId?: string; licenseId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    // 🔥 Mock/Real 데이터 소스 선택
    // 엄격하게: Real API를 기본값으로 사용 (기관에서 라이센스 등록 후 접속하는 경우)
    const [dataSource, setDataSource] = useState<'mock' | 'real'>('real');
    
    const [activeTab, setActiveTab] = useState<string>('users');
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);
    const [isCreateGuestModalOpen, setIsCreateGuestModalOpen] = useState<boolean>(false);

    // 라이센스별 시나리오 목록 (Real API만)
    const [scenariosByLicense, setScenariosByLicense] = useState<ScenarioItemDto[]>([]);
    const [scenariosTotalCount, setScenariosTotalCount] = useState<number>(0);
    const [scenariosLoading, setScenariosLoading] = useState<boolean>(false);
    const [scenariosError, setScenariosError] = useState<Error | null>(null);

    // Alert Dialog State
    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({
        isOpen: false,
        title: '',
        message: ''
    });

    // User Mutations
    const registerMembersMutation = useRegisterOrganizationMembers();
    const bulkCreateUsersMutation = useBulkCreateUsers();

    // Determine organization ID: from params (admin) or from user context (master)
    const rawOrganizationId = orgId || user?.currentAccount?.organizationId;
    
    // Normalize organization ID: convert org_XXX to ORGXXX format
    // 엄격하게: 숫자 ID는 그대로 사용 (백엔드 API는 숫자 ID를 기대)
    const normalizeOrgId = (id: string | null | undefined): string | null => {
        if (!id) return null;
        // 숫자만 있는 경우 그대로 반환 (백엔드 API용)
        if (/^\d+$/.test(id)) {
            return id;
        }
        // org_XXX 형식인 경우 ORGXXX로 변환 (Mock 데이터용)
        const normalized = id.replace(/^org_/i, 'ORG').toUpperCase();
        return normalized;
    };
    
    const organizationId = normalizeOrgId(rawOrganizationId);

    // 🌐 Real API 라이센스 상세 조회
    const { 
        data: realLicenseData, 
        isLoading: licenseLoading, 
        error: licenseError,
        refetch: refetchLicenses
    } = useLicenseDetail(
        organizationId || '',
        licenseId || '',
        {
            enabled: dataSource === 'real' && !!organizationId && !!licenseId,
            retry: 1,
        }
    );

    // Find organization data
    // 엄격하게: Real API 사용 시 organization 검증은 선택적 (백엔드에서 검증)
    const organization = organizationId 
        ? (organizationsData as Organization[]).find(org => org.id === organizationId)
        : null;
    
    // Real API 사용 시 organization이 없어도 계속 진행 (백엔드에서 검증)
    const shouldRequireOrganization = dataSource === 'mock';

    // 🔄 데이터 소스 선택 (Mock 또는 Real)
    const license = useMemo(() => {
        if (dataSource === 'mock') {
            // 🎭 Mock 데이터
            const licenses = organizationId ? getLicensesByOrgId(organizationId) : [];
            return licenses.find(l => l.id === licenseId);
        } else {
            // 🌐 Real API 데이터
            return realLicenseData || null;
        }
    }, [dataSource, organizationId, licenseId, realLicenseData]);

    // Default date range: from license start date to current date (or license end date if earlier)
    const defaultEndDate = useMemo(() => {
        if (!license) return new Date().toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        if (license.endDate) {
            return license.endDate < today ? license.endDate : today;
        }
        return today;
    }, [license?.endDate]);

    const [startDate, setStartDate] = useState<string>(license?.startDate || '');
    const [endDate, setEndDate] = useState<string>(defaultEndDate);

    // Get data for each tab (before early return to ensure hooks are called)
    const users: User[] = organizationId && licenseId && license ? getUsersByLicenseId(organizationId, licenseId) : [];
    const devices: Device[] = organizationId && licenseId && license ? getDevicesByLicenseId(organizationId, licenseId) : [];

    // Calculate license type flags (before early return)
    const isDeviceLicense = license ? (license.licenseType === '기기구독' || license.subscriptionType === 'device') : false;
    const isUserLicense = license ? (license.licenseType === '사용자구독' || license.subscriptionType === 'user') : false;

    // Calculate user statistics (before early return)
    const maxUsers = isDeviceLicense || !license ? null : (typeof license.maxUsers === 'string' 
        ? (license.maxUsers === '-' ? 0 : parseInt(license.maxUsers) || 0)
        : (license.maxUsers || 0));
    const activeUsers = license ? (typeof license.activeUsers === 'string' 
        ? parseInt(license.activeUsers) || 0 
        : (license.activeUsers || 0)) : 0;
    const totalUsers = license?.totalUsers || 0;
    const availableUsers = isDeviceLicense || !license ? null : (maxUsers !== null ? maxUsers - activeUsers : null);
    const membersCount = users.filter(u => u.accountType === '정회원').length;
    const guestsCount = users.filter(u => u.accountType === '게스트').length;

    // Calculate device statistics (before early return)
    const maxDevices = isUserLicense || !license ? null : (license.maxDevices || 0);
    const activeDevicesCount = devices.filter(d => d.status === 'active').length;
    const inactiveDevicesCount = devices.filter(d => d.status === 'inactive').length;

    // Calculate license info for modals (before early return)
    const licenseInfo = useMemo(() => {
        if (!license) {
            return {
                hasDeviceLicense: false,
                maxUsers: null,
                currentUsers: 0
            };
        }
        if (isDeviceLicense) {
            return {
                hasDeviceLicense: true,
                maxUsers: null,
                currentUsers: users.filter(u => u.status === 'active').length
            };
        }
        return {
            hasDeviceLicense: false,
            maxUsers: maxUsers,
            currentUsers: activeUsers,
            availableSlots: availableUsers !== null ? availableUsers : 0
        };
    }, [license, isDeviceLicense, maxUsers, activeUsers, availableUsers, users]);

    // Update dates when license changes
    useEffect(() => {
        if (license) {
            const today = new Date().toISOString().split('T')[0];
            const newEndDate = license.endDate && license.endDate < today ? license.endDate : today;
            setStartDate(license.startDate);
            setEndDate(newEndDate);
        }
    }, [license?.startDate, license?.endDate]);

    // 라이센스별 시나리오 목록 조회 (시나리오 탭 선택 시, Real API만)
    useEffect(() => {
        if (dataSource !== 'real' || activeTab !== 'scenarios' || !licenseId) {
            return;
        }
        const orgLicenseId = Number(licenseId);
        if (Number.isNaN(orgLicenseId)) {
            return;
        }
        let cancelled = false;
        setScenariosLoading(true);
        setScenariosError(null);
        getScenarioListByLicense({
            organizationLicenseId: orgLicenseId,
            page: 1,
            pageSize: 50,
        })
            .then((res: GetScenarioListByLicenseResponseDto) => {
                if (!cancelled) {
                    setScenariosByLicense(res.scenarioList ?? []);
                    setScenariosTotalCount(res.totalCount ?? 0);
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setScenariosError(err instanceof Error ? err : new Error('시나리오 목록을 불러오지 못했습니다.'));
                    setScenariosByLicense([]);
                    setScenariosTotalCount(0);
                }
            })
            .finally(() => {
                if (!cancelled) setScenariosLoading(false);
            });
        return () => { cancelled = true; };
    }, [dataSource, activeTab, licenseId]);

    // Format validity period (before early return)
    const validityPeriod = license?.endDate 
        ? `${license.startDate} ~ ${license.endDate}`
        : 'Lifetime';

    // Format license type with duration: "사용자구독(12개월)" 형식 (before early return)
    // Lifetime인 경우 기기구독만 "지정기기 영구사용" 형식으로 표시
    const formattedLicenseType = license?.duration === 'Lifetime' && license?.licenseType === '기기구독'
        ? '지정기기 영구사용'
        : (license?.duration && license.duration !== 'Lifetime'
            ? `${license.licenseType}(${license.duration})`
            : license?.licenseType || '');

    // Determine back navigation path based on route (before early return)
    const isAdminRoute = location.pathname.includes('/admin/');
    const backPath = isAdminRoute 
        ? `/admin/organizations/${organizationId}`
        : '/master/organization';

    // 로딩 상태
    const isLoading = dataSource === 'real' ? licenseLoading : false;
    const error = dataSource === 'real' ? licenseError : null;

    if (isLoading) {
        return (
            <section className="section-py">
                <div className="container">
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </section>
        );
    }

    // 엄격하게: Real API 사용 시 organization 검증은 선택적
    if (!organizationId) {
        return (
            <section className="section-py">
                <div className="container">
                    <p className="text-gray-600">기관 ID를 찾을 수 없습니다.</p>
                </div>
            </section>
        );
    }
    
    if (shouldRequireOrganization && !organization) {
        return (
            <section className="section-py">
                <div className="container">
                    <p className="text-gray-600">기관을 찾을 수 없습니다.</p>
                </div>
            </section>
        );
    }
    
    if (!license) {
        // Real API 에러가 있는 경우 표시
        if (dataSource === 'real' && licenseError) {
            return (
                <section className="section-py">
                    <div className="container">
                        <p className="text-red-600">
                            라이선스를 찾을 수 없습니다. 
                            {licenseError instanceof Error ? ` (${licenseError.message})` : ''}
                        </p>
                    </div>
                </section>
            );
        }
        return (
            <section className="section-py">
                <div className="container">
                    <p className="text-gray-600">라이선스를 찾을 수 없습니다.</p>
                </div>
            </section>
        );
    }

    // Header right content
    const headerRightContent = (
        <div className="flex items-center gap-4 text-base text-gray-700">
            <span>구독플랜: <span className="font-medium text-blue-500">{license.subscriptionPlan}</span></span>
            <span>유형: <span className="font-medium text-blue-500">{formattedLicenseType}</span></span>
            <span>유효기간: <span className="font-medium text-blue-500">{validityPeriod}</span></span>
        </div>
    );

    // Handlers
    const handleDeviceUpdate = (updatedDevice: Device) => {
        // TODO: Update device in state/backend
    };

    const handleAddMember = async (newMembers: Partial<User>[]) => {
        if (dataSource === 'mock') {
            setIsAddMemberModalOpen(false);
            return;
        }
        const orgIdNum = organizationId ? parseInt(organizationId, 10) : null;
        if (!orgIdNum || isNaN(orgIdNum)) {
            setAlertState({
                isOpen: true,
                title: '오류',
                message: '기관 ID를 찾을 수 없습니다.',
            });
            return;
        }
        const userIdList = newMembers
            .map((m) => (typeof m.id === 'number' ? m.id : parseInt(String(m.id), 10)))
            .filter((n) => !isNaN(n));
        if (userIdList.length === 0) {
            setAlertState({
                isOpen: true,
                title: '오류',
                message: '등록할 회원을 선택해주세요.',
            });
            return;
        }
        try {
            await registerMembersMutation.mutateAsync({
                organizationId: orgIdNum,
                userIdList,
            });
            setAlertState({
                isOpen: true,
                title: '등록 성공',
                message: `${newMembers.length}명의 정회원이 기관에 등록되었습니다.`,
            });
            setIsAddMemberModalOpen(false);
            refetchLicenses();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : '정회원 등록 중 오류가 발생했습니다.';
            setAlertState({
                isOpen: true,
                title: '등록 실패',
                message: msg,
            });
        }
    };

    const handleCreateGuest = async (guests: Partial<User>[]) => {
        if (dataSource === 'mock') {
            setIsCreateGuestModalOpen(false);
            return;
        }

        const orgIdNum = organizationId ? parseInt(organizationId.replace(/^ORG/i, ''), 10) : null;
        if (!orgIdNum || isNaN(orgIdNum)) {
            setAlertState({
                isOpen: true,
                title: '오류',
                message: '기관 ID를 찾을 수 없습니다.'
            });
            return;
        }

        // 엄격하게: Swagger BulkCreateUsers - 템플릿 A열: loginId, B열: pw, C열: realName
        try {
            const BOM = '\uFEFF';
            const header = 'loginId,pw,realName\n';
            const defaultPassword = '1234';
            const rows = guests
                .map((g) => {
                    const loginId = (g as { loginId?: string }).loginId || (g.id ? String(g.id) : `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
                    const pw = (g as { password?: string }).password || defaultPassword;
                    const realName = g.name || 'Guest';
                    return `${loginId},${pw},${realName}`;
                })
                .join('\n');
            const csvContent = BOM + header + rows;
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            const file = new File([blob], 'guests.csv', { type: 'text/csv' });

            const result = await bulkCreateUsersMutation.mutateAsync({
                organizationId: orgIdNum,
                file,
            });

            setAlertState({
                isOpen: true,
                title: '등록 완료',
                message: `게스트 ${result.createdCount}명이 등록되었습니다.${result.duplicateLoginIds?.length ? `\n중복 로그인ID: ${result.duplicateLoginIds.join(', ')}` : ''}`,
            });
            setIsCreateGuestModalOpen(false);
            refetchLicenses();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : '게스트 등록 중 오류가 발생했습니다.';
            setAlertState({
                isOpen: true,
                title: '등록 실패',
                message,
            });
        }
    };

    return (
        <FullScreenLayout
            backgroundColor="bg-white"
            header={
                <FullScreenHeader
                    title={license.className}
                    onBack={() => navigate(backPath)}
                    rightContent={headerRightContent}
                />
            }
        >
            <div className="max-w-[1280px] mx-auto px-4 py-6">

                {/* 🔥 Mock/Real 데이터 소스 선택 탭 */}
                <div className="mb-6">
                    <DataSourceTabs 
                        value={dataSource} 
                        onChange={setDataSource}
                    />
                </div>

                {/* 🌐 Real API 상태 표시 */}
                {dataSource === 'real' && (licenseError) && (
                    <div className="mb-6">
                        <ApiStatusBox
                            isLoading={licenseLoading}
                            error={licenseError}
                        />
                    </div>
                )}

                {/* Tabs */}
                <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex items-center justify-between mb-6">
                        <TabsList>
                            <TabsTrigger value="users">
                                사용자 ({users.length})
                            </TabsTrigger>
                            <TabsTrigger value="devices">
                                기기 ({devices.length})
                            </TabsTrigger>
                            {dataSource === 'real' && (
                                <TabsTrigger value="scenarios">
                                    시나리오 ({scenariosTotalCount})
                                </TabsTrigger>
                            )}
                        </TabsList>

                        {/* 조회기간 필터 */}
                        <DateRangeFilter
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={setStartDate}
                            onEndDateChange={setEndDate}
                            label="조회기간"
                        />
                    </div>

                    <TabsContent value="users">
                        {/* User Statistics Cards */}
                        <div className="grid grid-cols-5 gap-4 my-6">
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">최대 사용자 수</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className={`text-2xl font-black ${isDeviceLicense ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {isDeviceLicense ? '해당 없음' : (maxUsers || 0)}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">누적 사용자 수</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-black text-gray-600">{totalUsers}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">등록가능 사용자 수</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className={`text-2xl font-black ${isDeviceLicense ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {isDeviceLicense ? '해당 없음' : (availableUsers !== null ? availableUsers : 0)}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">정회원</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-black text-blue-600">{membersCount}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">게스트</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-black text-purple-600">{guestsCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mb-6">
                            <Button
                                variant="lightdark"
                                size="md"
                                onClick={() => setIsAddMemberModalOpen(true)}
                            >
                                <UsersIcon size={18} />
                                정회원 추가
                            </Button>
                            <Button
                                variant="outline"
                                size="md"
                                onClick={() => setIsCreateGuestModalOpen(true)}
                            >
                                <Plus size={18} />
                                게스트 계정 생성
                            </Button>
                        </div>

                        <UserList
                            users={users}
                            licenses={[license]}
                            organizationId={organizationId ? parseInt(organizationId.replace(/^ORG/i, '')) : null}
                            showStats={false}
                            showDataSourceTabs={true}
                            onAddMember={handleAddMember}
                            onCreateGuest={handleCreateGuest}
                        />
                    </TabsContent>

                    <TabsContent value="devices">
                        {/* Device Statistics Cards */}
                        <div className="grid grid-cols-3 gap-4 my-6">
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">최대 기기수</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className={`text-2xl font-black ${isUserLicense ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {isUserLicense ? '해당 없음' : (maxDevices || 0)}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">활성 기기수</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-black text-green-600">{activeDevicesCount}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">비활성 기기수</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-black text-gray-600">{inactiveDevicesCount}</span>
                                </div>
                            </div>
                        </div>

                        <DeviceList
                            devices={devices}
                            showStats={false}
                            onDeviceUpdate={handleDeviceUpdate}
                        />
                    </TabsContent>

                    {dataSource === 'real' && (
                        <TabsContent value="scenarios">
                            <div className="my-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <BookOpen size={20} />
                                    이 라이센스로 이용 가능한 시나리오
                                </h3>
                                {scenariosLoading && (
                                    <p className="text-gray-500">시나리오 목록을 불러오는 중...</p>
                                )}
                                {scenariosError && (
                                    <p className="text-red-600">{scenariosError.message}</p>
                                )}
                                {!scenariosLoading && !scenariosError && (
                                    <>
                                        {scenariosByLicense.length === 0 ? (
                                            <p className="text-gray-500">등록된 시나리오가 없습니다.</p>
                                        ) : (
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">시나리오명</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">맵</th>
                                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">예상 시간(초)</th>
                                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">플레이 수</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">최종 수정</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {scenariosByLicense.map((s) => (
                                                            <tr key={s.scenarioId} className="hover:bg-gray-50">
                                                                <td className="px-4 py-2 text-sm text-gray-900">{s.title}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-600">{s.mapItemName ?? '-'}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-600 text-right">{s.expectedPlayTimeSeconds ?? '-'}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-600 text-right">{s.playCount ?? 0}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-500">{s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            {/* Modals */}
            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                onSuccess={() => {
                    setIsAddMemberModalOpen(false);
                    // TODO: 리스트 새로고침
                }}
                organizationId={organizationId ? parseInt(organizationId.replace(/^ORG/i, '')) : undefined}
                currentUsers={users}
                licenseInfo={licenseInfo}
            />

            <CreateGuestModal
                isOpen={isCreateGuestModalOpen}
                onClose={() => setIsCreateGuestModalOpen(false)}
                onSave={handleCreateGuest}
                licenseInfo={licenseInfo}
            />

            <AlertDialog
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                title={alertState.title}
                message={alertState.message}
            />
        </FullScreenLayout>
    );
}
