import React, { useState } from 'react';
import { Modal, Badge } from '@/components/shared/ui';
import { Search, UserPlus, CheckCircle, Building2 } from 'lucide-react';
import { User } from '../../../types/admin';
import { useOrganizationSimpleList } from '@/hooks/useOrganizationSimple';
import { useRegularMemberList, useRegisterOrganizationMembers } from '@/hooks/useUserManagement';
import type { RegularMemberInfoDto } from '@/types/api/user';
import AlertDialog from '@/components/shared/ui/AlertDialog';

interface LicenseInfo {
    hasDeviceLicense: boolean;
    maxUsers: number | null;
    currentUsers: number;
    availableSlots?: number;
}

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void; // Real API 연동 시 사용
    organizationId?: number; // 기관 ID (선택 사항)
    currentUsers?: User[];
    licenseInfo?: LicenseInfo;
}

export default function AddMemberModal({ 
    isOpen, 
    onClose, 
    onSuccess,
    organizationId: propOrganizationId,
    currentUsers = [], 
    licenseInfo 
}: AddMemberModalProps): React.ReactElement {
    const [selectedOrgId, setSelectedOrgId] = useState<number | null>(propOrganizationId || null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedUsers, setSelectedUsers] = useState<RegularMemberInfoDto[]>([]);
    const [alertState, setAlertState] = useState({
        isOpen: false,
        type: 'success' as 'success' | 'error',
        title: '',
        message: ''
    });
    
    // 기관 목록 조회 (Real API)
    const { data: orgData, isLoading: orgLoading } = useOrganizationSimpleList({
        enabled: isOpen && !propOrganizationId, // 모달이 열릴 때만 조회 (propOrganizationId가 없을 때만)
    });

    // 정회원 목록 조회 (Real API - 검색 기능 포함)
    const { 
        data: usersData, 
        isLoading: usersLoading 
    } = useRegularMemberList(
        {
            page: 1,
            pageSize: 50,
            search: searchQuery || undefined,
        },
        {
            enabled: isOpen && !!selectedOrgId && searchQuery.length >= 2, // 검색어 2자 이상일 때만 조회
        }
    );

    // 기관별 정회원 등록 Mutation
    const registerMembersMutation = useRegisterOrganizationMembers();

    const isUserAffiliated = (userId: string | number) => {
        return currentUsers.some(u => u.id === userId);
    };

    const toggleUserSelection = (user: RegularMemberInfoDto) => {
        // Prevent selecting users who are already affiliated
        if (isUserAffiliated(user.userId)) {
            return;
        }

        setSelectedUsers(prev => {
            const isSelected = prev.some(u => u.userId === user.userId);
            if (isSelected) {
                return prev.filter(u => u.userId !== user.userId);
            } else {
                return [...prev, user];
            }
        });
    };

    const isUserSelected = (userId: string | number) => {
        return selectedUsers.some(u => u.userId === userId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedOrgId) {
            setAlertState({
                isOpen: true,
                type: 'error',
                title: '기관 선택 필요',
                message: '기관을 선택해주세요.'
            });
            return;
        }

        if (selectedUsers.length === 0) {
            setAlertState({
                isOpen: true,
                type: 'error',
                title: '사용자 선택 필요',
                message: '추가할 사용자를 선택해주세요.'
            });
            return;
        }

        // 🌐 Real API 호출
        try {
            await registerMembersMutation.mutateAsync({
                organizationId: selectedOrgId,
                userIdList: selectedUsers.map(u => u.userId),
            });

            setAlertState({
                isOpen: true,
                type: 'success',
                title: '정회원 추가 성공',
                message: `${selectedUsers.length}명의 정회원이 추가되었습니다.`
            });

            // Call success callback
            if (onSuccess) {
                onSuccess();
            }

            // Close modal after success
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (error: any) {
            setAlertState({
                isOpen: true,
                type: 'error',
                title: '정회원 추가 실패',
                message: error?.message || '정회원 추가 중 오류가 발생했습니다.'
            });
        }
    };
    
    const handleClose = () => {
        // Reset all states
        setSelectedOrgId(propOrganizationId || null);
        setSearchQuery('');
        setSelectedUsers([]);
        onClose();
    };

    const footer = (
        <>
            <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={handleClose}
            >
                취소
            </button>
            <button
                type="submit"
                form="add-member-form"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedOrgId || selectedUsers.length === 0 || registerMembersMutation.isPending}
            >
                <UserPlus size={16} />
                {registerMembersMutation.isPending 
                    ? '추가 중...' 
                    : selectedUsers.length > 0 
                        ? `${selectedUsers.length}명 추가` 
                        : '추가'
                }
            </button>
        </>
    );

    // Real API 데이터 변환
    const searchResults = usersData?.userList || [];

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="정회원 추가" footer={footer} size="large">
            <form id="add-member-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Organization Selection - 기존 스타일 유지 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 size={16} className="text-gray-500" />
                            <span>소속 기관</span>
                            <span className="text-red-500">*</span>
                        </div>
                    </label>
                    <select
                        id="organization-select"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                        value={selectedOrgId || ''}
                        onChange={(e) => setSelectedOrgId(e.target.value ? Number(e.target.value) : null)}
                        disabled={orgLoading || !!propOrganizationId}
                        aria-label="소속 기관 선택"
                        aria-required="true"
                        aria-describedby={!selectedOrgId ? "org-select-hint" : undefined}
                    >
                        <option value="">기관을 선택하세요</option>
                        {orgLoading ? (
                            <option value="" disabled>로딩 중...</option>
                        ) : propOrganizationId ? (
                            <option value={propOrganizationId}>현재 기관</option>
                        ) : (
                            orgData?.organizations.map(org => (
                                <option key={org.id} value={org.id}>
                                    {org.name}
                                </option>
                            ))
                        )}
                    </select>
                    {!selectedOrgId && (
                        <p id="org-select-hint" className="text-xs text-gray-500 mt-1" role="note">
                            정회원을 등록할 기관을 먼저 선택해주세요
                        </p>
                    )}
                </div>

                {/* License Info */}
                {licenseInfo && (
                    <div className={`p-4 rounded-lg border ${licenseInfo.hasDeviceLicense 
                        ? 'bg-green-50 border-green-200' 
                        : licenseInfo.availableSlots !== undefined && licenseInfo.availableSlots > 0
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-red-50 border-red-200'
                    }`}>
                        {licenseInfo.hasDeviceLicense ? (
                            <p className="text-sm text-green-800 font-medium">
                                ✓ 기기 라이선스: 사용자 수 제한 없음
                            </p>
                        ) : (
                            <div className="text-sm">
                                <p className={`font-medium ${licenseInfo.availableSlots !== undefined && licenseInfo.availableSlots <= 0 ? 'text-red-800' : 'text-blue-800'}`}>
                                    사용자 라이선스: {licenseInfo.currentUsers}명 / {licenseInfo.maxUsers}명
                                    {licenseInfo.availableSlots !== undefined && (
                                        <span className="ml-2">
                                            {licenseInfo.availableSlots > 0 
                                                ? `(추가 가능: ${licenseInfo.availableSlots}명)` 
                                                : '(한도 초과)'
                                            }
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Search Section */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">사용자 검색</label>
                    <div className="flex gap-2">
                        <input
                            type="search"
                            id="user-search-input"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={selectedOrgId ? "이름 또는 이메일로 검색 (2자 이상)" : "먼저 기관을 선택하세요"}
                            disabled={!selectedOrgId}
                            aria-label="사용자 검색"
                            aria-describedby={!selectedOrgId ? "search-disabled-hint" : undefined}
                        />
                        {usersLoading && (
                            <div className="flex items-center px-4 py-2 text-sm text-gray-600">
                                검색 중...
                            </div>
                        )}
                    </div>
                    {searchQuery && searchQuery.length < 2 && (
                        <p className="text-xs text-gray-500">검색어를 2자 이상 입력하세요</p>
                    )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">검색 결과</label>
                        <div className="border border-gray-200 rounded-lg max-h-[300px] overflow-y-auto">
                            {searchResults.map((user) => {
                                const isAffiliated = isUserAffiliated(user.userId);
                                const isSelected = isUserSelected(user.userId);
                                return (
                                    <label
                                        key={user.userId}
                                        className={`flex items-center p-3 border-b border-gray-200 last:border-b-0 transition-colors ${isAffiliated
                                                ? 'cursor-not-allowed opacity-60'
                                                : 'cursor-pointer hover:bg-gray-50'
                                            } ${isSelected ? 'bg-blue-50' : ''}`}
                                        onClick={() => !isAffiliated && toggleUserSelection(user)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={isAffiliated}
                                            onChange={() => { }}
                                            className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 font-medium">
                                                {user.realName}
                                                {isAffiliated && (
                                                    <span className="flex items-center gap-1 text-xs text-blue-600">
                                                        <CheckCircle size={14} />
                                                        소속됨
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {user.email || '-'} · {user.loginId || '-'}
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            선택된 사용자 ({selectedUsers.length}명)
                        </label>
                        <div className="bg-gray-50 p-4 rounded-lg flex flex-wrap gap-2">
                            {selectedUsers.map((user) => (
                                <Badge
                                    key={user.userId}
                                    variant="default"
                                    className="cursor-pointer hover:bg-blue-700"
                                    onClick={() => toggleUserSelection(user)}
                                >
                                    {user.realName} ✕
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {searchQuery && searchQuery.length >= 2 && searchResults.length === 0 && !usersLoading && (
                    <div className="text-center py-8 text-gray-500">
                        검색 결과가 없습니다.
                    </div>
                )}
            </form>

            <AlertDialog
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                title={alertState.title}
                message={alertState.message}
            />
        </Modal>
    );
}
