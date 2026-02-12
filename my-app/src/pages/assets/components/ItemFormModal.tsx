import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Tabs, TabsList, TabsTrigger } from '@/components/shared/ui';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectCombo, Input } from '@/components/shared/ui';
import { type Asset, type AssetType, type ToolType } from '../../../data/assets';
import { Upload, CheckCircle2, RefreshCw, Image as ImageIcon, Plus, RotateCcw, Trash2, Pen } from 'lucide-react';
import { cn } from '../../../utils/studioUtils';

interface AssetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (asset: Asset) => void;
    initialData: Asset | null;
    assets: Asset[]; // Pass existing assets to extract categories
}

export default function ItemFormModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    assets
}: AssetFormModalProps): React.ReactElement {
    const [formData, setFormData] = useState<Partial<Asset> & { englishName?: string }>({
        key: '',
        name: '',
        englishName: '',
        type: '캐릭터',
        category: '',
        description: '',
        isPlayable: true,
        thumbnail: '',
        spots: [],
        createdAt: new Date().toISOString().split('T')[0]
    });

    const [isAutoKey, setIsAutoKey] = useState(false);
    const [isAutoSpotKey, setIsAutoSpotKey] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isThumbUploading, setIsThumbUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    // Extract categories for the current type
    const availableCategories = useMemo(() => {
        const typeCats = Array.from(new Set(
            assets
                .filter(a => a.type === formData.type)
                .map(a => a.category)
                .filter((cat): cat is string => !!cat && cat.trim() !== '')
        )).sort();
        return typeCats;
    }, [assets, formData.type]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                englishName: initialData.englishName || ''
            });
            setIsAutoKey(false);
            setIsAddingCategory(false);
        } else {
            setFormData({
                key: '',
                name: '',
                englishName: '',
                type: '캐릭터',
                category: availableCategories.length > 0 ? availableCategories[0] : '',
                description: '',
                isPlayable: true,
                thumbnail: '',
                spots: [],
                createdAt: new Date().toISOString().split('T')[0]
            });
            setIsAutoKey(true);
            setIsAddingCategory(false);
        }
        setUploadStatus('idle');
    }, [initialData, isOpen]);

    // Update category when type changes if not adding manually
    useEffect(() => {
        if (!initialData && !isAddingCategory && availableCategories.length > 0) {
            if (!availableCategories.includes(formData.category || '')) {
                setFormData(prev => ({ ...prev, category: availableCategories[0] }));
            }
        }
    }, [formData.type, availableCategories, isAddingCategory, initialData]);

    useEffect(() => {
        if (isAutoKey && !initialData) {
            const prefix = formData.type === '캐릭터' ? 'char' :
                formData.type === '맵' ? 'map' :
                    formData.type === '장비' ? 'eq' :
                        formData.type === '도구' ? 'tool' : 'med';

            // Generate key: prefix + englishName + number
            const engName = formData.englishName ? formData.englishName.replace(/\s+/g, '_').toLowerCase() : 'item';
            const timestamp = Date.now().toString().slice(-4);
            setFormData(prev => ({ ...prev, key: `${prefix}_${engName}_${timestamp}` }));
        }
    }, [isAutoKey, formData.type, formData.englishName, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSpotChange = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const newSpots = [...(prev.spots || [])];
            if (field.startsWith('location_')) {
                const axis = field.split('_')[1] as 'x' | 'y' | 'z';
                newSpots[index] = {
                    ...newSpots[index],
                    location: {
                        ...newSpots[index].location,
                        [axis]: parseFloat(value) || 0
                    }
                };
            } else if (field === 'size') {
                newSpots[index] = { ...newSpots[index], [field]: parseFloat(value) || 0 };
            } else {
                newSpots[index] = { ...newSpots[index], [field]: value };
            }
            return { ...prev, spots: newSpots };
        });
    };

    const addSpot = () => {
        setFormData(prev => {
            const currentSpots = prev.spots || [];
            let nextKey = '';
            if (isAutoSpotKey) {
                const maxIndex = currentSpots.reduce((max, s) => {
                    const match = s.key.match(/^sp_(\d+)$/);
                    if (match) {
                        const idx = parseInt(match[1], 10);
                        return idx > max ? idx : max;
                    }
                    return max;
                }, 0);
                nextKey = `sp_${(maxIndex + 1).toString().padStart(2, '0')}`;
            }
            return {
                ...prev,
                spots: [
                    ...currentSpots,
                    { key: nextKey, name: '', location: { x: 0, y: 0, z: 0 }, size: 1 }
                ]
            };
        });
    };

    const removeSpot = (index: number) => {
        setFormData(prev => ({
            ...prev,
            spots: (prev.spots || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Asset);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        // Simulate file parsing and upload
        setTimeout(() => {
            setIsUploading(false);
            setUploadStatus('success');
            // Mock data from "Excel"
            setFormData(prev => ({
                ...prev,
                name: '업로드된 아이템',
                description: '엑셀 파일을 통해 자동 입력된 설명입니다.'
            }));
        }, 1500);
    };

    const handleThumbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsThumbUploading(true);
        // Simulate image upload
        const reader = new FileReader();
        reader.onloadend = () => {
            setTimeout(() => {
                setIsThumbUploading(false);
                setFormData(prev => ({ ...prev, thumbnail: reader.result as string }));
            }, 1000);
        };
        reader.readAsDataURL(file);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? '아이템 수정' : '아이템 추가'}
            size="large"
            footer={
                <div className="flex justify-between w-full">
                    <div className="flex items-center">
                        {uploadStatus === 'success' && (
                            <span className="text-sm text-green-600 flex items-center gap-1 font-medium">
                                <CheckCircle2 size={16} /> 엑셀 업로드 완료
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>취소</Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            {initialData ? '수정 완료' : '아이템 저장'}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Item Type (Tabs) - Full Width */}
                    <div className="space-y-2">
                        <Tabs
                            value={formData.type}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, type: val as AssetType }))}
                            className="w-full"
                        >
                            <TabsList className="w-full justify-start bg-transparent border-none">
                                <TabsTrigger value="캐릭터" className="px-6 py-2 rounded-lg border-b-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=inactive]:hover:bg-gray-100">캐릭터</TabsTrigger>
                                <TabsTrigger value="맵" className="px-6 py-2 rounded-lg border-b-0 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=inactive]:hover:bg-gray-100">맵</TabsTrigger>
                                <TabsTrigger value="장비" className="px-6 py-2 rounded-lg border-b-0 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=inactive]:hover:bg-gray-100">장비</TabsTrigger>
                                <TabsTrigger value="도구" className="px-6 py-2 rounded-lg border-b-0 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=inactive]:hover:bg-gray-100">도구</TabsTrigger>
                                <TabsTrigger value="약물" className="px-6 py-2 rounded-lg border-b-0 data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=inactive]:hover:bg-gray-100">약물</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {/* Category Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">카테고리</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    {isAddingCategory ? (
                                        <Input
                                            type="text"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            placeholder="새 카테고리 입력"
                                        />
                                    ) : (
                                        <SelectCombo
                                            value={formData.category || ''}
                                            onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                            options={availableCategories.map(cat => ({ value: cat, label: cat }))}
                                            placeholder="카테고리 선택"
                                        />
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant={isAddingCategory ? "outline" : "outline"}
                                    onClick={() => {
                                        setIsAddingCategory(!isAddingCategory);
                                        if (isAddingCategory) {
                                            setFormData(prev => ({ ...prev, category: availableCategories[0] || '' }));
                                        } else {
                                            setFormData(prev => ({ ...prev, category: '' }));
                                        }
                                    }}
                                    className="h-10 px-3 shrink-0"
                                >
                                    {isAddingCategory ? (
                                        <RotateCcw size={16} />
                                    ) : (
                                        <Pen size={16} />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Item Key Field */}
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <Input
                                    label="아이템 Key"
                                    type="text"
                                    name="key"
                                    value={formData.key}
                                    onChange={handleChange}
                                    disabled={isAutoKey && !initialData}
                                    placeholder="생성 예: char_nurse_a_1234"
                                    className={isAutoKey && !initialData ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed' : ''}
                                />
                            </div>
                            {!initialData && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAutoKey(!isAutoKey)}
                                    className="h-10 px-3 shrink-0"
                                    title={isAutoKey ? "수동 입력으로 전환" : "자동 생성으로 전환"}
                                >
                                    <RotateCcw size={16} className={cn(isAutoKey && "animate-spin-once")} />
                                </Button>
                            )}
                        </div>

                        {/* Item Name (Korean) */}
                        <div className="space-y-2">
                            <Input
                                label="아이템명 (국문)"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="예: 간호사 A"
                            />
                        </div>

                        {/* Item Name (English) */}
                        <div className="space-y-2">
                            <Input
                                label="아이템명 (영문)"
                                type="text"
                                name="englishName"
                                value={formData.englishName}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="예: nurse_a"
                            />
                        </div>

                        {/* Tool Type & Playable */}
                        {(formData.type === '도구' || formData.type === '장비') && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">도구 타입</label>
                                <Select
                                    value={formData.toolType || ''}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, toolType: val as ToolType }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="타입 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="equipment">equipment (장비형)</SelectItem>
                                        <SelectItem value="responsive">responsive (반응형)</SelectItem>
                                        <SelectItem value="use_spot">use_spot (사용형-드랍)</SelectItem>
                                        <SelectItem value="checking_a">checking_a (A버튼 확인형)</SelectItem>
                                        <SelectItem value="user_grab">user_grab (사용형-그랩)</SelectItem>
                                        <SelectItem value="value_int">value_int (값 입력형)</SelectItem>
                                        <SelectItem value="etc">etc (기타)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Select
                                label="플레이 가능 여부"
                                value={formData.isPlayable ? 'true' : 'false'}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, isPlayable: val === 'true' }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="가능 여부 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">플레이 가능</SelectItem>
                                    <SelectItem value="false">플레이 불가</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Description - Full Width */}
                        <div className="space-y-2">
                            <Input
                                label="설명"
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="아이템에 대한 설명을 입력하세요"
                            />
                        </div>


                        {/* Spot Settings - Multi-management for Char, Eq, Tool */}
                        {(formData.type === '캐릭터' || formData.type === '장비' || formData.type === '도구') && (
                            <div className="col-span-2 p-4 bg-gray-50/50 rounded-xl border border-gray-100 space-y-4 mt-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-gray-900">Spot 설정</h4>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            addSpot();
                                        }}
                                        className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                        <Plus size={16} className="mr-1" /> Spot 추가
                                    </Button>
                                </div>

                                {(formData.spots || []).length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 text-sm italic">
                                        등록된 Spot이 없습니다.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {(formData.spots || []).map((spot, index) => (
                                            <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 space-y-3 relative group">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        removeSpot(index);
                                                    }}
                                                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-400 uppercase">Spot Key</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={spot.key}
                                                                onChange={(e) => handleSpotChange(index, 'key', e.target.value)}
                                                                disabled={isAutoSpotKey}
                                                                className={`flex-1 p-2 border rounded-md text-sm outline-none ${isAutoSpotKey
                                                                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                                                    : 'border-gray-200 focus:ring-1 focus:ring-blue-500'
                                                                    }`}
                                                                placeholder="sp_01"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => setIsAutoSpotKey(!isAutoSpotKey)}
                                                                className="h-9 px-2 shrink-0"
                                                                title={isAutoSpotKey ? "수동 입력으로 전환" : "자동 생성으로 전환"}
                                                            >
                                                                <RotateCcw size={14} className={cn(isAutoSpotKey && "animate-spin-once")} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-400 uppercase">Spot Name</label>
                                                        <input
                                                            type="text"
                                                            value={spot.name}
                                                            onChange={(e) => handleSpotChange(index, 'name', e.target.value)}
                                                            className="w-full p-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                            placeholder="위치 명칭"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 grid grid-cols-4 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-400 uppercase text-center block">X</label>
                                                            <input
                                                                type="number"
                                                                value={spot.location.x}
                                                                onChange={(e) => handleSpotChange(index, 'location_x', e.target.value)}
                                                                step="0.01"
                                                                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-400 uppercase text-center block">Y</label>
                                                            <input
                                                                type="number"
                                                                value={spot.location.y}
                                                                onChange={(e) => handleSpotChange(index, 'location_y', e.target.value)}
                                                                step="0.01"
                                                                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-400 uppercase text-center block">Z</label>
                                                            <input
                                                                type="number"
                                                                value={spot.location.z}
                                                                onChange={(e) => handleSpotChange(index, 'location_z', e.target.value)}
                                                                step="0.01"
                                                                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-400 uppercase text-center block">Size</label>
                                                            <input
                                                                type="number"
                                                                value={spot.size}
                                                                onChange={(e) => handleSpotChange(index, 'size', e.target.value)}
                                                                step="0.1"
                                                                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Excel & Thumbnail Upload Section */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        {!initialData && (
                            <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                        <Upload size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-1">엑셀 일괄 업로드</h4>
                                        <label className="relative cursor-pointer block mt-2">
                                            <input
                                                type="file"
                                                className="sr-only"
                                                accept=".xlsx, .xls"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                            />
                                            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-center ${isUploading
                                                ? 'bg-blue-200 text-blue-500 cursor-not-allowed'
                                                : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm'
                                                }`}>
                                                {isUploading ? <RefreshCw size={12} className="animate-spin mx-auto" /> : '파일 선택'}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 overflow-hidden">
                                    {formData.thumbnail ? (
                                        <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon size={18} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">썸네일 업로드</h4>
                                    <label className="relative cursor-pointer block mt-2">
                                        <input
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={handleThumbUpload}
                                            disabled={isThumbUploading}
                                        />
                                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-center ${isThumbUploading
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
                                            }`}>
                                            {isThumbUploading ? <RefreshCw size={12} className="animate-spin mx-auto" /> : '이미지 선택'}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
