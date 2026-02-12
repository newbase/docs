import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, ArrowLeft, Save } from 'lucide-react';
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
    Badge,
    Button,
    Input
} from '@/components/shared/ui';
import { symptomTemplates, type SymptomTemplate, SYMPTOM_CATEGORIES_BY_TYPE } from '../../data/symptomTemplates';
import { SymptomDataForm } from './components/actions/SymptomDataForm';
import { PATIENT_CLASSIFICATIONS } from '../../data/assetEvents';

type ViewMode = 'list' | 'create' | 'edit';


export default function SymptomManagement(): React.ReactElement {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('전체');
    const [editingTemplate, setEditingTemplate] = useState<SymptomTemplate | null>(null);

    const initialFormData: SymptomTemplate = {
        id: '',
        key: '',
        displayName: '',
        description: '',
        category: '심혈관계',
        tags: [],
        patientType: 'Adult_Male',
        createdDate: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0],
        vitals: {},
        mentalStatus: {},
        locations: []
    };

    const [formData, setFormData] = useState<SymptomTemplate>(initialFormData);

    const filteredTemplates = symptomTemplates.filter(template => {
        const matchesSearch =
            template.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.key.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
            categoryFilter === '전체' ||
            template.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const categories = ['전체', ...Array.from(new Set(symptomTemplates.map(t => t.category)))];

    const handleAdd = () => {
        setFormData({ ...initialFormData, id: `symp_${Date.now()}` });
        setViewMode('create');
    };

    const handleEdit = (id: string) => {
        const template = symptomTemplates.find(t => t.id === id);
        if (template) {
            setFormData({ ...template });
            setViewMode('edit');
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('정말 이 템플릿을 삭제하시겠습니까?')) {
            // TODO: Implement delete
        }
    };

    const handleSave = () => {
        // TODO: Implement actual save logic
        setViewMode('list');
    };

    const handleCancel = () => {
        setViewMode('list');
    };

    const updateFormData = (data: any) => {
        setFormData(prev => {
            const newData = { ...prev, ...data };

            // patientType이 변경되었을 때, 기존 category가 새 patientType의 카테고리에 포함되지 않으면 초기화
            if (data.patientType && data.patientType !== prev.patientType) {
                const availableCategories = SYMPTOM_CATEGORIES_BY_TYPE[data.patientType] || [];
                if (!availableCategories.includes(prev.category)) {
                    newData.category = availableCategories[0] || '기타';
                }
            }

            return newData;
        });
    };

    if (viewMode === 'create' || viewMode === 'edit') {
        return (
            <div className="space-y-6">
                <PageHeader
                    title={viewMode === 'create' ? "증상 템플릿 생성" : "증상 템플릿 수정"}
                    breadcrumbs={[
                        { label: '에셋 관리' },
                        { label: '증상 템플릿' },
                        { label: viewMode === 'create' ? '템플릿 생성' : '템플릿 수정' }
                    ]}
                    actions={
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleCancel}>
                                <ArrowLeft size={16} />
                                취소
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                <Save size={16} />
                                저장하기
                            </Button>
                        </div>
                    }
                />

                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                                기본 정보
                            </h3>
                            <div className="space-y-4">
                                <Input
                                    label="템플릿 이름"
                                    value={formData.displayName}
                                    onChange={(e) => updateFormData({ displayName: e.target.value })}
                                    placeholder="예: 심근경색 초기 증상"
                                />
                                <Input
                                    label="템플릿 Key (ID)"
                                    value={formData.key}
                                    onChange={(e) => updateFormData({ key: e.target.value })}
                                    placeholder="예: mi_early_symptom"
                                    disabled={viewMode === 'edit'}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">환자 유형</label>
                                    <FilterSelect
                                        value={formData.patientType}
                                        onValueChange={(val) => updateFormData({ patientType: val })}
                                        options={PATIENT_CLASSIFICATIONS}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">분류</label>
                                    <FilterSelect
                                        value={formData.category}
                                        onValueChange={(val) => updateFormData({ category: val })}
                                        options={(SYMPTOM_CATEGORIES_BY_TYPE[formData.patientType!] || []).map(cat => ({ value: cat, label: cat }))}
                                        className="w-full"
                                    />
                                </div>
                                <Input
                                    label="설명"
                                    multiline
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => updateFormData({ description: e.target.value })}
                                    placeholder="템플릿에 대한 설명을 입력하세요."
                                />
                                <Input
                                    label="태그 (쉼표로 구분)"
                                    value={formData.tags?.join(', ')}
                                    onChange={(e) => updateFormData({ tags: e.target.value.split(',').map(t => t.trim()) })}
                                    placeholder="예: MI, Emergency"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2">
                        <SymptomDataForm
                            data={formData}
                            onChange={(data) => updateFormData(data)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="환자 증상 템플릿 관리"
                breadcrumbs={[{ label: '에셋 관리' }, { label: '증상 템플릿' }]}
                actions={
                    <Button variant="primary" onClick={handleAdd}>
                        <Plus size={16} />
                        템플릿 생성
                    </Button>
                }
            />

            <ListHeader
                totalCount={filteredTemplates.length}
                rightContent={
                    <FilterGroup>
                        <FilterSelect
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                            options={categories.map(cat => ({ value: cat, label: cat }))}
                        />
                        <SearchBar
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="템플릿 이름, 설명, Key 검색"
                        />
                    </FilterGroup>
                }
            />

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>Key</TableHead>
                            <TableHead>환자 타입</TableHead>
                            <TableHead>분류</TableHead>
                            <TableHead>템플릿 이름</TableHead>
                            <TableHead>설명</TableHead>
                            <TableHead>태그</TableHead>
                            <TableHead>관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTemplates.length > 0 ? (
                            filteredTemplates.map((template) => (
                                <TableRow key={template.id} className="hover:bg-gray-50 transition-colors">
                                    <TableCell>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{template.key}</code>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-gray-600 font-medium">{template.patientType}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{template.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-semibold text-blue-600">{template.displayName}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-md truncate text-sm text-gray-500" title={template.description}>
                                            {template.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {template.tags?.map(tag => (
                                                <span key={tag} className="text-sm px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(template.id)}
                                                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="수정"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(template.id)}
                                                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
                                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                    검색 결과가 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
