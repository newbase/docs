import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { PageHeader, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/shared/ui';
import { useAuth } from '../../contexts/AuthContext';
import { organizationsData } from '../../data/organizations';
import { getLicensesByOrgId, getLicenseStats, organizationLicenses } from '../../data/organizationLicenses';
import { updateLicense, UpdateLicenseResponse } from '../../services/licenseService';
import { featureFlags } from '../../config/featureFlags';
import { isFeatureEnabled } from '../../config/featureFlags';
import LicenseList from '../licenses/LicenseList';
import EditOrganizationModal from './modals/EditOrganizationModal';
import { Organization, License, User } from '../../types/admin';
import { MOCK_ORDERS } from '../order/OrderDetail';

/** 주문내역 탭: 해당 기관 주문 목록 (주문번호, 프로덕트 유형, 품목 정보 목록, 주문상태, 주문일시) */
function OrgOrderTable({ organizationName }: { organizationName: string }): React.ReactElement {
    const rows = useMemo(() => {
        if (!isFeatureEnabled('USE_MOCK_DATA')) return [];
        return MOCK_ORDERS.filter((o) => o.ordererName === organizationName);
    }, [organizationName]);

    const itemsSummary = (itemList: { productName: string }[]) => {
        if (itemList.length === 0) return '-';
        if (itemList.length === 1) return itemList[0].productName;
        return `${itemList[0].productName} 외 ${itemList.length - 1}건`;
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead className="text-center w-[140px]">주문번호</TableHead>
                        <TableHead className="w-[120px]">프로덕트 유형</TableHead>
                        <TableHead>품목 정보 목록</TableHead>
                        <TableHead className="text-center w-[100px]">주문상태</TableHead>
                        <TableHead className="text-center w-[160px]">주문일시</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                주문 내역이 없습니다.
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((order) => (
                            <TableRow key={order.id} className="text-sm hover:bg-gray-50">
                                <TableCell className="font-mono text-center">{order.id}</TableCell>
                                <TableCell>{order.type}</TableCell>
                                <TableCell>{itemsSummary(order.items)}</TableCell>
                                <TableCell className="text-center">{order.status}</TableCell>
                                <TableCell className="text-center text-gray-600">{order.createdAt}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default function MyOrganization(): React.ReactElement {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:15', message: 'Component render start', data: { timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isEditOrgModalOpen, setIsEditOrgModalOpen] = useState<boolean>(false);

    // State for managing users and licenses
    const [users, setUsers] = useState<User[]>([]);
    const [licenses, setLicenses] = useState<License[]>([]);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:23', message: 'Initial licenses state', data: { licensesLength: 0 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Get organization ID from current account
    const rawOrganizationId = user?.currentAccount?.organizationId;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:30', message: 'Raw organizationId extracted', data: { rawOrganizationId, hasUser: !!user }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion

    // Normalize organization ID: convert org_XXX to ORGXXX format
    const normalizeOrgId = (id: string | null | undefined): string | null => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:32', message: 'normalizeOrgId called', data: { inputId: id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
        // #endregion
        if (!id) return null;
        // If already in ORGXXX format, return as is
        if (id.startsWith('ORG')) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:36', message: 'normalizeOrgId result', data: { normalizedId: id, alreadyORG: true }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
            // #endregion
            return id;
        }
        // Convert org_001 -> ORG001, org_002 -> ORG002, etc.
        const normalized = id.replace(/^org_/i, 'ORG').toUpperCase();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:40', message: 'normalizeOrgId result', data: { inputId: id, normalizedId: normalized }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
        // #endregion
        return normalized;
    };

    const organizationId = normalizeOrgId(rawOrganizationId);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:48', message: 'organizationId after normalization', data: { organizationId, rawOrganizationId }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion

    // Debug logging (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
        console.log('MyOrganization Debug:', {
            user: user ? { id: user.id, name: user.name } : null,
            currentAccount: user?.currentAccount,
            rawOrganizationId,
            normalizedOrganizationId: organizationId,
            availableOrganizations: organizationsData.map(org => ({ id: org.id, name: org.name }))
        });
    }

    // Find organization data
    const organization = organizationId
        ? (organizationsData as Organization[]).find(org => org.id === organizationId)
        : null;

    // Initialize data - Hooks must be called before any conditional returns
    // Reload data when component mounts or when organizationId changes
    useEffect(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:61', message: 'useEffect entry', data: { organizationId, hasUser: !!user, pathname: location.pathname, availableKeys: Object.keys(organizationLicenses || {}) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
        // #endregion
        console.log('MyOrganization - useEffect triggered:', {
            hasUser: !!user,
            rawOrganizationId,
            organizationId,
            location: location.pathname,
            availableLicenseKeys: Object.keys(organizationLicenses || {})
        });

        if (organizationId) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:71', message: 'Before getLicensesByOrgId', data: { organizationId, rawDataExists: !!organizationLicenses[organizationId] }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
            // #endregion
            const orgLicenses = getLicensesByOrgId(organizationId);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:73', message: 'After getLicensesByOrgId', data: { organizationId, licensesCount: orgLicenses.length, licenses: orgLicenses }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
            // #endregion
            console.log('MyOrganization - Loading licenses:', {
                organizationId,
                licensesCount: orgLicenses.length,
                licenses: orgLicenses,
                location: location.pathname,
                rawData: organizationLicenses[organizationId]
            });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:79', message: 'Before setLicenses', data: { licensesCount: orgLicenses.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
            // #endregion
            setLicenses(orgLicenses);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:81', message: 'After setLicenses call', data: { licensesCount: orgLicenses.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
            // #endregion
        } else {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:84', message: 'No organizationId branch', data: { hasUser: !!user }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
            // #endregion
            console.log('MyOrganization - No organizationId, clearing licenses', {
                user: user ? { id: user.id, currentAccount: user.currentAccount } : null
            });
            setLicenses([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizationId, location.pathname, user?.currentAccount?.organizationId]);

    if (!organizationId || !organization) {
        return (
            <section className="section-py">
                <div className="container">
                    <div className="space-y-2">
                        <p className="text-gray-600">소속기관 정보를 찾을 수 없습니다.</p>
                        {!user && (
                            <p className="text-sm text-gray-500">사용자 정보가 없습니다. 로그인이 필요합니다.</p>
                        )}
                        {user && !user.currentAccount?.organizationId && (
                            <p className="text-sm text-gray-500">
                                현재 계정에 소속기관이 설정되어 있지 않습니다.
                                <br />
                                계정 전환을 통해 소속기관이 있는 계정을 선택해주세요.
                            </p>
                        )}
                        {organizationId && !organization && (
                            <p className="text-sm text-gray-500">
                                Organization ID: {organizationId}에 해당하는 기관을 찾을 수 없습니다.
                            </p>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    // Get data
    const licenseStats = getLicenseStats(organizationId || '');

    // Handle API response for deactivated users
    const handleDeactivatedUsers = (response: UpdateLicenseResponse) => {
        if (response.deactivatedUsers && response.deactivatedUsers.length > 0) {
            // Update users state with deactivated users
            setUsers(prevUsers =>
                prevUsers.map(user => {
                    const deactivated = response.deactivatedUsers?.find(du => du.id === user.id);
                    if (deactivated) {
                        return { ...user, status: 'inactive' as const };
                    }
                    return user;
                })
            );

            // Show notification
            const userNames = response.deactivatedUsers.map(u => u.name).join(', ');
            const message = response.message ||
                `라이선스 수량 감소로 인해 ${response.deactivatedUsers.length}명의 사용자가 비활성화되었습니다.\n비활성화된 사용자: ${userNames}\n(최종 접속일이 오래된 순서대로 비활성화되었습니다.)`;
            alert(message);
        }
    };

    // Handlers
    const handleLicenseSettings = (license: License) => {
        console.log('License settings:', license);
        // License settings modal will be opened by LicenseList component
    };

    const handleLicenseClick = (license: License) => {
        navigate(`/master/organization/licenses/${license.id}`);
    };

    const handleSaveLicense = async (updatedLicense: License) => {
        setIsLoading(true);
        setError(null);

        try {
            if (featureFlags.USE_MOCK_DATA) {
                // Mock 데이터 모드: 프론트엔드에서 처리 (개발/프로토타입용)
                const oldLicense = licenses.find(l => l.id === updatedLicense.id);

                if (oldLicense) {
                    const oldMaxUsers = typeof oldLicense.maxUsers === 'string'
                        ? (oldLicense.maxUsers === '-' ? 0 : parseInt(oldLicense.maxUsers) || 0)
                        : (oldLicense.maxUsers || 0);
                    const newMaxUsers = typeof updatedLicense.maxUsers === 'string'
                        ? (updatedLicense.maxUsers === '-' ? 0 : parseInt(updatedLicense.maxUsers) || 0)
                        : (updatedLicense.maxUsers || 0);

                    // Only process if maxUsers decreased
                    if (newMaxUsers < oldMaxUsers) {
                        const decreaseAmount = oldMaxUsers - newMaxUsers;

                        // Get active users sorted by last login date (oldest first)
                        const parseLastLoginDate = (lastLogin: string | undefined | null): Date => {
                            if (!lastLogin || lastLogin === '-' || lastLogin.trim() === '') {
                                return new Date(0);
                            }
                            const dateStr = lastLogin.split(' ')[0];
                            const parsed = new Date(dateStr);
                            return isNaN(parsed.getTime()) ? new Date(0) : parsed;
                        };

                        const activeUsers = users
                            .filter(u => u.status === 'active')
                            .sort((a, b) => {
                                const dateA = parseLastLoginDate(a.lastLogin);
                                const dateB = parseLastLoginDate(b.lastLogin);
                                return dateA.getTime() - dateB.getTime();
                            });

                        const usersToDeactivate = activeUsers.slice(0, decreaseAmount);

                        if (usersToDeactivate.length > 0) {
                            setUsers(prevUsers =>
                                prevUsers.map(user => {
                                    const shouldDeactivate = usersToDeactivate.some(u => u.id === user.id);
                                    if (shouldDeactivate) {
                                        return { ...user, status: 'inactive' as const };
                                    }
                                    return user;
                                })
                            );

                            const userNames = usersToDeactivate.map(u => u.name).join(', ');
                            alert(`라이선스 수량 감소로 인해 ${decreaseAmount}명의 사용자가 비활성화되었습니다.\n비활성화된 사용자: ${userNames}\n(최종 접속일이 오래된 순서대로 비활성화되었습니다.)`);
                        }
                    }
                }

                // Update license
                setLicenses(prev => prev.map(l => l.id === updatedLicense.id ? updatedLicense : l));
                console.log('Saving license (Mock):', updatedLicense);
            } else {
                // 실제 API 모드: 백엔드에서 처리
                if (!organizationId) {
                    throw new Error('조직 ID가 없습니다.');
                }

                const response = await updateLicense(
                    parseInt(updatedLicense.id),
                    {
                        type: (updatedLicense.licenseType || 'USER') as any,
                        plan: (updatedLicense.subscriptionPlan || updatedLicense.plan || 'BASIC') as any,
                        quantity: typeof updatedLicense.maxUsers === 'string'
                            ? parseInt(updatedLicense.maxUsers) || 0
                            : updatedLicense.maxUsers || 0,
                        startDate: updatedLicense.startDate,
                        endDate: updatedLicense.endDate || undefined,
                        curriculumIdList: [],
                    }
                );

                // Update license from API response or fallback to updatedLicense
                if (response.license) {
                    // Note: In a real app we might need to map LicenseDetailDto back to License
                    setLicenses(prev => prev.map(l => l.id === updatedLicense.id ? updatedLicense : l));
                } else {
                    setLicenses(prev => prev.map(l => l.id === updatedLicense.id ? updatedLicense : l));
                }

                // Handle deactivated users from API response
                handleDeactivatedUsers(response);

                console.log('License updated via API:', response);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '라이선스 업데이트에 실패했습니다.';
            setError(errorMessage);
            alert(`오류: ${errorMessage}`);
            console.error('License update error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLicense = (newLicense: License) => {
        console.log('Add license', newLicense);
        // TODO: Open add license modal
    };

    const handleAddMember = (newMembers: Partial<User>[]) => {
        console.log('Add member', newMembers);
        // TODO: Open add member modal
    };

    const handleCreateGuest = (guests: Partial<User>[]) => {
        console.log('Create guest', guests);
        // TODO: Open create guest modal
    };

    const handleSaveOrganization = (updatedOrg: Organization) => {
        console.log('Saving organization:', updatedOrg);
        // TODO: Update organization in state/backend
    };

    return (
        <section className="section-py">
            <div className="container">
                <PageHeader
                    title={
                        <span className="flex items-center gap-2">
                            {organization.name}
                            {organization.isPartner && (
                                <Badge variant="secondary" className="text-xs">제휴기관</Badge>
                            )}
                        </span>
                    }
                    breadcrumbs={[
                        { label: '라이선스', link: '/master/organization' }
                    ]}
                    actions={
                        <button
                            onClick={() => setIsEditOrgModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium"
                        >
                            <Edit size={16} />
                            수정
                        </button>
                    }
                />

                {/* 탭: 주문내역 | 사용자 관리 | 기기관리 */}
                <Tabs defaultValue="orders" className="w-full mb-8">
                    <TabsList className="grid w-full max-w-md grid-cols-3 rounded-lg bg-gray-100 p-1">
                        <TabsTrigger value="orders" className="rounded-md">주문내역</TabsTrigger>
                        <TabsTrigger value="users" className="rounded-md">사용자 관리</TabsTrigger>
                        <TabsTrigger value="devices" className="rounded-md">기기관리</TabsTrigger>
                    </TabsList>
                    <TabsContent value="orders" className="mt-4">
                        <OrgOrderTable organizationName={organization.name} />
                    </TabsContent>
                    <TabsContent value="users" className="mt-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                            사용자 관리 영역
                        </div>
                    </TabsContent>
                    <TabsContent value="devices" className="mt-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                            기기관리 영역
                        </div>
                    </TabsContent>
                </Tabs>

                {/* License List */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}
                {isLoading && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">라이선스를 업데이트하는 중...</p>
                    </div>
                )}
                {licenses.length === 0 && !isLoading && organizationId && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            등록된 라이선스가 없습니다. (Organization ID: {organizationId})
                            <br />
                            <span className="text-xs text-yellow-600 mt-1 block">
                                콘솔에서 디버그 정보를 확인하세요.
                            </span>
                        </p>
                    </div>
                )}
                {/* #region agent log */}
                {void fetch('http://127.0.0.1:7242/ingest/13a40279-b59c-4e58-9755-3b51157258c1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MyOrganization.tsx:372', message: 'Render LicenseList', data: { licensesLength: licenses.length, licenses: licenses }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { })}
                {/* #endregion */}
                <LicenseList
                    licenses={licenses}
                    showStats={true}
                    showAddButton={false}
                    onLicenseSettings={handleLicenseSettings}
                    onAddLicense={handleAddLicense}
                    onSaveLicense={handleSaveLicense}
                    onLicenseClick={handleLicenseClick}
                />

                <EditOrganizationModal
                    isOpen={isEditOrgModalOpen}
                    onClose={() => setIsEditOrgModalOpen(false)}
                    organization={organization}
                    onSave={handleSaveOrganization}
                />
            </div>
        </section>
    );
}
