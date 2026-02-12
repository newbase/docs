import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchBar, FilterGroup, FilterSelect, DateRangeFilter, StatsGrid, ListHeader, Pagination, PageHeader, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from '@/components/shared/ui';
import { Building, CheckCircle, AlertCircle, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import { Organization } from '../../types/admin';
import AddOrganizationModal from './modals/AddOrganizationModal';
import EditOrganizationModal from './modals/EditOrganizationModal';
import { useOrganizations, useOrganizationCount, useDeleteOrganization } from '@/hooks/useOrganization';
import { AlertDialog } from '@/components/shared/ui';

/** API 실패 시 사용할 mock 기관 목록 */
const MOCK_ORGANIZATIONS: Organization[] = [
    {
        id: '1',
        name: '서울대학교병원',
        country: '대한민국',
        type: '종합병원',
        status: 'active',
        licenseType: '사용자구독',
        licenseCount: 50,
        deviceCount: 10,
        userCount: 50,
        registeredDate: '2024-01-15',
        expiryDate: '2025-12-31',
    },
    {
        id: '2',
        name: '연세의료원',
        country: '대한민국',
        type: '종합병원',
        status: 'active',
        licenseType: '기기구독',
        deviceCount: 20,
        userCount: 0,
        registeredDate: '2024-03-01',
        expiryDate: '2025-06-30',
    },
    {
        id: '3',
        name: '강북삼성병원',
        country: '대한민국',
        type: '종합병원',
        status: 'inactive',
        licenseType: '사용자구독',
        licenseCount: 30,
        deviceCount: 5,
        userCount: 30,
        registeredDate: '2023-11-20',
        expiryDate: '2024-10-15',
    },
];

export default function OrganizationList(): React.ReactElement {
    const navigate = useNavigate();
    const routerLocation = useLocation();
    const prevPathnameRef = useRef<string>('');
    
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [countryFilter, setCountryFilter] = useState<string>('전체 국가');
    const [typeFilter, setTypeFilter] = useState<string>('전체 유형');
    const [statusFilter, setStatusFilter] = useState<string>('전체 상태');
    const [activeStatFilter, setActiveStatFilter] = useState<string>('all'); // 엄격하게: 통계 카드 필터 상태 추가
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [selectedOrganization, setSelectedOrganization] = useState<Organization | undefined>(undefined);
    const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string }>({
        isOpen: false,
        message: ''
    });
    const itemsPerPage = 10;
    
    // 삭제 Hook
    const deleteOrganizationMutation = useDeleteOrganization();

    // Date range filter
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const [startDate, setStartDate] = useState<string>(formatDate(oneYearAgo));
    const [endDate, setEndDate] = useState<string>(formatDate(today));

    // 엄격하게: 통계 카드 필터에 따른 API 파라미터 계산
    const apiParams = useMemo(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        let licenseStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXPIRING_SOON' | undefined;
        let filterStartDate: string | undefined;
        let filterEndDate: string | undefined;

        // 통계 카드 필터에 따른 조건 설정
        switch (activeStatFilter) {
            case 'active':
                licenseStatus = 'ACTIVE';
                break;
            case 'new':
                // 신규 기관: 최근 30일 이내 등록
                filterStartDate = formatDate(thirtyDaysAgo);
                filterEndDate = formatDate(today);
                break;
            case 'expiring':
                // 만료 예정 라이센스
                licenseStatus = 'EXPIRING_SOON';
                break;
            case 'all':
            default:
                // 전체: 필터 없음 (날짜 필터도 전달하지 않음)
                break;
        }

        // 엄격하게: 일반 필터와 통계 필터 병합
        // 기존 동작 유지: 날짜 필터는 선택적으로만 전송 (모든 데이터를 보기 위해)
        // 통계 필터의 날짜가 있을 때만 전달, 없으면 undefined (기존처럼 주석 처리된 것과 동일)
        return {
            page: currentPage,
            pageSize: itemsPerPage,
            search: searchQuery || undefined,
            licenseStatus: licenseStatus || (statusFilter === '활성화' ? 'ACTIVE' : statusFilter === '비활성화' ? 'INACTIVE' : undefined),
            // TODO: 필터 파라미터 매핑 필요
            // countryId: countryFilter !== '전체 국가' ? Number(countryFilter) : undefined,
            // organizationTypeId: typeFilter !== '전체 유형' ? Number(typeFilter) : undefined,
            // 날짜 필터는 통계 필터가 'new'일 때만 전달 (기존처럼 주석 처리된 것과 동일한 동작)
            startDate: filterStartDate || undefined,
            endDate: filterEndDate || undefined,
        };
    }, [currentPage, itemsPerPage, searchQuery, activeStatFilter, statusFilter]);

    // 🌐 Real API 호출
    const { 
        data: realApiData, 
        isLoading: realLoading, 
        error: realError,
        refetch: refetchOrganizations
    } = useOrganizations(
        apiParams,
        {
            retry: 1, // 에러 시 1번만 재시도
            refetchOnMount: true, // 컴포넌트 마운트 시 항상 refetch
        }
    );

    const { 
        data: realCountData,
        isLoading: countLoading,
        refetch: refetchCount
    } = useOrganizationCount({
        retry: 1,
    });

    // API 실패 시 mock 데이터 사용
    const useMockData = !!realError;

    // 🌐 Real API 데이터 변환 (실패 시 mock 사용)
    const organizations: Organization[] = useMemo(() => {
        if (useMockData) {
            return MOCK_ORGANIZATIONS;
        }
        if (realApiData?.organizationList) {
            // ✅ Swagger 타입에 맞춰 변환: OrganizationInfoDto → Organization
            return realApiData.organizationList.map((item) => ({
                id: String(item.organizationId),
                name: item.title,
                country: item.countryName,
                type: item.organizationTypeTitle,
                businessNumber: '', // API에 없음
                contactPerson: '', // API에 없음
                department: '', // API에 없음
                phone: '', // API에 없음
                email: '', // API에 없음
                registeredDate: item.createdAt ? item.createdAt.split('T')[0] : '',
                status: item.licenseStatus === 'ACTIVE' ? 'active' : 'inactive',
                licenseType: item.licenseType === 'USER' ? '사용자구독' : 
                            item.licenseType === 'DEVICE' ? '기기구독' : 
                            item.licenseType === 'LIFETIME' ? '평생구독' : '데모',
                licenseCount: item.licenseType === 'USER' ? item.userCount : 0,
                deviceCount: item.deviceCount,
                userCount: item.userCount,
                expiryDate: item.licenseExpiryDate || '',
            })) as Organization[];
        }
        return [];
    }, [realApiData, useMockData]);

    const isLoading = realLoading || countLoading;
    const error = realError;

    // 등록 후 목록 페이지로 돌아왔을 때 자동 refetch
    useEffect(() => {
        const currentPathname = routerLocation.pathname;
        // 경로가 변경되고 목록 페이지로 돌아왔을 때 refetch
        if (currentPathname === '/admin/organizations' && prevPathnameRef.current !== currentPathname) {
            refetchOrganizations();
            refetchCount(); // 통계도 함께 갱신
        }
        prevPathnameRef.current = currentPathname;
    }, [routerLocation.pathname, refetchOrganizations, refetchCount]);

    // Pagination: API 실패 시 mock 전체 건수·페이지 계산
    const listTotalCount = useMockData ? organizations.length : (realApiData?.totalCount ?? 0);
    const totalPages = useMemo(() => {
        if (useMockData) {
            return Math.max(1, Math.ceil(organizations.length / itemsPerPage));
        }
        if (realApiData) {
            return Math.max(1, Math.ceil((realApiData.totalCount || 0) / itemsPerPage));
        }
        return 0;
    }, [realApiData, itemsPerPage, useMockData, organizations.length]);

    // API 실패 시 클라이언트 페이지네이션, 아니면 서버 페이지네이션 결과 그대로 사용
    const paginatedOrganizations = useMemo(() => {
        if (useMockData) {
            const start = (currentPage - 1) * itemsPerPage;
            return organizations.slice(start, start + itemsPerPage);
        }
        return organizations;
    }, [organizations, useMockData, currentPage, itemsPerPage]);

    // Calculate statistics (API 실패 시 mock 데이터로 계산)
    const totalOrganizations = useMemo(() => {
        if (useMockData) return MOCK_ORGANIZATIONS.length;
        return realCountData?.totalCount || 0;
    }, [realCountData, useMockData]);

    const activeOrganizations = useMemo(() => {
        if (useMockData) return MOCK_ORGANIZATIONS.filter(o => o.status === 'active').length;
        return realCountData?.activeCount || 0;
    }, [realCountData, useMockData]);

    // 30일 이내 신규 기관 수 (목록 데이터에서 계산, mock 시 mock 기준)
    const newOrganizations = useMemo(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        const source = useMockData ? MOCK_ORGANIZATIONS : organizations;
        return source.filter(org => {
            if (!org.registeredDate) return false;
            const registeredDate = new Date(org.registeredDate);
            registeredDate.setHours(0, 0, 0, 0);
            return registeredDate >= thirtyDaysAgo && registeredDate <= today;
        }).length;
    }, [organizations, useMockData]);

    const expiringSoon = useMemo(() => {
        if (useMockData) {
            const today = new Date();
            const in30Days = new Date(today);
            in30Days.setDate(today.getDate() + 30);
            return MOCK_ORGANIZATIONS.filter(o => {
                if (!o.expiryDate) return false;
                const expiry = new Date(o.expiryDate);
                return expiry >= today && expiry <= in30Days;
            }).length;
        }
        return realCountData?.expiringSoonCount || 0;
    }, [realCountData, useMockData]);

    // 엄격하게: 통계 카드 클릭 핸들러
    const handleStatCardClick = (filterType: string) => {
        // 같은 카드를 다시 클릭하면 필터 해제 (토글 방식)
        if (activeStatFilter === filterType) {
            setActiveStatFilter('all');
        } else {
            setActiveStatFilter(filterType);
        }
        setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
        // 통계 필터가 활성화되면 다른 필터는 초기화하지 않음 (사용자가 설정한 필터 유지)
    };

    // 엄격하게: 통계 카드 데이터 (기본값 'all'일 때는 아무 카드도 활성화되지 않음)
    const statsData = [
        {
            label: "전체 기관고객수",
            value: totalOrganizations,
            sub: "CLIENTS",
            icon: Building,
            color: "brand",
            isActive: false, // 엄격하게: 기본값일 때는 활성화되지 않음
            onClick: () => handleStatCardClick('all')
        },
        {
            label: "활성 기관고객수",
            value: activeOrganizations,
            sub: "ACTIVE",
            icon: CheckCircle,
            color: "brand",
            isActive: activeStatFilter === 'active',
            onClick: () => handleStatCardClick('active')
        },
        {
            label: "신규 기관고객수",
            value: newOrganizations,
            sub: "LAST 30 DAYS",
            icon: TrendingUp,
            color: "brand",
            isActive: activeStatFilter === 'new',
            onClick: () => handleStatCardClick('new')
        },
        {
            label: "만료 예정 라이센스",
            value: expiringSoon,
            sub: "30일 이내",
            icon: AlertCircle,
            color: "brand",
            isActive: activeStatFilter === 'expiring',
            onClick: () => handleStatCardClick('expiring')
        }
    ];

    const getStatusBadge = (status: string): 'default' | 'destructive' => {
        return status === 'active' ? 'default' : 'destructive';
    };

    const handleEdit = (org: Organization) => {
        setSelectedOrganization(org);
        setIsEditModalOpen(true);
    };

    const handleEditClose = () => {
        setIsEditModalOpen(false);
        setSelectedOrganization(undefined);
    };

    const handleEditSuccess = () => {
        // TODO: 목록 새로고침 또는 상태 업데이트
        handleEditClose();
    };

    const handleDelete = async (orgId: string) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) {
            return;
        }

        try {
            // 엄격한 입력 검증
            if (!orgId || typeof orgId !== 'string' || orgId.trim() === '') {
                setAlertState({ isOpen: true, message: '유효하지 않은 기관 ID입니다.' });
                return;
            }

            // 숫자 변환 및 검증
            const organizationId = Number(orgId);
            if (isNaN(organizationId) || organizationId <= 0 || !Number.isInteger(organizationId)) {
                setAlertState({ isOpen: true, message: '기관 ID는 양의 정수여야 합니다.' });
                return;
            }

            await deleteOrganizationMutation.mutateAsync(organizationId);
            setAlertState({ isOpen: true, message: '기관이 삭제되었습니다.' });
            refetchOrganizations();
            refetchCount();
        } catch (error: any) {
            // 사용자 친화적인 에러 메시지로 변환
            let errorMessage = '기관 삭제에 실패했습니다.';
            
            // 일반 에러 (타입 검증 실패 등)
            if (error instanceof Error && !('status' in error)) {
                errorMessage = error.message || '기관 삭제에 실패했습니다.';
                setAlertState({ isOpen: true, message: errorMessage });
                return;
            }
            
            // ApiError인 경우 상태 코드에 따라 메시지 변환
            if (error?.status) {
                switch (error.status) {
                    case 404:
                        errorMessage = '삭제할 기관을 찾을 수 없습니다. (백엔드 API가 구현되지 않았을 수 있습니다.)';
                        break;
                    case 403:
                        errorMessage = '기관 삭제 권한이 없습니다.';
                        break;
                    case 400:
                        errorMessage = '기관 삭제 요청이 올바르지 않습니다.';
                        break;
                    case 500:
                    case 502:
                    case 503:
                        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                        break;
                    default:
                        errorMessage = `기관 삭제에 실패했습니다. (상태 코드: ${error.status})`;
                }
            } else if (error?.data?.message) {
                // 백엔드에서 제공한 메시지가 있으면 사용 (하지만 기술적인 메시지는 필터링)
                const backendMessage = error.data.message;
                // 기술적인 메시지 필터링 (DELETE, Cannot, HTTP 메서드, URL 경로 등)
                if (!backendMessage.includes('DELETE') && 
                    !backendMessage.includes('Cannot') && 
                    !backendMessage.includes('/organization/') &&
                    !backendMessage.includes('404') &&
                    !backendMessage.includes('Not Found')) {
                    errorMessage = backendMessage;
                }
            }
            
            setAlertState({ isOpen: true, message: errorMessage });
        }
    };

    const handleAddNew = () => {
        setIsAddModalOpen(true);
    };

    const handleOrganizationAdded = () => {
        // 기관 등록 후 목록 및 통계 즉시 갱신
        refetchOrganizations();
        refetchCount();
    };

    return (
        <>
            <PageHeader
                title="기관관리"
                breadcrumbs={[{ label: '기관관리' }]}
                actions={
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Plus size={16} />
                        신규 등록
                    </button>
                }
            />

            {/* Loading/Error 상태 표시 (API 실패 시 mock 데이터 표시 안내) */}
            {isLoading && !useMockData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-700 text-sm">데이터를 불러오는 중...</p>
                </div>
            )}
            {useMockData && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-amber-800 text-sm">데이터를 불러올 수 없어 샘플 데이터를 표시합니다.</p>
                </div>
            )}
            {error && !useMockData && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700 text-sm">데이터를 불러오는 중 오류가 발생했습니다: {error.message || '알 수 없는 오류'}</p>
                </div>
            )}

            {/* Statistics */}
            <StatsGrid items={statsData} />

            {/* List Header with Total and Filters */}
            <ListHeader
                totalCount={listTotalCount}
                rightContent={
                    <>
                        <FilterGroup>
                            <FilterSelect
                                value={countryFilter}
                                onValueChange={(val) => setCountryFilter(val)}
                                options={[
                                    { value: '전체 국가', label: '전체 국가' },
                                    { value: '대한민국', label: '대한민국' },
                                    { value: '일본', label: '일본' },
                                    { value: '미국', label: '미국' },
                                    { value: '영국', label: '영국' },
                                    { value: '프랑스', label: '프랑스' },
                                    { value: '독일', label: '독일' }
                                ]}
                            />
                            <FilterSelect
                                value={typeFilter}
                                onValueChange={(val) => setTypeFilter(val)}
                                options={[
                                    { value: '전체 유형', label: '전체 유형' },
                                    { value: '종합병원', label: '종합병원' },
                                    { value: '의과대학', label: '의과대학' },
                                    { value: '간호대학', label: '간호대학' },
                                    { value: '공공기관', label: '공공기관' },
                                    { value: '일반학교', label: '일반학교' },
                                    { value: '유통업체', label: '유통업체' },
                                    { value: '산업체', label: '산업체' },
                                    { value: '기타', label: '기타' }
                                ]}
                            />
                            <FilterSelect
                                value={statusFilter}
                                onValueChange={(val) => setStatusFilter(val)}
                                options={[
                                    { value: '전체 상태', label: '전체 상태' },
                                    { value: '활성화', label: '활성화' },
                                    { value: '비활성화', label: '비활성화' }
                                ]}
                            />
                            <SearchBar
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="기관명, 담당자, 이메일 검색"
                            />
                        </FilterGroup>
                        <DateRangeFilter
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={(val) => setStartDate(val)}
                            onEndDateChange={(val) => setEndDate(val)}
                        />
                    </>
                }
            />

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>기관명</TableHead>
                            <TableHead>국가</TableHead>
                            <TableHead>기관유형</TableHead>
                            <TableHead>라이센스 유형</TableHead>
                            <TableHead>기기수</TableHead>
                            <TableHead>사용자수</TableHead>
                            <TableHead>라이센스 만료일</TableHead>
                            <TableHead>등록일</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedOrganizations.length > 0 ? (
                            paginatedOrganizations.map((org) => {
                                let isExpiringSoon = false;
                                let isExpired = false;
                                let daysUntilExpiry = 0;

                                if (org.expiryDate) {
                                    const expiryDate = new Date(org.expiryDate);
                                    const today = new Date();
                                    daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                                    isExpired = daysUntilExpiry <= 0;
                                }

                                return (
                                    <TableRow
                                        key={org.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <TableCell>
                                            <div
                                                className="flex items-center gap-2 cursor-pointer"
                                                onClick={() => navigate(`/admin/organizations/${org.id}`)}
                                            >
                                                <Building size={16} className="text-blue-600 flex-shrink-0" />
                                                <strong className="text-blue-600 hover:underline">{org.name}</strong>
                                            </div>
                                        </TableCell>
                                        <TableCell>{org.country}</TableCell>
                                        <TableCell>{org.type}</TableCell>
                                        <TableCell>
                                            <Badge variant={org.licenseType === '사용자구독' ? 'default' : 'secondary'}>
                                                {org.licenseType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{org.deviceCount || '-'}</TableCell>
                                        <TableCell>{org.userCount}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div>{org.expiryDate}</div>
                                                {isExpiringSoon && (
                                                    <div className="text-xs text-orange-600 mt-0.5">
                                                        {daysUntilExpiry}일 남음
                                                    </div>
                                                )}
                                                {isExpired && (
                                                    <div className="text-xs text-red-600 mt-0.5">
                                                        만료됨
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{org.registeredDate}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadge(org.status)}>
                                                {org.status === 'active' ? '활성' : '비활성'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(org);
                                                    }}
                                                    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="수정"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(org.id)}
                                                    className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
                totalItems={listTotalCount}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
            />

            {/* Add Organization Modal */}
            <AddOrganizationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleOrganizationAdded}
            />

            {/* Edit Organization Modal */}
            <EditOrganizationModal
                isOpen={isEditModalOpen}
                onClose={handleEditClose}
                organization={selectedOrganization}
                onSave={handleEditSuccess}
                dataSource="real"
            />

            {/* AlertDialog */}
            <AlertDialog
                isOpen={alertState.isOpen}
                onClose={() => setAlertState({ isOpen: false, message: '' })}
                message={alertState.message}
            />
        </>
    );
}
