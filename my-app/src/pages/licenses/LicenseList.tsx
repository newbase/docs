import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, FileText, AlertCircle } from 'lucide-react';
import LicenseSettingsModal from './modals/LicenseSettingsModal';
import { License } from '../../types/admin';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Pagination } from '@/components/shared/ui';
import { DataSourceTabs } from '@/components/shared/DataSourceTabs';
import { useLicenseList } from '@/hooks/useLicenseList';
import { convertLicenseDtoToLicense } from '@/utils/licenseUtils';
import { handleApiError } from '@/utils/errorHandlers';

interface LicenseListProps {
    licenses: License[];
    showStats?: boolean;
    showAddButton?: boolean;
    showDataSourceTabs?: boolean; // DataSourceTabs 표시 여부
    organizationIdForOrderCreate?: string; // 주문 생성 페이지로 이동 시 기관 ID (통합: AddLicenseModal 대신 OrderCreate 사용)
    onAddLicense?: (license: License) => void;
    onLicenseSettings?: (license: License) => void;
    onSaveLicense?: (license: License) => void;
    onLicenseClick?: (license: License) => void;
    leftActions?: React.ReactNode;
}

export default function LicenseList({
    licenses: initialLicenses,
    showStats = true,
    showAddButton = true,
    showDataSourceTabs = false,
    organizationIdForOrderCreate,
    onAddLicense,
    onLicenseSettings,
    onSaveLicense,
    onLicenseClick,
    leftActions
}: LicenseListProps): React.ReactElement {
    const navigate = useNavigate();
    const [dataSource, setDataSource] = useState<'mock' | 'real'>('mock');
    const [licenses, setLicenses] = useState<License[]>(initialLicenses);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
    const [selectedLicense, setSelectedLicense] = useState<License | null>(null);

    const handleAddLicenseClick = () => {
        const qs = organizationIdForOrderCreate ? `?organizationId=${organizationIdForOrderCreate}` : '';
        navigate(`/admin/order-create${qs}`);
    };

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // Real API 조회
    const {
        data: realData,
        isLoading: realLoading,
        error: realError,
        refetch: refetchRealData
    } = useLicenseList({
        enabled: dataSource === 'real',
    });

    // Real 데이터를 License 타입으로 변환
    const realLicenses = realData?.licenseList.map(convertLicenseDtoToLicense) || [];

    // 표시할 라이센스 결정 (Mock or Real)
    const displayLicenses = dataSource === 'real' ? realLicenses : initialLicenses;

    // Update internal state when prop changes or dataSource changes
    useEffect(() => {
        setLicenses(displayLicenses);
        setCurrentPage(1); // Reset to first page when licenses change
    }, [initialLicenses, dataSource, realData]);

    // Calculate stats
    const licenseStats = {
        total: licenses.length,
        active: licenses.filter(l => l.status === 'active').length,
        expiring: licenses.filter(l => l.status === 'expiring').length,
        expired: licenses.filter(l => l.status === 'expired').length
    };

    const handleSettings = (license: License) => {
        if (onLicenseSettings) {
            onLicenseSettings(license);
        }
        setSelectedLicense(license);
        setIsSettingsModalOpen(true);
    };

    const handleSaveLicense = (updatedLicense: License) => {
        setLicenses(prev => prev.map(l => l.id === updatedLicense.id ? updatedLicense : l));
        console.log('Saving license:', updatedLicense);
        if (onSaveLicense) {
            onSaveLicense(updatedLicense);
        }
    };

    const handleAddNewLicense = (newLicense: License) => {
        setLicenses(prev => [newLicense, ...prev]);
        console.log('Adding license:', newLicense);
        if (onAddLicense) onAddLicense(newLicense);
    };

    const getStatusBadge = (status: string) => {
        const badges: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
            active: { label: '활성', variant: 'default' },
            expiring: { label: '만료임박', variant: 'destructive' },
            expired: { label: '만료', variant: 'destructive' },
            pending: { label: '대기', variant: 'secondary' }
        };
        return badges[status] || badges.active;
    };

    // Pagination logic
    const totalPages = Math.ceil(licenses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLicenses = licenses.slice(startIndex, endIndex);

    return (
        <>
            {/* DataSourceTabs */}
            {showDataSourceTabs && (
                <div className="mb-6">
                    <DataSourceTabs
                        value={dataSource}
                        onChange={setDataSource}
                    />

                    {/* API Status Box */}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                {dataSource === 'real' ? (
                                    <>
                                        <p className="font-medium mb-1">Real API 연동 준비 완료</p>
                                        <p className="text-xs text-blue-700">
                                            현재 Mock 데이터를 사용 중입니다. 백엔드 API 준비 시 자동으로 Real 데이터로 전환됩니다.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium mb-1">Mock 데이터 사용 중</p>
                                        <p className="text-xs text-blue-700">
                                            개발/테스트용 샘플 데이터입니다.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {dataSource === 'real' && realError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-red-900 mb-1">
                                {handleApiError(realError).title}
                            </h4>
                            <p className="text-sm text-red-700 mb-3">
                                {handleApiError(realError).message}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => refetchRealData()}
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

            {/* Loading Indicator */}
            {dataSource === 'real' && realLoading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                        <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>라이센스 목록을 불러오는 중...</span>
                    </div>
                </div>
            )}

            {showStats && (
                <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
                    <div className="flex gap-6 pl-2 pt-4 items-center">
                        <div className="flex items-center gap-3">
                            <span className="text-base font-medium text-gray-600">사용중</span>
                            <span className="text-base font-bold text-green-600">{licenseStats.active}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-base font-medium text-gray-600">만료예정</span>
                            <span className="text-base font-bold text-orange-600">{licenseStats.expiring}</span>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        {leftActions}
                        {showAddButton && (
                            <Button
                                variant="lightdark"
                                size="md"
                                onClick={handleAddLicenseClick}
                            >
                                <Plus size={18} />
                                주문 및 라이선스 등록
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>제품명</TableHead>
                            <TableHead>구독플랜</TableHead>
                            <TableHead>플랫폼</TableHead>
                            <TableHead>라이센스 유형</TableHead>
                            <TableHead>기간</TableHead>
                            <TableHead>활성/최대</TableHead>
                            <TableHead>누적</TableHead>
                            <TableHead>시작일</TableHead>
                            <TableHead>종료일</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>설정</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Loading Skeleton */}
                        {dataSource === 'real' && realLoading ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <TableRow key={`skeleton-${idx}`}>
                                    <TableCell>
                                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : paginatedLicenses.length > 0 ? (
                            paginatedLicenses.map((license) => {
                                const statusBadge = getStatusBadge(license.status);
                                return (
                                    <TableRow key={license.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="font-semibold text-gray-900">
                                            {onLicenseClick ? (
                                                <button
                                                    onClick={() => onLicenseClick(license)}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                >
                                                    {license.className}
                                                </button>
                                            ) : (
                                                license.className
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="default">{license.subscriptionPlan}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">{license.platform}</TableCell>
                                        <TableCell className="text-sm text-gray-600">{license.licenseType}</TableCell>
                                        <TableCell className="text-sm text-gray-600">{license.duration}</TableCell>
                                        <TableCell className="text-sm text-gray-900">
                                            {license.activeUsers || 0} / {license.maxUsers}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-900">{license.totalUsers || 0}</TableCell>
                                        <TableCell className="text-sm text-gray-600">{license.startDate}</TableCell>
                                        <TableCell className="text-sm text-gray-600">{license.endDate || 'Lifetime'}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusBadge.variant}>
                                                {statusBadge.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                type="button"
                                                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                onClick={() => handleSettings(license)}
                                                aria-label={`${license.className} 라이센스 설정`}
                                            >
                                                <Settings size={16} aria-hidden="true" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            /* Enhanced Empty State */
                            <TableRow>
                                <TableCell colSpan={11} className="py-16">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="mb-4 p-4 bg-gray-100 rounded-full">
                                            <FileText size={48} className="text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            등록된 라이센스가 없습니다
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-6 max-w-md">
                                            새로운 라이센스를 발급하여 기관에 서비스를 제공하세요.
                                        </p>
                                        {showAddButton && (
                                            <button
                                                onClick={handleAddLicenseClick}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                            >
                                                <Plus size={18} />
                                                주문 및 라이선스 등록
                                            </button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {licenses.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={licenses.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            )}

            <LicenseSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                license={selectedLicense}
                onSave={handleSaveLicense}
            />

        </>
    );
}
