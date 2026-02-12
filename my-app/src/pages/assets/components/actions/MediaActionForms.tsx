import React, { useState, useRef } from 'react';
import { Play, Square, Volume2 } from 'lucide-react';
import {
    type VoiceParams,
    type SoundParams,
    type AnimationParams,
    type ModelParams,
    type TextureParams,
    type RepeatType,
    type RepeatSettings
} from '../../../../data/assetEvents';
import { Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button } from '@/components/shared/ui';
import { spots, type Spot } from '../../../../data/spots';
import { cn } from '../../../../utils/studioUtils';
import { MAP_OPTIONS } from '../../../../data/studioPresets';

// Voice Action Form
interface VoiceActionFormProps {
    params: VoiceParams;
    onChange: (params: VoiceParams) => void;
    repeatSettings?: RepeatSettings;
    onRepeatChange: (settings: RepeatSettings) => void;
}

export function RepeatSettingsForm({ settings, onChange, hideType = false, inline = false }: { settings: RepeatSettings, onChange: (settings: RepeatSettings) => void, hideType?: boolean, inline?: boolean }) {
    const updateRepeat = (field: keyof RepeatSettings, value: string | number) => {
        onChange({ ...settings, [field]: value });
    };

    if (inline) {
        return (
            <div className="flex items-center gap-3">
                {!hideType && (
                    <div className="w-[120px]">
                        <Select
                            label="반복 타입"
                            labelPlacement="hidden"
                            value={settings.type || 'None'}
                            onValueChange={(value) => onChange({ ...settings, type: value as RepeatType })}
                        >
                            <SelectTrigger className={`h-10 px-3 border rounded-xl text-sm font-bold transition-all ${settings.type && settings.type !== 'None' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="None">반복안함</SelectItem>
                                <SelectItem value="Periodic">주기적으로</SelectItem>
                                <SelectItem value="Random">랜덤하게</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {settings.type === 'Periodic' && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <Input
                            type="number"
                            value={settings.interval || ''}
                            onChange={(e) => updateRepeat('interval', parseInt(e.target.value) || 0)}
                            className="h-10 w-[80px] text-sm text-center font-bold"
                            placeholder="초"
                        />
                        <span className="text-xs font-bold text-gray-400">SEC</span>
                    </div>
                )}

                {settings.type === 'Random' && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <Input
                            type="number"
                            value={settings.intervalMin || ''}
                            onChange={(e) => updateRepeat('intervalMin', parseInt(e.target.value) || 0)}
                            className="h-10 w-[70px] text-sm text-center font-bold"
                            placeholder="Min"
                        />
                        <span className="text-gray-300">~</span>
                        <Input
                            type="number"
                            value={settings.intervalMax || ''}
                            onChange={(e) => updateRepeat('intervalMax', parseInt(e.target.value) || 0)}
                            className="h-10 w-[70px] text-sm text-center font-bold"
                            placeholder="Max"
                        />
                        <span className="text-xs font-bold text-gray-400">SEC</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 ${hideType ? 'border-none mt-0 pt-0' : ''}`}>
            {!hideType && (
                <div className="w-[140px]">
                    <Select
                        label="반복 타입"
                        value={settings.type || 'None'}
                        onValueChange={(value) => onChange({ ...settings, type: value as RepeatType })}
                    >
                        <SelectTrigger className={`h-9 px-3 border rounded-xl text-sm font-bold transition-all ${settings.type && settings.type !== 'None' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                            <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="None">반복안함</SelectItem>
                            <SelectItem value="Periodic">주기적으로</SelectItem>
                            <SelectItem value="Random">랜덤하게</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {settings.type === 'Periodic' && (
                <div className="w-[120px] animate-in fade-in slide-in-from-left-2 duration-300">
                    <Input
                        type="number"
                        value={settings.interval || ''}
                        onChange={(e) => updateRepeat('interval', parseInt(e.target.value) || 0)}
                        className="h-9 text-sm"
                        placeholder="주기(초)"
                    />
                </div>
            )}

            {settings.type === 'Random' && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="w-[100px]">
                        <Input
                            type="number"
                            value={settings.intervalMin || ''}
                            onChange={(e) => updateRepeat('intervalMin', parseInt(e.target.value) || 0)}
                            className="h-9 text-sm"
                            placeholder="최소(초)"
                        />
                    </div>
                    <div className="w-[100px]">
                        <Input
                            type="number"
                            value={settings.intervalMax || ''}
                            onChange={(e) => updateRepeat('intervalMax', parseInt(e.target.value) || 0)}
                            className="h-9 text-sm"
                            placeholder="최대(초)"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export function VoiceActionForm({ params, onChange, repeatSettings, onRepeatChange }: VoiceActionFormProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const updateField = (field: keyof VoiceParams, value: any) => {
        onChange({ ...params, [field]: value });
    };

    const handleVoiceTest = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        if (!params.text) return;

        const utterance = new SpeechSynthesisUtterance(params.text);
        utterance.volume = params.volume ?? 1.0;
        utterance.rate = params.speed ?? 1.0;

        // Voice selection logic could be improved, but for now we use default
        // In the future, we could filter available voices based on params.voice

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        utteranceRef.current = utterance;
        setIsPlaying(true);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="space-y-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-10 py-8">
                <div className="grid grid-cols-12 gap-8 items-start">
                    {/* Column 1: Text Input */}
                    <div className="col-span-4">
                        <Input
                            label="대사 입력"
                            multiline
                            value={params.text || ''}
                            onChange={(e) => updateField('text', e.target.value)}
                            rows={5}
                            placeholder="재생할 대사를 입력하세요"
                        />
                    </div>

                    {/* Column 2: Voice & Tone */}
                    <div className="col-span-3 space-y-6">
                        <Select
                            label="목소리"
                            value={params.voice || 'natural'}
                            onValueChange={(value) => updateField('voice', value)}
                        >
                            <SelectTrigger className="h-10 text-sm font-medium bg-white border-gray-200 shadow-sm">
                                <SelectValue placeholder="Voice" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="natural">Natural</SelectItem>
                                <SelectItem value="robotic">Robotic</SelectItem>
                                <SelectItem value="male_01">Male 01</SelectItem>
                                <SelectItem value="female_01">Female 01</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            label="톤 (Tone)"
                            value={params.tone || 'normal'}
                            onValueChange={(value) => updateField('tone', value)}
                        >
                            <SelectTrigger className="h-10 text-sm font-medium bg-white border-gray-200 shadow-sm">
                                <SelectValue placeholder="Tone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="warm">Warm</SelectItem>
                                <SelectItem value="cool">Cool</SelectItem>
                                <SelectItem value="bright">Bright</SelectItem>
                                <SelectItem value="calm">Calm</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Column 3: Controls & Test */}
                    <div className="col-span-5 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 ml-0.5 flex items-center justify-between">
                                    <span>재생 크기 (Volume)</span>
                                    <span className="text-blue-600 font-bold tabular-nums">{(params.volume || 1.0).toFixed(1)}</span>
                                </label>
                                <div className="h-10 flex items-center bg-gray-50/50 px-3 rounded-xl border border-gray-100">
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={params.volume || 1.0}
                                        onChange={(e) => updateField('volume', parseFloat(e.target.value))}
                                        className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 ml-0.5 flex items-center justify-between">
                                    <span>재생 속도 (Speed)</span>
                                    <span className="text-blue-600 font-bold tabular-nums">{(params.speed || 1.0).toFixed(1)}</span>
                                </label>
                                <div className="h-10 flex items-center bg-gray-50/50 px-3 rounded-xl border border-gray-100">
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2.0"
                                        step="0.1"
                                        value={params.speed || 1.0}
                                        onChange={(e) => updateField('speed', parseFloat(e.target.value))}
                                        className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {repeatSettings && onRepeatChange && (
                            <RepeatSettingsForm
                                settings={repeatSettings}
                                onChange={onRepeatChange}
                                inline={true}
                            />
                        )}

                        <div className="pt-2">
                            <Button
                                variant="dark"
                                onClick={handleVoiceTest}
                                className={`w-[250px] gap-3 rounded-xl transition-all shadow-sm ${isPlaying ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 active:scale-[0.98]' : 'bg-blue-600 border-blue-600 text-secondary-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-100'}`}
                                disabled={!params.text}
                            >
                                {isPlaying ? <Square size={18} className="fill-current" /> : <Play size={18} className="fill-current" />}
                                <span className="text-sm font-bold">{isPlaying ? '음성 출력 중지' : '음성 보이스 테스트'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sound Action Form
interface SoundActionFormProps {
    params: SoundParams;
    onChange: (params: SoundParams) => void;
    repeatSettings?: RepeatSettings;
    onRepeatChange: (settings: RepeatSettings) => void;
}

const ENVIRONMENT_SOUND_PRESETS = [
    { name: '앰비언트 (병원)', url: '/assets/sounds/ambient_hospital.mp3' },
    { name: '사이렌', url: '/assets/sounds/siren.mp3' },
    { name: '모니터 비프음', url: '/assets/sounds/monitor_beep.mp3' },
    { name: '군중 소음', url: '/assets/sounds/crowd.mp3' },
];

export function SoundActionForm({ params, onChange, repeatSettings, onRepeatChange }: SoundActionFormProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDirectInput, setIsDirectInput] = useState(!params.name && !params.url);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const updateField = (field: keyof SoundParams, value: any) => {
        onChange({ ...params, [field]: value });
    };

    const handleSoundTest = () => {
        if (isPlaying) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setIsPlaying(false);
            return;
        }

        if (!params.url) return;

        const audio = new Audio(params.url);
        audioRef.current = audio;
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        audio.play().catch(() => setIsPlaying(false));
    };

    // 필터링된 데이터 (맵 또는 스팟)
    const displayItems = params.category === '환경'
        ? MAP_OPTIONS.map(m => ({ key: m.id, name: m.name, sub: '맵' }))
        : spots.filter(spot => {
            if (params.category === '환자-청진음' || params.category === '환자-호흡음') {
                return spot.type === '환자' && (spot.category === '흉부' || spot.category === '복부');
            }
            return spot.type === '장비' || spot.type === '물품';
        }).map(s => ({ key: s.key, name: s.name, sub: s.category }));

    const targetIds = params.targetIds || [];
    const isAllSelected = displayItems.length > 0 && targetIds.length === displayItems.length;

    const toggleTarget = (id: string) => {
        const newTargets = targetIds.includes(id)
            ? targetIds.filter(t => t !== id)
            : [...targetIds, id];
        updateField('targetIds', newTargets);
    };

    const toggleSelectAll = () => {
        if (isAllSelected) {
            updateField('targetIds', []);
        } else {
            updateField('targetIds', displayItems.map(i => i.key));
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6">
                <div className="grid grid-cols-12 gap-8 items-start">
                    {/* Column 1: Configuration */}
                    <div className="col-span-4 space-y-6">
                        <Select
                            label="사운드 분류"
                            value={params.category || ''}
                            onValueChange={(value) => {
                                updateField('category', value);
                                updateField('targetIds', []); // 분류 변경 시 대상 초기화
                            }}
                        >
                            <SelectTrigger className="h-10 text-sm font-medium bg-white border-gray-200 shadow-sm">
                                <SelectValue placeholder="분류 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="환경">환경</SelectItem>
                                <SelectItem value="의료기기">의료기기</SelectItem>
                                <SelectItem value="환자-청진음">환자-청진음</SelectItem>
                                <SelectItem value="환자-호흡음">환자-호흡음</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700 ml-0.5">재생 방식</label>
                            <div className="flex gap-4 p-1.5 bg-gray-50/50 rounded-xl border border-gray-100">
                                <button
                                    onClick={() => updateField('triggerType', 'auto')}
                                    className={cn(
                                        "flex-1 h-9 rounded-lg text-sm font-bold transition-all",
                                        params.triggerType === 'auto'
                                            ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                    )}
                                >
                                    자동재생
                                </button>
                                <button
                                    onClick={() => updateField('triggerType', 'spot_click')}
                                    className={cn(
                                        "flex-1 h-9 rounded-lg text-sm font-bold transition-all",
                                        params.triggerType === 'spot_click'
                                            ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                    )}
                                >
                                    지점클릭
                                </button>
                            </div>
                        </div>

                        {repeatSettings && onRepeatChange && params.triggerType === 'auto' && (
                            <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                                <RepeatSettingsForm
                                    settings={repeatSettings}
                                    onChange={onRepeatChange}
                                    inline={true}
                                />
                            </div>
                        )}
                    </div>

                    {/* Column 2: Location (Maps or Spots) */}
                    <div className="col-span-4 space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700 ml-0.5">
                                    {params.category === '환경' ? '재생 맵 선택' : '재생 지점 선택'}
                                </label>
                                {displayItems.length > 0 && (
                                    <button
                                        onClick={toggleSelectAll}
                                        className={cn(
                                            "text-xs font-bold px-2 py-1 rounded-md transition-all",
                                            isAllSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        )}
                                    >
                                        전체 선택
                                    </button>
                                )}
                            </div>
                            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-2 min-h-[160px] max-h-[280px] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 gap-1">
                                    {displayItems.length > 0 ? (
                                        displayItems.map(item => (
                                            <button
                                                key={item.key}
                                                onClick={() => toggleTarget(item.key)}
                                                className={cn(
                                                    "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all",
                                                    targetIds.includes(item.key)
                                                        ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-100 scale-[1.01]"
                                                        : "text-gray-600 hover:bg-white hover:text-blue-600 border border-transparent hover:border-blue-100"
                                                )}
                                            >
                                                <span>{item.name}</span>
                                                <span className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded-full",
                                                    targetIds.includes(item.key) ? "bg-white/20" : "bg-gray-100"
                                                )}>
                                                    {item.sub}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="h-24 flex items-center justify-center text-gray-400 text-xs italic">
                                            분류를 먼저 선택해주세요
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Resource & Execution */}
                    <div className="col-span-4 space-y-6">
                        <div className="space-y-4">
                            <Select
                                label="사운드 선택"
                                value={isDirectInput ? 'direct' : params.name}
                                onValueChange={(value) => {
                                    if (value === 'direct') {
                                        setIsDirectInput(true);
                                        updateField('name', '');
                                        updateField('url', '');
                                    } else {
                                        setIsDirectInput(false);
                                        const preset = ENVIRONMENT_SOUND_PRESETS.find(p => p.name === value);
                                        if (preset) {
                                            updateField('name', preset.name);
                                            updateField('url', preset.url);
                                        }
                                    }
                                }}
                            >
                                <SelectTrigger className="h-10 text-sm font-medium">
                                    <SelectValue placeholder="사운드 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="direct">직접입력</SelectItem>
                                    {ENVIRONMENT_SOUND_PRESETS.map(p => (
                                        <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {isDirectInput && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Input
                                        value={params.name || ''}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        placeholder="사운드명 입력"
                                    />
                                    <div className="space-y-2">
                                        <div className="flex flex-col gap-3">
                                            <div className="relative group">
                                                <Input
                                                    value={params.url || ''}
                                                    onChange={(e) => updateField('url', e.target.value)}
                                                    className="pr-10"
                                                    placeholder="URL 또는 파일 경로"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                    <Volume2 size={16} />
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                            >
                                                + 파일 업로드
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isDirectInput && params.name && (
                                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Volume2 size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-blue-900">{params.name}</div>
                                            <div className="text-xs text-blue-600 truncate max-w-[180px]">{params.url}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="dark"
                            onClick={handleSoundTest}
                            className={`w-full h-11 gap-3 rounded-xl transition-all shadow-sm ${isPlaying ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' : 'bg-blue-600 border-blue-600 text-secondary-600 hover:bg-blue-700 shadow-blue-100'}`}
                            disabled={!params.url}
                        >
                            {isPlaying ? <Square size={18} className="fill-current" /> : <Play size={18} className="fill-current" />}
                            <span className="text-sm font-bold">{isPlaying ? '정지' : '사운드 재생'}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Common Resource Form (Animation, Model)
interface ResourceActionFormProps {
    params: SoundParams | AnimationParams | ModelParams;
    onChange: (params: any) => void;
    title: string;
    showTrigger?: boolean;
    repeatSettings?: RepeatSettings;
    onRepeatChange?: (settings: RepeatSettings) => void;
}

export function ResourceActionForm({ params, onChange, title, showTrigger = false, repeatSettings, onRepeatChange }: ResourceActionFormProps) {
    const updateField = (field: string, value: any) => {
        onChange({ ...params, [field]: value });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-5 pb-0">
                <h5 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    {title} 설정
                </h5>
                <div className="grid grid-cols-2 gap-6 text-left">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">{title} 분류</label>
                        <Select
                            value={(params as any).category || ''}
                            onValueChange={(value) => updateField('category', value)}
                        >
                            <SelectTrigger className="h-9 text-sm font-medium">
                                <SelectValue placeholder="분류 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="environment">환경</SelectItem>
                                <SelectItem value="medical">의료기기</SelectItem>
                                <SelectItem value="patient">환자</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">{title} 명</label>
                        <Input
                            type="text"
                            value={(params as any).name || ''}
                            onChange={(e) => updateField('name', e.target.value)}
                            className="h-9 text-sm"
                            placeholder="이름 입력"
                        />
                    </div>

                    {showTrigger && (
                        <div className="col-span-2 space-y-3 pt-2 border-t border-gray-50 mt-2">
                            <label className="block text-sm font-medium text-gray-600 ml-0.5">재생 방식</label>
                            <div className="flex gap-6 items-center h-9 px-1">
                                <label className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors group">
                                    <input
                                        type="radio"
                                        checked={(params as any).triggerType === 'auto'}
                                        onChange={() => updateField('triggerType', 'auto')}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 transition-colors"
                                    /> 자동재생
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors group">
                                    <input
                                        type="radio"
                                        checked={(params as any).triggerType === 'spot_click'}
                                        onChange={() => updateField('triggerType', 'spot_click')}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 transition-colors"
                                    /> 재생위치 설정
                                </label>
                            </div>
                            {(params as any).triggerType === 'spot_click' && (
                                <div className="animate-in fade-in slide-in-from-left-2 duration-200 pt-2">
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">Spot ID</label>
                                    <Input
                                        type="text"
                                        value={(params as any).spotId || ''}
                                        onChange={(e) => updateField('spotId', e.target.value)}
                                        className="h-9 bg-blue-50/30 border-blue-100 focus:ring-blue-500"
                                        placeholder="sp_01"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="col-span-2 border-t border-gray-50 pt-4 mt-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">URL / Path</label>
                        <Input
                            type="text"
                            value={(params as any).url || ''}
                            onChange={(e) => updateField('url', e.target.value)}
                            className="h-9 text-sm"
                            placeholder="https://... 또는 asset_path"
                        />
                    </div>
                </div>

                {repeatSettings && onRepeatChange && (title === '애니메이션' || (title === '사운드' && (params as any).triggerType === 'auto')) && (
                    <RepeatSettingsForm settings={repeatSettings} onChange={onRepeatChange} />
                )}
            </div>
            <div className="pb-5"></div>
        </div>
    );
}

// Texture Action Form
interface TextureActionFormProps {
    params: TextureParams;
    onChange: (params: TextureParams) => void;
}

export function TextureActionForm({ params, onChange }: TextureActionFormProps) {
    const updateField = (field: keyof TextureParams, value: string) => {
        onChange({ ...params, [field]: value });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-5 pb-0">
                <h5 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    텍스처 설정
                </h5>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">텍스처 분류</label>
                        <Select
                            value={params.category || ''}
                            onValueChange={(value) => updateField('category', value)}
                        >
                            <SelectTrigger className="h-9 text-sm font-medium">
                                <SelectValue placeholder="분류 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="skin">피부</SelectItem>
                                <SelectItem value="clothing">의상</SelectItem>
                                <SelectItem value="prop">소품</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">텍스트 명</label>
                        <Input
                            type="text"
                            value={params.name || ''}
                            onChange={(e) => updateField('name', e.target.value)}
                            className="h-9 text-sm"
                            placeholder="이름 입력"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">적용할 스팟 (Spot ID)</label>
                        <Input
                            type="text"
                            value={params.spotId || ''}
                            onChange={(e) => updateField('spotId', e.target.value)}
                            className="h-9 text-sm"
                            placeholder="sp001"
                        />
                    </div>
                    <div className="col-span-2 border-t border-gray-50 pt-4 mt-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-0.5">URL / Path</label>
                        <Input
                            type="text"
                            value={params.url || ''}
                            onChange={(e) => updateField('url', e.target.value)}
                            className="h-9 text-sm"
                            placeholder="URL 또는 경로"
                        />
                    </div>
                </div>
            </div>
            <div className="pb-5"></div>
        </div>
    );
}
