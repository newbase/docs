import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { scenarioDetails, ScenarioDetail } from '../../data/scenarioDetails';
import { Modal, Button, SearchBar, FilterGroup, SimpleSelect } from '@/components/shared/ui';

interface ScenarioSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (scenarios: ScenarioDetail[]) => void;
    selectedScenarioIds?: number[];
}

export default function AddScenarioModal({
    isOpen,
    onClose,
    onSelect,
    selectedScenarioIds = []
}: ScenarioSelectionModalProps): React.ReactElement {
    const [searchQuery, setSearchQuery] = useState('');
    const [tempSelectedIds, setTempSelectedIds] = useState<number[]>(selectedScenarioIds);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Sync tempSelectedIds with prop when modal opens or prop changes
    useEffect(() => {
        if (isOpen) {
            setTempSelectedIds(selectedScenarioIds);
        }
    }, [isOpen, selectedScenarioIds]);

    // Convert scenarioDetails object to array
    const allScenarios = useMemo(() => {
        return scenarioDetails ? Object.values(scenarioDetails) : [];
    }, []);

    // Get unique categories
    const categories = useMemo(() => {
        const uniqueCategories = new Set((allScenarios || []).map(s => s.category));
        return ['all', ...Array.from(uniqueCategories)];
    }, [allScenarios]);

    // Filter scenarios based on search query and category
    const filteredScenarios = useMemo(() => {
        let filtered = allScenarios;

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
    }, [allScenarios, searchQuery, selectedCategory]);

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
            <div className="space-y-2">
                {/* Filters and Search Bar in One Line */}
                <div className="sticky top-0 bg-white z-10">
                    <FilterGroup>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200 whitespace-nowrap">
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
                            <span className="text-sm font-medium text-gray-700">전체</span>
                            <span className="text-sm text-gray-500">({tempSelectedIds.length})</span>
                        </div>

                        <SimpleSelect
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            wrapperClassName="w-48"
                        >
                            <option value="all">전체 카테고리</option>
                            {categories.filter(c => c !== 'all').map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </SimpleSelect>

                        <div className="flex-1">
                            <SearchBar
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="시나리오명, 저작자, 내용으로 검색"
                            />
                        </div>
                    </FilterGroup>
                </div>

                {/* Scenario List */}
                <div className="min-h-[300px] max-h-[500px] overflow-y-auto">
                    {filteredScenarios.length > 0 ? (
                        <div className="space-y-2">
                            {filteredScenarios.map((scenario) => {
                                const isSelected = tempSelectedIds.includes(scenario.id);

                                return (
                                    <div
                                        key={scenario.id}
                                        onClick={() => handleToggleScenario(scenario.id)}
                                        className={`
                        px-3 py-2 border rounded-md cursor-pointer transition-all
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
                                                    className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                                                />
                                            </div>

                                            {/* Scenario Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 justify-between flex-wrap">
                                                    <h4 className="font-semibold text-sm text-gray-900">
                                                        {scenario.title}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <span className="w-28 overflow-hidden text-ellipsis whitespace-nowrap bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-md">{scenario.ContributedBy}</span>
                                                        <span className="w-16 overflow-hidden text-ellipsis whitespace-nowrap bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-md">{scenario.duration}</span>
                                                        <span className="w-16 overflow-hidden text-ellipsis whitespace-nowrap bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-md">{scenario.platform || 'VR'}</span>
                                                    </div>
                                                </div>
                                                {scenario.handover && (
                                                    <p className="text-sm text-gray-500 font-medium mt-2 line-clamp-1">
                                                        {scenario.handover}
                                                    </p>
                                                )}
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
                <div className="flex justify-end gap-3 pt-1">
                    <Button variant="secondary" onClick={handleCancel}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        확인
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
