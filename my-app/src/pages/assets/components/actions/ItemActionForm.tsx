import { type ItemParams } from '../../../../data/assetEvents';
import { Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/shared/ui';

interface ItemActionFormProps {
    params: ItemParams;
    onChange: (params: ItemParams) => void;
}

export function ItemActionForm({ params, onChange }: ItemActionFormProps) {
    const updateField = (field: keyof ItemParams, value: string) => {
        onChange({ ...params, [field]: value });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="p-5 pb-0">
                <h5 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    아이템 설정
                </h5>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">아이템 키 (Key)</label>
                        <Input
                            type="text"
                            value={params.itemKey || ''}
                            onChange={(e) => updateField('itemKey', e.target.value)}
                            className="h-9 text-sm"
                            placeholder="it_001"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">아이템 명</label>
                        <Input
                            type="text"
                            value={params.name || ''}
                            onChange={(e) => updateField('name', e.target.value)}
                            className="h-9 text-sm"
                            placeholder="청진기"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">아이템 타입</label>
                        <Select
                            value={params.itemType || ''}
                            onValueChange={(value) => updateField('itemType', value)}
                        >
                            <SelectTrigger className="h-9 text-sm font-medium">
                                <SelectValue placeholder="타입 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="equipment">장비</SelectItem>
                                <SelectItem value="consumable">소모품</SelectItem>
                                <SelectItem value="document">문서</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">아이템 분류</label>
                        <Select
                            value={params.category || ''}
                            onValueChange={(value) => updateField('category', value)}
                        >
                            <SelectTrigger className="h-9 text-sm font-medium">
                                <SelectValue placeholder="분류 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="diagnostic">진단도구</SelectItem>
                                <SelectItem value="surgical">수술도구</SelectItem>
                                <SelectItem value="general">일반</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">액션 (Action)</label>
                        <div className="flex gap-6 items-center h-9 px-1">
                            <label className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
                                <input
                                    type="radio"
                                    checked={params.action === 'wear'}
                                    onChange={() => updateField('action', 'wear')}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                /> 착용 (Wear)
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
                                <input
                                    type="radio"
                                    checked={params.action === 'remove'}
                                    onChange={() => updateField('action', 'remove')}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                /> 제거 (Remove)
                            </label>
                        </div>
                    </div>
                    {params.action === 'wear' && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                            <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">착용 위치 (Position)</label>
                            <Input
                                type="text"
                                value={params.position || ''}
                                onChange={(e) => updateField('position', e.target.value)}
                                className="h-9 bg-blue-50/30 border-blue-100 focus:ring-blue-500 text-sm"
                                placeholder="Hand_R, Head, etc."
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="pb-5"></div>
        </div>
    );
}
