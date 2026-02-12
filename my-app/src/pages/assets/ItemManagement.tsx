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
    Button,
    StatsGrid,
} from '@/components/shared/ui';
import { PlusSquare, Users, Map, Wrench, Pill, Package, Edit2, Trash2, MoreHorizontal, Copy, Check } from 'lucide-react';
import { assets as initialAssets, type Asset, type AssetType, type ToolType } from '../../data/assets';
import ItemFormModal from './components/ItemFormModal';

export default function ItemManagement(): React.ReactElement {
    const [assets, setAssets] = useState<Asset[]>(initialAssets);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('전체');
    const [categoryFilter, setCategoryFilter] = useState<string>('전체');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Get unique categories based on current type filter
    const categories = Array.from(new Set(
        assets
            .filter(a => typeFilter === '전체' || a.type === typeFilter)
            .map(a => a.category)
            .filter(Boolean)
    )).sort();

    // Handlers
    const handleSave = (assetData: Asset) => {
        if (selectedAsset) {
            // Update
            setAssets(prev => prev.map(a => a.key === selectedAsset.key ? assetData : a));
        } else {
            // Create
            setAssets(prev => [assetData, ...prev]);
        }
        setIsModalOpen(false);
        setSelectedAsset(null);
    };

    const handleEdit = (asset: Asset) => {
        setSelectedAsset(asset);
        setIsModalOpen(true);
    };

    const handleDelete = (key: string) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            setAssets(prev => prev.filter(a => a.key !== key));
        }
    };

    const handleOpenCreateModal = () => {
        setSelectedAsset(null);
        setIsModalOpen(true);
    };

    const handleCopyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    // Filter logic
    const filteredAssets = assets.filter(asset => {
        const matchesSearch =
            asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === '전체' || asset.type === typeFilter;
        const matchesCategory = categoryFilter === '전체' || asset.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
    });

    // Pagination
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
    const paginatedAssets = filteredAssets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Statistics
    const stats = [
        {
            label: '캐릭터 수',
            value: assets.filter(a => a.type === '캐릭터').length.toString(),
            icon: Users,
            color: 'brand',
            trend: '2',
            trendUp: true,
            isActive: typeFilter === '캐릭터',
            onClick: () => {
                setTypeFilter(typeFilter === '캐릭터' ? '전체' : '캐릭터');
                setCategoryFilter('전체');
                setCurrentPage(1);
            }
        },
        {
            label: '맵 수',
            value: assets.filter(a => a.type === '맵').length.toString(),
            icon: Map,
            color: 'brand',
            trend: '1',
            trendUp: true,
            isActive: typeFilter === '맵',
            onClick: () => {
                setTypeFilter(typeFilter === '맵' ? '전체' : '맵');
                setCategoryFilter('전체');
                setCurrentPage(1);
            }
        },
        {
            label: '장비 수',
            value: assets.filter(a => a.type === '장비').length.toString(),
            icon: Package,
            color: 'brand',
            trend: '3',
            trendUp: true,
            isActive: typeFilter === '장비',
            onClick: () => {
                setTypeFilter(typeFilter === '장비' ? '전체' : '장비');
                setCategoryFilter('전체');
                setCurrentPage(1);
            }
        },
        {
            label: '도구 수',
            value: assets.filter(a => a.type === '도구').length.toString(),
            icon: Wrench,
            color: 'brand',
            trend: '2',
            trendUp: true,
            isActive: typeFilter === '도구',
            onClick: () => {
                setTypeFilter(typeFilter === '도구' ? '전체' : '도구');
                setCategoryFilter('전체');
                setCurrentPage(1);
            }
        },
        {
            label: '약물 수',
            value: assets.filter(a => a.type === '약물').length.toString(),
            icon: Pill,
            color: 'brand',
            trend: '5',
            trendUp: true,
            isActive: typeFilter === '약물',
            onClick: () => {
                setTypeFilter(typeFilter === '약물' ? '전체' : '약물');
                setCategoryFilter('전체');
                setCurrentPage(1);
            }
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="아이템 관리"
                breadcrumbs={[{ label: '아이템 관리' }, { label: '아이템 관리' }]}
                rightContent={
                    <Button variant="outline" onClick={handleOpenCreateModal}>
                        <PlusSquare className="w-4 h-4 mr-2" />
                        아이템 추가
                    </Button>
                }
            />

            <StatsGrid items={stats} columns={5} />

            <ListHeader
                totalCount={filteredAssets.length}
                rightContent={
                    <FilterGroup>
                        <FilterSelect
                            value={typeFilter}
                            onValueChange={(val) => {
                                setTypeFilter(val);
                                setCategoryFilter('전체'); // Reset category when type changes
                                setCurrentPage(1);
                            }}
                            options={[
                                { value: '전체', label: '전체 타입' },
                                { value: '캐릭터', label: '캐릭터' },
                                { value: '맵', label: '맵' },
                                { value: '장비', label: '장비' },
                                { value: '도구', label: '도구' },
                                { value: '약물', label: '약물' },
                            ]}
                        />
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
                        <SearchBar
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="아이템명, 키워드 검색"
                        />
                    </FilterGroup>
                }
            />

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[80px]">이미지</TableHead>
                            <TableHead className="w-[120px]">카테고리</TableHead>
                            <TableHead className="min-w-[150px]">아이템명</TableHead>
                            <TableHead>설명</TableHead>
                            <TableHead className="w-[120px] text-center">플레이 가능</TableHead>
                            <TableHead className="w-[120px]">Use 타입</TableHead>
                            <TableHead className="w-[120px]">Key</TableHead>
                            <TableHead className="w-[110px] text-center">등록일</TableHead>
                            <TableHead className="w-[100px] text-center">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedAssets.length > 0 ? (
                            paginatedAssets.map((asset) => (
                                <TableRow key={asset.key} className="hover:bg-gray-50 transition-colors">
                                    <TableCell>
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                            {asset.thumbnail ? (
                                                <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Package size={20} />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-sm text-gray-600">{asset.category}</TableCell>
                                    <TableCell className="text-sm font-medium text-gray-900">{asset.name}</TableCell>
                                    <TableCell className="text-sm text-gray-600 max-w-xs truncate" title={asset.description}>
                                        {asset.description}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${asset.isPlayable ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-700 border-gray-100'
                                            }`}>
                                            {asset.isPlayable ? '가능' : '불가'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                        {asset.toolType ? (
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                                {asset.toolType}
                                            </span>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => handleCopyKey(asset.key)}
                                            className={`group flex items-center justify-between gap-2 px-2 py-1 rounded border transition-all w-full text-left font-mono text-xs ${copiedKey === asset.key
                                                ? 'bg-green-50 border-green-200 text-green-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                                                }`}
                                            title="Click to copy key"
                                        >
                                            <span className="truncate">{asset.key}</span>
                                            {copiedKey === asset.key ? (
                                                <Check size={12} className="shrink-0" />
                                            ) : (
                                                <Copy size={12} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            )}
                                        </button>
                                    </TableCell>

                                    <TableCell className="text-center text-xs text-gray-500">
                                        {asset.createdAt}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(asset)}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="수정"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(asset.key)}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
                                <TableCell colSpan={9} className="text-center py-12 text-gray-500">
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
                totalItems={filteredAssets.length}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
            />

            <ItemFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={selectedAsset}
                assets={assets}
            />
        </div>
    );
}
