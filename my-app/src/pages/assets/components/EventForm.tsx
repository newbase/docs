import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
    type AssetEvent,
    type EventParameter,
    type EventCategory,
    type TriggerType,
    type ResourceType,
    type RepeatSettings,
    type RepeatType,
    type PatientData,
    type PatientType,
    type LabResult,
    type EMRData,
    type ActionType,
    type VoiceParams,
    type SoundParams,
    type AnimationParams,
    type ModelParams,
    type SymptomParams,
    type ItemParams,
    type TextureParams,
    type EventAction,
    type PatientClassification,
    type NPCClassification,
    PATIENT_CLASSIFICATIONS,
    NPC_CLASSIFICATIONS
} from "../../../data/assetEvents";
import { validateEvent, generateEventId } from "../../../utils/eventUtils";
import { useAuth } from "../../../contexts/AuthContext";
import { SymptomDataForm } from "./actions/SymptomDataForm";
import { ResourceActionForm, VoiceActionForm, TextureActionForm, SoundActionForm } from "./actions/MediaActionForms";
import { ItemActionForm } from "./actions/ItemActionForm";
import {
    Button,
    Input,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectGroup,
    SelectLabel
} from '@/components/shared/ui';
import { assets } from '../../../data/assets';
import { symptomTemplates } from '../../../data/symptomTemplates';

interface EventFormProps {
    initialData?: AssetEvent | null;
    onSave: (event: AssetEvent) => void;
    onCancel: () => void;
    isEditing?: boolean;
}

export function EventForm({ initialData, onSave, onCancel, isEditing = false }: EventFormProps): React.ReactElement {
    const { user } = useAuth();
    const [errors, setErrors] = useState<string[]>([]);

    const [eventForm, setEventForm] = useState({
        key: '',
        displayName: '',
        description: '',
        category: 'npc_event' as EventCategory,
        trigger: 'npc_spawn' as TriggerType,
        roleTypes: [] as string[],
        parameters: [] as EventParameter[],
        resources: [] as Array<{ id: string; type: ResourceType; name: string; path: string; description?: string }>,
        notes: '',
        target: [] as string[],
        classification: '',
        actions: [] as EventAction[]
    });

    useEffect(() => {
        if (initialData) {
            setEventForm({
                key: initialData.key || '',
                displayName: initialData.displayName || '',
                description: initialData.description || '',
                category: initialData.category || 'npc_event',
                trigger: initialData.trigger || 'npc_spawn',
                roleTypes: initialData.roleTypes || [],
                parameters: initialData.parameters || [],
                resources: initialData.resources || [],
                notes: initialData.notes || '',
                target: initialData.target || [],
                classification: initialData.classification || '',
                actions: initialData.actions || []
            });
        }
    }, [initialData]);


    const handleRoleToggle = (role: string) => {
        const newRoles = eventForm.roleTypes.includes(role)
            ? eventForm.roleTypes.filter(r => r !== role)
            : [...eventForm.roleTypes, role];
        setEventForm({ ...eventForm, roleTypes: newRoles });
    };

    const handleTargetChange = (value: string) => {
        const targets = value.split(',').map(t => t.trim()).filter(t => t);
        setEventForm({ ...eventForm, target: targets });
    };


    const handleAddAction = (type: ActionType) => {
        const newAction: EventAction = {
            id: `action_${Date.now()}`,
            type,
            params: {}
        };

        // Default params based on type
        if (type === 'play_voice') {
            newAction.params = { text: '', voice: 'natural', volume: 1.0, speed: 1.0 } as VoiceParams;
        } else if (type === 'play_sound') {
            newAction.params = { category: '', name: '', triggerType: 'auto', targetIds: [], url: '' } as SoundParams;
        } else if (type === 'play_animation') {
            newAction.params = { category: '', name: '', url: '' } as AnimationParams;
        } else if (type === 'change_3d_model') {
            newAction.params = { category: '', name: '', url: '' } as ModelParams;
        } else if (type === 'change_texture') {
            newAction.params = { category: '', name: '', spotId: '', url: '' } as TextureParams;
        } else if (type === 'item_action') {
            newAction.params = { itemKey: '', itemType: '', category: '', name: '', action: 'wear' } as ItemParams;
        } else if (type === 'symptom_info') {
            newAction.params = { chiefComplaint: '' } as SymptomParams;
        } else if (type === 'change_patient_data') {
            newAction.params = { patientType: 'Adult_Male', vitals: {}, mentalStatus: {}, locations: [] } as PatientData;
        } else if (type === 'emr_update') {
            newAction.params = { patientInfo: '', order: '', nursingNote: '' };
        } else if (type === 'apply_symptom') {
            newAction.params = { symptomKey: '' } as SymptomParams;
        } else if (type === 'quiz') {
            newAction.params = { question: '', options: ['', ''], answer: 0 };
        }

        newAction.repeatSettings = {
            type: 'None' as RepeatType,
            interval: undefined,
            intervalMin: undefined,
            intervalMax: undefined
        };

        setEventForm({
            ...eventForm,
            actions: [...eventForm.actions, newAction]
        });
    };

    const handleRemoveAction = (id: string) => {
        setEventForm({
            ...eventForm,
            actions: eventForm.actions.filter(a => a.id !== id)
        });
    };

    const handleActionChange = (id: string, params: any, repeatSettings?: RepeatSettings) => {
        setEventForm({
            ...eventForm,
            actions: eventForm.actions.map(a => a.id === id ? { ...a, params, repeatSettings: repeatSettings || a.repeatSettings } : a)
        });
    };

    const renderActionParams = (action: EventAction) => {
        const { type, params } = action;

        const updateParams = (newParams: any) => {
            handleActionChange(action.id, { ...params, ...newParams });
        };

        switch (type) {
            case 'symptom_info':
            case 'change_patient_data':
                return (
                    <SymptomDataForm
                        data={params as PatientData}
                        onChange={updateParams}
                        overridePatientType={eventForm.classification}
                    />
                );
            case 'apply_symptom':
                return (
                    <SymptomDataForm
                        data={params as any}
                        onChange={updateParams}
                        isTemplateReference
                        overridePatientType={eventForm.classification}
                    />
                );
            case 'play_voice':
                return (
                    <VoiceActionForm
                        params={params as VoiceParams}
                        onChange={updateParams}
                        repeatSettings={action.repeatSettings}
                        onRepeatChange={(settings: RepeatSettings) => handleActionChange(action.id, params, settings)}
                    />
                );
            case 'play_sound':
                return (
                    <SoundActionForm
                        params={params as SoundParams}
                        onChange={updateParams}
                        repeatSettings={action.repeatSettings}
                        onRepeatChange={(settings: RepeatSettings) => handleActionChange(action.id, params, settings)}
                    />
                );
            case 'play_animation':
                return (
                    <ResourceActionForm
                        title="애니메이션"
                        params={params as AnimationParams}
                        onChange={updateParams}
                        repeatSettings={action.repeatSettings}
                        onRepeatChange={(settings: RepeatSettings) => handleActionChange(action.id, params, settings)}
                    />
                );
            case 'change_3d_model':
                return (
                    <ResourceActionForm
                        title="3D 모델"
                        params={params as ModelParams}
                        onChange={updateParams}
                        repeatSettings={action.repeatSettings}
                        onRepeatChange={(settings: RepeatSettings) => handleActionChange(action.id, params, settings)}
                    />
                );
            case 'change_texture':
                return <TextureActionForm params={params as TextureParams} onChange={updateParams} />;
            case 'item_action':
                return <ItemActionForm params={params as ItemParams} onChange={updateParams} />;
            case 'emr_update':
                return (
                    <div className="space-y-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400">
                        <div className="p-5 pb-0">
                            <h5 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                EMR 업데이트 설정
                            </h5>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">치료/처방 정보 (Order)</label>
                                    <Input
                                        multiline
                                        value={params.order || ''}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateParams({ order: e.target.value })}
                                        rows={2}
                                        placeholder="적용할 처방 내용을 입력하세요"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">간호 기록 (Nursing Note)</label>
                                    <Input
                                        multiline
                                        value={params.nursingNote || ''}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateParams({ nursingNote: e.target.value })}
                                        rows={2}
                                        placeholder="기록될 간호 노트를 입력하세요"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="pb-5"></div>
                    </div>
                );
            case 'quiz':
                const updateOption = (idx: number, val: string) => {
                    const newOptions = [...(params.options || ['', ''])];
                    newOptions[idx] = val;
                    updateParams({ options: newOptions });
                };
                return (
                    <div className="space-y-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400">
                        <div className="p-5 pb-0">
                            <h5 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                퀴즈 설정
                            </h5>
                            <div className="space-y-4 text-left">
                                <Input
                                    label="질문"
                                    value={params.question || ''}
                                    onChange={(e) => updateParams({ question: e.target.value })}
                                    placeholder="질문을 입력하세요"
                                />
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600 ml-0.5">보기 및 정답 설정</label>
                                    {(params.options || ['', '']).map((opt: string, i: number) => (
                                        <div key={i} className="flex gap-3 items-center">
                                            <input
                                                type="radio"
                                                checked={params.answer === i}
                                                onChange={() => updateParams({ answer: i })}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <Input
                                                value={opt}
                                                onChange={(e) => updateOption(i, e.target.value)}
                                                placeholder={`보기 ${i + 1}`}
                                                className="h-9"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="pb-5"></div>
                    </div>
                );
            case 'send_message':
                return (
                    <div className="space-y-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400">
                        <div className="p-5 pb-0">
                            <h5 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                메시지 설정
                            </h5>
                            <Input
                                label="메시지 내용"
                                value={params.message || ''}
                                onChange={(e) => updateParams({ message: e.target.value })}
                                placeholder="전달할 메시지를 입력하세요"
                            />
                        </div>
                        <div className="pb-5"></div>
                    </div>
                );
            case 'play_particle':
                return (
                    <div className="space-y-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400">
                        <div className="p-5 pb-0">
                            <h5 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                파티클 설정
                            </h5>
                            <div className="grid grid-cols-2 gap-6">
                                <Input
                                    label="파티클 ID"
                                    value={params.particleId || ''}
                                    onChange={(e) => updateParams({ particleId: e.target.value })}
                                    placeholder="fx_01"
                                    className="h-9"
                                />
                                <Input
                                    label="실행 스팟"
                                    value={params.spotId || ''}
                                    onChange={(e) => updateParams({ spotId: e.target.value })}
                                    placeholder="sp001"
                                    className="h-9"
                                />
                            </div>
                        </div>
                        <div className="pb-5"></div>
                    </div>
                );
            default:
                return (
                    <div className="bg-white p-3 rounded border border-gray-100 text-xs text-gray-400 italic">
                        추가 파라미터가 없는 기능입니다.
                    </div>
                );
        }
    };

    const handleSave = () => {
        const newEvent: AssetEvent = {
            id: initialData?.id || generateEventId(),
            key: eventForm.key,
            displayName: eventForm.displayName,
            description: eventForm.description,
            trigger: eventForm.trigger,
            category: eventForm.category,
            roleTypes: eventForm.roleTypes as any,
            resources: eventForm.resources,
            parameters: eventForm.parameters,
            notes: eventForm.notes || undefined,
            target: eventForm.target.length > 0 ? eventForm.target : undefined,
            classification: eventForm.classification || undefined,
            createdDate: initialData?.createdDate || new Date().toISOString().split('T')[0],
            updatedDate: new Date().toISOString().split('T')[0],
            actions: eventForm.actions,
            createdBy: initialData?.createdBy || user?.name || 'unknown',
            status: initialData?.status || 'active',
            usageCount: initialData?.usageCount || 0,
            source: 'asset'
        } as AssetEvent;

        const validation = validateEvent(newEvent);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        onSave(newEvent);
        setErrors([]);
    };

    const availableRoles = ['Nurse', 'Doctor', 'Patient', 'Caregiver', 'Paramedic'];

    const filteredAssets = assets.filter(asset => {
        if (eventForm.category === 'patient_event') {
            return asset.type === '캐릭터' && asset.category === '환자';
        }
        if (eventForm.category === 'npc_event') {
            return asset.type === '캐릭터' && asset.category === '의료인력';
        }
        if (eventForm.category === 'player_event') {
            return asset.type === '캐릭터' && asset.category === 'Player';
        }
        return false;
    });

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                    <p className="font-semibold text-red-800 mb-1">입력 항목을 확인해주세요</p>
                    <ul className="list-disc list-inside text-sm text-red-700">
                        {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                    </ul>
                </div>
            )}

            {/* Basic Info Section */}
            <div className="flex items-center gap-4">
                <div className="w-[180px]">
                    <Select
                        value={eventForm.category}
                        onValueChange={(value) => setEventForm({ ...eventForm, category: value as EventCategory })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="이벤트 분류 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">이벤트 분류 선택</SelectItem>
                            <SelectItem value="patient_event">환자이벤트</SelectItem>
                            <SelectItem value="npc_event">NPC 이벤트</SelectItem>
                            <SelectItem value="emr_update">EMR 업데이트</SelectItem>
                            <SelectItem value="player_event">플레이어 이벤트</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {(eventForm.category === 'patient_event' || eventForm.category === 'npc_event' || eventForm.category === 'player_event') && (
                    <div className="w-[220px]">
                        <Select
                            value={eventForm.classification}
                            onValueChange={(value) => setEventForm({ ...eventForm, classification: value, target: [value] })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {eventForm.category === 'patient_event' ? (
                                    PATIENT_CLASSIFICATIONS.map(pc => (
                                        <SelectItem key={pc.value} value={pc.value}>
                                            {pc.label}
                                        </SelectItem>
                                    ))
                                ) : eventForm.category === 'npc_event' ? (
                                    NPC_CLASSIFICATIONS.map(nc => (
                                        <SelectItem key={nc.value} value={nc.value}>
                                            {nc.label}
                                        </SelectItem>
                                    ))
                                ) : (
                                    filteredAssets.map(asset => (
                                        <SelectItem key={asset.key} value={asset.key}>
                                            {asset.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="w-[220px]">
                    <Input
                        value={eventForm.key}
                        onChange={(e) => setEventForm({ ...eventForm, key: e.target.value })}
                        placeholder="이벤트 key"
                    />
                </div>

                <div className="w-[300px]">
                    <Input
                        value={eventForm.displayName}
                        onChange={(e) => setEventForm({ ...eventForm, displayName: e.target.value })}
                        placeholder="이벤트명/증상명"
                    />
                </div>

                <div className="w-[240px]">
                    <Select
                        onValueChange={(value) => {
                            if (value) {
                                handleAddAction(value as ActionType);
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="+ 기능 추가하기" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>상태/정보</SelectLabel>
                                <SelectItem value="change_patient_data">환자 상태 변화</SelectItem>
                                <SelectItem value="apply_symptom">환자 증상 템플릿 적용</SelectItem>
                                <SelectItem value="emr_update">EMR 업데이트</SelectItem>
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                                <SelectLabel>미디어/연출</SelectLabel>
                                <SelectItem value="play_voice">음성 재생</SelectItem>
                                <SelectItem value="play_sound">사운드 재생</SelectItem>
                                <SelectItem value="play_animation">애니메이션 재생</SelectItem>
                                <SelectItem value="play_particle">파티클 효과</SelectItem>
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                                <SelectLabel>모델/착용</SelectLabel>
                                <SelectItem value="item_action">아이템 착용/제거</SelectItem>
                                <SelectItem value="change_3d_model">3D 모델 변경</SelectItem>
                                <SelectItem value="change_texture">텍스처 변경</SelectItem>
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                                <SelectLabel>상호작용</SelectLabel>
                                <SelectItem value="quiz">퀴즈</SelectItem>
                                <SelectItem value="send_message">메시지 전송</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

            </div>

            {/* Actions Section */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    {eventForm.actions.map((action, idx) => (
                        <div key={action.id} className="relative bg-white border border-gray-200 rounded-2xl group animate-in duration-200">
                            <div className="flex items-center justify-between p-5 pb-0 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase tracking-wider">
                                        Action {idx + 1}
                                    </span>
                                    <h4 className="font-bold text-gray-800 capitalize">{action.type.replace(/_/g, ' ')}</h4>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAction(action.id)}
                                    className="p-2 text-blue-400 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="bg-white/50 rounded-xl">
                                {renderActionParams(action)}
                            </div>

                        </div>
                    ))}
                    {eventForm.actions.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                            <p className="text-gray-400 text-sm">추가된 기능이 없습니다. 우측 상단에서 기능을 추가하세요.</p>
                        </div>
                    )}
                </div>
            </div>


            {/* Sticky Bottom Actions */}
            <div className="sticky bottom-4 flex justify-end gap-3 px-6 py-4 bg-white/80 z-10">
                <Button variant="outline" className="px-6 py-2.5" onClick={onCancel}>취소</Button>
                <Button variant="primary" className="px-6 py-2.5" onClick={handleSave}>
                    {isEditing ? '변경사항 저장' : '이벤트 생성'}
                </Button>
            </div>
        </div>
    );
}
