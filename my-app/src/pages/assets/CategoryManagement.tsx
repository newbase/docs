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
import { Edit, Trash2, PlusSquare } from 'lucide-react';
import { categories as initialCategories, type Category } from '../../data/categories';
import CategoryFormModal from './components/CategoryFormModal';

export default function CategoryManagement(): React.ReactElement {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('전체');
    const [childTypeFilter, setChildTypeFilter] = useState<string>('전체');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [parentCategory, setParentCategory] = useState<Category | null>(null);

    // Get unique types and child types for filters
    const types = Array.from(new Set(categories.map(c => c.type)));
    const childTypes = Array.from(new Set(categories.map(c => c.childType)));

    // Filtering
    const filteredCategories = categories.filter(category => {
        const matchesSearch =
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === '전체' || category.type === typeFilter;
        const matchesChildType = childTypeFilter === '전체' || category.childType === childTypeFilter;

        return matchesSearch && matchesType && matchesChildType;
    });

    // Sort to show hierarchy (simple approach: parents then children)
    const sortedCategories = [...filteredCategories].sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        if (a.childType !== b.childType) return a.childType.localeCompare(b.childType);

        // If same hierarchy, sort by depth then order
        if (a.depth !== b.depth) return a.depth - b.depth;
        return a.order - b.order;
    });

    // Pagination
    const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
    const paginatedCategories = sortedCategories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleCreate = () => {
        setSelectedCategory(null);
        setParentCategory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setParentCategory(null);
        setIsModalOpen(true);
    };

    const handleAddSub = (category: Category) => {
        setSelectedCategory(null);
        setParentCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('정말 이 카테고리를 삭제하시겠습니까?')) {
            setCategories(prev => prev.filter(c => c.id !== id && c.parentId !== id));
        }
    };

    const handleSave = (category: Category) => {
        if (selectedCategory) {
            // Update
            setCategories(prev => prev.map(c => c.id === category.id ? category : c));
        } else {
            // Create
            setCategories(prev => [...prev, category]);
        }
        setIsModalOpen(false);
    };

    const renderPermissionBadge = (allowed: boolean, label: string) => (
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold mr-1 ${allowed ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
            {label}
        </span>
    );

    return (
        <>
            <PageHeader
                title="카테고리 관리"
                breadcrumbs={[{ label: '에셋 관리' }, { label: '카테고리 관리' }]}
                rightContent={
                    <Button variant="primary" onClick={handleCreate}>
                        <PlusSquare className="w-4 h-4 mr-2" />
                        카테고리 생성
                    </Button>
                }
            />

            <ListHeader
                totalCount={filteredCategories.length}
                rightContent={
                    <FilterGroup>
                        <FilterSelect
                            value={typeFilter}
                            onValueChange={(val) => setTypeFilter(val)}
                            options={[
                                { value: '전체', label: '전체 유형' },
                                ...types.map(t => ({ value: t, label: t }))
                            ]}
                        />
                        <FilterSelect
                            value={childTypeFilter}
                            onValueChange={(val) => setChildTypeFilter(val)}
                            options={[
                                { value: '전체', label: '전체 종속 유형' },
                                ...childTypes.map(ct => ({ value: ct, label: ct }))
                            ]}
                        />
                        <SearchBar
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="카테고리명 검색"
                        />
                    </FilterGroup>
                }
            />

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-16">순서</TableHead>
                            <TableHead>유형 / 종속 유형</TableHead>
                            <TableHead>카테고리명 (국문/영문)</TableHead>
                            <TableHead>Depth</TableHead>
                            <TableHead> 사용자 편집권한</TableHead>
                            <TableHead className="w-32">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedCategories.length > 0 ? (
                            paginatedCategories.map((category) => (
                                <TableRow key={category.id} className="hover:bg-gray-50 transition-colors">
                                    <TableCell className="font-medium text-gray-500">{category.order}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="w-fit">{category.type}</Badge>
                                            <span className="text-xs text-gray-400">{category.childType}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            {category.depth > 1 && (
                                                <span className="mr-2 text-gray-300">└</span>
                                            )}
                                            <div className="flex flex-col">
                                                <strong className="text-gray-900">{category.name}</strong>
                                                <span className="text-xs text-gray-500">{category.englishName}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-0.5 rounded text-xs ${category.depth === 1 ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                            D{category.depth}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            {renderPermissionBadge(category.permissions.c, 'C')}
                                            {renderPermissionBadge(category.permissions.r, 'R')}
                                            {renderPermissionBadge(category.permissions.u, 'U')}
                                            {renderPermissionBadge(category.permissions.d, 'D')}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleAddSub(category)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="서브 카테고리 추가"
                                            >
                                                <PlusSquare size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                title="수정"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
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
                                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                    검색 결과가 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedCategories.length}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
            />

            <CategoryFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={selectedCategory}
                parentCategory={parentCategory}
            />
        </>
    );
}
