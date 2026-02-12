import { type PatientData, type SymptomParams } from '../../../../../data/assetEvents';
import { Input, Button } from '@/components/shared/ui';

interface VitalSignsSectionProps {
    data: PatientData | SymptomParams;
    updateVital: (field: string, value: any) => void;
    resetVitals: () => void;
    initNormalVitals: () => void;
}

export function VitalSignsSection({
    data,
    updateVital,
    resetVitals,
    initNormalVitals
}: VitalSignsSectionProps) {
    return (
        <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h5 className="text-sm font-bold text-blue-600 uppercase">
                    활력징후
                </h5>
                <div className="flex items-center gap-2">
                    {!data.vitals ? (
                        <Button variant="outline" size="sm" className="h-7" onClick={initNormalVitals}>
                            + 활력징후 추가
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetVitals}
                        >
                            삭제
                        </Button>
                    )}
                </div>
            </div>

            {data.vitals ? (
                <div className="grid grid-cols-4 gap-x-8 gap-y-6">
                    {/* SBP Range */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-600 ml-0.5">SBP (mmHg)</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={data.vitals?.sbp || ''}
                                onChange={(e) => updateVital('sbp', parseInt(e.target.value) || undefined)}
                                placeholder="Min"
                                className="h-9"
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                                type="number"
                                value={data.vitals?.sbp_max || ''}
                                onChange={(e) => updateVital('sbp_max', parseInt(e.target.value) || undefined)}
                                placeholder="Max"
                                className="h-9"
                            />
                        </div>
                    </div>

                    {/* DBP Range */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-600 ml-0.5">DBP (mmHg)</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={data.vitals?.dbp || ''}
                                onChange={(e) => updateVital('dbp', parseInt(e.target.value) || undefined)}
                                placeholder="Min"
                                className="h-9"
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                                type="number"
                                value={data.vitals?.dbp_max || ''}
                                onChange={(e) => updateVital('dbp_max', parseInt(e.target.value) || undefined)}
                                placeholder="Max"
                                className="h-9"
                            />
                        </div>
                    </div>

                    {/* HR Range */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-600 ml-0.5">HR (bpm)</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={data.vitals?.hr || ''}
                                onChange={(e) => updateVital('hr', parseInt(e.target.value) || undefined)}
                                placeholder="Min"
                                className="h-9"
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                                type="number"
                                value={data.vitals?.hr_max || ''}
                                onChange={(e) => updateVital('hr_max', parseInt(e.target.value) || undefined)}
                                placeholder="Max"
                                className="h-9"
                            />
                        </div>
                    </div>

                    {/* RR Range */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-600 ml-0.5">RR (/min)</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={data.vitals?.rr || ''}
                                onChange={(e) => updateVital('rr', parseInt(e.target.value) || undefined)}
                                placeholder="Min"
                                className="h-9"
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                                type="number"
                                value={data.vitals?.rr_max || ''}
                                onChange={(e) => updateVital('rr_max', parseInt(e.target.value) || undefined)}
                                placeholder="Max"
                                className="h-9"
                            />
                        </div>
                    </div>

                    {/* BT Range */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-600 ml-0.5">BT (°C)</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                step="0.1"
                                value={data.vitals?.bt || ''}
                                onChange={(e) => updateVital('bt', parseFloat(e.target.value) || undefined)}
                                placeholder="Min"
                                className="h-9"
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                                type="number"
                                step="0.1"
                                value={data.vitals?.bt_max || ''}
                                onChange={(e) => updateVital('bt_max', parseFloat(e.target.value) || undefined)}
                                placeholder="Max"
                                className="h-9"
                            />
                        </div>
                    </div>

                    {/* SpO2 Range */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-600 ml-0.5">SpO2 (%)</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={data.vitals?.spo2 || ''}
                                onChange={(e) => updateVital('spo2', parseInt(e.target.value) || undefined)}
                                placeholder="Min"
                                className="h-9"
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                                type="number"
                                value={data.vitals?.spo2_max || ''}
                                onChange={(e) => updateVital('spo2_max', parseInt(e.target.value) || undefined)}
                                placeholder="Max"
                                className="h-9"
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
    );
}
