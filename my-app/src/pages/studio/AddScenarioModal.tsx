import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, CustomBadge, Input } from '@/components/shared';
import { ScenarioData } from '../../types';
import { organizationService } from '../../services/organizationService';
import { userServiceApi } from '../../services/userServiceApi';
import { scenarioDetails } from '../../data/scenarioDetails';
import { Search, ChevronDown, ClosedCaptionIcon, X } from 'lucide-react';

interface AddScenarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        thumbnail: string | null;
        category: string;
        platform: string;
        metadata: ScenarioData['metadata'];
    }) => void;
    data: ScenarioData;
    updateMetadata: (field: keyof ScenarioData['metadata'], value: any) => void;
}

export default function AddScenarioModal({
    isOpen,
    onClose,
    onSave,
    data,
    updateMetadata
}: AddScenarioModalProps): React.ReactElement {
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [category, setCategory] = useState<string>('');
    const [platform, setPlatform] = useState<string>('');

    const [organizations, setOrganizations] = useState<any[]>([]);
    const [orgSearchQuery, setOrgSearchQuery] = useState('');
    const [showOrgSuggestions, setShowOrgSuggestions] = useState(false);

    const [companyUsers, setCompanyUsers] = useState<any[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // 데이터 로드
    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const orgRes = await organizationService.getList({ page: 1, pageSize: 100 });
                setOrganizations(orgRes.organizationList);
            } catch (error) {
                console.error('Failed to fetch organizations:', error);
            }
        };
        if (isOpen) {
            fetchOrgs();
        }
    }, [isOpen]);

    // 기관 선택 시 해당 기관 사용자 로드
    useEffect(() => {
        const fetchUsers = async () => {
            if (!data.metadata.organization) {
                setCompanyUsers([]);
                return;
            }

            setIsLoadingUsers(true);
            try {
                // 실제 앱에서는 org name으로 ID를 찾거나 검색 파라미터를 사용하겠지만, 
                // 여기서는 mock 데이터 구조에 맞춰 organizationId가 필요함.
                const selectedOrg = organizations.find(o => o.title === data.metadata.organization);
                if (selectedOrg?.organizationId) {
                    const userRes = await userServiceApi.getOrganizationUserList({
                        organizationId: selectedOrg.organizationId,
                        page: 1,
                        pageSize: 100
                    });
                    setCompanyUsers(userRes.userList);
                } else {
                    // 기관 이름만 있고 ID가 없는 경우 (직접 입력 등) - 전체 목록에서 필터링하거나 빈 배열
                    setCompanyUsers([]);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
                setCompanyUsers([]);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [data.metadata.organization, organizations]);

    const [authorSearchQuery, setAuthorSearchQuery] = useState('');
    const [showAuthorSuggestions, setShowAuthorSuggestions] = useState(false);

    const filteredUsers = useMemo(() => {
        if (!authorSearchQuery) return companyUsers;
        return companyUsers.filter(user =>
            user.name.toLowerCase().includes(authorSearchQuery.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(authorSearchQuery.toLowerCase())) ||
            (user.loginId && user.loginId.toLowerCase().includes(authorSearchQuery.toLowerCase()))
        );
    }, [authorSearchQuery, companyUsers]);

    const [showAuthorInput, setShowAuthorInput] = useState(false);

    // 모달이 열릴 때 state 초기화
    useEffect(() => {
        if (isOpen) {
            setThumbnail(null);
            setThumbnailFile(null);
            setCategory('');
            setPlatform('');
            setOrgSearchQuery(data.metadata.organization || '');
            setAuthorSearchQuery('');
        }
    }, [isOpen, data.metadata.organization]);

    const filteredOrgs = useMemo(() => {
        if (!orgSearchQuery) return organizations;
        return organizations.filter(org =>
            org.title.toLowerCase().includes(orgSearchQuery.toLowerCase())
        );
    }, [orgSearchQuery, organizations]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnail(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveThumbnail = () => {
        setThumbnail(null);
        setThumbnailFile(null);
    };

    const handleSave = () => {
        if (!data.metadata.title.trim()) {
            alert('시나리오 제목을 입력해주세요.');
            return;
        }
        onSave({ thumbnail, category, platform, metadata: data.metadata });
        setThumbnail(null);
        setThumbnailFile(null);
        setCategory('');
        setPlatform('');
    };

    const handleClose = () => {
        setThumbnail(null);
        setThumbnailFile(null);
        setCategory('');
        setPlatform('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="기본 정보" maxWidth="max-w-2xl">
            <div className="space-y-4">
                {/* Scenario Classification Display (Read-only) */}
                <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wider ${data.metadata.sourceType === 'customized'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                    }`}>
                    {data.metadata.sourceType === 'customized' ? 'Customized' : 'Original'}
                </span>
                {/* Basic Info Section */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">시나리오 제목 <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={data.metadata.title}
                        onChange={(e) => updateMetadata('title', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="시나리오 제목 입력"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">인계사항</label>
                    <textarea
                        value={data.metadata.handover}
                        onChange={(e) => updateMetadata('handover', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none h-32 resize-none"
                        placeholder="인계사항을 입력해주세요."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">핵심과제</label>
                    <textarea
                        value={data.metadata.mission}
                        onChange={(e) => updateMetadata('mission', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none"
                        placeholder="학습자가 달성해야 할 구체적인 과제를 입력해주세요."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">카테고리</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                        >
                            <option value="">선택하세요</option>
                            <option value="Essential Skills">핵심술기</option>
                            <option value="Disease Care">질환케어</option>
                            <option value="Diagnosis">진단/평가</option>
                            <option value="Procedure">술기절차</option>
                            <option value="Other">기타</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">플랫폼</label>
                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                        >
                            <option value="">선택하세요</option>
                            <option value="VR">VR</option>
                            <option value="Mobile">Mobile</option>
                            <option value="PC">PC</option>
                        </select>
                    </div>
                </div>

                {/* Copyright info Section */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">저작권 정보</h3>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="relative">
                                <Input
                                    type="text"
                                    value={orgSearchQuery}
                                    onChange={(e) => {
                                        setOrgSearchQuery(e.target.value);
                                        setShowOrgSuggestions(true);
                                    }}
                                    onFocus={() => setShowOrgSuggestions(true)}
                                    className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-200 outline-none"
                                    placeholder="기관명 입력"
                                />
                                {orgSearchQuery && (
                                    <button
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                                        onClick={() => {
                                            setOrgSearchQuery('');
                                            updateMetadata('organization', '');
                                            setCompanyUsers([]);
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            {showOrgSuggestions && orgSearchQuery && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {filteredOrgs.length > 0 ? (
                                        filteredOrgs.map(org => (
                                            <button
                                                key={org.organizationId}
                                                onClick={() => {
                                                    updateMetadata('organization', org.title);
                                                    setOrgSearchQuery(org.title);
                                                    setShowOrgSuggestions(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-base hover:bg-slate-50 border-b border-slate-50 last:border-0"
                                            >
                                                {org.title}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-slate-500 italic">결과가 없습니다</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            className="shrink-0"
                            onClick={() => setShowAuthorInput(true)}
                        >
                            저자 추가
                        </Button>
                    </div>

                    {showAuthorInput && (
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={authorSearchQuery}
                                    onChange={(e) => {
                                        setAuthorSearchQuery(e.target.value);
                                        setShowAuthorSuggestions(true);
                                    }}
                                    onFocus={() => setShowAuthorSuggestions(true)}
                                    disabled={!data.metadata.organization || isLoadingUsers}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                                    placeholder='저자명 입력'
                                    autoFocus
                                />
                                {showAuthorSuggestions && authorSearchQuery && data.metadata.organization && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map(user => (
                                                <button
                                                    key={user.userId || user.name}
                                                    onClick={() => {
                                                        if (!data.metadata.authors?.includes(user.name)) {
                                                            updateMetadata('authors', [...(data.metadata.authors || []), user.name]);
                                                        }
                                                        setAuthorSearchQuery('');
                                                        setShowAuthorSuggestions(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0"
                                                >
                                                    <div className="text-base text-slate-700">{user.name} · {user.email || user.loginId}</div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-slate-500 italic">검색 결과가 없습니다</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAuthorInput(false);
                                    setAuthorSearchQuery('');
                                }}
                                className="shrink-0 p-2"
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    )}

                    {data.metadata.authors && data.metadata.authors.length > 0 && (
                        <div className="flex flex-wrap gap-2 min-h-[32px] p-2 rounded-md bg-slate-50/50">
                            {data.metadata.authors.map((author, index) => (
                                <span key={index} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-base font-medium border border-brand-100">
                                    {author}
                                    <button
                                        onClick={() => updateMetadata('authors', data.metadata.authors?.filter((_, i) => i !== index))}
                                        className="hover:text-brand-900"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}

                        </div>
                    )}
                    {/* License Section */}
                    <div className="grid grid-cols-1 gap-y-3">
                        <div className="flex flex-col">
                            <select
                                value={data.metadata.licenseType || ''}
                                onChange={(e) => updateMetadata('licenseType', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                            >
                                <option value="">라이선스 사용조건 선택</option>
                                <option value="CC BY">CC BY (저작자 표시)</option>
                                <option value="CC BY-SA">CC BY-SA (저작자 표시-동일조건변경허락)</option>
                                <option value="CC BY-ND">CC BY-ND (저작자 표시-변경금지)</option>
                                <option value="CC BY-NC">CC BY-NC (저작자 표시-비영리)</option>
                                <option value="All Rights Reserved">All Rights Reserved</option>
                            </select>
                        </div>
                        {data.metadata.licenseType && (
                            <div className="px-3 text-sm text-brand-700 leading-relaxed">
                                {data.metadata.licenseType === 'CC BY' && '저작자를 밝히면 자유로운 이용이 가능합니다. 상업적 이용 및 수정(2차적 저작물 작성)이 모두 허용됩니다.'}
                                {data.metadata.licenseType === 'CC BY-SA' && '저작자를 밝히고, 2차적 저작물물에 대해서는 원저작물과 동일한 라이선스를 적용해야 합니다. 상업적 이용 및 수정이 가능합니다.'}
                                {data.metadata.licenseType === 'CC BY-ND' && '저작자를 밝히면 자유로운 이용이 가능하나, 원저작물을 변경하거나 이를 이용한 2차적 저작물을 작성하는 것은 금지됩니다.'}
                                {data.metadata.licenseType === 'CC BY-NC' && '저작자를 밝히면 자유로운 이용이 가능하나, 영리 목적의 이용은 금지됩니다. 비영리 목적의 수정은 가능합니다.'}
                                {data.metadata.licenseType === 'All Rights Reserved' && '해당 저작물의 모든 법적 권리는 저작권자에게 있습니다. 저작권자의 명시적인 사전 동의 없이 무단 복제, 배포, 수정하는 것을 금지합니다.'}
                            </div>
                        )}
                    </div>
                </div>
                {/* Thumbnail Section */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">썸네일</label>
                    <div className="flex items-start gap-4 p-3 border border-slate-200 rounded-lg">
                        <div className="w-32 h-20 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            {thumbnail ? (
                                <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs text-slate-400">No Image</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                            />
                            <p className="mt-1.5 text-[11px] text-slate-400">Recommended: 1280x720px (JPG, PNG)</p>
                            {thumbnail && (
                                <button type="button" onClick={handleRemoveThumbnail} className="mt-2 text-xs text-red-600 hover:underline">
                                    Remove image
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <Button onClick={handleClose} variant="outline" size="md">취소</Button>
                <Button onClick={handleSave} variant="primary" size="md">저장</Button>
            </div>
        </Modal >
    );
}
