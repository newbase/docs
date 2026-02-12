import { useState, useEffect } from 'react';
import { type PatientData, type SymptomParams } from '../../../../data/assetEvents';
import { symptomTemplates, SYMPTOM_CATEGORIES_BY_TYPE } from '../../../../data/symptomTemplates';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, Button } from '@/components/shared/ui';
import { spots as spotData } from '../../../../data/spots';
import { labItemOptions } from '../../../../data/labResults';

// Sections
import { SymptomBasicSection } from './symptom-sections/SymptomBasicSection';
import { VitalSignsSection } from './symptom-sections/VitalSignsSection';
import { PhysicalExamSection } from './symptom-sections/PhysicalExamSection';
import { NeurologicalSection } from './symptom-sections/NeurologicalSection';
import { ImagingSection } from './symptom-sections/ImagingSection';
import { LabSection } from './symptom-sections/LabSection';

interface SymptomDataFormProps {
    data: PatientData | SymptomParams;
    onChange: (data: any) => void;
    isTemplateReference?: boolean;
    overridePatientType?: string;
}

export function SymptomDataForm({
    data,
    onChange,
    isTemplateReference = false,
    overridePatientType
}: SymptomDataFormProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [symptomCategoryFilter, setSymptomCategoryFilter] = useState<string>('');

    // 최종적으로 사용할 환자 유형 결정
    const effectivePatientType = overridePatientType || (data as PatientData).patientType;

    useEffect(() => {
        // 기본값으로 '전신(sp_whole_body)' 설정
        if (!data.locations || data.locations.length === 0) {
            onChange({ ...data, locations: ['sp_whole_body'] });
        }
    }, []);

    const updateField = (field: keyof PatientData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const updateVital = (field: string, value: any) => {
        onChange({
            ...data,
            vitals: { ...(data.vitals || {}), [field]: value }
        });
    };

    const updateMental = (field: string, value: string) => {
        onChange({
            ...data,
            mentalStatus: { ...(data.mentalStatus || {}), [field]: value }
        });
    };

    const updatePupil = (field: string, value: any) => {
        onChange({
            ...data,
            pupilResponse: { ...(data.pupilResponse || {}), [field]: value }
        });
    };

    const updateMotor = (field: string, value: string) => {
        onChange({
            ...data,
            motorPower: { ...(data.motorPower || {}), [field]: value }
        });
    };

    const updateCN = (field: string, value: any) => {
        onChange({
            ...data,
            cranialNerves: { ...(data.cranialNerves || {}), [field]: value }
        });
    };

    const updateImaging = (index: number, field: string, value: any) => {
        const imagingResults = [...(data.imagingResults || [])];
        if (!imagingResults[index]) {
            imagingResults[index] = { key: Math.random().toString(36).substr(2, 9), type: '', location: '', url: '' };
        }
        imagingResults[index] = { ...imagingResults[index], [field]: value };
        onChange({ ...data, imagingResults });
    };

    const addImaging = () => {
        const imagingResults = [...(data.imagingResults || [])];
        imagingResults.push({ key: Math.random().toString(36).substr(2, 9), type: '', location: '', url: '' });
        onChange({ ...data, imagingResults });
    };

    const removeImaging = (index: number) => {
        const imagingResults = (data.imagingResults || []).filter((_, i) => i !== index);
        onChange({ ...data, imagingResults });
    };

    const resetImaging = () => {
        if (!window.confirm('모든 영상 검사 항목을 삭제하시겠습니까?')) return;
        onChange({ ...data, imagingResults: [] });
    };

    const updateLab = (index: number, field: string, value: any) => {
        let labResults = [...(data.labResults || [])];
        if (!labResults[index]) {
            labResults[index] = { key: Math.random().toString(36).substr(2, 9), name: '', value: '', unit: '' };
        }

        if (field === 'specimen') {
            labResults[index] = { ...labResults[index], specimen: value };
        } else if (field === 'name') {
            const option = labItemOptions.find(o => o.name === value || o.abbreviation === value);
            if (option) {
                const patientClassification = (data as PatientData).patientType || 'Adult_Male';
                const normalRange = option.ranges[patientClassification] || option.ranges['Adult_Male'];
                labResults[index] = {
                    ...labResults[index],
                    specimen: option.specimen,
                    name: option.name,
                    unit: option.unit,
                    value: normalRange
                };
            } else {
                labResults[index] = { ...labResults[index], [field]: value };
            }
        } else {
            labResults[index] = { ...labResults[index], [field]: value };
        }

        onChange({ ...data, labResults });
    };

    const addLab = (specimenName: string, isBulk: boolean = true) => {
        const labResults = [...(data.labResults || [])];
        const patientClassification = (data as PatientData).patientType || 'Adult_Male';
        const filteredOptions = labItemOptions.filter(opt => opt.specimen === specimenName);

        if (isBulk && filteredOptions.length > 0) {
            filteredOptions.forEach(opt => {
                const alreadyExists = labResults.some(r => r.name === opt.name && r.specimen === opt.specimen);
                if (!alreadyExists) {
                    const normalRange = opt.ranges[patientClassification] || opt.ranges['Adult_Male'];
                    labResults.push({
                        key: Math.random().toString(36).substr(2, 9),
                        specimen: opt.specimen,
                        name: opt.name,
                        unit: opt.unit,
                        value: normalRange
                    });
                }
            });
        } else {
            labResults.push({
                key: Math.random().toString(36).substr(2, 9),
                specimen: specimenName,
                name: '',
                value: '',
                unit: ''
            });
        }
        onChange({ ...data, labResults });
    };

    const removeLab = (index: number) => {
        const labResults = (data.labResults || []).filter((_, i) => i !== index);
        onChange({ ...data, labResults });
    };

    const resetLabs = (specimenName: string) => {
        if (!window.confirm(`${specimenName} 관련 모든 항목을 초기화하시겠습니까?`)) return;
        const labResults = (data.labResults || []).filter(r => {
            if (specimenName === 'Blood') {
                return r.specimen === 'Urine Test' || r.specimen === 'Stool' || r.specimen === 'Blood Sugar' || r.specimen === 'Saliva';
            }
            return r.specimen !== specimenName;
        });
        onChange({ ...data, labResults });
    };

    const updateAuscultationResult = (index: number, field: string, value: any) => {
        const auscultationResults = [...(data.auscultationResults || [])];
        if (!auscultationResults[index]) {
            auscultationResults[index] = { key: Math.random().toString(36).substr(2, 9), type: 'Breath', location: '', finding: '' };
        }
        auscultationResults[index] = { ...auscultationResults[index], [field]: value };
        onChange({ ...data, auscultationResults });
    };

    const addAuscultationResult = (type: 'Breath' | 'Heart' | 'Bowel') => {
        const auscultationResults = [...(data.auscultationResults || [])];
        auscultationResults.push({ key: Math.random().toString(36).substr(2, 9), type, location: '', finding: '' });
        onChange({ ...data, auscultationResults });
    };

    const removeAuscultationResult = (index: number) => {
        const auscultationResults = (data.auscultationResults || []).filter((_, i) => i !== index);
        onChange({ ...data, auscultationResults });
    };

    const updatePercussionResult = (index: number, field: string, value: any) => {
        const percussionResults = [...(data.percussionResults || [])];
        if (!percussionResults[index]) {
            percussionResults[index] = { key: Math.random().toString(36).substr(2, 9), type: 'Chest', location: '', finding: '' };
        }
        percussionResults[index] = { ...percussionResults[index], [field]: value };
        onChange({ ...data, percussionResults });
    };

    const addPercussionResult = (type: 'Chest' | 'Abdomen') => {
        const percussionResults = [...(data.percussionResults || [])];
        percussionResults.push({ key: Math.random().toString(36).substr(2, 9), type, location: '', finding: '' });
        onChange({ ...data, percussionResults });
    };

    const removePercussionResult = (index: number) => {
        const percussionResults = (data.percussionResults || []).filter((_, i) => i !== index);
        onChange({ ...data, percussionResults });
    };

    const updatePalpationResult = (index: number, field: string, value: any) => {
        const palpationResults = [...(data.palpationResults || [])];
        if (!palpationResults[index]) {
            palpationResults[index] = { key: Math.random().toString(36).substr(2, 9), type: 'Abdomen', location: '', finding: '' };
        }
        palpationResults[index] = { ...palpationResults[index], [field]: value };
        onChange({ ...data, palpationResults });
    };

    const addPalpationResult = (type: 'Chest' | 'Abdomen' | 'Extremities' | 'Other') => {
        const palpationResults = [...(data.palpationResults || [])];
        palpationResults.push({ key: Math.random().toString(36).substr(2, 9), type, location: '', finding: '' });
        onChange({ ...data, palpationResults });
    };

    const removePalpationResult = (index: number) => {
        const palpationResults = (data.palpationResults || []).filter((_, i) => i !== index);
        onChange({ ...data, palpationResults });
    };

    const updateInspectionResult = (index: number, field: string, value: any) => {
        const inspectionResults = [...(data.inspectionResults || [])];
        if (!inspectionResults[index]) {
            inspectionResults[index] = { key: Math.random().toString(36).substr(2, 9), type: 'General', location: '', finding: '' };
        }
        inspectionResults[index] = { ...inspectionResults[index], [field]: value };
        onChange({ ...data, inspectionResults });
    };

    const addInspectionResult = (type: 'General' | 'Chest' | 'Abdomen' | 'Skin' | 'Extremities') => {
        const inspectionResults = [...(data.inspectionResults || [])];
        inspectionResults.push({ key: Math.random().toString(36).substr(2, 9), type, location: '', finding: '' });
        onChange({ ...data, inspectionResults });
    };

    const removeInspectionResult = (index: number) => {
        const inspectionResults = (data.inspectionResults || []).filter((_, i) => i !== index);
        onChange({ ...data, inspectionResults });
    };

    const initNormalVitals = () => {
        onChange({
            ...data,
            vitals: {
                sbp: 120, sbp_max: 120,
                dbp: 80, dbp_max: 80,
                hr: 80, hr_max: 80,
                rr: 16, rr_max: 16,
                bt: 36.5, spo2: 98
            }
        });
    };

    const initNormalMental = () => {
        onChange({
            ...data,
            mentalStatus: {
                gcs_score: 'E4V5M6',
                gcs_status: 'Alert',
                orientation: '시간, 장소, 사람'
            }
        });
    };

    const initNormalCN = () => {
        onChange({
            ...data,
            pupilResponse: {
                right_size: 3, right_shape: 'Round', right_reaction: 'Prompt',
                left_size: 3, left_shape: 'Round', left_reaction: 'Prompt'
            },
            cranialNerves: {
                eom: 'Normal',
                facialSymmetry: 'Symmetrical',
                gagReflex: 'Present',
                tongueDeviation: 'Middle'
            }
        });
    };

    const initNormalMotor = () => {
        onChange({
            ...data,
            motorPower: {
                upper_right: '5',
                upper_left: '5',
                lower_right: '5',
                lower_left: '5',
                gait: 'Normal',
                muscleTone: 'Normal'
            }
        });
    };

    const resetVitals = () => {
        if (!window.confirm('활력징후 데이터를 삭제하시겠습니까?')) return;
        onChange({ ...data, vitals: undefined });
    };

    const resetMental = () => {
        if (!window.confirm('의식수준 데이터를 삭제하시겠습니까?')) return;
        onChange({ ...data, mentalStatus: undefined });
    };

    const resetCN = () => {
        if (!window.confirm('뇌신경 검사 데이터를 삭제하시겠습니까?')) return;
        onChange({ ...data, pupilResponse: undefined, cranialNerves: undefined });
    };

    const resetMotor = () => {
        if (!window.confirm('운동기능 데이터를 삭제하시겠습니까?')) return;
        onChange({ ...data, motorPower: undefined });
    };

    const addLocation = (spotKey: string) => {
        if (!spotKey) return;
        const currentLocations = data.locations || [];
        if (!currentLocations.includes(spotKey)) {
            onChange({ ...data, locations: [...currentLocations, spotKey] });
        }
    };

    const removeLocation = (spotKey: string) => {
        const currentLocations = data.locations || [];
        onChange({ ...data, locations: currentLocations.filter(k => k !== spotKey) });
    };

    const symptomKey = (data as SymptomParams).symptomKey;
    const selectedTemplate = symptomTemplates.find(t => t.key === symptomKey);

    if (isTemplateReference) {
        return (
            <div className="space-y-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="p-5">
                    <h5 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        증상 템플릿 선택
                    </h5>
                    <div className="grid grid-cols-2 gap-6 items-start">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">템플릿 리스트</label>
                            <Select
                                value={symptomKey || ''}
                                onValueChange={(val) => onChange({ ...data, symptomKey: val })}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="템플릿을 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>카테고리 필터</SelectLabel>
                                        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b">
                                            <Button
                                                variant={symptomCategoryFilter === '' ? 'primary' : 'outline'}
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={(e) => { e.stopPropagation(); setSymptomCategoryFilter(''); }}
                                            >
                                                전체
                                            </Button>
                                            {(SYMPTOM_CATEGORIES_BY_TYPE[effectivePatientType!] || []).map(cat => (
                                                <Button
                                                    key={cat}
                                                    variant={symptomCategoryFilter === cat ? 'primary' : 'outline'}
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={(e) => { e.stopPropagation(); setSymptomCategoryFilter(cat); }}
                                                >
                                                    {cat}
                                                </Button>
                                            ))}
                                        </div>
                                    </SelectGroup>
                                    {symptomTemplates
                                        .filter(t => {
                                            const matchesType = !effectivePatientType || t.patientType === effectivePatientType;
                                            const matchesCategory = !symptomCategoryFilter || t.category === symptomCategoryFilter;
                                            return matchesType && matchesCategory;
                                        })
                                        .map(t => (
                                            <SelectItem key={t.key} value={t.key}>
                                                {t.displayName} ({t.category})
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            {selectedTemplate && (
                                <p className="mt-2 text-xs text-gray-500 italic">
                                    {selectedTemplate.description}
                                </p>
                            )}
                        </div>
                        {selectedTemplate && (
                            <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100/50">
                                <h6 className="text-sm font-bold text-blue-500 uppercase tracking-tighter mb-2">프리뷰 (Key Data)</h6>
                                <div className="grid grid-cols-2 gap-y-2 text-xs">
                                    <div className="text-gray-500 italic">환자 타입:</div>
                                    <div className="font-medium">{selectedTemplate.patientType}</div>
                                    <div className="text-gray-500 italic">주호소:</div>
                                    <div className="font-medium">{selectedTemplate.chiefComplaint}</div>
                                    <div className="text-gray-500 italic">활력징후:</div>
                                    <div className="font-medium">
                                        BP {selectedTemplate.vitals?.sbp}/{selectedTemplate.vitals?.dbp},
                                        HR {selectedTemplate.vitals?.hr},
                                        BT {selectedTemplate.vitals?.bt}°C
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="pb-5"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="p-5 pb-0">
                <SymptomBasicSection
                    data={data}
                    updateField={updateField}
                    addLocation={addLocation}
                    removeLocation={removeLocation}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />

                <VitalSignsSection
                    data={data}
                    updateVital={updateVital}
                    resetVitals={resetVitals}
                    initNormalVitals={initNormalVitals}
                />

                <PhysicalExamSection
                    data={data}
                    updateInspectionResult={updateInspectionResult}
                    addInspectionResult={addInspectionResult}
                    removeInspectionResult={removeInspectionResult}
                    updatePalpationResult={updatePalpationResult}
                    addPalpationResult={addPalpationResult}
                    removePalpationResult={removePalpationResult}
                    updatePercussionResult={updatePercussionResult}
                    addPercussionResult={addPercussionResult}
                    removePercussionResult={removePercussionResult}
                    updateAuscultationResult={updateAuscultationResult}
                    addAuscultationResult={addAuscultationResult}
                    removeAuscultationResult={removeAuscultationResult}
                />

                <NeurologicalSection
                    data={data}
                    updateMental={updateMental}
                    updatePupil={updatePupil}
                    updateCN={updateCN}
                    updateMotor={updateMotor}
                    initNormalMental={initNormalMental}
                    resetMental={resetMental}
                    initNormalCN={initNormalCN}
                    resetCN={resetCN}
                    initNormalMotor={initNormalMotor}
                    resetMotor={resetMotor}
                />

                <ImagingSection
                    data={data}
                    updateImaging={updateImaging}
                    addImaging={addImaging}
                    removeImaging={removeImaging}
                    resetImaging={resetImaging}
                />

                <LabSection
                    data={data}
                    updateLab={updateLab}
                    addLab={addLab}
                    removeLab={removeLab}
                    resetLabs={resetLabs}
                />
            </div>
            <div className="pb-5"></div>
        </div>
    );
}