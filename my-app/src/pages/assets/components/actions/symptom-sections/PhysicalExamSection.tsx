import { X } from 'lucide-react';
import { type PatientData, type SymptomParams } from '../../../../../data/assetEvents';
import { SelectCombo, Button } from '@/components/shared/ui';

interface PhysicalExamSectionProps {
    data: PatientData | SymptomParams;
    updateInspectionResult: (index: number, field: string, value: any) => void;
    addInspectionResult: (type: 'General' | 'Chest' | 'Abdomen' | 'Skin' | 'Extremities') => void;
    removeInspectionResult: (index: number) => void;
    updatePalpationResult: (index: number, field: string, value: any) => void;
    addPalpationResult: (type: 'Chest' | 'Abdomen' | 'Extremities' | 'Other') => void;
    removePalpationResult: (index: number) => void;
    updatePercussionResult: (index: number, field: string, value: any) => void;
    addPercussionResult: (type: 'Chest' | 'Abdomen') => void;
    removePercussionResult: (index: number) => void;
    updateAuscultationResult: (index: number, field: string, value: any) => void;
    addAuscultationResult: (type: 'Breath' | 'Heart' | 'Bowel') => void;
    removeAuscultationResult: (index: number) => void;
}

export function PhysicalExamSection({
    data,
    updateInspectionResult,
    addInspectionResult,
    removeInspectionResult,
    updatePalpationResult,
    addPalpationResult,
    removePalpationResult,
    updatePercussionResult,
    addPercussionResult,
    removePercussionResult,
    updateAuscultationResult,
    addAuscultationResult,
    removeAuscultationResult
}: PhysicalExamSectionProps) {
    return (
        <div className="space-y-6">
            {/* Inspection Section */}
            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-bold text-blue-600 uppercase">
                        시진 (Inspection)
                    </h5>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addInspectionResult('General')}>
                            + 전신 상태 추가
                        </Button>
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addInspectionResult('Chest')}>
                            + 가슴 시진 추가
                        </Button>
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addInspectionResult('Abdomen')}>
                            + 복부 시진 추가
                        </Button>
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addInspectionResult('Skin')}>
                            + 피부 관찰 추가
                        </Button>
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addInspectionResult('Extremities')}>
                            + 사지 시진 추가
                        </Button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    {(data.inspectionResults || []).map((result, index) => {
                        let locationOptions: { value: string; label: string }[] = [];
                        let findingOptions: { value: string; label: string }[] = [];
                        let typeLabel = '';
                        let typeColor = '';

                        if (result.type === 'General') {
                            typeLabel = '전신';
                            typeColor = 'text-teal-600 bg-teal-50 border-teal-100';
                            locationOptions = [
                                { value: 'Appearance', label: '외양 (Appearance)' },
                                { value: 'Face', label: '얼굴 (Face)' },
                                { value: 'Mental Status', label: '정신상태' },
                                { value: 'Nutritional State', label: '영양상태' },
                            ];
                            findingOptions = [
                                { value: 'Acute Illness', label: '급성 병색 (Acute illness)' },
                                { value: 'Chronic Illness', label: '만성 병색 (Chronic illness)' },
                                { value: 'Healthy', label: '건강해 보임 (Healthy)' },
                                { value: 'Jaundice', label: '황달 (Jaundice)' },
                                { value: 'Pale', label: '창백 (Pale)' },
                                { value: 'Distress', label: '고통스러워 함 (Distress)' },
                                { value: 'Anxious', label: '불안해 함 (Anxious)' },
                            ];
                        } else if (result.type === 'Chest') {
                            typeLabel = '가슴';
                            typeColor = 'text-sky-600 bg-sky-50 border-sky-100';
                            locationOptions = [
                                { value: 'Anterior Chest', label: '흉부 전면' },
                                { value: 'Posterior Chest', label: '흉부 후면' },
                                { value: 'Movement', label: '흉곽 운동' },
                            ];
                            findingOptions = [
                                { value: 'Symmetrical', label: '대칭적 확장' },
                                { value: 'Asymmetrical', label: '비대칭적 확장' },
                                { value: 'Barrel Chest', label: '술통형 가슴 (Barrel chest)' },
                                { value: 'Pigeon Chest', label: '새가슴' },
                                { value: 'Accessory Muscle Use', label: '보조근 사용' },
                                { value: 'Retraction', label: '흉벽 함몰 (Retraction)' },
                            ];
                        } else if (result.type === 'Abdomen') {
                            typeLabel = '복부';
                            typeColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
                            locationOptions = [
                                { value: 'Contour', label: '상복부 윤곽' },
                                { value: 'Umbilicus', label: '배꼽 부위' },
                            ];
                            findingOptions = [
                                { value: 'Flat', label: '편평함' },
                                { value: 'Distended', label: '팽창됨 (Distended)' },
                                { value: 'Scaphoid', label: '함몰됨 (Scaphoid)' },
                                { value: 'Striae', label: '임신선/선조' },
                                { value: 'Scar', label: '흉터 (Scar)' },
                                { value: 'Pulsation', label: '박동 관찰' },
                            ];
                        } else if (result.type === 'Skin') {
                            typeLabel = '피부';
                            typeColor = 'text-amber-600 bg-amber-50 border-amber-100';
                            locationOptions = [
                                { value: 'Trunk', label: '몸통' },
                                { value: 'Arms', label: '팔' },
                                { value: 'Legs', label: '다리' },
                                { value: 'Systemic', label: '전신 피부' },
                            ];
                            findingOptions = [
                                { value: 'Cyanosis', label: '청색증 (Cyanosis)' },
                                { value: 'Diaphoresis', label: '발한/식은땀' },
                                { value: 'Rash', label: '발진 (Rash)' },
                                { value: 'Petechiae', label: '출혈점 (Petechiae)' },
                                { value: 'Ecchymosis', label: '반상출혈 (Ecchymosis)' },
                                { value: 'Dry', label: '건조함' },
                            ];
                        } else if (result.type === 'Extremities') {
                            typeLabel = '사지';
                            typeColor = 'text-indigo-600 bg-indigo-50 border-indigo-100';
                            locationOptions = [
                                { value: 'Hands', label: '손/손톱' },
                                { value: 'Feet', label: '발' },
                                { value: 'Joints', label: '관절' },
                            ];
                            findingOptions = [
                                { value: 'Edema', label: '부종 (Edema)' },
                                { value: 'Clubbing', label: '곤봉지 (Clubbing)' },
                                { value: 'Muscle Wasting', label: '근육 위축' },
                                { value: 'Tremor', label: '떨림 (Tremor)' },
                                { value: 'Deformity', label: '기형/변형' },
                            ];
                        }

                        return (
                            <div key={result.key} className="relative flex items-center gap-4 px-2 py-1 rounded-lg group animate-in fade-in slide-in-from-right-1">
                                <div className={`w-12 text-xs font-bold px-2 py-1 rounded border text-center ${typeColor}`}>
                                    {typeLabel}
                                </div>
                                <div className="flex-1 grid grid-cols-12 gap-4">
                                    <div className="col-span-5">
                                        <SelectCombo
                                            value={result.location}
                                            onValueChange={(val: string) => updateInspectionResult(index, 'location', val)}
                                            options={locationOptions}
                                            placeholder="위치 선택"
                                            triggerClassName="h-9 bg-white"
                                        />
                                    </div>
                                    <div className="col-span-7">
                                        <SelectCombo
                                            value={result.finding}
                                            onValueChange={(val: string) => updateInspectionResult(index, 'finding', val)}
                                            options={findingOptions}
                                            placeholder="소견 선택"
                                            triggerClassName="h-9 bg-white"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeInspectionResult(index)}
                                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        );
                    })}

                    {(!data.inspectionResults || data.inspectionResults.length === 0) && (
                        <div className="text-center py-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                            <span className="text-sm text-gray-500">증상 관련 이상 징후가 있는 경우, 추가해주세요.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Palpation Section */}
            <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-bold text-blue-600 uppercase">
                        촉진
                    </h5>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addPalpationResult('Chest')}>
                            + 가슴 촉진 추가
                        </Button>
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addPalpationResult('Abdomen')}>
                            + 복부 촉진 추가
                        </Button>
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addPalpationResult('Extremities')}>
                            + 사지 촉진 추가
                        </Button>
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addPalpationResult('Other')}>
                            + 기타 촉진 추가
                        </Button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    {(data.palpationResults || []).map((result, index) => {
                        let locationOptions: { value: string; label: string }[] = [];
                        let findingOptions: { value: string; label: string }[] = [];
                        let typeLabel = '';
                        let typeColor = '';

                        if (result.type === 'Chest') {
                            typeLabel = '가슴';
                            typeColor = 'text-rose-600 bg-rose-50 border-rose-100';
                            locationOptions = [
                                { value: 'Apex', label: '심첨부 (Apex)' },
                                { value: 'Sternum', label: '흉골 (Sternum)' },
                                { value: 'Ribs', label: '늑골 (Ribs)' },
                                { value: 'Precordium', label: '심전구 (Precordium)' },
                            ];
                            findingOptions = [
                                { value: 'Normal', label: '정상 (Normal)' },
                                { value: 'Thrill', label: '진동 (Thrill)' },
                                { value: 'Heave', label: '융기 (Heave)' },
                                { value: 'Tenderness', label: '압통 (Tenderness)' },
                                { value: 'Crepitus', label: '염발음 (Crepitus)' },
                            ];
                        } else if (result.type === 'Abdomen') {
                            typeLabel = '복부';
                            typeColor = 'text-amber-600 bg-amber-50 border-amber-100';
                            locationOptions = [
                                { value: 'RUQ', label: 'RUQ (우상복부)' },
                                { value: 'LUQ', label: 'LUQ (좌상복부)' },
                                { value: 'RLQ', label: 'RLQ (우하복부)' },
                                { value: 'LLQ', label: 'LLQ (좌하복부)' },
                                { value: 'Epigastric', label: '상복부 (Epigastric)' },
                                { value: 'McBurney', label: 'McBurney point' },
                                { value: 'Liver border', label: '간 연변 (Liver border)' },
                            ];
                            findingOptions = [
                                { value: 'Normal', label: '정상 (Normal)' },
                                { value: 'Tenderness', label: '압통 (Tenderness)' },
                                { value: 'Rebound Tenderness', label: '반동압통 (Rebound Tenderness)' },
                                { value: 'Mass', label: '종괴 (Mass)' },
                                { value: 'Guarding', label: '저항 (Guarding)' },
                                { value: 'Rigidity', label: '경직 (Rigidity)' },
                                { value: 'Pulsation', label: '박동 (Pulsation)' },
                            ];
                        } else if (result.type === 'Extremities') {
                            typeLabel = '사지';
                            typeColor = 'text-cyan-600 bg-cyan-50 border-cyan-100';
                            locationOptions = [
                                { value: 'Radial pulse', label: '요골맥박 (Radial pulse)' },
                                { value: 'Dorsalis pedis', label: '족배맥박 (Dorsalis pedis)' },
                                { value: 'Joint', label: '관절 (Joint)' },
                                { value: 'Edema area', label: '부종 부위' },
                            ];
                            findingOptions = [
                                { value: 'Normal', label: '정상 (Normal)' },
                                { value: 'Weak pulse', label: '맥박 약함' },
                                { value: 'Absent pulse', label: '맥박 소실' },
                                { value: 'Edema', label: '부종 (Edema)' },
                                { value: 'Tenderness', label: '압통 (Tenderness)' },
                                { value: 'Heat', label: '열감 (Heat)' },
                            ];
                        } else {
                            typeLabel = '기타';
                            typeColor = 'text-slate-600 bg-slate-50 border-slate-100';
                            locationOptions = [
                                { value: 'Lymph nodes', label: '임파선 (Lymph nodes)' },
                                { value: 'Thyroid', label: '갑상선 (Thyroid)' },
                                { value: 'Skin', label: '피부' },
                            ];
                            findingOptions = [
                                { value: 'Normal', label: '정상 (Normal)' },
                                { value: 'Enlarged', label: '비대 (Enlarged)' },
                                { value: 'Tenderness', label: '압통 (Tenderness)' },
                                { value: 'Moisture', label: '습함' },
                                { value: 'Dryness', label: '건조' },
                            ];
                        }

                        return (
                            <div key={result.key} className="relative flex items-center gap-4 px-2 py-0.5 rounded-lg group animate-in fade-in slide-in-from-right-1">
                                <div className={`w-12 text-xs font-bold px-2 py-0.5 rounded border text-center ${typeColor}`}>
                                    {typeLabel}
                                </div>
                                <div className="flex-1 grid grid-cols-12 gap-4">
                                    <div className="col-span-5">
                                        <SelectCombo
                                            value={result.location}
                                            onValueChange={(val: string) => updatePalpationResult(index, 'location', val)}
                                            options={locationOptions}
                                            placeholder="위치 선택"
                                            triggerClassName="h-9 bg-white"
                                        />
                                    </div>
                                    <div className="col-span-7">
                                        <SelectCombo
                                            value={result.finding}
                                            onValueChange={(val: string) => updatePalpationResult(index, 'finding', val)}
                                            options={findingOptions}
                                            placeholder="소견 선택"
                                            triggerClassName="h-9 bg-white"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removePalpationResult(index)}
                                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        );
                    })}

                    {(!data.palpationResults || data.palpationResults.length === 0) && (
                        <div className="text-center py-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                            <span className="text-sm text-gray-500">증상 관련 이상 징후가 있는 경우, 추가해주세요.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Percussion Section */}
            <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-bold text-blue-600 uppercase">
                        타진음
                    </h5>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addPercussionResult('Chest')}>
                            + 가슴 타진 추가
                        </Button>
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addPercussionResult('Abdomen')}>
                            + 복부 타진 추가
                        </Button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    {(data.percussionResults || []).map((result, index) => {
                        let locationOptions: { value: string; label: string }[] = [];
                        let findingOptions: { value: string; label: string }[] = [];
                        let typeLabel = '';
                        let typeColor = '';

                        if (result.type === 'Chest') {
                            typeLabel = '가슴';
                            typeColor = 'text-blue-600 bg-blue-50 border-blue-100';
                            locationOptions = [
                                { value: 'R-Upper Field', label: 'R-Upper Field (우상폐야)' },
                                { value: 'L-Upper Field', label: 'L-Upper Field (좌상폐야)' },
                                { value: 'R-Lower Field', label: 'R-Lower Field (우하폐야)' },
                                { value: 'L-Lower Field', label: 'L-Lower Field (좌하폐야)' },
                                { value: 'Traube\'s space', label: 'Traube\'s space' },
                                { value: 'Cardiac border', label: 'Cardiac border' },
                            ];
                            findingOptions = [
                                { value: 'Resonant', label: '공명음 (Resonant)' },
                                { value: 'Hyperresonant', label: '과공명음 (Hyperresonant)' },
                                { value: 'Dull', label: '탁음 (Dull)' },
                                { value: 'Flat', label: '절대탁음 (Flat)' },
                            ];
                        } else if (result.type === 'Abdomen') {
                            typeLabel = '복부';
                            typeColor = 'text-blue-600 bg-blue-50 border-blue-100';
                            locationOptions = [
                                { value: 'Liver area', label: 'Liver area (간 부위)' },
                                { value: 'RUQ', label: 'RUQ (우상복부)' },
                                { value: 'LUQ', label: 'LUQ (좌상복부)' },
                                { value: 'RLQ', label: 'RLQ (우하복부)' },
                                { value: 'LLQ', label: 'LLQ (좌하복부)' },
                                { value: 'Suprapubic', label: 'Suprapubic (방광 부위)' },
                            ];
                            findingOptions = [
                                { value: 'Tympanic', label: '고창음 (Tympanic)' },
                                { value: 'Dull', label: '탁음 (Dull)' },
                                { value: 'Shifting Dullness', label: '이동탁음 (Shifting Dullness)' },
                            ];
                        }

                        return (
                            <div key={result.key} className="relative flex items-center gap-4 px-2 py-1 rounded-lg group animate-in fade-in slide-in-from-right-1">
                                <div className={`w-12 text-xs font-bold px-2 py-1 rounded border text-center ${typeColor}`}>
                                    {typeLabel}
                                </div>
                                <div className="flex-1 grid grid-cols-12 gap-4">
                                    <div className="col-span-5">
                                        <SelectCombo
                                            value={result.location}
                                            onValueChange={(val: string) => updatePercussionResult(index, 'location', val)}
                                            options={locationOptions}
                                            placeholder="위치 선택"
                                            triggerClassName="h-9 bg-white"
                                        />
                                    </div>
                                    <div className="col-span-7">
                                        <SelectCombo
                                            value={result.finding}
                                            onValueChange={(val: string) => updatePercussionResult(index, 'finding', val)}
                                            options={findingOptions}
                                            placeholder="소견 선택"
                                            triggerClassName="h-9 bg-white"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removePercussionResult(index)}
                                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        );
                    })}

                    {(!data.percussionResults || data.percussionResults.length === 0) && (
                        <div className="text-center py-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                            <span className="text-sm text-gray-500">증상 관련 이상 징후가 있는 경우, 추가해주세요.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Auscultation Section */}
            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-bold text-blue-600 uppercase">
                        청진음
                    </h5>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addAuscultationResult('Breath')}>
                            + 폐음 추가
                        </Button>
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addAuscultationResult('Heart')}>
                            + 심음 추가
                        </Button>
                        <Button variant="outline" size="sm" className="h-7" onClick={() => addAuscultationResult('Bowel')}>
                            + 장음 추가
                        </Button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    {(data.auscultationResults || []).map((result, index) => {
                        let locationOptions: { value: string; label: string }[] = [];
                        let findingOptions: { value: string; label: string }[] = [];
                        let typeLabel = '';
                        let typeColor = '';

                        if (result.type === 'Breath') {
                            typeLabel = '폐음';
                            typeColor = 'text-blue-600 bg-blue-50 border-blue-100';
                            locationOptions = [
                                { value: 'RUL', label: 'RUL (우상엽)' },
                                { value: 'LUL', label: 'LUL (좌상엽)' },
                                { value: 'RML', label: 'RML (우중엽)' },
                                { value: 'LML', label: 'LML (좌중엽)' },
                                { value: 'RLL', label: 'RLL (우하엽)' },
                                { value: 'LLL', label: 'LLL (좌하엽)' },
                                { value: 'Posterior R-Upper', label: 'Posterior R-Upper' },
                                { value: 'Posterior L-Upper', label: 'Posterior L-Upper' },
                                { value: 'Posterior R-Lower', label: 'Posterior R-Lower' },
                                { value: 'Posterior L-Lower', label: 'Posterior L-Lower' },
                            ];
                            findingOptions = [
                                { value: 'Normal', label: '정상 폐음 (Normal)' },
                                { value: 'Clear', label: '정상 (Clear)' },
                                { value: 'Crackles', label: '악설음/수포음 (Crackles)' },
                                { value: 'Wheezing', label: '천명음 (Wheezing)' },
                                { value: 'Stridor', label: '협착음 (Stridor)' },
                                { value: 'Rhonchi', label: '수성음 (Rhonchi)' },
                                { value: 'Diminished', label: '호흡음 감소 (Diminished)' },
                                { value: 'Absent', label: '호흡음 소실 (Absent)' },
                            ];
                        } else if (result.type === 'Heart') {
                            typeLabel = '심음';
                            typeColor = 'text-blue-600 bg-blue-50 border-blue-100';
                            locationOptions = [
                                { value: 'Aortic Area', label: 'Aortic Area (대동맥판 영역)' },
                                { value: 'Pulmonic Area', label: 'Pulmonic Area (폐동맥판 영역)' },
                                { value: 'Erb\'s Point', label: 'Erb\'s Point' },
                                { value: 'Tricuspid Area', label: 'Tricuspid Area (삼첨판 영역)' },
                                { value: 'Mitral Area', label: 'Mitral Area (이첨판 영역)' },
                            ];
                            findingOptions = [
                                { value: 'Normal', label: '정상 심음 (Normal)' },
                                { value: 'S1/S2', label: '정상 (S1, S2)' },
                                { value: 'Murmur', label: '심잡음 (Murmur)' },
                                { value: 'Gallop', label: '분마음 (Gallop)' },
                                { value: 'Rub', label: '마찰음 (Friction Rub)' },
                                { value: 'Muffled', label: '심음 미약 (Muffled)' },
                            ];
                        } else if (result.type === 'Bowel') {
                            typeLabel = '장음';
                            typeColor = 'text-blue-600 bg-blue-50 border-blue-100';
                            locationOptions = [
                                { value: 'RUQ', label: 'RUQ (우상복부)' },
                                { value: 'LUQ', label: 'LUQ (좌상복부)' },
                                { value: 'RLQ', label: 'RLQ (우하복부)' },
                                { value: 'LLQ', label: 'LLQ (좌하복부)' },
                                { value: 'Epigastric', label: 'Epigastric (상복부)' },
                            ];
                            findingOptions = [
                                { value: 'Normal', label: '정상 장음 (Normal)' },
                                { value: 'Hyperactive', label: '장운동 항진 (Hyperactive)' },
                                { value: 'Hypoactive', label: '장운동 저하 (Hypoactive)' },
                                { value: 'Absent', label: '장음 소실 (Absent)' },
                                { value: 'Tinkling', label: '금속성 장음 (Tinkling)' },
                            ];
                        }

                        return (
                            <div key={result.key} className="relative flex items-center gap-4 px-2 py-0.5 rounded-lg group animate-in fade-in slide-in-from-right-1">
                                <div className={`w-12 text-xs font-bold px-2 py-0.5 rounded border text-center ${typeColor}`}>
                                    {typeLabel}
                                </div>
                                <div className="flex-1 grid grid-cols-12 gap-4">
                                    <div className="col-span-5">
                                        <SelectCombo
                                            value={result.location}
                                            onValueChange={(val: string) => updateAuscultationResult(index, 'location', val)}
                                            options={locationOptions}
                                            placeholder="위치 선택"
                                            triggerClassName="h-9 bg-white"
                                        />
                                    </div>
                                    <div className="col-span-7">
                                        <SelectCombo
                                            value={result.finding}
                                            onValueChange={(val: string) => updateAuscultationResult(index, 'finding', val)}
                                            options={findingOptions}
                                            placeholder="소견 선택"
                                            triggerClassName="h-9 bg-white"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeAuscultationResult(index)}
                                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        );
                    })}

                    {(!data.auscultationResults || data.auscultationResults.length === 0) && (
                        <div className="text-center py-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                            <span className="text-sm text-gray-500">증상 관련 이상 징후가 있는 경우, 추가해주세요.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
