import { type PatientData, type SymptomParams } from '../../../../../data/assetEvents';
import { Input, SelectCombo, Button } from '@/components/shared/ui';

interface NeurologicalSectionProps {
    data: PatientData | SymptomParams;
    updateMental: (field: string, value: string) => void;
    updatePupil: (field: string, value: any) => void;
    updateCN: (field: string, value: any) => void;
    updateMotor: (field: string, value: string) => void;
    initNormalMental: () => void;
    resetMental: () => void;
    initNormalCN: () => void;
    resetCN: () => void;
    initNormalMotor: () => void;
    resetMotor: () => void;
}

const pupilReactions = [
    { value: 'Prompt', label: 'Prompt (신속)' },
    { value: 'Sluggish', label: 'Sluggish (완만)' },
    { value: 'Fixed', label: 'Fixed (고정)' },
    { value: 'Hippus', label: 'Hippus (홍채동요)' },
];

const pupilShapes = [
    { value: 'Round', label: 'Round (원형)' },
    { value: 'Oval', label: 'Oval (타원)' },
    { value: 'Irregular', label: 'Irregular (불규칙)' },
];

const motorGrades = [
    { value: '5', label: '5 (Normal)' },
    { value: '4', label: '4 (Good)' },
    { value: '3', label: '3 (Fair)' },
    { value: '2', label: '2 (Poor)' },
    { value: '1', label: '1 (Trace)' },
    { value: '0', label: '0 (None)' },
];

const gaitOptions = [
    { value: 'Normal', label: '정상 (Normal)' },
    { value: 'Hemiplegic', label: '편마비 보행 (Hemiplegic)' },
    { value: 'Ataxic', label: '실조성 보행 (Ataxic)' },
    { value: 'Assisted', label: '부축 보행 (Assisted)' },
    { value: 'Unable', label: '보행 불가 (Unable)' },
];

const muscleToneOptions = [
    { value: 'Normal', label: '정상 (Normal)' },
    { value: 'Flaccid', label: '이완 (Flaccid)' },
    { value: 'Spastic', label: '강직 (Spastic)' },
    { value: 'Rigid', label: '경직 (Rigid)' },
];

const eomOptions = [
    { value: 'Normal', label: '정상 (Normal)' },
    { value: 'Nystagmus', label: '안진 (Nystagmus)' },
    { value: 'Impaired_Right', label: '우측 장애 (Impaired R)' },
    { value: 'Impaired_Left', label: '좌측 장애 (Impaired L)' },
];

const facialSymmetryOptions = [
    { value: 'Symmetrical', label: '대칭 (Symmetrical)' },
    { value: 'Asymmetrical_Right_Droop', label: '우측 처짐 (R Droop)' },
    { value: 'Asymmetrical_Left_Droop', label: '좌측 처짐 (L Droop)' },
];

const gagReflexOptions = [
    { value: 'Present', label: '있음 (Present)' },
    { value: 'Absent', label: '없음 (Absent)' },
    { value: 'Diminished', label: '약함 (Diminished)' },
];

const tongueDeviationOptions = [
    { value: 'Middle', label: '중앙 (Middle)' },
    { value: 'Deviation_Right', label: '우측 편위 (R Deviation)' },
    { value: 'Deviation_Left', label: '좌측 편위 (L Deviation)' },
];

export function NeurologicalSection({
    data,
    updateMental,
    updatePupil,
    updateCN,
    updateMotor,
    initNormalMental,
    resetMental,
    initNormalCN,
    resetCN,
    initNormalMotor,
    resetMotor
}: NeurologicalSectionProps) {
    return (
        <div className="space-y-6">
            {/* Mental Status Section */}
            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-bold text-blue-600 uppercase">
                        의식수준
                    </h5>
                    <div className="flex items-center gap-2">
                        {!data.mentalStatus ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                onClick={initNormalMental}
                            >
                                + 의식수준 추가
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                onClick={resetMental}
                            >
                                삭제
                            </Button>
                        )}
                    </div>
                </div>

                {data.mentalStatus ? (
                    <div className="grid grid-cols-4 gap-x-4 gap-y-6">
                        <Input
                            label="GCS Score"
                            type="text"
                            value={data.mentalStatus?.gcs_score || ''}
                            onChange={(e) => updateMental('gcs_score', e.target.value)}
                            placeholder="E4V5M6"
                            className="h-9"
                        />
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-600 ml-0.5">GCS Status</label>
                            <SelectCombo
                                value={data.mentalStatus?.gcs_status || ''}
                                onValueChange={(val: string) => updateMental('gcs_status', val)}
                                options={[
                                    { value: 'Alert', label: 'Alert' },
                                    { value: 'Drowsy', label: 'Drowsy' },
                                    { value: 'Stupor', label: 'Stupor' },
                                    { value: 'Semi-coma', label: 'Semi-coma' },
                                    { value: 'Coma', label: 'Coma' },
                                ]}
                                placeholder="상태 선택"
                                triggerClassName="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-600 ml-0.5">Orientation (시간/장소/사람)</label>
                            <div className="flex items-center gap-4 h-9 px-1">
                                {['시간', '장소', '사람'].map((item) => {
                                    const current = data.mentalStatus?.orientation || '';
                                    const isChecked = current.split(',').map(s => s.trim()).includes(item);

                                    return (
                                        <label key={item} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const parts = current.split(',').map(s => s.trim()).filter(s => s);
                                                    const nextParts = e.target.checked
                                                        ? [...parts, item]
                                                        : parts.filter(p => p !== item);
                                                    updateMental('orientation', nextParts.join(', '));
                                                }}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                                                {item}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                        <span className="text-sm text-gray-500">증상 관련 이상 징후가 있는 경우, 추가해주세요.</span>
                    </div>
                )}
            </div>

            {/* Cranial Nerve Examination Section */}
            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-bold text-blue-600 uppercase">
                        뇌신경 검사결과
                    </h5>
                    <div className="flex items-center gap-2">
                        {!data.cranialNerves ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                onClick={initNormalCN}
                            >
                                + 뇌신경 검사 추가
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                onClick={resetCN}
                            >
                                삭제
                            </Button>
                        )}
                    </div>
                </div>

                {data.cranialNerves ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-3 gap-x-4 gap-y-6">
                            {/* Right Eye */}
                            <div className="col-span-1">
                                <Input
                                    label="동공 크기 (R, mm)"
                                    type="number"
                                    value={data.pupilResponse?.right_size ?? ''}
                                    onChange={(e) => updatePupil('right_size', parseFloat(e.target.value) || undefined)}
                                    placeholder="1-9"
                                    className="h-9"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">동공 모양 (R)</label>
                                <SelectCombo
                                    value={data.pupilResponse?.right_shape || 'Round'}
                                    onValueChange={(val: string) => updatePupil('right_shape', val)}
                                    options={pupilShapes}
                                    placeholder="선택"
                                    triggerClassName="h-9"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">동공 반사 (R)</label>
                                <SelectCombo
                                    value={data.pupilResponse?.right_reaction || ''}
                                    onValueChange={(val: string) => updatePupil('right_reaction', val)}
                                    options={pupilReactions}
                                    placeholder="선택"
                                    triggerClassName="h-9"
                                />
                            </div>

                            {/* Left Eye */}
                            <div className="col-span-1">
                                <Input
                                    label="동공 크기 (L, mm)"
                                    type="number"
                                    value={data.pupilResponse?.left_size ?? ''}
                                    onChange={(e) => updatePupil('left_size', parseFloat(e.target.value) || undefined)}
                                    placeholder="1-9"
                                    className="h-9"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">동공 모양 (L)</label>
                                <SelectCombo
                                    value={data.pupilResponse?.left_shape || 'Round'}
                                    onValueChange={(val: string) => updatePupil('left_shape', val)}
                                    options={pupilShapes}
                                    placeholder="선택"
                                    triggerClassName="h-9"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">동공 반사 (L)</label>
                                <SelectCombo
                                    value={data.pupilResponse?.left_reaction || ''}
                                    onValueChange={(val: string) => updatePupil('left_reaction', val)}
                                    options={pupilReactions}
                                    placeholder="선택"
                                    triggerClassName="h-9"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-x-4 gap-y-6">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">안구운동 (EOM)</label>
                                <SelectCombo
                                    value={data.cranialNerves?.eom || ''}
                                    onValueChange={(val: string) => updateCN('eom', val)}
                                    options={eomOptions}
                                    placeholder="선택"
                                    triggerClassName="h-9"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">안면 대칭 (CN VII)</label>
                                <SelectCombo
                                    value={data.cranialNerves?.facialSymmetry || ''}
                                    onValueChange={(val: string) => updateCN('facialSymmetry', val)}
                                    options={facialSymmetryOptions}
                                    placeholder="선택"
                                    triggerClassName="h-9"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">구역 반사 (Gag)</label>
                                <SelectCombo
                                    value={data.cranialNerves?.gagReflex || ''}
                                    onValueChange={(val: string) => updateCN('gagReflex', val)}
                                    options={gagReflexOptions}
                                    placeholder="선택"
                                    triggerClassName="h-9"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">혀 편위 (CN XII)</label>
                                <SelectCombo
                                    value={data.cranialNerves?.tongueDeviation || ''}
                                    onValueChange={(val: string) => updateCN('tongueDeviation', val)}
                                    options={tongueDeviationOptions}
                                    placeholder="선택"
                                    triggerClassName="h-9"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                        <span className="text-sm text-gray-500">증상 관련 이상 징후가 있는 경우, 추가해주세요.</span>
                    </div>
                )}
            </div>

            {/* Motor Power Section */}
            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-bold text-blue-600 uppercase">
                        운동기능
                    </h5>
                    <div className="flex items-center gap-2">
                        {!data.motorPower ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                onClick={initNormalMotor}
                            >
                                + 운동기능 추가
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                onClick={resetMotor}
                            >
                                삭제
                            </Button>
                        )}
                    </div>
                </div>

                {data.motorPower ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-1.5 border p-3 rounded-lg bg-gray-50/30">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Upper Right</label>
                                <SelectCombo
                                    value={data.motorPower?.upper_right || ''}
                                    onValueChange={(val: string) => updateMotor('upper_right', val)}
                                    options={motorGrades}
                                    placeholder="Grade"
                                    triggerClassName="h-8 bg-white"
                                />
                            </div>
                            <div className="space-y-1.5 border p-3 rounded-lg bg-gray-50/30">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Upper Left</label>
                                <SelectCombo
                                    value={data.motorPower?.upper_left || ''}
                                    onValueChange={(val: string) => updateMotor('upper_left', val)}
                                    options={motorGrades}
                                    placeholder="Grade"
                                    triggerClassName="h-8 bg-white"
                                />
                            </div>
                            <div className="space-y-1.5 border p-3 rounded-lg bg-gray-50/30">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Lower Right</label>
                                <SelectCombo
                                    value={data.motorPower?.lower_right || ''}
                                    onValueChange={(val: string) => updateMotor('lower_right', val)}
                                    options={motorGrades}
                                    placeholder="Grade"
                                    triggerClassName="h-8 bg-white"
                                />
                            </div>
                            <div className="space-y-1.5 border p-3 rounded-lg bg-gray-50/30">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Lower Left</label>
                                <SelectCombo
                                    value={data.motorPower?.lower_left || ''}
                                    onValueChange={(val: string) => updateMotor('lower_left', val)}
                                    options={motorGrades}
                                    placeholder="Grade"
                                    triggerClassName="h-8 bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-600 ml-0.5">보행 (Gait)</label>
                                <SelectCombo
                                    value={data.motorPower?.gait || ''}
                                    onValueChange={(val: string) => updateMotor('gait', val)}
                                    options={gaitOptions}
                                    placeholder="보행 상태 선택"
                                    triggerClassName="h-9"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-600 ml-0.5">근긴장도 (Muscle Tone)</label>
                                <SelectCombo
                                    value={data.motorPower?.muscleTone || ''}
                                    onValueChange={(val: string) => updateMotor('muscleTone', val)}
                                    options={muscleToneOptions}
                                    placeholder="근긴장도 선택"
                                    triggerClassName="h-9"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                        <span className="text-sm text-gray-500">증상 관련 이상 징후가 있는 경우, 추가해주세요.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
