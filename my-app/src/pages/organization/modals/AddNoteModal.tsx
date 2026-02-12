import React, { useState } from 'react';
import { Modal } from '@/components/shared/ui';
import { FileText, X } from 'lucide-react';

interface AddNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: any) => void;
}

interface NoteFormData {
    content: string;
    links: string[];
    documents: File[];
}

export default function AddNoteModal({ isOpen, onClose, onSave }: AddNoteModalProps): React.ReactElement {
    const [formData, setFormData] = useState<NoteFormData>({
        content: '',
        links: [],
        documents: []
    });
    const [linkInput, setLinkInput] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(file => {
                const ext = file.name.split('.').pop()?.toLowerCase() || '';
                return ['pdf', 'doc', 'docx', 'xlsx', 'xls', 'csv', 'ppt', 'pptx', 'txt'].includes(ext);
            });

            setFormData(prev => ({
                ...prev,
                documents: [...prev.documents, ...validFiles]
            }));
        }
    };



    const addLink = () => {
        if (linkInput.trim()) {
            setFormData(prev => ({
                ...prev,
                links: [...prev.links, linkInput.trim()]
            }));
            setLinkInput('');
        }
    };

    const removeDocument = (index: number) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };



    const removeLink = (index: number) => {
        setFormData(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newNote = {
            id: `NOTE${Date.now()}`,
            adminId: 'admin@medicrew.com',
            adminName: '관리자',
            createdAt: new Date().toLocaleString('ko-KR'),
            content: formData.content,
            links: formData.links,
            attachments: formData.documents.map(f => f.name)
        };

        onSave(newNote);
        setFormData({ content: '', links: [], documents: [] });
        setLinkInput('');
        onClose();
    };

    const footer = (
        <>
            <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={onClose}
            >
                취소
            </button>
            <button
                type="submit"
                form="add-note-form"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
                저장
            </button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="노트 추가" footer={footer} size="large">
            <form id="add-note-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        내용 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="content"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        placeholder="관리자 메모를 입력하세요..."
                        rows={6}
                    />
                </div>

                {/* Document Upload */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">파일 첨부</label>
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                        onClick={() => document.getElementById('note-document-input')?.click()}
                    >
                        <input
                            id="note-document-input"
                            type="file"
                            accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                            multiple
                            onChange={handleDocumentChange}
                            className="hidden"
                        />
                        <FileText size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                            클릭하여 문서 선택<br />
                            <span className="text-xs text-gray-500">지원 형식: PDF, Word, Excel, PowerPoint, TXT, png, jpg</span>
                        </p>
                    </div>

                    {formData.documents.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {formData.documents.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                                    <span className="flex items-center gap-2 text-sm text-gray-900">
                                        <FileText size={16} className="flex-shrink-0" />
                                        {file.name}
                                    </span>
                                    <button
                                        type="button"
                                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        onClick={() => removeDocument(index)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


            </form>
        </Modal >
    );
}
