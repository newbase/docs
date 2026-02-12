import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/components/shared/ui';
import { Category } from '../../../data/categories';

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: Category) => void;
    initialData: Partial<Category> | null;
    parentCategory?: Category | null;
}

export default function CategoryFormModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    parentCategory
}: CategoryFormModalProps): React.ReactElement {
    const [formData, setFormData] = useState<Partial<Category>>({
        type: 'dialogue',
        childType: '',
        name: '',
        englishName: '',
        depth: 1,
        order: 1,
        permissions: { c: true, r: true, u: true, d: false }
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...formData,
                ...initialData
            });
        } else if (parentCategory) {
            setFormData({
                ...formData,
                parentId: parentCategory.id,
                type: parentCategory.type,
                childType: parentCategory.childType,
                depth: parentCategory.depth + 1
            });
        } else {
            setFormData({
                type: 'dialogue',
                childType: '',
                name: '',
                englishName: '',
                depth: 1,
                order: 1,
                permissions: { c: true, r: true, u: true, d: false }
            });
        }
    }, [initialData, parentCategory, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('perm_')) {
            const permKey = name.replace('perm_', '') as keyof Category['permissions'];
            setFormData((prev: Partial<Category>) => ({
                ...prev,
                permissions: {
                    ...prev.permissions!,
                    [permKey]: (e.target as HTMLInputElement).checked
                }
            }));
        } else {
            setFormData((prev: Partial<Category>) => ({
                ...prev,
                [name]: name === 'depth' || name === 'order' ? parseInt(value) || 0 : value
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: formData.id || `cat_${Date.now()}`
        } as Category);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData?.id ? '카테고리 수정' : parentCategory ? `${parentCategory.name}의 서브 카테고리 추가` : '새 카테고리 생성'}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>취소</Button>
                    <Button variant="primary" onClick={handleSubmit}>저장</Button>
                </>
            }
        >
            <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">유형</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="dialogue">dialogue</option>
                            <option value="system">system</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">종속 유형</label>
                        <input
                            type="text"
                            name="childType"
                            value={formData.childType}
                            onChange={handleChange}
                            placeholder="예: 환자대화"
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">카테고리명 (국문)</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">카테고리명 (영문)</label>
                    <input
                        type="text"
                        name="englishName"
                        value={formData.englishName}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Depth</label>
                        <input
                            type="number"
                            name="depth"
                            value={formData.depth}
                            onChange={handleChange}
                            disabled={!!parentCategory}
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">순서</label>
                        <input
                            type="number"
                            name="order"
                            value={formData.order}
                            onChange={handleChange}
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">권한 (C/R/U/D)</label>
                    <div className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {['c', 'r', 'u', 'd'].map(p => (
                            <label key={p} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name={`perm_${p}`}
                                    checked={formData.permissions?.[p as keyof Category['permissions']]}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-bold text-gray-700 uppercase">{p}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </form>
        </Modal>
    );
}
