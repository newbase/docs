import React from 'react';
import { X } from 'lucide-react';
import { type EMRData, type LabResult } from '../../../data/assetEvents';

interface EMRDataFormProps {
    data: EMRData;
    onChange: (data: EMRData) => void;
}

export function EMRDataForm({ data, onChange }: EMRDataFormProps): React.ReactElement {
    const handleAddLabResult = () => {
        const newLab: LabResult = { key: '', name: '', value: '', unit: '' };
        onChange({
            ...data,
            labResults: [...(data.labResults || []), newLab]
        });
    };

    const handleRemoveLabResult = (index: number) => {
        const newLabs = [...(data.labResults || [])];
        newLabs.splice(index, 1);
        onChange({
            ...data,
            labResults: newLabs
        });
    };

    const handleLabResultChange = (index: number, field: keyof LabResult, value: string) => {
        const newLabs = [...(data.labResults || [])];
        newLabs[index] = { ...newLabs[index], [field]: value };
        onChange({
            ...data,
            labResults: newLabs
        });
    };

    const updateField = (field: keyof EMRData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 space-y-6">
            <div className="flex items-center gap-3 border-b border-orange-100 pb-4">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                <h3 className="text-lg font-bold text-orange-900">EMR 업데이트 데이터</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-orange-800">환자 인적사항 (Patient Info)</label>
                    <textarea
                        value={data.patientInfo || ''}
                        onChange={(e) => updateField('patientInfo', e.target.value)}
                        className="w-full px-4 py-2 border border-orange-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500"
                        rows={2}
                        placeholder="이름, 나이, 성별, 등록번호 등"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-orange-800">처방 정보 (Order)</label>
                    <textarea
                        value={data.order || ''}
                        onChange={(e) => updateField('order', e.target.value)}
                        className="w-full px-4 py-2 border border-orange-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500"
                        rows={2}
                        placeholder="처방 내역 및 처치 지시"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-orange-800">I/O 기록 (Intake & Output)</label>
                    <textarea
                        value={data.io || ''}
                        onChange={(e) => updateField('io', e.target.value)}
                        className="w-full px-4 py-2 border border-orange-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500"
                        rows={2}
                        placeholder="섭취량 및 배설량"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-orange-800">간호기록 (Nursing Note)</label>
                    <textarea
                        value={data.nursingNote || ''}
                        onChange={(e) => updateField('nursingNote', e.target.value)}
                        className="w-full px-4 py-2 border border-orange-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500"
                        rows={2}
                        placeholder="환자 관찰 및 처치 기록"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-orange-700">검사 결과 (Lab Results)</h4>
                    <button
                        type="button"
                        onClick={handleAddLabResult}
                        className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
                    >
                        + 결과 추가
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {(data.labResults || []).map((lab, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded border border-orange-100">
                            <input
                                type="text"
                                value={lab.name}
                                onChange={(e) => handleLabResultChange(idx, 'name', e.target.value)}
                                className="flex-1 px-2 py-1 text-xs border rounded"
                                placeholder="검사항목명"
                            />
                            <input
                                type="text"
                                value={lab.value}
                                onChange={(e) => handleLabResultChange(idx, 'value', e.target.value)}
                                className="w-24 px-2 py-1 text-xs border rounded"
                                placeholder="수치"
                            />
                            <input
                                type="text"
                                value={lab.unit}
                                onChange={(e) => handleLabResultChange(idx, 'unit', e.target.value)}
                                className="w-20 px-2 py-1 text-xs border rounded"
                                placeholder="단위"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveLabResult(idx)}
                                className="p-1 text-red-400 hover:text-red-650"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
