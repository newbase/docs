import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, Users as UsersIcon, Crown } from 'lucide-react';
import { Pagination, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '@/components/shared/ui';
import EditUserModal from './modals/EditUserModal';
import AddMemberModal from './modals/AddMemberModal';
import CreateGuestModal from './modals/CreateGuestModal';
import { User, License } from '../../types/admin';
import { DataSourceTabs } from '@/components/shared/DataSourceTabs';
import { useOrganizationUserList } from '@/hooks/useUserManagement';
import { formatDateShort, formatDateTime } from '@/utils/dateUtils';
import { handleApiError } from '@/utils/errorHandlers';
import type { OrganizationUserInfoDto } from '../../types/api/user.d';

interface UserListProps {
    users: User[];
    licenses?: License[];
    organizationId?: number | null; // Real API 조회용
    showStats?: boolean;
    showDataSourceTabs?: boolean; // DataSourceTabs 표시 여부
    onAddMember?: (newMembers: Partial<User>[]) => void;
    onCreateGuest?: (newGuests: Partial<User>[]) => void;
    onSaveUser?: (user: User) => void;
    onDeleteUser?: (user: User) => void;
}

/**
 * OrganizationUserInfoDto를 User 타입으로 변환
 */
const convertOrganizationUserInfoDtoToUser = (dto: OrganizationUserInfoDto): User => {
    return {
        id: dto.userId.toString(),
        name: dto.name,
        email: dto.email,
        type: dto.accountType === 'REGULAR' ? 'regular' : 'guest',
        accountType: dto.accountType === 'REGULAR' ? '정회원' : '게스트',
        customerType: '기관고객',
        role: dto.role === 'ORGANIZATION_ADMIN' ? 'Master' : 'Student',
        registeredDate: dto.registeredAt,
        lastLogin: dto.lastSigninAt,
        status: 'active', // OrganizationUserInfoDto에는 status 없음
        loginId: dto.loginId, // 엄격하게: 아이디 필드 추가
    };
};

export default function UserList({ 
    users: initialUsers, 
    licenses = [], 
    organizationId = null,
    showStats = true, 
    showDataSourceTabs = false,
    onAddMember, 
    onCreateGuest, 
    onSaveUser, 
    onDeleteUser 
}: UserListProps): React.ReactElement {
    // 🔥 Mock/Real 데이터 소스 선택
    const [dataSource, setDataSource] = useState<'mock' | 'real'>('mock');
    
    const [users, setUsers] = useState<User[]>(initialUsers);
    
    // Update users when initialUsers prop changes (Mock 데이터)
    useEffect(() => {
        if (dataSource === 'mock') {
            setUsers(initialUsers);
        }
    }, [initialUsers, dataSource]);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);
    const [isCreateGuestModalOpen, setIsCreateGuestModalOpen] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 20;

    // 🌐 Real API 호출 (Real 탭일 때만 활성화)
    const { 
        data: realApiData, 
        isLoading: realLoading, 
        error: realError 
    } = useOrganizationUserList(
        {
            organizationId: organizationId || 0,
            page: currentPage,
            pageSize: itemsPerPage,
        },
        {
            enabled: dataSource === 'real' && !!organizationId && organizationId > 0,
            retry: 1,
        }
    );

    // Real API 데이터 변환
    const realUsers = useMemo(() => {
        if (!realApiData?.userList) return [];
        return realApiData.userList.map(convertOrganizationUserInfoDtoToUser);
    }, [realApiData]);

    // Update users when Real API data changes
    useEffect(() => {
        if (dataSource === 'real' && realUsers.length > 0) {
            setUsers(realUsers);
        }
    }, [realUsers, dataSource]);

    // 표시할 데이터 선택 (Mock vs Real)
    const displayUsers = dataSource === 'mock' ? users : realUsers;

    // Calculate stats
    const userStats = {
        total: displayUsers.length,
        members: displayUsers.filter(u => u.accountType === '정회원').length,
        guests: displayUsers.filter(u => u.accountType === '게스트').length,
        active: displayUsers.filter(u => u.status === 'active').length
    };

    // Calculate license limits
    const licenseInfo = useMemo(() => {
        // Check if there's any device license (unlimited users)
        const hasDeviceLicense = licenses.some(license => 
            (license.licenseType === '기기구독' || license.subscriptionType === 'device') && 
            license.status === 'active'
        );

        if (hasDeviceLicense) {
            return {
                hasDeviceLicense: true,
                maxUsers: null, // Unlimited
                currentUsers: displayUsers.filter(u => u.status === 'active').length
            };
        }

        // Calculate total max users from all active user licenses
        const activeUserLicenses = licenses.filter(license => 
            (license.licenseType === '사용자구독' || license.subscriptionType === 'user') && 
            license.status === 'active'
        );

        const totalMaxUsers = activeUserLicenses.reduce((sum, license) => {
            const maxUsers = typeof license.maxUsers === 'string' 
                ? (license.maxUsers === '-' ? 0 : parseInt(license.maxUsers) || 0)
                : (license.maxUsers || 0);
            return sum + maxUsers;
        }, 0);

        const currentActiveUsers = displayUsers.filter(u => u.status === 'active').length;

        return {
            hasDeviceLicense: false,
            maxUsers: totalMaxUsers,
            currentUsers: currentActiveUsers,
            availableSlots: totalMaxUsers - currentActiveUsers
        };
    }, [licenses, displayUsers]);

    // Validate license limit before adding users
    const validateLicenseLimit = (newUserCount: number): { valid: boolean; message?: string } => {
        // Device license: unlimited users
        if (licenseInfo.hasDeviceLicense) {
            return { valid: true };
        }

        // User license: check limit
        if (licenseInfo.maxUsers === null || licenseInfo.maxUsers === 0) {
            return {
                valid: false,
                message: '사용자 라이선스가 없습니다. 사용자 라이선스를 구매하거나 기기 라이선스를 구매해주세요.'
            };
        }

        const totalAfterAdd = licenseInfo.currentUsers + newUserCount;
        if (totalAfterAdd > licenseInfo.maxUsers) {
            return {
                valid: false,
                message: `사용자 라이선스 한도를 초과합니다. (현재: ${licenseInfo.currentUsers}명 / 최대: ${licenseInfo.maxUsers}명, 추가 가능: ${Math.max(0, licenseInfo.availableSlots)}명)`
            };
        }

        return { valid: true };
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleDelete = (user: User) => {
        if (window.confirm(`${user.name} 사용자를 삭제하시겠습니까?`)) {
            setUsers(prev => prev.filter(u => u.id !== user.id));
            if (onDeleteUser) onDeleteUser(user);
        }
    };

    const handleSaveUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (onSaveUser) onSaveUser(updatedUser);
    };

    const handleAddMembers = (newMembers: Partial<User>[]) => {
        // Validate license limit
        const validation = validateLicenseLimit(newMembers.length);
        if (!validation.valid) {
            alert(validation.message);
            return;
        }

        const membersToAdd = newMembers as User[];
        setUsers(prev => [...membersToAdd, ...prev]);
        if (onAddMember) onAddMember(newMembers);
    };

    const handleCreateGuests = (newGuests: Partial<User>[]) => {
        // Validate license limit
        const validation = validateLicenseLimit(newGuests.length);
        if (!validation.valid) {
            alert(validation.message);
            return;
        }

        const guestsToAdd = newGuests as User[];
        setUsers(prev => [...guestsToAdd, ...prev]);
        if (onCreateGuest) onCreateGuest(newGuests);
    };

    const getStatusVariant = (status: string): 'default' | 'destructive' => {
        return status === 'active' ? 'default' : 'destructive';
    };

    // Pagination logic
    const totalPages = Math.ceil(displayUsers.length / itemsPerPage);
    const paginatedUsers = displayUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            {/* DataSourceTabs */}
            {showDataSourceTabs && (
                <div className="mb-6">
                    <DataSourceTabs
                        value={dataSource}
                        onChange={setDataSource}
                    />
                    
                    {/* API 상태 표시 - 기존 스타일 유지 */}
                    {dataSource === 'real' && realError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 text-red-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-red-800 mb-1">
                                        {handleApiError(realError).title}
                                    </h4>
                                    <p className="text-red-700 text-sm mb-3">
                                        {handleApiError(realError).message}
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => window.location.reload()}
                                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            aria-label="다시 시도"
                                        >
                                            다시 시도
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setDataSource('mock')}
                                            className="px-3 py-1.5 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-100 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            aria-label="Mock 데이터로 전환"
                                        >
                                            Mock 데이터로 전환
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* 로딩 중 안내 - 테이블 위 */}
                    {dataSource === 'real' && realLoading && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 text-blue-700">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                <span className="text-sm font-medium">사용자 목록을 불러오는 중...</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showStats && (
                <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
                    <div className="flex gap-6 pl-2 pt-4 items-center">
                        <div>
                            <span className="text-base font-medium text-gray-600 mr-4">정회원</span>
                            <span className="text-base font-bold text-blue-600">{userStats.members}</span>
                        </div>
                        <div>
                            <span className="text-base font-medium text-gray-600 mr-4">게스트</span>
                            <span className="text-base font-bold text-purple-600">{userStats.guests}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
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
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>ID</TableHead>
                            <TableHead>이름</TableHead>
                            <TableHead>이메일</TableHead>
                            <TableHead>계정구분</TableHead>
                            <TableHead>권한</TableHead>
                            <TableHead>등록일</TableHead>
                            <TableHead>최종접속일</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {realLoading && dataSource === 'real' ? (
                            <>
                                {/* 로딩 스켈레톤 - 기존 디자인 유지 */}
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`}>
                                        <TableCell>
                                            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <div className="h-7 w-7 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-7 w-7 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </>
                        ) : displayUsers.length > 0 ? (
                            paginatedUsers.map((user) => {
                                const isMaster = user.role === 'Master';
                                return (
                                    <TableRow
                                        key={user.id}
                                        className={`hover:bg-gray-50 transition-colors ${isMaster ? 'bg-orange-50/50' : ''}`}
                                    >
                                        <TableCell>{user.loginId || user.id}</TableCell>
                                        <TableCell>
                                            <strong className={`flex items-center gap-2 ${isMaster ? 'text-orange-600' : ''}`}>
                                                {isMaster && <Crown size={16} />}
                                                {user.name}
                                            </strong>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.accountType === '정회원' ? 'default' : 'secondary'}>
                                                {user.accountType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={isMaster ? 'text-orange-600 font-semibold' : ''}>
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell>{formatDateShort(user.registeredDate)}</TableCell>
                                        <TableCell>{user.lastLogin ? formatDateTime(user.lastLogin) : '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(user.status)}>
                                                {user.status === 'active' ? '활성' : '비활성'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                    onClick={() => handleEdit(user)}
                                                    aria-label={`${user.name} 사용자 수정`}
                                                >
                                                    <Edit size={16} aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                    onClick={() => handleDelete(user)}
                                                    aria-label={`${user.name} 사용자 삭제`}
                                                >
                                                    <Trash2 size={16} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="py-16">
                                    {/* Empty State - 기존 디자인 스타일 유지 */}
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="mb-4 p-4 bg-gray-100 rounded-full">
                                            <UsersIcon size={48} className="text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            등록된 사용자가 없습니다
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-6 max-w-md">
                                            {dataSource === 'real' 
                                                ? '이 라이센스에 등록된 사용자가 없습니다. 아래 버튼을 클릭하여 첫 사용자를 추가해보세요.'
                                                : '라이센스에 사용자를 추가하면 여기에 표시됩니다.'
                                            }
                                        </p>
                                        {showStats && (
                                            <div className="flex gap-3">
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
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {/* Pagination */}
            {displayUsers.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={displayUsers.length}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                />
            )}

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUser}
                onSave={handleSaveUser}
            />

            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                onSuccess={() => {
                    setIsAddMemberModalOpen(false);
                    // Real API는 자동으로 refetch됨
                }}
                organizationId={organizationId || undefined}
                currentUsers={users}
                licenseInfo={licenseInfo}
            />

            <CreateGuestModal
                isOpen={isCreateGuestModalOpen}
                onClose={() => setIsCreateGuestModalOpen(false)}
                onSave={handleCreateGuests}
                licenseInfo={licenseInfo}
            />
        </>
    );
}
