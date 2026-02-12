import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Modal, Button } from '@/components/shared/ui';
import { Dialogue } from '../../../data/dialogues';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ExcelUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (data: Dialogue[]) => void;
    existingKeys: string[];
}

export default function ExcelUploadModal({
    isOpen,
    onClose,
    onUpload,
    existingKeys
}: ExcelUploadModalProps): React.ReactElement {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<Dialogue[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = async (selectedFile: File) => {
        if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
            setErrors(['엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.']);
            return;
        }

        setFile(selectedFile);
        setErrors([]);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

                const prefix = 'ac01';
                const existingNumbers = existingKeys
                    .filter(k => k.startsWith(prefix))
                    .map(k => parseInt(k.replace(prefix, ''), 10))
                    .filter(n => !isNaN(n));

                let nextBatchNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 10101;

                const mappedData: Dialogue[] = jsonData.map((row) => {
                    const topic = row['Topic']?.toString() || '';
                    const topicId = row['TopicId']?.toString() || topic.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');

                    let key = row['Key']?.toString();
                    if (!key) {
                        key = `${prefix}${nextBatchNum.toString().padStart(4, '0')}`;
                        nextBatchNum++;
                    }

                    return {
                        key: key,
                        language: row['Language']?.toString() || 'kr',
                        type: row['Type']?.toString() || '환자대화',
                        category: row['Category']?.toString() || '',
                        topic: topic,
                        topicId: topicId,
                        answerRole: row['AnswerRole']?.toString() || '성인 환자',
                        question: row['Question']?.toString() || '',
                        answer: row['Answer']?.toString() || '',
                        tags: row['Tags'] ? row['Tags'].toString().split(',').map((t: string) => t.trim()) : [],
                        property: row['Property']?.toString() || 'look_target',
                        speakerId: 'character_id_placeholder',
                        roleType: row['RoleType']?.toString() || row['SpeakerName']?.toString() || '이름'
                    };
                });

                // Simple validation
                const newErrors: string[] = [];
                const batchKeys = new Set<string>();

                mappedData.forEach((d, i) => {
                    if (!d.category) newErrors.push(`${i + 2}행: 카테고리가 누락되었습니다.`);
                    if (!d.question) newErrors.push(`${i + 2}행: 질문 내용이 누락되었습니다.`);
                    if (!d.answer) newErrors.push(`${i + 2}행: 답변 내용이 누락되었습니다.`);

                    if (existingKeys.includes(d.key)) {
                        newErrors.push(`${i + 2}행: 기존 데이터와 중복된 Key(${d.key})가 존재합니다.`);
                    }
                    if (batchKeys.has(d.key)) {
                        newErrors.push(`${i + 2}행: 업로드 파일 내 중복된 Key(${d.key})가 존재합니다.`);
                    }
                    batchKeys.add(d.key);
                });

                setPreviewData(mappedData);
                setErrors(newErrors);
            } catch (err) {
                setErrors(['파일 파싱 중 오류가 발생했습니다.']);
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFile(droppedFile);
    }, []);

    const reset = () => {
        setFile(null);
        setPreviewData([]);
        setErrors([]);
    };

    const handleUploadClick = () => {
        if (previewData.length > 0 && errors.length === 0) {
            onUpload(previewData);
            onClose();
            reset();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { onClose(); reset(); }}
            title="엑셀 업로드"
            size="xlarge"
            footer={
                <div className="flex justify-between w-full items-center">
                    <div className="text-sm text-gray-500">
                        {previewData.length > 0 && `${previewData.length}개의 데이터가 감지되었습니다.`}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => { onClose(); reset(); }}>취소</Button>
                        <Button
                            variant="primary"
                            disabled={previewData.length === 0 || errors.length > 0}
                            onClick={handleUploadClick}
                        >
                            업로드 완료
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                {!file ? (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                            }`}
                        onClick={() => document.getElementById('excel-input')?.click()}
                    >
                        <input
                            id="excel-input"
                            type="file"
                            className="hidden"
                            accept=".xlsx, .xls"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">파일을 드래그하거나 클릭하여 업로드</h3>
                            <p className="text-sm text-gray-500 mt-2">.xlsx, .xls 형식만 지원합니다.</p>
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left inline-block">
                                <p className="text-base text-gray-900 font-semibold mb-1">엑셀파일 작성방법</p>
                                <p className="text-base text-gray-900 mb-3"> 엑셀컬럼 : Key, Language, Type, Category, Topic, RoleType, AnswerRole, Question, Answer, Tags, Property</p>
                                <p className="text-sm text-gray-900">- Key를 자동생성하려면 빈 칸으로 입력해주세요.</p>
                                <p className="text-sm text-gray-900">- Tags는 쉼표로 구분해주세요.</p>
                                <p className="text-sm text-gray-900">- Property는 "look_target" 또는 "없음"으로 입력해주세요.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button onClick={reset} className="p-2 hover:bg-gray-200 rounded-full">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <span className="text-sm font-bold text-red-900">검증 오류 ({errors.length}건)</span>
                                </div>
                                <ul className="text-xs text-red-700 space-y-1 max-h-[100px] overflow-y-auto">
                                    {errors.map((error, idx) => (
                                        <li key={idx}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                <span className="text-xs font-bold text-gray-600">데이터 미리보기 (상위 5개)</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-50 text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-4 py-2">Category</th>
                                            <th className="px-4 py-2">Question</th>
                                            <th className="px-4 py-2">Answer</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 text-gray-700">
                                        {previewData.slice(0, 5).map((d, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 font-medium">{d.category}</td>
                                                <td className="px-4 py-3">{d.question}</td>
                                                <td className="px-4 py-3">{d.answer}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
