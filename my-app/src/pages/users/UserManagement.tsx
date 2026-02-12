import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Edit, Trash2, Search, Building2, User as UserIcon, Crown, Pen, Users, Building, UserCheck, UserPlus, Upload, Download, FileSpreadsheet, X } from 'lucide-react';
import { FilterGroup, FilterSelect, PageHeader, DateRangeFilter, StatsGrid, ListHeader, Pagination, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from '@/components/shared/ui';
import EditUserModal from './modals/EditUserModal';
import { User } from '../../types/admin';
import { useUserListWithFilters, useAllUserCount, useBulkCreateUsers, useExportUserListExcel, useDownloadBulkUploadTemplate, useUpdateUserStatus, useUpdateUserRoleByAdmin, useUpdateUserInfo, useUpdateUserPassword, useDeleteUsers } from '@/hooks/useUserManagement';
import type { GetUserListFilters } from '../../services/userServiceApi';
import type { UserInfoDto } from '../../types/api/user';
import { convertRoleNumberToString } from '@/utils/roleUtils';
import { formatDateTimeWithSeconds } from '@/utils/dateUtils';
import AlertDialog from '@/components/shared/ui/AlertDialog';

/**
 * UserInfoDto를 User 타입으로 변환
 */
const convertUserInfoDtoToUser = (dto: UserInfoDto): User => {
    return {
        id: dto.userId,
        name: dto.name,
        email: dto.email,
        type: dto.type === 'REGULAR' ? 'regular' : 'guest',
        accountType: dto.type === 'REGULAR' ? '정회원' : '게스트',
        customerType: dto.organizationName ? '기관고객' : '개인고객',
        organizationName: dto.organizationName,
        role: convertRoleNumberToString(dto.role),
        registeredDate: dto.createdAt,
        lastLogin: dto.lastSigninAt,
        status: dto.status ? 'active' : 'inactive',
        loginId: dto.loginId,
        classCount: dto.activeClassCount,
        simulationCount: undefined, // UserInfoDto에 없음, 표시용 0은 테이블에서 처리
    };
};

interface UserStats {
    total: number;
    organization: number;
    individual: number;
    active: number;
    withdrawal: number;
    newUsers: number;
    masters: number;
    students: number;
    guests: number;
}

// User Management Component
export default function UserManagement(): React.ReactElement {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('');
    const [accountTypeFilter, setAccountTypeFilter] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [activeStatFilter, setActiveStatFilter] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 20;

    // Date Range Filter
    const [dateFilterType, setDateFilterType] = useState<string>('registeredDate'); // 'registeredDate' or 'lastLogin'
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Alert Dialog State
    const [alertState, setAlertState] = useState({
        isOpen: false,
        type: 'success' as 'success' | 'error',
        title: '',
        message: ''
    });

    // Real API Mutations
    const bulkCreateUsersMutation = useBulkCreateUsers();
    const downloadTemplateMutation = useDownloadBulkUploadTemplate();
    const exportExcelMutation = useExportUserListExcel();
    const updateUserStatusMutation = useUpdateUserStatus();
    const updateUserRoleMutation = useUpdateUserRoleByAdmin();
    const updateUserInfoMutation = useUpdateUserInfo();
    const updateUserPasswordMutation = useUpdateUserPassword();
    const deleteUsersMutation = useDeleteUsers();

    // Excel 파일 업로드를 위한 ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 🌐 Real API 호출 파라미터 변환
    const apiParams: GetUserListFilters = useMemo(() => {
        // role 필터 변환
        let apiRole: 'STUDENT' | 'ORGANIZATION_ADMIN' | 'SALES_ADMIN' | 'SUPER_ADMIN' | undefined;
        if (roleFilter === 'Student') apiRole = 'STUDENT';
        else if (roleFilter === 'Master') apiRole = 'ORGANIZATION_ADMIN';
        else if (roleFilter === 'Admin') apiRole = 'SUPER_ADMIN';

        // isActive 필터 변환
        // 주의: 'inactive' 필터는 서버에 전달하지 않고 클라이언트 사이드에서만 처리
        // 이유: 서버에서 isActive=false로 필터링하면 비활성 사용자만 반환하는데,
        // 클라이언트 사이드에서도 필터링이 필요하므로 서버 필터링을 사용하지 않음
        let apiIsActive: boolean | undefined;
        if (statusFilter === 'active') {
            apiIsActive = true;
        } else if (statusFilter === 'inactive') {
            // 비활성은 서버에 전달하지 않음 (클라이언트 사이드에서만 필터링)
            apiIsActive = undefined;
        } else {
            // statusFilter가 없거나 'withdrawal' 등 다른 값일 때는 undefined
            apiIsActive = undefined;
        }

        // type 필터 변환
        let apiType: 'ASSOCIATE' | 'REGULAR' | undefined;
        if (accountTypeFilter === '게스트') apiType = 'ASSOCIATE';
        else if (accountTypeFilter === '정회원') apiType = 'REGULAR';

        // search 파라미터: status/role/customerType/accountType 관련 키워드는 서버에 전달하지 않음
        // (클라이언트 사이드에서만 처리)
        const statusKeywords = ['활성', '비활성', '탈퇴', 'active', 'inactive', 'withdrawal'];
        const roleKeywords = ['master', 'student', '마스터', '스튜던트', '학생'];
        const customerTypeKeywords = ['기관고객', '개인고객', '기관', '개인'];
        const accountTypeKeywords = ['정회원', '게스트'];
        
        const searchLower = searchQuery?.toLowerCase() || '';
        const isStatusOrRoleOrTypeKeyword = 
            statusKeywords.some(kw => searchLower.includes(kw.toLowerCase())) ||
            roleKeywords.some(kw => searchLower.includes(kw.toLowerCase())) ||
            customerTypeKeywords.some(kw => searchLower.includes(kw.toLowerCase())) ||
            accountTypeKeywords.some(kw => searchLower.includes(kw.toLowerCase()));
        
        // status/role/type 관련 키워드가 아닐 때만 서버에 search 파라미터 전달
        const apiSearch = (searchQuery && !isStatusOrRoleOrTypeKeyword) ? searchQuery : undefined;

        return {
            page: currentPage,
            pageSize: itemsPerPage,
            search: apiSearch,
            role: apiRole,
            isActive: apiIsActive,
            type: apiType,
        };
    }, [currentPage, itemsPerPage, searchQuery, roleFilter, statusFilter, accountTypeFilter]);

    // 🌐 Real API 호출
    const {
        data: realUsersData,
        isLoading: usersLoading,
        error: usersError
    } = useUserListWithFilters(apiParams, {
        retry: 1,
    });

    const {
        data: realStatsData,
        isLoading: statsLoading,
        error: statsError
    } = useAllUserCount({
        retry: 1,
    });

    // 🌐 Real API 데이터 - UserInfoDto를 User로 변환
    const users = useMemo(() => {
        return (realUsersData?.userList || []).map(convertUserInfoDtoToUser);
    }, [realUsersData]);

    const stats: UserStats = useMemo(() => {
        // 엄격하게: 실제 API 데이터 사용 (GetAllUserCountResponseDto)
        // - allUserCount: 전체 사용자 수
        // - regularMemberCount: 정회원(학생) 수
        // - associateMemberCount: 준회원(게스트) 수
        // - activeUserCount: 활성 사용자 수
        
        const total = realStatsData?.allUserCount || 0;
        const students = realStatsData?.regularMemberCount || 0;
        const guests = realStatsData?.associateMemberCount || 0;
        const active = realStatsData?.activeUserCount || 0;
        
        // 비활성(탈퇴) 사용자 = 전체 - 활성
        const withdrawal = total - active;
        
        // 조직/개인 구분은 userList에서 계산
        const organizationUsers = users.filter(u => u.organizationName).length;
        const individualUsers = users.filter(u => !u.organizationName).length;
        
        // 마스터 수 = role이 2 이상인 사용자 (ORGANIZATION_ADMIN, SALES_ADMIN, SUPER_ADMIN)
        // 엄격하게: realUsersData의 원본 DTO에서 role 숫자 값 확인
        const masters = (realUsersData?.userList || []).filter(dto => dto.role >= 2).length;
        
        // 신규 사용자 = 최근 7일 이내 가입 (createdAt 기준)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        // 엄격하게: realUsersData의 원본 DTO에서 createdAt 확인
        const newUsers = (realUsersData?.userList || []).filter(dto => {
            const createdDate = new Date(dto.createdAt);
            return createdDate >= sevenDaysAgo;
        }).length;
        
        return {
            total,
            organization: organizationUsers,
            individual: individualUsers,
            active,
            withdrawal,
            newUsers,
            masters,
            students,
            guests,
        };
    }, [realStatsData, realUsersData, users]);

    const applyFilters = useCallback(() => {
        // 서버에서 받은 데이터를 기준으로 클라이언트 사이드 추가 필터링
        // 주의: 서버에서 이미 statusFilter로 필터링된 경우도 있으므로, 
        // 클라이언트 사이드에서는 추가 필터링만 수행
        let filtered: User[] = users;

        // Search filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            
            // Status 한글/영문 매핑
            const statusMap: Record<string, string> = {
                '활성': 'active',
                '비활성': 'inactive',
                '탈퇴': 'withdrawal',
                'active': 'active',
                'inactive': 'inactive',
                'withdrawal': 'withdrawal'
            };
            
            // Role 한글/영문 매핑 (Master, Student만 지원 - guest는 accountType에서 처리)
            const roleMap: Record<string, string> = {
                '마스터': 'master',
                '스튜던트': 'student',
                '학생': 'student',
                'master': 'master',
                'student': 'student',
                'Master': 'master',
                'Student': 'student'
            };
            
            filtered = filtered.filter(u => {
                // 기본 필드 검색
                const matchesBasic = 
                    u.name.toLowerCase().includes(lowerQuery) ||
                    (u.email && u.email.toLowerCase().includes(lowerQuery)) ||
                    (u.organizationName && u.organizationName.toLowerCase().includes(lowerQuery));
                
                // CustomerType 검색 (기관고객, 개인고객)
                const matchesCustomerType = 
                    (u.customerType && u.customerType.toLowerCase().includes(lowerQuery)) ||
                    (lowerQuery === '기관' && u.customerType === '기관고객') ||
                    (lowerQuery === '개인' && u.customerType === '개인고객');
                
                // AccountType 검색 (정회원, 게스트)
                const matchesAccountType = 
                    (u.accountType && u.accountType.toLowerCase().includes(lowerQuery)) ||
                    (lowerQuery === '정회원' && u.accountType === '정회원') ||
                    (lowerQuery === '게스트' && u.accountType === '게스트');
                
                // Role 검색 (Master, Student만 지원 - guest는 accountType에서 처리)
                const roleLower = u.role?.toLowerCase() || '';
                // guest는 role 검색에서 제외
                let matchesRole = false;
                if (roleLower !== 'guest') {
                    // 대문자/소문자 모두 지원 (Master, master, MASTER 등)
                    const queryLower = lowerQuery.toLowerCase();
                    matchesRole = 
                        (queryLower === 'master' || queryLower === '마스터') && roleLower === 'master' ||
                        (queryLower === 'student' || queryLower === '스튜던트' || queryLower === '학생') && roleLower === 'student' ||
                        roleLower === 'master' && (queryLower.includes('master') || queryLower.includes('마스터')) ||
                        roleLower === 'student' && (queryLower.includes('student') || queryLower.includes('스튜던트') || queryLower.includes('학생'));
                }
                
                // Status 검색 (한글/영문 모두 지원)
                const userStatus = u.status?.toLowerCase() || '';
                
                // 비활성 검색: "비활성" 또는 "inactive" 키워드로 검색
                const isInactiveQuery = 
                    lowerQuery === '비활성' || 
                    lowerQuery === 'inactive' || 
                    lowerQuery.includes('비활성') || 
                    (lowerQuery.includes('inactive') && !lowerQuery.includes('active'));
                
                // 활성 검색: "활성" 또는 "active" 키워드로 검색 (비활성이 아닐 때만)
                const isActiveQuery = 
                    !isInactiveQuery && (
                        lowerQuery === '활성' || 
                        lowerQuery === 'active' || 
                        (lowerQuery.includes('활성') && !lowerQuery.includes('비활성'))
                    );
                
                // 탈퇴 검색
                const isWithdrawalQuery = 
                    lowerQuery === '탈퇴' || 
                    lowerQuery === 'withdrawal' || 
                    lowerQuery.includes('탈퇴') || 
                    lowerQuery.includes('withdrawal');
                
                const matchesStatus = 
                    (isActiveQuery && userStatus === 'active') ||
                    (isInactiveQuery && userStatus === 'inactive') ||
                    (isWithdrawalQuery && userStatus === 'withdrawal');
                
                return matchesBasic || matchesCustomerType || matchesAccountType || matchesRole || matchesStatus;
            });
        }

        // Customer type filter
        if (customerTypeFilter) {
            filtered = filtered.filter(u => u.customerType === customerTypeFilter);
        }

        // Account type filter
        if (accountTypeFilter) {
            filtered = filtered.filter(u => u.accountType === accountTypeFilter);
        }

        // Role filter (대소문자 구분 없이 비교)
        if (roleFilter) {
            filtered = filtered.filter(u => {
                const userRoleLower = u.role?.toLowerCase() || '';
                const filterRoleLower = roleFilter.toLowerCase();
                // Master -> master, Student -> student 매칭
                return userRoleLower === filterRoleLower;
            });
        }

        // Status filter (대소문자 구분 없이 비교)
        if (statusFilter) {
            filtered = filtered.filter(u => {
                const userStatus = u.status?.toLowerCase() || '';
                const filterStatus = statusFilter.toLowerCase();
                return userStatus === filterStatus;
            });
        }

        // Stat card filter
        if (activeStatFilter === 'organization') {
            filtered = filtered.filter(u => u.customerType === '기관고객');
        } else if (activeStatFilter === 'individual') {
            filtered = filtered.filter(u => u.customerType === '개인고객');
        } else if (activeStatFilter === 'active') {
            filtered = filtered.filter(u => u.status === 'active');
        } else if (activeStatFilter === 'withdrawal') {
            filtered = filtered.filter(u => u.status === 'withdrawal');
        } else if (activeStatFilter === 'newUsers') {
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);
            filtered = filtered.filter(u => {
                if (!u.registeredDate) return false;
                const regDate = new Date(u.registeredDate as string);
                return regDate >= thirtyDaysAgo && regDate <= today;
            });
        }

        // Date range filter
        if (startDate || endDate) {
            filtered = filtered.filter(u => {
                const dateValue = dateFilterType === 'registeredDate' ? u.registeredDate : u.lastLogin;
                if (!dateValue) return false;

                const userDate = new Date(dateValue);

                if (startDate) {
                    const start = new Date(startDate);
                    if (userDate < start) return false;
                }

                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (userDate > end) return false;
                }

                return true;
            });
        }

        return filtered;
    }, [searchQuery, customerTypeFilter, accountTypeFilter, roleFilter, statusFilter, activeStatFilter, startDate, endDate, dateFilterType, users]);

    // Filtered users
    const filteredUsers = useMemo(() => {
        return applyFilters();
    }, [applyFilters]);
    
    // Total count (API의 totalCount 사용)
    const totalCount = realUsersData?.totalCount || 0;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // 검색 시 첫 페이지로 이동
    };

    // 필터 초기화 함수
    const handleResetFilters = () => {
        setSearchQuery('');
        setCustomerTypeFilter('');
        setAccountTypeFilter('');
        setRoleFilter('');
        setStatusFilter('');
        setActiveStatFilter('all');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    // 필터가 하나라도 적용되어 있는지 확인
    const hasActiveFilters = useMemo(() => {
        return !!(
            searchQuery ||
            customerTypeFilter ||
            accountTypeFilter ||
            roleFilter ||
            statusFilter ||
            activeStatFilter !== 'all' ||
            startDate ||
            endDate
        );
    }, [searchQuery, customerTypeFilter, accountTypeFilter, roleFilter, statusFilter, activeStatFilter, startDate, endDate]);

    const handleStatCardClick = (filterType: string) => {
        setActiveStatFilter(filterType);
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async (updatedUser: User) => {
        try {
            // 엄격하게: 사용자 ID 검증
            const userId = typeof updatedUser.id === 'string' ? Number(updatedUser.id) : updatedUser.id;
            if (!userId || isNaN(userId) || userId <= 0) {
                setAlertState({
                    isOpen: true,
                    type: 'error',
                    title: '사용자 수정 실패',
                    message: '유효하지 않은 사용자 ID입니다.'
                });
                return;
            }

            let successMessages: string[] = [];

            // 엄격하게: 비밀번호가 입력되었는지 확인
            if (updatedUser.password && updatedUser.password.trim() !== '') {
                // 비밀번호 변경 API 호출
                await updateUserPasswordMutation.mutateAsync({
                    userId,
                    password: updatedUser.password
                });
                successMessages.push('비밀번호가 변경되었습니다.');
            }

            // 상태 변경이 있는 경우 API 호출
            const originalStatus = selectedUser?.status;
            if (updatedUser.status && updatedUser.status !== originalStatus) {
                await updateUserStatusMutation.mutateAsync({
                    userIdList: [userId]
                });
                successMessages.push('상태가 변경되었습니다.');
            }

            // 역할 변경이 있는 경우
            const originalRole = selectedUser?.role;
            if (updatedUser.role && updatedUser.role !== originalRole) {
                // 역할 문자열을 숫자로 변환
                let roleNumber: number;
                const roleLower = updatedUser.role.toLowerCase();
                
                if (roleLower === 'student') {
                    roleNumber = 1; // STUDENT
                } else if (roleLower === 'master') {
                    roleNumber = 2; // ORGANIZATION_ADMIN (Master)
                } else if (roleLower === 'admin') {
                    roleNumber = 5; // SUPER_ADMIN
                } else {
                    setAlertState({
                        isOpen: true,
                        type: 'error',
                        title: '역할 변경 실패',
                        message: '올바르지 않은 역할입니다.'
                    });
                    return;
                }

                await updateUserRoleMutation.mutateAsync({
                    userId,
                    role: roleNumber
                });
                successMessages.push('역할이 변경되었습니다.');
            }

            // 성공 메시지 표시
            setAlertState({
                isOpen: true,
                type: 'success',
                title: '사용자 정보 수정 완료',
                message: successMessages.length > 0 
                    ? successMessages.join('\n') 
                    : '사용자 정보가 수정되었습니다.'
            });

            setIsEditModalOpen(false);
        } catch (error: any) {
            setAlertState({
                isOpen: true,
                type: 'error',
                title: '사용자 수정 실패',
                message: error?.message || '사용자 정보 수정 중 오류가 발생했습니다.'
            });
        }
    };

    const handleDelete = async (user: User) => {
        if (!window.confirm(`${user.name} 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }
        const userId = typeof user.id === 'string' ? Number(user.id) : user.id;
        if (!userId || isNaN(userId) || userId <= 0) {
            setAlertState({
                isOpen: true,
                type: 'error',
                title: '삭제 실패',
                message: '유효하지 않은 사용자 ID입니다.',
            });
            return;
        }
        try {
            await deleteUsersMutation.mutateAsync({ userIdList: [userId] });
            setAlertState({
                isOpen: true,
                type: 'success',
                title: '회원 삭제 완료',
                message: `${user.name} 사용자가 삭제되었습니다.`,
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : '회원 삭제 중 오류가 발생했습니다.';
            setAlertState({
                isOpen: true,
                type: 'error',
                title: '회원 삭제 실패',
                message,
            });
        }
    };

    const getStatusVariant = (status: string): 'default' | 'destructive' => {
        return status === 'active' ? 'default' : 'destructive';
    };

    /**
     * 템플릿 다운로드 핸들러
     */
    const handleDownloadTemplate = async () => {
        try {
            const response = await downloadTemplateMutation.mutateAsync();
            
            // downloadUrl로 새 탭에서 다운로드
            window.open(response.downloadUrl, '_blank');

            setAlertState({
                isOpen: true,
                type: 'success',
                title: '템플릿 다운로드 성공',
                message: '회원 일괄 등록 템플릿을 다운로드했습니다.'
            });
        } catch (error: any) {
            setAlertState({
                isOpen: true,
                type: 'error',
                title: '템플릿 다운로드 실패',
                message: error.message || '템플릿 다운로드 중 오류가 발생했습니다.'
            });
        }
    };

    /**
     * Excel 파일 업로드 핸들러
     */
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // organizationId 입력 받기
        const orgIdStr = window.prompt('기관 ID를 입력하세요 (숫자):');
        if (!orgIdStr) {
            event.target.value = '';
            return;
        }

        const organizationId = parseInt(orgIdStr, 10);
        if (isNaN(organizationId)) {
            alert('유효한 기관 ID를 입력해주세요.');
            event.target.value = '';
            return;
        }

        try {
            await bulkCreateUsersMutation.mutateAsync({
                organizationId,
                file
            });

            setAlertState({
                isOpen: true,
                type: 'success',
                title: '회원 일괄 등록 성공',
                message: 'Excel 파일로 회원을 일괄 등록했습니다.'
            });

            // 데이터 새로고침 (Real API는 자동으로 refetch됨)
        } catch (error: any) {
            setAlertState({
                isOpen: true,
                type: 'error',
                title: '회원 일괄 등록 실패',
                message: error.message || '회원 일괄 등록 중 오류가 발생했습니다.'
            });
        } finally {
            event.target.value = '';
        }
    };

    /**
     * 회원 리스트 엑셀 추출 핸들러
     */
    const handleExportExcel = async () => {
        try {
            const response = await exportExcelMutation.mutateAsync({
                search: apiParams.search,
                role: apiParams.role,
                type: apiParams.type,
                isActive: apiParams.isActive,
                organizationId: undefined,
            });

            // downloadUrl로 새 탭에서 다운로드
            window.open(response.downloadUrl, '_blank');

            setAlertState({
                isOpen: true,
                type: 'success',
                title: '엑셀 추출 성공',
                message: `총 ${response.totalCount}명의 회원 리스트를 엑셀로 추출했습니다.`
            });
        } catch (error: any) {
            setAlertState({
                isOpen: true,
                type: 'error',
                title: '엑셀 추출 실패',
                message: error.message || '엑셀 추출 중 오류가 발생했습니다.'
            });
        }
    };

    // Pagination: API가 이미 현재 페이지만 반환하므로 클라이언트 slice 금지
    // (slice 시 2페이지부터 filteredUsers.slice(20,40) → 빈 배열이 됨)
    const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
    const paginatedUsers = filteredUsers;

    // 필터 값이 바뀔 때만 1페이지로 리셋 (users 변경 시에는 리셋하지 않음 → 페이지 이동 유지)
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, customerTypeFilter, accountTypeFilter, roleFilter, statusFilter, activeStatFilter, startDate, endDate, dateFilterType]);

    return (
        <>
            <PageHeader
                title="사용자 관리"
                breadcrumbs={[{ label: '사용자관리' }]}
                rightContent={
                    <div className="flex justify-end gap-3">
                        {/* Excel 관련 버튼들 */}
                        <button
                            onClick={handleDownloadTemplate}
                            disabled={downloadTemplateMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="회원 일괄 등록 템플릿 다운로드"
                        >
                            <FileSpreadsheet size={16} />
                            <span>템플릿 다운로드</span>
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={bulkCreateUsersMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Excel 파일로 회원 일괄 등록"
                        >
                            <Upload size={16} />
                            <span>회원 일괄 등록</span>
                        </button>

                        <button
                            onClick={handleExportExcel}
                            disabled={exportExcelMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="회원 리스트 엑셀 추출"
                        >
                            <Download size={16} />
                            <span>엑셀 추출</span>
                        </button>

                        <FilterGroup>
                            <FilterSelect
                                value={dateFilterType}
                                onValueChange={(val) => setDateFilterType(val)}
                                options={[
                                    { value: 'registeredDate', label: '가입일시' },
                                    { value: 'lastLogin', label: '최근접속' }
                                ]}
                            />
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

            {/* 🌐 Real API 상태 표시 */}
            {(usersLoading || statsLoading) && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-blue-600">데이터를 불러오는 중...</div>
                </div>
            )}
            {/* 401 에러는 자동으로 로그인 페이지로 리다이렉트되므로 여기서는 표시하지 않음 */}
            {(usersError || statsError) && 
             usersError && typeof usersError === 'object' && 'status' in usersError && usersError.status !== 401 &&
             statsError && typeof statsError === 'object' && 'status' in statsError && statsError.status !== 401 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</div>
                </div>
            )}

            {/* Statistics */}
            <StatsGrid items={[
                {
                    label: "총 사용자수",
                    value: stats.total,
                    sub: "명",
                    icon: Users,
                    color: "brand",
                    isActive: activeStatFilter === 'all',
                    onClick: () => handleStatCardClick('all')
                },
                {
                    label: "기관사용자",
                    value: stats.organization,
                    sub: "명",
                    icon: Building,
                    color: "brand",
                    isActive: activeStatFilter === 'organization',
                    onClick: () => handleStatCardClick('organization')
                },
                {
                    label: "개인사용자",
                    value: stats.individual,
                    sub: "명",
                    icon: UserIcon,
                    color: "brand",
                    isActive: activeStatFilter === 'individual',
                    onClick: () => handleStatCardClick('individual')
                },
                {
                    label: "신규 사용자",
                    value: stats.newUsers,
                    sub: "명 (30일 이내)",
                    icon: UserPlus,
                    color: "brand",
                    isActive: activeStatFilter === 'newUsers',
                    onClick: () => handleStatCardClick('newUsers')
                },
                {
                    label: "탈퇴 사용자",
                    value: stats.withdrawal,
                    sub: "명",
                    icon: UserCheck,
                    color: "brand",
                    isActive: activeStatFilter === 'withdrawal',
                    onClick: () => handleStatCardClick('withdrawal')
                }
            ]} />

            {/* List Header with Total and Filters */}
            <ListHeader
                totalCount={totalCount}
                rightContent={
                    <FilterGroup>
                        <div className="flex gap-4 items-center flex-wrap">
                            <div className="relative min-w-[250px]">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                />
                                <input
                                    type="text"
                                    placeholder="이름, 이메일, 기관명으로 검색"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        aria-label="검색어 지우기"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <FilterSelect
                                value={customerTypeFilter}
                                onValueChange={(val) => {
                                    setCustomerTypeFilter(val);
                                    setCurrentPage(1);
                                }}
                                options={[
                                    { value: '', label: '전체 고객' },
                                    { value: '기관고객', label: '기관고객' },
                                    { value: '개인고객', label: '개인고객' }
                                ]}
                            />
                            <FilterSelect
                                value={accountTypeFilter}
                                onValueChange={(val) => {
                                    setAccountTypeFilter(val);
                                    setCurrentPage(1);
                                }}
                                options={[
                                    { value: '', label: '전체 회원구분' },
                                    { value: '정회원', label: '정회원' },
                                    { value: '게스트', label: '게스트' }
                                ]}
                            />
                            <FilterSelect
                                value={roleFilter}
                                onValueChange={(val) => {
                                    setRoleFilter(val);
                                    setCurrentPage(1);
                                }}
                                options={[
                                    { value: '', label: '전체 역할' },
                                    { value: 'Master', label: 'Master' },
                                    { value: 'Student', label: 'Student' }
                                ]}
                            />
                            <FilterSelect
                                value={statusFilter}
                                onValueChange={(val) => {
                                    setStatusFilter(val);
                                    setCurrentPage(1);
                                }}
                                options={[
                                    { value: '', label: '전체 상태' },
                                    { value: 'active', label: '활성' },
                                    { value: 'inactive', label: '비활성' },
                                    { value: 'withdrawal', label: '탈퇴' }
                                ]}
                            />
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
                                    aria-label="필터 초기화"
                                >
                                    초기화
                                </button>
                            )}
                        </div>
                    </FilterGroup>
                }
            />

            {/* User Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>No.</TableHead>
                            <TableHead>사용자</TableHead>
                            <TableHead>고객구분</TableHead>
                            <TableHead>역할</TableHead>
                            <TableHead>시뮬레이션 수</TableHead>
                            <TableHead>참여 클래스 수</TableHead>
                            <TableHead>최종접속일</TableHead>
                            <TableHead>회원가입일</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user, index) => {
                                const isMaster = user.role?.toLowerCase() === 'master';

                                const isWithdrawal = user.status === 'withdrawal';
                                const displayName = isWithdrawal ? '탈퇴한 사용자' : user.name;
                                const displayEmail = isWithdrawal ? '-' : (user.email || '-');
                                // 전체 건수 기준 역순 번호: 1페이지 40→20, 2페이지 20→1 (페이지 바뀌어도 1로 초기화 안 함)
                                const globalIndex = (currentPage - 1) * itemsPerPage + index;
                                const rowNo = totalCount - globalIndex;

                                return (
                                    <TableRow
                                        key={user.id}
                                        className={`hover:bg-gray-50 transition-colors ${isMaster ? 'bg-orange-50' : ''} ${isWithdrawal ? 'opacity-60' : ''}`}
                                    >
                                        <TableCell>{rowNo}</TableCell>
                                        <TableCell>
                                            <div>
                                                <strong className={`flex items-center gap-2 mb-1 ${isMaster ? 'text-orange-600' : ''}`}>
                                                    {isMaster && <Crown size={16} />}
                                                    {displayName}
                                                </strong>
                                                <div className="text-sm text-gray-600">
                                                    {displayEmail}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {user.customerType === '기관고객' ? (
                                                    <>
                                                        <Building2 size={14} className="text-green-600" />
                                                        <span>{user.organizationName}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserIcon size={14} className="text-indigo-600" />
                                                        <span>개인</span>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`${isMaster ? 'text-orange-600 font-semibold' : ''}`}>
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell>{user.simulationCount ?? '-'}</TableCell>
                                        <TableCell>{user.classCount ?? '-'}</TableCell>
                                        <TableCell>{user.lastLogin ? formatDateTimeWithSeconds(user.lastLogin) : '-'}</TableCell>
                                        <TableCell>{user.registeredDate ? formatDateTimeWithSeconds(user.registeredDate) : '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(user.status)}>
                                                {user.status === 'active' ? '활성' : '비활성'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <button
                                                    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    onClick={() => handleEdit(user)}
                                                    title="수정"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    onClick={() => handleDelete(user)}
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center py-12 text-gray-500">
                                    검색 결과가 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
            />

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUser}
                onSave={handleSaveUser}
            />

            <AlertDialog
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                title={alertState.title}
                message={alertState.message}
            />
        </>
    );
}
