import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Plus, ExternalLink, FileText } from 'lucide-react';
import { PageHeader, Button, Pagination } from '@/components/shared/ui';
import LicenseList from '../licenses/LicenseList';
import EditOrganizationModal from './modals/EditOrganizationModal';
import AddNoteModal from './modals/AddNoteModal';
import { Organization, License, Note } from '../../types/admin';
import { useOrganizationDetail } from '@/hooks/useOrganization';
import { useLicensesByOrganization, useCreateLicense, useUpdateLicense } from '@/hooks/useLicense';
import AlertDialog from '@/components/shared/ui/AlertDialog';
import { ApiError } from '../../services/apiClient';
import { mockOrganizations } from '@/data/mockOrganizations';
import { getMockLicensesByOrganizationIdSync } from '@/data/mockLicenses';
import { convertLicenseDtoToLicense } from '@/utils/licenseUtils';

export default function OrganizationDetail(): React.ReactElement {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [isEditOrgModalOpen, setIsEditOrgModalOpen] = useState<boolean>(false);
    const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState<boolean>(false);

    // Alert Dialog State
    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    // License Mutations
    const createLicenseMutation = useCreateLicense();
    const updateLicenseMutation = useUpdateLicense();

    // Pagination for notes
    const [currentNotePage, setCurrentNotePage] = useState<number>(1);
    const notesPerPage = 10;

    // 🌐 Real API 호출
    const organizationIdNum = useMemo(() => {
        if (!id) return 0;
        const num = Number(id);
        return isNaN(num) ? 0 : num;
    }, [id]);

    const {
        data: realApiData,
        isLoading: realLoading,
        error: realError
    } = useOrganizationDetail(
        organizationIdNum,
        {
            enabled: !!organizationIdNum,
            retry: 1,
        }
    );

    // 🌐 Real API 라이센스 목록 호출
    const {
        data: realLicensesData,
        isLoading: licensesLoading,
        error: licensesError
    } = useLicensesByOrganization(
        id || '',
        {
            enabled: !!id,
            retry: false,
        }
    );

    // 🌐 Real API 데이터 - 노트 API가 없으면 빈 배열
    // TODO: Real API 노트 목록 연동 필요
    const notes: Note[] = [];

    // Pagination logic for notes (before early return to ensure hooks are called)
    const notesTotalPages = Math.ceil(notes.length / notesPerPage);
    const notesStartIndex = (currentNotePage - 1) * notesPerPage;
    const notesEndIndex = notesStartIndex + notesPerPage;
    const paginatedNotes = useMemo(() => {
        return notes.slice(notesStartIndex, notesEndIndex);
    }, [notes, notesStartIndex, notesEndIndex]);

    // 🌐 Real API 데이터 (licenseList 또는 licenses 키 지원, DTO → License 변환) + Mock fallback
    const licenses: License[] = useMemo(() => {
        let list: any[] = [];
        if (Array.isArray(realLicensesData)) {
            list = realLicensesData;
        } else if (realLicensesData && typeof realLicensesData === 'object') {
            const raw = (realLicensesData as any).licenseList ?? (realLicensesData as any).licenses;
            if (Array.isArray(raw)) list = raw;
        }
        if (list.length === 0 && id) {
            const numId = Number(id);
            if (!isNaN(numId)) {
                list = getMockLicensesByOrganizationIdSync(numId);
            }
        }
        if (list.length === 0) return [];
        return list.map((item: any) =>
            item.organizationLicenseId != null ? convertLicenseDtoToLicense(item) : item
        );
    }, [realLicensesData, id]);

    const licenseStats = useMemo(() => {
        const active = licenses.filter(l => l.status === 'active').length;
        const expired = licenses.filter(l => l.status === 'expired').length;
        const total = licenses.length;
        return { active, expired, total };
    }, [licenses]);

    // 🌐 Real API 데이터 변환 + Mock fallback (API 미연동/실패 시 상세 페이지 표시용)
    const organization = useMemo(() => {
        const mapDtoToOrganization = (dto: typeof realApiData) => {
            if (!dto) return null;
            const countryObj = dto.country || { id: 0, title: '' };
            const organizationTypeObj = dto.organizationType || { id: 0, title: '' };
            return {
                id: String(dto.organizationId),
                name: dto.title || '',
                country: countryObj,
                type: organizationTypeObj.title || '',
                organizationType: organizationTypeObj,
                countryCallingCode: dto.countryCallingCode || { id: 0, code: '', title: '' },
                businessNumber: dto.businessRegistrationNumber || '',
                contactPerson: dto.managerName || '',
                department: dto.department || '',
                position: '',
                phone: dto.phoneNumber || '',
                email: dto.email || '',
                registeredDate: dto.createdAt || '',
                status: dto.licenseStatus === 'ACTIVE' ? 'active' : 'inactive',
                licenseType: '사용자구독',
                licenseCount: 0,
                deviceCount: 0,
                userCount: 0,
                expiryDate: '',
                isPartner: dto.isPartner ?? false
            } as any;
        };

        if (realApiData) return mapDtoToOrganization(realApiData);

        if (id) {
            const numId = Number(id);
            const mockOrg = mockOrganizations.find(
                (o) => o.organizationId === numId || String(o.organizationId) === id
            );
            if (mockOrg) return mapDtoToOrganization(mockOrg);
        }
        return null;
    }, [realApiData, id]);

    // 로딩 상태
    const isLoading = realLoading || licensesLoading;
    const error = realError || licensesError;

    if (isLoading) {
        return (
            <section className="py-6">
                <div className="max-w-7xl mx-auto px-5">
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </section>
        );
    }

    // 에러 상태 표시 (mock fallback으로 organization이 있으면 에러 화면 생략)
    if (error && !organization) {
        const isApiError = error instanceof ApiError;
        const apiError = isApiError ? error as ApiError : null;
        return (
            <section className="py-6">
                <div className="max-w-7xl mx-auto px-5">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-red-900 font-semibold mb-2">API 오류 발생</h3>
                        <p className="text-red-700 text-sm">
                            {error.message || '기관 정보를 불러오는 중 오류가 발생했습니다.'}
                        </p>
                        {apiError && apiError.status && (
                            <p className="text-red-600 text-xs mt-2">
                                상태 코드: {apiError.status} {apiError.statusText || ''}
                            </p>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    if (!organization) {
        return (
            <section className="py-6">
                <div className="max-w-7xl mx-auto px-5">
                    <p className="text-gray-600">기관을 찾을 수 없습니다.</p>
                </div>
            </section>
        );
    }

    // Handlers
    const handleLicenseSettings = (license: License) => {
        console.log('License settings:', license);
        // LicenseList 컴포넌트 내부에서 모달 열림
    };

    const handleAddLicense = async (newLicense: License) => {
        if (!id) return;

        try {
            await createLicenseMutation.mutateAsync({
                organizationId: id,
                licenseData: newLicense
            });

            setAlertState({
                isOpen: true,
                type: 'success',
                title: '라이센스 발급 성공',
                message: '라이센스가 성공적으로 발급되었습니다.'
            });
        } catch (error: any) {
            setAlertState({
                isOpen: true,
                type: 'error',
                title: '라이센스 발급 실패',
                message: error.message || '라이센스 발급 중 오류가 발생했습니다.'
            });
        }
    };

    const handleSaveLicense = async (updatedLicense: License) => {
        if (!id) return;

        try {
            await updateLicenseMutation.mutateAsync({
                _organizationId: id,
                licenseId: updatedLicense.id.toString(),
                licenseData: {
                    type: (updatedLicense.licenseType || 'USER') as any,
                    plan: (updatedLicense.subscriptionPlan || updatedLicense.plan || 'BASIC') as any,
                    quantity: typeof updatedLicense.maxUsers === 'string'
                        ? parseInt(updatedLicense.maxUsers) || 0
                        : updatedLicense.maxUsers || 0,
                    startDate: updatedLicense.startDate,
                    endDate: updatedLicense.endDate || undefined,
                    curriculumIdList: [],
                }
            });

            setAlertState({
                isOpen: true,
                type: 'success',
                title: '라이센스 수정 성공',
                message: '라이센스가 성공적으로 수정되었습니다.'
            });
        } catch (error: any) {
            setAlertState({
                isOpen: true,
                type: 'error',
                title: '라이센스 수정 실패',
                message: error.message || '라이센스 수정 중 오류가 발생했습니다.'
            });
        }
    };

    const handleLicenseClick = (license: License) => {
        navigate(`/admin/organizations/${id}/licenses/${license.id}`);
    };

    const handleSaveOrganization = (updatedOrg: Organization) => {
        console.log('Saving organization:', updatedOrg);
        // TODO: Update organization in state/backend
    };

    const handleAddNote = (note: Partial<Note>) => {
        if (!id) return;

        // TODO: Real API 노트 추가 연동 필요
        setCurrentNotePage(1);
        setIsAddNoteModalOpen(false);

        setAlertState({
            isOpen: true,
            type: 'success',
            title: '노트 추가 완료',
            message: '노트가 성공적으로 추가되었습니다.'
        });
    };

    return (
        <section className="py-6">
            <div className="max-w-7xl mx-auto px-5">
                <PageHeader
                    title={organization.name}
                    breadcrumbs={[
                        { label: '기관관리', link: '/admin/organizations' },
                        { label: organization.name }
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

                {/* Loading/Error 상태 표시 */}
                {isLoading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-blue-700 text-sm">데이터를 불러오는 중...</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-700 text-sm">데이터를 불러오는 중 오류가 발생했습니다: {(error as Error)?.message || '알 수 없는 오류'}</p>
                    </div>
                )}

                {/* Contact Info */}
                <div className="bg-gray-50 p-6 rounded-xl mb-8 space-y-3">
                    {organization.logo && (
                        <div className="flex items-center gap-4 pb-4 border-b border-gray-200 mb-4">
                            <img 
                                src={organization.logo} 
                                alt={organization.name}
                                className="h-12 w-auto object-contain"
                            />
                        </div>
                    )}
                    <div className="flex flex-wrap gap-4">
                        <span className="font-bold text-sm text-gray-400 w-20">기관정보</span>
                        <div className="flex flex-wrap gap-6 text-base text-gray-600">
                            <span><b>{typeof organization.country === 'string' ? organization.country : (organization.country as any)?.title || ''} </b> | <b> {organization.type || ''}</b></span>
                            <span>사업자등록번호: <b>{organization.businessNumber}</b></span>
                            <span>등록일: <b>{organization.registeredDate}</b></span>
                            <span>제휴기관 여부: <b>{organization.isPartner ? '예' : '아니오'}</b></span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <span className="font-bold text-sm text-gray-400 w-20">담당자</span>
                        <div className="flex flex-wrap gap-6 text-base text-gray-600">
                            <span><b>{organization.contactPerson}</b> {organization.department} {organization.position}</span>
                            <span>연락처: <b> {organization.phone} </b></span>
                            <span>이메일: <b> {organization.email} </b></span>
                        </div>
                    </div>
                </div>

                {/* License List */}
                <LicenseList
                    licenses={licenses}
                    showStats={true}
                    organizationIdForOrderCreate={id}
                    onLicenseSettings={handleLicenseSettings}
                    onAddLicense={handleAddLicense}
                    onSaveLicense={handleSaveLicense}
                    onLicenseClick={handleLicenseClick}
                />

                {/* Notes Section */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mt-8">
                    <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">노트</h2>
                        <Button
                            variant="outline"
                            size="md"
                            onClick={() => setIsAddNoteModalOpen(true)}
                        >
                            <Plus size={18} />
                            노트 추가
                        </Button>
                    </div>

                    <div className="p-6">
                        {paginatedNotes.length > 0 ? (
                            <div className="space-y-4">
                                {paginatedNotes.map((note) => (
                                    <div key={note.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-gray-900">{note.adminName}</span>
                                                <span className="text-sm text-gray-500">{note.createdAt}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap mb-3">{note.content}</p>

                                        {/* Links */}
                                        {note.links && note.links.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {note.links.map((link, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                                    >
                                                        <ExternalLink size={14} />
                                                        {link}
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        {/* Attachments */}
                                        {note.attachments && note.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {note.attachments.map((attachment, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-sm text-gray-700"
                                                    >
                                                        <FileText size={14} />
                                                        {attachment}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <p>노트가 없습니다.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination for notes */}
                    {notes.length > 0 && (
                        <div className="px-6 pb-6">
                            <Pagination
                                currentPage={currentNotePage}
                                totalPages={notesTotalPages}
                                totalItems={notes.length}
                                itemsPerPage={notesPerPage}
                                onPageChange={setCurrentNotePage}
                            />
                        </div>
                    )}
                </div>

                <EditOrganizationModal
                    isOpen={isEditOrgModalOpen}
                    onClose={() => setIsEditOrgModalOpen(false)}
                    organization={organization}
                    dataSource="real"
                />

                <AddNoteModal
                    isOpen={isAddNoteModalOpen}
                    onClose={() => setIsAddNoteModalOpen(false)}
                    onSave={handleAddNote}
                />

                <AlertDialog
                    isOpen={alertState.isOpen}
                    onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                    title={alertState.title}
                    message={alertState.message}
                />
            </div>
        </section>
    );
}
