import { RotateCcw, X } from 'lucide-react';
import { type PatientData, type SymptomParams } from '../../../../../data/assetEvents';
import { Input, SelectCombo, ComboBox, Button } from '@/components/shared/ui';
import { labItemOptions } from '../../../../../data/labResults';

interface LabSectionProps {
    data: PatientData | SymptomParams;
    updateLab: (index: number, field: string, value: any) => void;
    addLab: (specimenName: string, isBulk?: boolean) => void;
    removeLab: (index: number) => void;
    resetLabs: (specimenName: string) => void;
}

export function LabSection({
    data,
    updateLab,
    addLab,
    removeLab,
    resetLabs
}: LabSectionProps) {
    return (
        <div className="space-y-6">
            {
                [
                    { title: '혈당검사 결과', specimen: 'Blood Sugar' },
                    { title: '혈액검사 결과', specimen: 'Blood' },
                    { title: '소변검사 결과', specimen: 'Urine Test' },
                    { title: '대변검사 결과', specimen: 'Stool' },
                    { title: '타액검사 결과', specimen: 'Saliva' },
                ].map((section, sIndex) => {
                    const filteredResults = (data.labResults || []).map((r, i) => ({ ...r, originalIndex: i }))
                        .filter(r => {
                            if (section.specimen === 'Blood') {
                                // Blood section matches any blood tube types EXCEPT others
                                return r.specimen !== 'Urine Test' && r.specimen !== 'Stool' && r.specimen !== 'Blood Sugar' && r.specimen !== 'Saliva';
                            }
                            return r.specimen === section.specimen;
                        });

                    return (
                        <div key={section.specimen} className={`pt-6 ${sIndex > 0 ? '' : 'border-t border-gray-100'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h5 className="text-sm font-bold text-blue-600 uppercase">
                                    {section.title}
                                </h5>
                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                    {Array.from(new Set(labItemOptions
                                        .filter(opt => {
                                            if (section.specimen === 'Blood') {
                                                return opt.specimen !== 'Urine Test' && opt.specimen !== 'Stool' && opt.specimen !== 'Blood Sugar' && opt.specimen !== 'Saliva';
                                            }
                                            return opt.specimen === section.specimen;
                                        })
                                        .map(o => o.specimen)
                                    )).map(specimenName => (
                                        <Button
                                            key={specimenName}
                                            variant="outline"
                                            size="sm"
                                            className="h-7 bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                                            onClick={() => addLab(specimenName)}
                                        >
                                            {specimenName} 추가
                                        </Button>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7"
                                        onClick={() => addLab(section.specimen, false)}
                                    >
                                        + 수동 추가
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                        onClick={() => resetLabs(section.specimen)}
                                    >
                                        <RotateCcw size={14} className="mr-1" />
                                        초기화
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {filteredResults.map((result) => (
                                    <div key={result.key} className="grid grid-cols-12 gap-4 items-center group animate-in fade-in slide-in-from-top-1">
                                        <div className="col-span-3">
                                            <SelectCombo
                                                value={result.specimen || ''}
                                                onValueChange={(val: string) => updateLab(result.originalIndex, 'specimen', val)}
                                                options={Array.from(new Set(labItemOptions.map(o => o.specimen)))
                                                    .filter(s => {
                                                        if (section.specimen === 'Blood') {
                                                            return s !== 'Urine Test' && s !== 'Stool' && s !== 'Blood Sugar' && s !== 'Saliva';
                                                        }
                                                        return s === section.specimen;
                                                    })
                                                    .map(s => ({ value: s, label: s }))}
                                                placeholder="검체 선택"
                                                triggerClassName="h-9 bg-white"
                                            />
                                        </div>
                                        <div className="col-span-4">
                                            <ComboBox
                                                value={result.name}
                                                onValueChange={(val: string) => updateLab(result.originalIndex, 'name', val)}
                                                options={[
                                                    ...labItemOptions
                                                        .filter(opt => !result.specimen || opt.specimen === result.specimen)
                                                        .map(opt => ({
                                                            value: opt.name,
                                                            label: `${opt.name} (${opt.abbreviation})`
                                                        })),
                                                    ...(result.name && !labItemOptions.some(opt => opt.name === result.name)
                                                        ? [{ value: result.name, label: result.name }]
                                                        : [])
                                                ]}
                                                placeholder="항목 선택 또는 입력"
                                                triggerClassName="h-9 bg-white"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                value={result.value}
                                                onChange={(e) => updateLab(result.originalIndex, 'value', e.target.value)}
                                                placeholder="결과"
                                                className="h-9 bg-white"
                                            />
                                        </div>
                                        <div className="col-span-3 flex items-center gap-2">
                                            <Input
                                                value={result.unit}
                                                onChange={(e) => updateLab(result.originalIndex, 'unit', e.target.value)}
                                                placeholder="단위"
                                                className="h-9 bg-white flex-1"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeLab(result.originalIndex)}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {filteredResults.length === 0 && (
                                    <div className="text-center py-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                                        <span className="text-sm text-gray-500">증상 관련 이상 징후가 있는 경우, 추가해주세요.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            }
        </div>
    );
}
