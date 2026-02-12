import { Trash2 } from 'lucide-react';
import { type PatientData, type SymptomParams } from '../../../../../data/assetEvents';
import { Input, SelectCombo, Button } from '@/components/shared/ui';

interface ImagingSectionProps {
    data: PatientData | SymptomParams;
    updateImaging: (index: number, field: string, value: any) => void;
    addImaging: () => void;
    removeImaging: (index: number) => void;
    resetImaging: () => void;
}

export function ImagingSection({
    data,
    updateImaging,
    addImaging,
    removeImaging,
    resetImaging
}: ImagingSectionProps) {
    return (
        <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
                <h5 className="text-sm font-bold text-blue-600 uppercase">
                    영상검사결과
                </h5>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7"
                        onClick={addImaging}
                    >
                        + 항목 추가
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7"
                        onClick={resetImaging}
                    >
                        초기화
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                {/* Dynamic Imaging Results */}
                {(data.imagingResults || []).map((result, index) => (
                    <div key={result.key} className="relative grid grid-cols-4 gap-x-2 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                        <button
                            type="button"
                            onClick={() => removeImaging(index)}
                            className="absolute bottom-2 right-2 w-8 h-8 rounded-2 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors z-10"
                        >
                            <Trash2 size={16} />
                        </button>
                        <div className="col-span-1">
                            <div className="aspect-video bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                                {result.url ? (
                                    <img src={result.url} alt="Imaging Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-xs text-gray-400 italic text-center px-2">이미지가<br />없습니다</span>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1 space-y-2">
                            <div className="space-y-2 bg-white">
                                <SelectCombo
                                    value={result.type}
                                    onValueChange={(val: string) => updateImaging(index, 'type', val)}
                                    options={[
                                        { value: 'ECG', label: 'ECG (심전도)' },
                                        { value: 'X-Ray', label: 'X-Ray' },
                                        { value: 'CT', label: 'CT' },
                                        { value: 'MRI', label: 'MRI' },
                                        { value: 'Ultrasound', label: 'Ultrasound (초음파)' },
                                        { value: 'Endoscopy', label: 'Endoscopy (내시경)' },
                                        { value: 'Angiography', label: 'Angiography (혈관조영)' },
                                    ]}
                                    placeholder="검사항목 선택"
                                    triggerClassName="h-9"
                                />
                            </div>
                            {result.type === 'ECG' ? (
                                <div className="space-y-2">
                                    <SelectCombo
                                        value={result.rhythm || ''}
                                        onValueChange={(val: string) => updateImaging(index, 'rhythm', val)}
                                        options={[
                                            { value: 'Sinus Rhythm', label: 'Sinus Rhythm' },
                                            { value: 'Sinus Bradycardia', label: 'Sinus Bradycardia' },
                                            { value: 'Sinus Tachycardia', label: 'Sinus Tachycardia' },
                                            { value: 'Atrial Fibrillation', label: 'Atrial Fibrillation' },
                                            { value: 'Atrial Flutter', label: 'Atrial Flutter' },
                                            { value: 'Ventricular Tachycardia', label: 'Ventricular Tachycardia' },
                                            { value: 'Ventricular Fibrillation', label: 'Ventricular Fibrillation' },
                                            { value: 'Asystole', label: 'Asystole' },
                                            { value: 'ST Elevation', label: 'ST Elevation' },
                                            { value: 'ST Depression', label: 'ST Depression' },
                                        ]}
                                        placeholder="리듬 선택"
                                        triggerClassName="h-9"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Input
                                        value={result.location}
                                        onChange={(e) => updateImaging(index, 'location', e.target.value)}
                                        placeholder="예: Chest, Abdomen"
                                        className="h-9"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="col-span-2">
                            <div className="grid grid-cols-1 gap-2">
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            value={result.url}
                                            onChange={(e) => updateImaging(index, 'url', e.target.value)}
                                            placeholder="이미지 URL을 입력하세요"
                                            className="h-9"
                                        />
                                        <Button variant="outline" className="w-20 h-9"
                                            onClick={() => {/* 이미지 선택 팝업 로직 (차후 구현) */ }}
                                        >
                                            변경
                                        </Button>
                                    </div>
                                    <Input
                                        multiline
                                        rows={1.5}
                                        value={result.description || ''}
                                        onChange={(e) => updateImaging(index, 'description', e.target.value)}
                                        placeholder="상세 결과를 입력하세요 (예: 심실빈맥 관찰됨)"
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {(!data.imagingResults || data.imagingResults.length === 0) && (
                    <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                        <span className="text-sm text-gray-500 italic">영상 검사 결과가 없습니다. 필요 시 항목을 추가하세요.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
