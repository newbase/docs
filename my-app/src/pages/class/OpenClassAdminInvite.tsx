/**
 * 오픈클래스 참가자 초대 (어드민 전용)
 * - 초대코드 생성: 유효기간(7/14/30/60일, 직접입력), 수량, 기관명
 * - 사용현황: 기관명, 초대코드(6자리), 상태, 사용자ID
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Building, Ticket, User, PlusCircle, Copy, Check } from 'lucide-react';
import { Button, Input, Badge, Modal } from '@/components/shared/ui';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/shared/ui';
import { organizationService } from '../../services/organizationService';
import type { OrganizationInfoDto } from '../../types/api/organization';

const VALIDITY_PRESETS = [7, 14, 30, 60] as const;
const SEARCH_DEBOUNCE_MS = 300;

export type InviteUsageStatus = 'AVAILABLE' | 'USED' | 'CANCELLED';

export interface InviteUsageItem {
    id: string;
    organizationName: string;
    inviteCode: string;
    status: InviteUsageStatus;
    userId: string;
}

interface OrgOption {
    id: number;
    title: string;
}

const STATUS_LABEL: Record<InviteUsageStatus, string> = {
    AVAILABLE: '사용가능',
    USED: '사용완료',
    CANCELLED: '구매취소',
};

const STATUS_BADGE_CLASS: Record<InviteUsageStatus, string> = {
    AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
    USED: 'bg-gray-100 text-gray-700 border-gray-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

function generateSixDigitCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}

interface OpenClassAdminInviteProps {
    classId: string;
    classTitle?: string;
}

/** 초기 목업 사용현황 */
function getInitialUsageList(): InviteUsageItem[] {
    return [
        { id: '1', organizationName: '메디크루 의원', inviteCode: '123456', status: 'USED', userId: 'user_001' },
        { id: '2', organizationName: '서울대 병원', inviteCode: '234567', status: 'AVAILABLE', userId: '—' },
        { id: '3', organizationName: '연세 헬스케어', inviteCode: '345678', status: 'CANCELLED', userId: '—' },
    ];
}

export default function OpenClassAdminInvite({ classId, classTitle }: OpenClassAdminInviteProps): React.ReactElement {
    const [validityPreset, setValidityPreset] = useState<number | 'custom'>(30);
    const [customDays, setCustomDays] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(5);
    const [orgSearchQuery, setOrgSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<OrgOption[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string>('');
    const [selectedOrgName, setSelectedOrgName] = useState<string>('');
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [usageList, setUsageList] = useState<InviteUsageItem[]>(getInitialUsageList);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [orgDetailModalOrg, setOrgDetailModalOrg] = useState<string | null>(null);
    const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const resolvedDays = validityPreset === 'custom'
        ? (parseInt(customDays, 10) || 0)
        : validityPreset;

    const fetchOrgSuggestions = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
            return;
        }
        setIsLoadingSuggestions(true);
        try {
            const response = await organizationService.getList({
                page: 1,
                pageSize: 20,
                search: query.trim(),
            });
            const list = response?.organizationList ?? [];
            setSuggestions(list.map((org: OrganizationInfoDto) => ({ id: org.organizationId, title: org.title })));
            setIsSuggestionsOpen(true);
        } catch (e) {
            console.error('Failed to search organizations', e);
            setSuggestions([]);
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, []);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = null;
        }
        if (!orgSearchQuery.trim()) {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
            return;
        }
        searchTimeoutRef.current = setTimeout(() => {
            fetchOrgSuggestions(orgSearchQuery);
        }, SEARCH_DEBOUNCE_MS);
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [orgSearchQuery, fetchOrgSuggestions]);

    const handleSelectOrg = (org: OrgOption) => {
        setSelectedOrgId(org.id.toString());
        setSelectedOrgName(org.title);
        setOrgSearchQuery(org.title);
        setIsSuggestionsOpen(false);
    };

    const handleOrgInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOrgSearchQuery(e.target.value);
        setSelectedOrgId('');
        setSelectedOrgName('');
    };

    const handleGenerateInvites = async () => {
        const orgName = selectedOrgName || orgSearchQuery.trim();
        if (!orgName) {
            alert('기관명을 선택하거나 입력해주세요.');
            return;
        }
        if (resolvedDays < 1) {
            alert('유효기간을 1일 이상으로 설정해주세요.');
            return;
        }
        if (quantity < 1) {
            alert('수량을 1 이상으로 입력해주세요.');
            return;
        }

        setIsGenerating(true);
        try {
            await new Promise((r) => setTimeout(r, 600));
            const newItems: InviteUsageItem[] = Array.from({ length: quantity }, (_, i) => ({
                id: `inv-${Date.now()}-${i}`,
                organizationName: orgName,
                inviteCode: generateSixDigitCode(),
                status: 'AVAILABLE' as const,
                userId: '—',
            }));
            setUsageList((prev) => [...newItems, ...prev]);
            alert(`${quantity}개의 초대코드가 생성되었습니다.`);
            setIsCreateModalOpen(false);
        } catch (e) {
            console.error(e);
            alert('초대코드 생성에 실패했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCopyCode = (code: string, rowId: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedCodeId(rowId);
            setTimeout(() => setCopiedCodeId(null), 1500);
        }).catch(() => alert('복사에 실패했습니다.'));
    };

    const orgDetailItems = orgDetailModalOrg
        ? usageList.filter((row) => row.organizationName === orgDetailModalOrg)
        : [];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                <Ticket size={18} />
                참가자 초대 (관리자)
            </h3>

            {/* 사용현황 */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <User size={14} />
                        사용현황
                    </h4>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <PlusCircle size={14} className="mr-1.5" />
                        초대코드 생성
                    </Button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-4 py-3">기관명</TableHead>
                                <TableHead className="px-4 py-3">초대코드(6자리)</TableHead>
                                <TableHead className="px-4 py-3">상태</TableHead>
                                <TableHead className="px-4 py-3">사용자ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usageList.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className="px-4 py-2">
                                        <button
                                            type="button"
                                            onClick={() => setOrgDetailModalOrg(row.organizationName)}
                                            className="font-medium text-blue-600 hover:underline text-left"
                                        >
                                            {row.organizationName}
                                        </button>
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-gray-700">{row.inviteCode}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyCode(row.inviteCode, row.id)}
                                                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                                                title="초대코드 복사"
                                            >
                                                {copiedCodeId === row.id ? (
                                                    <Check size={14} className="text-green-600" />
                                                ) : (
                                                    <Copy size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        <Badge
                                            variant="outline"
                                            className={STATUS_BADGE_CLASS[row.status]}
                                        >
                                            {STATUS_LABEL[row.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-2 text-gray-600">
                                        {row.userId}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>

            {/* 초대코드 생성 모달 */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                title="초대코드 생성"
                size="medium"
                footer={
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={handleCloseCreateModal}>
                            취소
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleGenerateInvites}
                            disabled={isGenerating}
                        >
                            {isGenerating ? '생성 중...' : '초대코드 생성'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4 py-2">
                    <div>
                        <label className="text-sm font-medium text-gray-600 block mb-2">초대 유효기간</label>
                        <div className="flex flex-wrap gap-2">
                            {VALIDITY_PRESETS.map((days) => (
                                <button
                                    key={days}
                                    type="button"
                                    onClick={() => setValidityPreset(days)}
                                    className={`py-1.5 px-3 text-sm rounded-md border transition-colors ${
                                        validityPreset === days
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                >
                                    {days}일
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setValidityPreset('custom')}
                                className={`py-1.5 px-3 text-sm rounded-md border transition-colors ${
                                    validityPreset === 'custom'
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                            >
                                직접입력
                            </button>
                            {validityPreset === 'custom' && (
                                <div className="inline-flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={customDays}
                                        onChange={(e) => setCustomDays(e.target.value)}
                                        placeholder="일"
                                        wrapperClassName="w-20"
                                    />
                                    <span className="text-sm text-gray-500">일</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600 block mb-2">수량</label>
                        <Input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                            wrapperClassName="w-32"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600 block mb-2 flex items-center gap-1">
                            <Building size={14} />
                            기관명
                        </label>
                        <div className="relative max-w-full" ref={suggestionsRef}>
                            <Input
                                type="text"
                                value={orgSearchQuery}
                                onChange={handleOrgInputChange}
                                onFocus={() => suggestions.length > 0 && setIsSuggestionsOpen(true)}
                                onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 200)}
                                placeholder="기관명 입력"
                                wrapperClassName="w-full"
                            />
                            {isLoadingSuggestions && (
                                <p className="text-xs text-gray-500 mt-1">검색 중...</p>
                            )}
                            {isSuggestionsOpen && suggestions.length > 0 && (
                                <div className="autocomplete-suggestions" role="listbox">
                                    {suggestions.map((org) => (
                                        <div
                                            key={org.id}
                                            role="option"
                                            className="autocomplete-item"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleSelectOrg(org);
                                            }}
                                        >
                                            {org.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* 기관별 초대코드 사용현황 모달 */}
            <Modal
                isOpen={!!orgDetailModalOrg}
                onClose={() => setOrgDetailModalOrg(null)}
                title={orgDetailModalOrg ? `${orgDetailModalOrg} 초대코드 사용현황` : ''}
                size="medium"
            >
                <div className="py-2">
                    {orgDetailItems.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4 text-center">해당 기관의 초대코드가 없습니다.</p>
                    ) : (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-4 py-3">초대코드(6자리)</TableHead>
                                        <TableHead className="px-4 py-3">상태</TableHead>
                                        <TableHead className="px-4 py-3">사용자ID</TableHead>
                                        <TableHead className="px-4 py-3 w-20">복사</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orgDetailItems.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="px-4 py-2 font-mono text-gray-700">
                                                {row.inviteCode}
                                            </TableCell>
                                            <TableCell className="px-4 py-2">
                                                <Badge
                                                    variant="outline"
                                                    className={STATUS_BADGE_CLASS[row.status]}
                                                >
                                                    {STATUS_LABEL[row.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-4 py-2 text-gray-600">
                                                {row.userId}
                                            </TableCell>
                                            <TableCell className="px-4 py-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2"
                                                    onClick={() => handleCopyCode(row.inviteCode, row.id)}
                                                >
                                                    {copiedCodeId === row.id ? (
                                                        <span className="text-green-600 text-xs flex items-center gap-1">
                                                            <Check size={12} /> 복사됨
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs flex items-center gap-1">
                                                            <Copy size={12} /> 복사
                                                        </span>
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
