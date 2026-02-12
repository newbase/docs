import { X } from 'lucide-react';
import { type PatientData, type SymptomParams } from '../../../../../data/assetEvents';
import { Input, SelectCombo, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button } from '@/components/shared/ui';
import { spots as spotData } from '../../../../../data/spots';

interface SymptomBasicSectionProps {
    data: PatientData | SymptomParams;
    updateField: (field: keyof PatientData, value: any) => void;
    addLocation: (spotKey: string) => void;
    removeLocation: (spotKey: string) => void;
    selectedCategory: string;
    setSelectedCategory: (value: string) => void;
}

const symptomOptions = [
    { value: '흉통', label: '흉통 (Chest Pain)' },
    { value: '호흡곤란', label: '호흡곤란 (Dyspnea)' },
    { value: '두통', label: '두통 (Headache)' },
    { value: '어지러움', label: '어지러움 (Dizziness)' },
    { value: '복통', label: '복통 (Abdominal Pain)' },
    { value: '오심/구토', label: '오심/구토 (Nausea/Vomiting)' },
    { value: '발열', label: '발열 (Fever)' },
    { value: '기침', label: '기침 (Cough)' },
    { value: '실신', label: '실신 (Syncope)' },
    { value: '두근거림', label: '두근거림 (Palpitations)' },
    { value: '요통', label: '요통 (Back Pain)' },
    { value: '사지 위약', label: '사지 위약 (Limb Weakness)' },
    { value: '감각 이상', label: '감각 이상 (Numbness)' },
    { value: '의식 저하', label: '의식 저하 (Altered Consciousness)' },
    { value: '출혈', label: '출혈 (Bleeding)' },
    { value: '발진', label: '발진 (Rash)' },
    { value: '기타', label: '기타 (Other)' },
];

export function SymptomBasicSection({
    data,
    updateField,
    addLocation,
    removeLocation,
    selectedCategory,
    setSelectedCategory
}: SymptomBasicSectionProps) {
    const patientSpots = spotData.filter(spot => spot.type === '환자');
    const categories = Array.from(new Set(patientSpots.map(s => s.category).filter(Boolean))) as string[];

    return (
        <div className="space-y-6">
            {/* Symptom Info Section */}
            <div>
                <h5 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    증상정보
                </h5>
                <div className="grid grid-cols-3 gap-4 items-end mb-4">
                    <div className="col-span-1">
                        <SelectCombo
                            value={data.symptomName || ''}
                            onValueChange={(val: string) => updateField('symptomName', val)}
                            options={symptomOptions}
                            placeholder="증상 선택"
                            triggerClassName="h-9"
                        />
                    </div>
                    <div className="col-span-2">
                        <Input
                            type="text"
                            value={data.chiefComplaint || ''}
                            onChange={(e) => updateField('chiefComplaint', e.target.value)}
                            placeholder="예: 가슴이 찌르듯이 아파요"
                            className="h-9"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-end mb-4">
                    <div className="col-span-1">
                        <Select
                            value={selectedCategory}
                            onValueChange={(value) => setSelectedCategory(value)}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="카테고리" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2">
                        <Select
                            onValueChange={(value) => addLocation(value)}
                            value=""
                            disabled={!selectedCategory}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="부위 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {patientSpots
                                    .filter(spot => spot.category === selectedCategory)
                                    .map(spot => (
                                        <SelectItem key={spot.key} value={spot.key}>
                                            {spot.name}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                        {(data.locations || []).map(key => {
                            const spot = spotData.find(s => s.key === key);
                            return (
                                <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium border border-blue-100">
                                    {spot ? spot.name : key}
                                    <button
                                        type="button"
                                        onClick={() => removeLocation(key)}
                                        className="hover:text-blue-900 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            );
                        })}
                        {(data.locations || []).length === 0 && (
                            <span className="text-xs text-gray-400 mt-1 italic">선택된 부위 없음</span>
                        )}
                    </div>
                </div>
                <div>
                    <h5 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        문진
                    </h5>
                    <Input
                        multiline
                        value={data.prompt || '[증상양상]\n\n[증상기간]\n\n[증상의 정도]\n\n[증상의 특징]\n\n[발생시기]\n\n[지속시간]\n\n[발생/완화요인]'}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('prompt', e.target.value)}
                        rows={12}
                        placeholder="증상 상세 내용을 입력하세요."
                    />
                </div>
            </div>
        </div>
    );
}
