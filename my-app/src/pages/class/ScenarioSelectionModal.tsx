import React, { useState, useMemo, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { scenarioDetails, ScenarioDetail } from '../../data/scenarioDetails';
import { getLicensesByOrgId } from '../../data/organizationLicenses';
import { useAuth } from '@/contexts/AuthContext';
import { Modal, Button, SearchBar, FilterGroup, FilterSelect } from '@/components/shared/ui';

interface ScenarioSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (scenarios: ScenarioDetail[]) => void;
    selectedScenarioIds?: number[];
}

export default function ScenarioSelectionModal({
    isOpen,
    onClose,
    onSelect,
    selectedScenarioIds = []
}: ScenarioSelectionModalProps): React.ReactElement {
    const [searchQuery, setSearchQuery] = useState('');
    const [tempSelectedIds, setTempSelectedIds] = useState<number[]>(selectedScenarioIds);
    const [selectedLicense, setSelectedLicense] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Sync tempSelectedIds with prop when modal opens or prop changes
    useEffect(() => {
        if (isOpen) {
            setTempSelectedIds(selectedScenarioIds);
        }
    }, [isOpen, selectedScenarioIds]);

    const { user } = useAuth();
    const orgId = user?.currentAccount?.organizationId || 'ORG001';

    // Get licenses for current organization
    const orgLicenses = useMemo(() => {
        return getLicensesByOrgId(orgId);
    }, [orgId]);

    // Convert scenarioDetails object to array
    const allScenarios = useMemo(() => {
        return Object.values(scenarioDetails);
    }, []);

    // Get unique categories
    const categories = useMemo(() => {
        const uniqueCategories = new Set(allScenarios.map(s => s.category));
        return ['all', ...Array.from(uniqueCategories)];
    }, [allScenarios]);

    // Filter scenarios based on search query, license, and category
    const filteredScenarios = useMemo(() => {
        let filtered = allScenarios;

        // License filter (mappings to platform and premium status)
        if (selectedLicense !== 'all') {
            const license = orgLicenses.find(l => l.id === selectedLicense);
            if (license) {
                // Filter by platform
                filtered = filtered.filter(scenario => scenario.platform === license.platform);

                // Filter by premium tier
                const isPremiumPlan = license.subscriptionPlan === 'Enterprise' || license.subscriptionPlan === 'Pro';
                if (!isPremiumPlan) {
                    filtered = filtered.filter(scenario => !scenario.requiredPremium);
                }
            }
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(scenario => scenario.category === selectedCategory);
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(scenario =>
                scenario.title.toLowerCase().includes(query) ||
                scenario.ContributedBy.toLowerCase().includes(query) ||
                scenario.handover?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [allScenarios, searchQuery, selectedLicense, selectedCategory, orgLicenses]);

    const handleToggleScenario = (scenarioId: number) => {
        setTempSelectedIds(prev =>
            prev.includes(scenarioId)
                ? prev.filter(id => id !== scenarioId)
                : [...prev, scenarioId]
        );
    };

    const handleSelectAll = () => {
        const filteredIds = filteredScenarios.map(s => s.id);
        const allFilteredSelected = filteredIds.every(id => tempSelectedIds.includes(id));

        if (allFilteredSelected) {
            // 전체 해제: 필터링된 시나리오들만 제거
            setTempSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            // 전체 선택: 필터링된 시나리오들 추가
            const newIds = [...new Set([...tempSelectedIds, ...filteredIds])];
            setTempSelectedIds(newIds);
        }
    };

    // 전체 선택 상태 확인
    const isAllSelected = filteredScenarios.length > 0 &&
        filteredScenarios.every(scenario => tempSelectedIds.includes(scenario.id));
    const isSomeSelected = filteredScenarios.some(scenario => tempSelectedIds.includes(scenario.id)) && !isAllSelected;

    const handleConfirm = () => {
        const selected = allScenarios.filter(s => tempSelectedIds.includes(s.id));
        onSelect(selected);
        onClose();
    };

    const handleCancel = () => {
        setTempSelectedIds(selectedScenarioIds);
        setSearchQuery('');
        setSelectedLicense('all');
        setSelectedCategory('all');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title="시나리오 선택"
            size="xl"
        >
            <div className="space-y-4">
                {/* Filters and Search Bar */}
                <div className="sticky top-0 bg-white z-10 pb-4 border-b space-y-3">
                    {/* Filter Group with Search Bar */}
                    <FilterGroup>
                        <FilterSelect
                            value={selectedLicense}
                            onValueChange={(val) => setSelectedLicense(val)}
                            options={[
                                { value: 'all', label: '제품명' },
                                ...orgLicenses.map(license => ({
                                    value: license.id,
                                    label: license.className
                                }))
                            ]}
                        />

                        <FilterSelect
                            value={selectedCategory}
                            onValueChange={(val) => setSelectedCategory(val)}
                            options={[
                                { value: 'all', label: '전체 카테고리' },
                                ...categories.filter(c => c !== 'all').map((category) => ({
                                    value: category,
                                    label: category
                                }))
                            ]}
                        />

                        <div className="flex-1">
                            <SearchBar
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="시나리오명, 저작자, 내용으로 검색"
                            />
                        </div>

                        {(selectedLicense !== 'all' || selectedCategory !== 'all' || searchQuery) && (
                            <button
                                onClick={() => {
                                    setSelectedLicense('all');
                                    setSelectedCategory('all');
                                    setSearchQuery('');
                                }}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors h-[44px] whitespace-nowrap"
                            >
                                초기화
                            </button>
                        )}
                    </FilterGroup>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    ref={(input) => {
                                        if (input) {
                                            input.indeterminate = isSomeSelected;
                                        }
                                    }}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">전체 선택</span>
                            </label>
                            <p className="text-sm text-gray-500">
                                {filteredScenarios.length}개 시나리오 중 {tempSelectedIds.length}개 선택됨
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scenario List */}
                <div className="max-h-[500px] overflow-y-auto">
                    {filteredScenarios.length > 0 ? (
                        <div className="space-y-2">
                            {filteredScenarios.map((scenario) => {
                                const isSelected = tempSelectedIds.includes(scenario.id);

                                return (
                                    <div
                                        key={scenario.id}
                                        onClick={() => handleToggleScenario(scenario.id)}
                                        className={`
                      p-4 border rounded-lg cursor-pointer transition-all
                      ${isSelected
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            }
                    `}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Checkbox */}
                                            <div className="mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => { }}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                            </div>

                                            {/* Scenario Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 mb-2">
                                                            {scenario.title}
                                                        </h4>

                                                        {scenario.handover && (
                                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                                {scenario.handover}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                                                            <div>
                                                                <span className="text-gray-500">저작자:</span>{' '}
                                                                <span className="text-gray-900">{scenario.ContributedBy}</span>
                                                            </div>

                                                            <div>
                                                                <span className="text-gray-500">플랫폼:</span>{' '}
                                                                <span className="text-gray-900">
                                                                    {scenario.platform || 'VR'}
                                                                </span>
                                                            </div>

                                                            <div>
                                                                <span className="text-gray-500">소요시간:</span>{' '}
                                                                <span className="text-gray-900">{scenario.duration}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Search size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">검색 결과가 없습니다.</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="secondary" onClick={handleCancel}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        확인 ({tempSelectedIds.length}개)
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
