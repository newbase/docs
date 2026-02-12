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
import { Edit, Trash2, PlusSquare, Upload, Copy } from 'lucide-react';
import { dialogues as initialDialogues, type Dialogue } from '../../data/dialogues';
import DialogueFormModal from './components/DialogueFormModal';
import ExcelUploadModal from './components/ExcelUploadModal';

export default function DialogueManagement(): React.ReactElement {
    const [dialogues, setDialogues] = useState<Dialogue[]>(initialDialogues);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [langFilter, setLangFilter] = useState<string>('전체');
    const [roleFilter, setRoleFilter] = useState<string>('전체');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedDialogue, setSelectedDialogue] = useState<Dialogue | null>(null);

    // Get unique values for filters
    const langs = Array.from(new Set(dialogues.map(d => d.language)));
    const roles = Array.from(new Set([
        ...dialogues.map(d => d.answerRole)
    ]));

    // Filtering
    const filteredDialogues = dialogues.filter(dialogue => {
        const matchesSearch =
            dialogue.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dialogue.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dialogue.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dialogue.key.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesLang = langFilter === '전체' || dialogue.language === langFilter;
        const matchesRole = roleFilter === '전체' || dialogue.answerRole === roleFilter;

        return matchesSearch && matchesLang && matchesRole;
    });

    // Pagination
    const totalPages = Math.ceil(filteredDialogues.length / itemsPerPage);
    const paginatedDialogues = filteredDialogues.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleCreate = () => {
        setSelectedDialogue(null);
        setIsModalOpen(true);
    };

    const handleEdit = (dialogue: Dialogue) => {
        setSelectedDialogue(dialogue);
        setIsModalOpen(true);
    };

    const handleDelete = (key: string) => {
        if (window.confirm('정말 이 대화를 삭제하시겠습니까?')) {
            setDialogues(prev => prev.filter(d => d.key !== key));
        }
    };

    const handleBulkUpload = (newData: Dialogue[]) => {
        setDialogues(prev => [...prev, ...newData]);
    };

    const handleSave = (dialogue: Dialogue) => {
        if (selectedDialogue) {
            // Update
            setDialogues(prev => prev.map(d => d.key === dialogue.key ? dialogue : d));
        } else {
            // Create
            setDialogues(prev => [...prev, dialogue]);
        }
        setIsModalOpen(false);
    };

    return (
        <>
            <PageHeader
                title="대화 템플릿 관리"
                breadcrumbs={[{ label: '에셋' }, { label: '대화 템플릿 관리' }]}
                rightContent={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
                            <Upload className="w-4 h-4 mr-2" />
                            Excel 업로드
                        </Button>
                        <Button variant="outline" onClick={handleCreate}>
                            <PlusSquare className="w-4 h-4 mr-2" />
                            대화 템플릿 생성
                        </Button>
                    </div>
                }
            />

            <ListHeader
                totalCount={filteredDialogues.length}
                rightContent={
                    <FilterGroup>
                        <FilterSelect
                            value={langFilter}
                            onValueChange={(val) => setLangFilter(val)}
                            options={[
                                { value: '전체', label: '전체 언어' },
                                ...langs.map(l => ({ value: l, label: l }))
                            ]}
                        />
                        <FilterSelect
                            value={roleFilter}
                            onValueChange={(val) => setRoleFilter(val)}
                            options={[
                                { value: '전체', label: '전체 대상' },
                                ...roles.map(r => ({ value: r, label: r }))
                            ]}
                        />
                        <SearchBar
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="질문, 답변, 토픽 검색"
                        />
                    </FilterGroup>
                }
            />

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">

                            <TableHead className="w-[100px]">분류</TableHead>
                            <TableHead className="w-[250px]">토픽 / 질문</TableHead>
                            <TableHead className="w-[300px]">화자 / 답변</TableHead>
                            <TableHead className="w-[150px]">키워드/속성</TableHead>
                            <TableHead className="w-[40px]">언어</TableHead>
                            <TableHead className="w-[120px]">Key</TableHead>
                            <TableHead className="w-[80px]">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedDialogues.length > 0 ? (
                            paginatedDialogues.map((d) => (
                                <TableRow key={d.key} className="hover:bg-gray-50 transition-colors">

                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm">{d.category}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-900">
                                            <span className="text-sm font-semibold gap-1.5 mb-1">{d.topic}</span>
                                            <p className="line-clamp-2" title={d.question}>{d.question}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-900">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-sm font-semibold">{d.answerRole} <span className="font-medium">{d.roleType}</span></span>
                                            </div>
                                            <p className="line-clamp-3" title={d.answer}>{d.answer}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1 items-center">
                                            {d.tags.map((tag, idx) => (
                                                <span key={idx} className="text-sm text-blue-600">
                                                    #{tag}
                                                </span>
                                            ))}
                                            {d.property && (
                                                <span className="text-sm text-blue-600">
                                                    {d.property}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">{d.language.toUpperCase()}</span>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(d.key);
                                            }}
                                            className="flex items-center gap-1.5 px-2 py-1 border border-gray-200 text-xs text-gray-600 font-mono hover:text-blue-600 hover:border-blue-200 hover:border hover:bg-blue-50 rounded transition-colors w-full"
                                            title="클릭하여 복사"
                                        >
                                            <span className="truncate">{d.key}</span>
                                            <Copy size={12} className="shrink-0" />
                                        </button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEdit(d)}
                                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                title="수정"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(d.key)}
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
                                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
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
                totalItems={filteredDialogues.length}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
            />

            <DialogueFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={selectedDialogue}
                existingKeys={dialogues.map(d => d.key)}
            />

            <ExcelUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleBulkUpload}
                existingKeys={dialogues.map(d => d.key)}
            />
        </>
    );
}
