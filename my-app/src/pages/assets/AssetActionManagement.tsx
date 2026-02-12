import React, { useState } from 'react';
import {
    PageHeader,
    ListHeader,
    FilterGroup,
    FilterSelect,
    SearchBar,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Pagination,
    Badge,
    Button
} from '@/components/shared/ui';
import { Edit, Trash2, PlusSquare, Copy, Check, AlertCircle, Award } from 'lucide-react';
import { actions as initialActions, type Action, type ActionStartTracking, type RequirementType, getRequirementTypeLabel, getActionCategories } from '../../data/actions';
import ActionFormModal from './components/ActionFormModal';

export default function AssetActionManagement(): React.ReactElement {
    const [actions, setActions] = useState<Action[]>(initialActions);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('전체');
    const [prerequisiteFilter, setPrerequisiteFilter] = useState<string>('전체');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const itemsPerPage = 10;

    // Filter by category
    const filteredByCategory = categoryFilter === '전체'
        ? actions
        : actions.filter(a => a.category === categoryFilter);

    // Filter by prerequisite type
    const filteredByPrerequisite = prerequisiteFilter === '전체'
        ? filteredByCategory
        : filteredByCategory.filter(a => a.requiredConditionType === prerequisiteFilter);

    // Filter by search query
    const filteredActions = filteredByPrerequisite.filter(action =>
        action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const prerequisiteTypes: RequirementType[] = [
        'none', 'item_equipped', 'item_used', 'skill_completed',
        'time_elapsed', 'patient_state', 'vital_sign', 'location',
        'dialogue_completed', 'custom'
    ];

    const categories = getActionCategories();

    // Pagination
    const totalPages = Math.ceil(filteredActions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedActions = filteredActions.slice(startIndex, startIndex + itemsPerPage);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);

    const handleCreate = () => {
        setSelectedAction(null);
        setIsModalOpen(true);
    };

    const handleEdit = (action: Action) => {
        setSelectedAction(action);
        setIsModalOpen(true);
    };

    const handleDelete = (key: string) => {
        if (window.confirm('이 액션을 삭제하시겠습니까?')) {
            setActions(prev => prev.filter(a => a.key !== key));
        }
    };

    const handleSave = (action: Action) => {
        if (selectedAction) {
            // Edit existing
            setActions(prev => prev.map(a => a.key === action.key ? action : a));
        } else {
            // Create new
            setActions(prev => [...prev, action]);
        }
        setIsModalOpen(false);
        setSelectedAction(null);
    };

    const handleCopyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="액션 관리"
                breadcrumbs={[{ label: '에셋 관리' }, { label: '액션 관리' }]}
                rightContent={
                    <Button variant="outline" onClick={handleCreate}>
                        <PlusSquare className="w-4 h-4 mr-2" />
                        액션 생성
                    </Button>
                }
            />

            <ListHeader
                totalCount={filteredActions.length}
                rightContent={
                    <FilterGroup>
                        <FilterSelect
                            value={categoryFilter}
                            onValueChange={(val) => {
                                setCategoryFilter(val);
                                setCurrentPage(1);
                            }}
                            options={[
                                { value: '전체', label: '전체 카테고리' },
                                ...categories.map(c => ({ value: c, label: c }))
                            ]}
                        />
                        <FilterSelect
                            value={prerequisiteFilter}
                            onValueChange={(val) => {
                                setPrerequisiteFilter(val);
                                setCurrentPage(1);
                            }}
                            options={[
                                { value: '전체', label: '전체 조건' },
                                ...prerequisiteTypes.map(r => ({ value: r, label: getRequirementTypeLabel(r) }))
                            ]}
                        />
                        <SearchBar
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="액션명, 키, 설명 검색"
                        />
                    </FilterGroup>
                }
            />

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[140px]">Key</TableHead>
                            <TableHead className="w-[100px]">카테고리</TableHead>
                            <TableHead className="w-[160px]">액션명</TableHead>
                            <TableHead className="w-[100px]">액션 타입</TableHead>
                            <TableHead>설명</TableHead>
                            <TableHead className="w-[100px]">선행조건</TableHead>
                            <TableHead className="w-[80px] text-center">점수</TableHead>
                            <TableHead className="w-[100px] text-center">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedActions.length > 0 ? (
                            paginatedActions.map((action) => (
                                <TableRow key={action.key} className="hover:bg-gray-50 transition-colors">
                                    <TableCell>
                                        <button
                                            onClick={() => handleCopyKey(action.key)}
                                            className={`group flex items-center justify-between gap-2 px-2 py-1 rounded border transition-all w-full text-left font-mono text-xs ${copiedKey === action.key
                                                ? 'bg-green-50 border-green-200 text-green-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                                                }`}
                                            title="클릭하여 복사"
                                        >
                                            <span className="truncate">{action.key}</span>
                                            {copiedKey === action.key ? (
                                                <Check size={12} className="shrink-0" />
                                            ) : (
                                                <Copy size={12} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            )}
                                        </button>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{action.category}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900">
                                        {action.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {action.actionStartType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600 max-w-xs truncate" title={action.description}>
                                        {action.description}
                                    </TableCell>
                                    <TableCell>
                                        {action.requiredConditionType && action.requiredConditionType !== 'none' ? (
                                            <div className="flex items-center gap-1.5">
                                                <AlertCircle size={14} className="text-amber-500 shrink-0" />
                                                <span className="text-xs text-gray-600 truncate">
                                                    {getRequirementTypeLabel(action.requiredConditionType)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">조건 없음</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {action.score && action.score > 0 ? (
                                            <div className="flex items-center justify-center gap-1">
                                                <Award size={14} className="text-yellow-500" />
                                                <span className="text-sm font-medium text-gray-700">{action.score}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handleEdit(action)}
                                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                title="수정"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(action.key)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="삭제"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                                    {searchQuery || categoryFilter !== '전체' || prerequisiteFilter !== '전체'
                                        ? '검색 결과가 없습니다.'
                                        : '등록된 액션이 없습니다.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            <ActionFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedAction(null);
                }}
                onSave={handleSave}
                initialData={selectedAction}
                existingKeys={actions.map(a => a.key)}
            />
        </div>
    );
}
