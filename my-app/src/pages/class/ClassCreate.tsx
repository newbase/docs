import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/shared/ui';
import CurriculumSetup from './CurriculumSetup';
import { CurriculumItem, VideoLecture } from '../../types/curriculum';
import { scenarioDetails, ScenarioDetail } from '../../data/scenarioDetails';
import { ClassItem } from '../../data/classes';

import { useAuth } from '../../contexts/AuthContext';
import { useOrganizations } from '../../hooks/useOrganization';

interface CompletionRequirement {
    minScenarios: number;
    minPassingScore: number;
    requireAllScenarios: boolean;
}

export default function ClassCreate(): React.ReactElement {
    const navigate = useNavigate();
    const { getLicenseInfo, getCurrentRole } = useAuth();
    const licenseInfo = getLicenseInfo();
    const isAdmin = getCurrentRole() === 'admin';

    // Form state
    const today = new Date().toISOString().split('T')[0];
    const [className, setClassName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [maxParticipants, setMaxParticipants] = useState<number>(30); // Default to 30
    const [isPublic, setIsPublic] = useState(true);
    const [password, setPassword] = useState('');
    const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
    const [completionRequirements, setCompletionRequirements] = useState<CompletionRequirement>({
        minScenarios: 1,
        minPassingScore: 70,
        requireAllScenarios: false
    });

    // Thumbnail state
    const [thumbnailMode, setThumbnailMode] = useState<'custom' | 'scenario'>('custom');
    const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
    const [selectedScenarioThumbnail, setSelectedScenarioThumbnail] = useState<string | null>(null);

    // Admin-specific state
    const [saleStatus, setSaleStatus] = useState<'available' | 'unavailable'>('available');
    const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [discountPrice, setDiscountPrice] = useState<number>(0);

    // Fetch organizations for admin
    const { data: organizationsData } = useOrganizations(
        { page: 1, pageSize: 1000 },
        { enabled: isAdmin && saleStatus === 'available' }
    );

    // Duplication state
    const location = useLocation();
    const duplicateFrom = location.state?.duplicateFrom as ClassItem | undefined;

    // Determine base path based on current route
    const isMasterRoute = location.pathname.includes('/master/');
    const classManagementPath = isMasterRoute ? '/master/class-management' : '/admin/class-management';

    // Validation state
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Initialize state if duplicating
    useEffect(() => {
        if (duplicateFrom) {
            setClassName(`${duplicateFrom.title} (copy)`);
            setDescription(duplicateFrom.description || '');

            if (duplicateFrom.participationPeriod) {
                setStartDate(duplicateFrom.participationPeriod.startDate);
                setEndDate(duplicateFrom.participationPeriod.endDate);
            }

            if (duplicateFrom.maxParticipants) {
                setMaxParticipants(duplicateFrom.maxParticipants);
            }

            const dupPublic = (duplicateFrom as ClassItem & { isPublic?: boolean }).isPublic;
            if (dupPublic !== undefined) {
                setIsPublic(dupPublic);
            }

            if (duplicateFrom.password) {
                setPassword(duplicateFrom.password);
            }

            if (duplicateFrom.completionRequirements) {
                setCompletionRequirements(duplicateFrom.completionRequirements);
            }

            // Map curriculum items back
            const initialItems: CurriculumItem[] = duplicateFrom.curriculum.map(item => {
                const itemId = `copy-${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                if (item.type === 'video') {
                    return {
                        id: itemId,
                        type: 'video',
                        data: {
                            id: item.id.toString(),
                            title: item.name,
                            url: '', // Missing in legacy data
                            duration: item.duration,
                            author: {
                                name: item.author || 'Unknown',
                                type: item.authorType || 'individual'
                            },
                            description: ''
                        } as VideoLecture
                    };
                } else {
                    // Default to scenario
                    const detail = scenarioDetails[item.id];
                    return {
                        id: itemId,
                        type: 'scenario',
                        data: detail || {
                            id: item.id,
                            title: item.name,
                            duration: item.duration,
                            platform: item.platform,
                            ContributedBy: item.author || 'Medicrew',
                            // Add other required fields with defaults if detail is missing
                        } as any
                    };
                }
            });
            setCurriculumItems(initialItems);
        }
    }, [duplicateFrom]);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!className.trim()) {
            newErrors.className = '클래스명을 입력해주세요.';
        }

        // 참여기간 검증 (판매불가일 때는 건너뛰기)
        const shouldValidateParticipationPeriod = !(isAdmin && saleStatus === 'unavailable');
        if (shouldValidateParticipationPeriod) {
            if (!startDate) {
                newErrors.startDate = '시작일을 선택해주세요.';
            }

            if (!endDate) {
                newErrors.endDate = '종료일을 선택해주세요.';
            }

            if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
                newErrors.endDate = '종료일은 시작일 이후여야 합니다.';
            }
        }

        // 참가자 수 검증 (판매불가일 때는 건너뛰기)
        const shouldValidateMaxParticipants = !(isAdmin && saleStatus === 'unavailable');
        if (shouldValidateMaxParticipants) {
            if (!maxParticipants || maxParticipants < 1) {
                newErrors.maxParticipants = '최대 참가자 수는 1명 이상이어야 합니다.';
            } else if (!isAdmin && licenseInfo.type === 'user' && maxParticipants > licenseInfo.count) {
                newErrors.maxParticipants = `등록 가능 사용자 수(${licenseInfo.count}개)를 초과할 수 없습니다.`;
            }
        }

        // Admin-specific validation
        if (isAdmin) {
            if (saleStatus === 'available') {
                if (!selectedOrganizationId) {
                    newErrors.organization = '교육기관을 선택해주세요.';
                }
                if (!price || price < 0) {
                    newErrors.price = '수강료를 입력해주세요.';
                }
                if (discountPrice < 0) {
                    newErrors.discountPrice = '할인가는 0 이상이어야 합니다.';
                }
                if (discountPrice > price) {
                    newErrors.discountPrice = '할인가는 수강료보다 작거나 같아야 합니다.';
                }
            }
        }

        if (curriculumItems.length === 0) {
            newErrors.scenarios = '최소 1개 이상의 커리큘럼 아이템을 추가해주세요.';
        }

        if (!isPublic && !password.trim()) {
            newErrors.password = '비공개 클래스는 비밀번호를 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        const classData = {
            className,
            description,
            isPublic,
            password: !isPublic ? password : undefined,
            participationPeriod: {
                startDate,
                endDate
            },
            maxParticipants,
            completionRequirements,
            thumbnail: thumbnailMode === 'custom' ? customThumbnail : selectedScenarioThumbnail,
            ...(isAdmin && {
                saleStatus,
                ...(saleStatus === 'available' && {
                    organizationId: selectedOrganizationId ? parseInt(selectedOrganizationId) : undefined,
                    price,
                    discountPrice
                })
            }),
            curriculum: curriculumItems.map((item, index) => {
                const commonData = {
                    order: index + 1,
                    type: item.type,
                    title: item.data.title,
                    duration: item.data.duration,
                };

                if (item.type === 'scenario') {
                    const scenario = item.data as ScenarioDetail;
                    return {
                        ...commonData,
                        scenarioId: scenario.id,
                        author: {
                            name: scenario.ContributedBy,
                            type: 'institution'
                        },
                        patient: scenario.patient,
                        map: scenario.map
                    };
                } else {
                    const video = item.data as VideoLecture;
                    return {
                        ...commonData,
                        videoId: video.id,
                        url: video.url,
                        author: video.author,
                        description: video.description
                    };
                }
            })
        };

        alert('클래스가 생성되었습니다!');
        navigate(-1);
    };

    const handleCancel = () => {
        if (className || curriculumItems.length > 0) {
            if (window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
                navigate(-1);
            }
        } else {
            navigate(-1);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomThumbnail(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Extract images from scenarios
    const scenarioImages = curriculumItems
        .filter(item => item.type === 'scenario')
        .map(item => {
            const scenario = item.data as ScenarioDetail;
            // Use the first example image if available
            const image = scenario.simulationExamples?.[0]?.image;
            return {
                id: scenario.id,
                title: scenario.title,
                image: image
            };
        })
        .filter(item => item.image); // Only keep items with images

    return (
        <>
            <PageHeader
                title="클래스 생성"
                breadcrumbs={[
                    { label: '클래스 관리', link: classManagementPath },
                    { label: '클래스 생성' }
                ]}
            />

            <div className="space-y-8">
                <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="space-y-6">
                        {/* 클래스명 */}
                        <div className="flex items-start gap-4">
                            <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                클래스명
                            </label>
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    value={className}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClassName(e.target.value)}
                                    placeholder="클래스명을 입력하세요"
                                    className="w-1/2"
                                />
                                {errors.className && (
                                    <p className="text-sm text-red-600 mt-2">{errors.className}</p>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200"></div>

                        {/* 소개 */}
                        <div className="flex items-start gap-4">
                            <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                소개
                            </label>
                            <div className="flex-1">
                                <Input
                                    multiline
                                    value={description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                    placeholder="클래스에 대한 소개를 입력하세요"
                                    rows={5}
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-200"></div>

                        {/* Admin: 판매상태 */}
                        {isAdmin && (
                            <>
                                <div className="flex items-start gap-4">
                                    <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                        판매상태
                                    </label>
                                    <div className="flex-1">
                                        <div className="space-y-2 w-2/3">
                                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input
                                                    type="radio"
                                                    name="saleStatus"
                                                    value="available"
                                                    checked={saleStatus === 'available'}
                                                    onChange={() => setSaleStatus('available')}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">판매가능</div>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input
                                                    type="radio"
                                                    name="saleStatus"
                                                    value="unavailable"
                                                    checked={saleStatus === 'unavailable'}
                                                    onChange={() => setSaleStatus('unavailable')}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">판매불가</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200"></div>
                            </>
                        )}

                        {/* 참여기간 */}
                        <div className="flex items-start gap-4">
                            <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                참여기간
                            </label>
                            <div className="flex-1">
                                <div className="flex gap-4">
                                    <div className="w-42">
                                        <label className="block text-sm text-gray-600 mb-1.5">
                                            시작일
                                        </label>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                                            disabled={isAdmin && saleStatus === 'unavailable'}
                                        />
                                        {errors.startDate && (
                                            <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
                                        )}
                                    </div>
                                    <div className="w-42">
                                        <label className="block text-sm text-gray-600 mb-1.5">
                                            종료일
                                        </label>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                                            disabled={isAdmin && saleStatus === 'unavailable'}
                                        />
                                        {errors.endDate && (
                                            <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200"></div>

                        {/* 참가자 수 */}
                        <div className="flex items-start gap-4">
                            <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                참가자 수
                            </label>
                            <div className="flex-1">
                                <div className="flex items-center gap-6">
                                    <span className="text-sm text-gray-600 whitespace-nowrap">
                                        현재 <span className="font-bold text-gray-900 mx-1">0</span>명
                                    </span>
                                    <span className="text-gray-300">/</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600 whitespace-nowrap">최대</span>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={maxParticipants}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxParticipants(parseInt(e.target.value) || 0)}
                                            className="w-24 text-right"
                                            disabled={isAdmin && saleStatus === 'unavailable'}
                                        />
                                        <span className="text-sm text-gray-600 whitespace-nowrap">명</span>
                                    </div>
                                    <span className="text-sm text-blue-600 ml-4 whitespace-nowrap">
                                        {isAdmin
                                            ? '(보유 라이선스 제한 없음)'
                                            : licenseInfo.type === 'user'
                                            ? `(등록가능 사용자 수: ${licenseInfo.count}개)`
                                            : '(기기 라이센스: 사용자 수 무제한)'}
                                    </span>
                                </div>
                                {errors.maxParticipants && (
                                    <p className="text-sm text-red-600 mt-2">{errors.maxParticipants}</p>
                                )}
                            </div>
                        </div>

                        {/* Admin: 판매가능 시 추가 필드 */}
                        {isAdmin && saleStatus === 'available' && (
                            <>
                                <div className="border-t border-gray-200"></div>

                                {/* 교육기관 선택 */}
                                <div className="flex items-start gap-4">
                                    <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                        교육기관
                                    </label>
                                    <div className="flex-1">
                                        <Select
                                            value={selectedOrganizationId}
                                            onValueChange={setSelectedOrganizationId}
                                        >
                                            <SelectTrigger className="w-1/2">
                                                <SelectValue placeholder="교육기관을 선택하세요" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {organizationsData?.organizationList.map((org) => (
                                                    <SelectItem key={org.organizationId} value={org.organizationId.toString()}>
                                                        {org.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.organization && (
                                            <p className="text-sm text-red-600 mt-2">{errors.organization}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-gray-200"></div>

                                {/* 수강료 */}
                                <div className="flex items-start gap-4">
                                    <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                        수강료
                                    </label>
                                    <div className="flex-1">
                                        <div className="flex gap-4">
                                            <div className="w-48">
                                                <label className="block text-sm text-gray-600 mb-1.5">
                                                    수강료
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={price}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(parseInt(e.target.value) || 0)}
                                                        placeholder="0"
                                                    />
                                                    <span className="text-sm text-gray-600">원</span>
                                                </div>
                                                {errors.price && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.price}</p>
                                                )}
                                            </div>
                                            <div className="w-48">
                                                <label className="block text-sm text-gray-600 mb-1.5">
                                                    할인가
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={discountPrice}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscountPrice(parseInt(e.target.value) || 0)}
                                                        placeholder="0"
                                                    />
                                                    <span className="text-sm text-gray-600">원</span>
                                                </div>
                                                {errors.discountPrice && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.discountPrice}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="border-t border-gray-200"></div>

                        {/* 썸네일 이미지 */}
                        <div className="flex items-start gap-4">
                            <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                썸네일 이미지
                            </label>
                            <div className="flex-1">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="thumbnailMode"
                                                value="custom"
                                                checked={thumbnailMode === 'custom'}
                                                onChange={() => setThumbnailMode('custom')}
                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">직접 업로드</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="thumbnailMode"
                                                value="scenario"
                                                checked={thumbnailMode === 'scenario'}
                                                onChange={() => setThumbnailMode('scenario')}
                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">시나리오 이미지 선택</span>
                                        </label>
                                    </div>

                                    {thumbnailMode === 'custom' ? (
                                        <div className="flex items-start gap-4">
                                            <div className="w-32 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                                                {customThumbnail ? (
                                                    <img src={customThumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs text-gray-400">이미지 없음</span>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">권장 사이즈: 1280x720px (JPG, PNG)</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {scenarioImages.length > 0 ? (
                                                <div className="grid grid-cols-5 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                    {scenarioImages.map((img) => (
                                                        <div
                                                            key={img.id}
                                                            onClick={() => setSelectedScenarioThumbnail(img.image)}
                                                            className={`cursor-pointer rounded-lg overflow-hidden border-2 relative group ${selectedScenarioThumbnail === img.image ? 'border-blue-500' : 'border-transparent'}`}
                                                        >
                                                            <div className="aspect-video bg-gray-100">
                                                                <img src={img.image} alt={img.title} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded">선택</span>
                                                            </div>
                                                            {selectedScenarioThumbnail === img.image && (
                                                                <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                                                    ✓
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg text-center border border-dashed border-gray-200">
                                                    선택 가능한 시나리오 이미지가 없습니다.
                                                    <br />
                                                    커리큘럼에 시나리오를 먼저 추가해주세요.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200"></div>

                        {/* 공개설정 */}
                        <div className="flex items-start gap-4">
                            <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                공개설정
                            </label>
                            <div className="flex-1">
                                <div className="space-y-2 w-2/3">
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            value="public"
                                            checked={isPublic === true}
                                            onChange={() => setIsPublic(true)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">공개</div>
                                            <div className="text-sm text-gray-500">
                                                모든 사용자가 이 클래스를 조회하고 참여할 수 있습니다.
                                            </div>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            value="private"
                                            checked={isPublic === false}
                                            onChange={() => setIsPublic(false)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">비공개</div>
                                            <div className="text-sm text-gray-500">
                                                비밀번호를 입력한 사용자만 이 클래스에 접근할 수 있습니다.
                                            </div>
                                        </div>
                                    </label>

                                    {!isPublic && (
                                        <div className="mt-4 pl-7">
                                            <label className="block text-sm text-gray-600 mb-1.5">
                                                비밀번호
                                            </label>
                                            <Input
                                                type="password"
                                                value={password}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                                placeholder="비밀번호를 입력하세요"
                                                className="w-1/2"
                                            />
                                            {errors.password && (
                                                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200"></div>

                        {/* 이수조건 */}
                        <div className="flex items-start gap-4">
                            <label className="text-sm font-medium text-gray-700 w-32 pt-2">
                                이수조건
                            </label>
                            <div className="flex-1">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={completionRequirements.requireAllScenarios}
                                            onChange={(e) => setCompletionRequirements({
                                                ...completionRequirements,
                                                requireAllScenarios: e.target.checked
                                            })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">모든 시나리오 완료 필수</span>
                                    </label>

                                    {!completionRequirements.requireAllScenarios && (
                                        <div className="flex items-center gap-3">
                                            <label className="text-sm text-gray-600 w-40">
                                                최소 완료 시나리오 수
                                            </label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={curriculumItems.length || 1}
                                                value={completionRequirements.minScenarios}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompletionRequirements({
                                                    ...completionRequirements,
                                                    minScenarios: parseInt(e.target.value) || 1
                                                })}
                                                className="w-32"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <label className="text-sm text-gray-600 w-40">
                                            최소 합격 점수 (%)
                                        </label>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={completionRequirements.minPassingScore}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompletionRequirements({
                                                ...completionRequirements,
                                                minPassingScore: parseInt(e.target.value) || 0
                                            })}
                                            className="w-32"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200"></div>

                        {/* 커리큘럼 설정 */}
                        <CurriculumSetup
                            items={curriculumItems}
                            onItemsChange={setCurriculumItems}
                            error={errors.scenarios}
                        />
                    </div>
                </section>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pb-8">
                    <Button variant="secondary" onClick={handleCancel}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        클래스 생성
                    </Button>
                </div>
            </div>


        </>
    );
}
