import { TaskType, TriggerType, StorageItem, StorageSection } from '../types/index';
import { Activity, Baby, Bed, Thermometer, Truck, Wind, Zap, BriefcaseMedical, ClipboardList, Archive, Droplet, Filter, ScanLine, HeartPulse } from 'lucide-react';
import React from 'react';

// --- Presets Data ---
export const PRESET_ROLES = [
    { name: '응급의학과 의사', type: 'Doctor' as const },
    { name: '외상 외과의 (Trauma Surgeon)', type: 'Doctor' as const },
    { name: '마취과 의사', type: 'Doctor' as const },
    { name: '분류 간호사 (Triage Nurse)', type: 'Nurse' as const },
    { name: '책임 간호사 (Charge Nurse)', type: 'Nurse' as const },
    { name: '중환자 간호사 (ICU Nurse)', type: 'Nurse' as const },
    { name: '응급구조사 (Paramedic)', type: 'Technician' as const },
    { name: '호흡 치료사 (RT)', type: 'Technician' as const },
    { name: '영상의학 기사', type: 'Technician' as const },
    { name: '보호자', type: 'Family' as const },
    { name: '표준화 환자', type: 'Patient' as const },
];

export const PRESET_EVENTS = [
    { title: '중등도 고열', description: '체온 38.0-39.0°C.', triggerType: 'immediate' as TriggerType, roleTypes: ['Nurse', 'Doctor'], category: 'symptom' },
    { title: '중등도 두통', description: '통증 척도 4-6/10.', triggerType: 'immediate' as TriggerType, roleTypes: ['Nurse', 'Patient'], category: 'symptom' },
    { title: '환자 입원', description: '환자가 응급실/병동에 도착함.', triggerType: 'immediate' as TriggerType, roleTypes: ['Nurse', 'Technician'], category: 'admin' },
    { title: '심정지', description: '환자 반응 없고 맥박 없음.', triggerType: 'immediate' as TriggerType, roleTypes: ['Doctor', 'Nurse', 'Paramedic'], category: 'critical' },
    { title: '호흡 곤란', description: '환자가 심한 호흡 곤란 증세를 보임.', triggerType: 'immediate' as TriggerType, roleTypes: ['Doctor', 'Nurse', 'Technician'], category: 'symptom' },
    { title: '발작', description: '환자가 전신 강직 간대 발작을 시작함.', triggerType: 'immediate' as TriggerType, roleTypes: ['Nurse', 'Doctor', 'Family'], category: 'critical' },
    { title: '정맥로 확보됨', description: '말초 정맥로 확보 성공.', triggerType: 'event' as TriggerType, roleTypes: ['Nurse', 'Paramedic'], category: 'clinical' },
    { title: '검사 결과 나옴', description: '혈액 검사 결과가 검사실에서 도착함.', triggerType: 'time' as TriggerType, triggerValue: '300', roleTypes: ['Technician', 'Nurse', 'Doctor'], category: 'clinical' },
    { title: '투약 오류', description: '잘못된 용량 또는 약물이 투여됨.', triggerType: 'immediate' as TriggerType, roleTypes: ['Nurse', 'Doctor'], category: 'critical' },
    { title: '제세동', description: '환자에게 전기 충격 전달됨.', triggerType: 'event' as TriggerType, roleTypes: ['Doctor', 'Nurse', 'Paramedic'], category: 'clinical' },
    { title: '근무 교대 인계', description: '다음 팀에게 환자 인계.', triggerType: 'time' as TriggerType, triggerValue: '600', roleTypes: ['Nurse', 'Doctor'], category: 'admin' },
    { title: '보호자 불안 호소', description: '보호자가 상태 설명을 요구하거나 불안해함.', triggerType: 'immediate' as TriggerType, roleTypes: ['Family', 'Nurse'], category: 'admin' },
];

export interface TaskCategory {
    id: string;
    title: string;
    items: { content: string; type: TaskType }[];
}

export const PRESET_TASKS: TaskCategory[] = [
    {
        id: 'assessment',
        title: '평가 및 모니터링',
        items: [
            { content: '활력 징후 확인', type: 'todo' },
            { content: '폐음 청진', type: 'todo' },
            { content: '심음 청진', type: 'todo' },
            { content: '심전도(EKG) 모니터링 부착', type: 'todo' },
            { content: '산소 포화도(SpO2) 측정', type: 'todo' },
            { content: '의식 수준(GCS) 사정', type: 'todo' },
            { content: '동공 반사 확인', type: 'todo' },
            { content: '혈당(BST) 측정', type: 'todo' },
        ]
    },
    {
        id: 'airway',
        title: '기도 및 호흡 (Airway/Breathing)',
        items: [
            { content: '산소 투여 (비강 캐ラ)', type: 'todo' },
            { content: '산소 투여 (안면 마스크)', type: 'todo' },
            { content: '백-밸브-마스크(BVM) 환기', type: 'todo' },
            { content: '구인두 기도기(OPA) 삽입', type: 'todo' },
            { content: '기관내 삽관 시행', type: 'decision' },
            { content: 'EtCO2 모니터링', type: 'todo' },
            { content: '흡인(Suction) 시행', type: 'todo' },
        ]
    },
    {
        id: 'circulation',
        title: '순환 (Circulation)',
        items: [
            { content: '정맥로 확보 (IV Access)', type: 'todo' },
            { content: '수액 투여 (NS 0.9%)', type: 'todo' },
            { content: '수액 투여 (Hartmann Solution)', type: 'todo' },
            { content: '심폐소생술 시행 (2분)', type: 'todo' },
            { content: '제세동 패드 부착', type: 'todo' },
            { content: '맥박 확인', type: 'todo' },
        ]
    },
    {
        id: 'medication',
        title: '약물 투여 (Medication)',
        items: [
            { content: '에피네프린 1mg 투여', type: 'decision' },
            { content: '아미오다론 300mg 투여', type: 'decision' },
            { content: '아트로핀 0.5mg 투여', type: 'decision' },
            { content: '아데노신 6mg 투여', type: 'decision' },
            { content: '진통제 투여', type: 'decision' },
        ]
    },
    {
        id: 'diagnostic',
        title: '검사 (Diagnostic)',
        items: [
            { content: '흉부 X-ray 처방', type: 'todo' },
            { content: '12-lead EKG 촬영', type: 'todo' },
            { content: '동맥혈 가스 분석(ABGA)', type: 'todo' },
            { content: '혈액 검사(Lab) 시행', type: 'todo' },
            { content: 'Portable X-ray 요청', type: 'todo' },
        ]
    },
    {
        id: 'caution',
        title: '주의사항 및 금기 (Penalty)',
        items: [
            { content: '가슴 압박 중단하지 말 것', type: 'must-not' },
            { content: '과환기 시키지 말 것', type: 'must-not' },
            { content: '불필요한 환자 이송 지연 금지', type: 'must-not' },
            { content: '기도 확보 전 억제대 사용 금지', type: 'must-not' },
        ]
    }
];

export const MAP_OPTIONS = [
    { id: 'er_trauma', name: '응급실 외상 처치실', icon: React.createElement(Activity, { size: 24 }), image: '/assets/images/Items/maps/er_empty.png' },
    { id: 'peds_ward', name: '소아 병동', icon: React.createElement(Baby, { size: 24 }), image: '/assets/images/Items/maps/pediatrics_empty.png' },
    { id: 'single_room', name: '1인실 병실', icon: React.createElement(Bed, { size: 24 }), image: '/assets/images/Items/maps/Single bed ward 1.png' },
    { id: 'delivery', name: '분만실', icon: React.createElement(Thermometer, { size: 24 }), image: '/assets/images/Items/maps/delivery_empty.png' },
    { id: 'ambulance', name: '구급차 내부', icon: React.createElement(Truck, { size: 24 }), image: null },
];

export const ITEM_OPTIONS = [
    { id: 'monitor', name: '환자 감시 장치', icon: React.createElement(Activity, { size: 16 }) },
    { id: 'ventilator', name: '인공호흡기', icon: React.createElement(Wind, { size: 16 }) },
    { id: 'defib', name: '제세동기', icon: React.createElement(Zap, { size: 16 }) },
    { id: 'crash_cart', name: '응급 카트', icon: React.createElement(BriefcaseMedical, { size: 16 }), isStorage: true },
    { id: 'nursing_cart', name: '간호 카트', icon: React.createElement(ClipboardList, { size: 16 }), isStorage: true },
    { id: 'storage', name: '비품 보관함', icon: React.createElement(Archive, { size: 16 }), isStorage: true },
    { id: 'iv_pump', name: '수액 주입기', icon: React.createElement(Droplet, { size: 16 }) },
    { id: 'suction', name: '흡인기', icon: React.createElement(Filter, { size: 16 }) },
    { id: 'ultrasound', name: '초음파', icon: React.createElement(ScanLine, { size: 16 }) },
    { id: 'ecmo', name: 'ECMO', icon: React.createElement(HeartPulse, { size: 16 }) },
];

// --- Supply Database ---
export const INITIAL_SUPPLY_DATABASE: StorageItem[] = [
    { id: 'spinal_needle', name: '척수 바늘 (Spinal Needle)', category: 'supply', width: 20, height: 160, imageUrl: 'https://placehold.co/20x160/cccccc/ffffff?text=Needle' },
    { id: 'iv_set', name: '수액 세트', category: 'supply', width: 100, height: 100, imageUrl: 'https://placehold.co/100x100/e0e7ff/000000?text=IV+Set' },
    { id: 'sample_cup', name: '검체 용기', category: 'supply', width: 60, height: 70, imageUrl: 'https://placehold.co/60x70/bfdbfe/000000?text=Cup' },
    { id: 'pain_tool', name: '통증 사정 도구', category: 'equipment', width: 120, height: 160, imageUrl: 'https://placehold.co/120x160/ffffff/000000?text=Chart' },
    { id: 'syringe_safety', name: '안전 주사기', category: 'supply', width: 25, height: 110, imageUrl: 'https://placehold.co/25x110/fca5a5/000000?text=Syr' },
    { id: 'epi', name: '에피네프린 1:1000 앰플', category: 'medication', width: 20, height: 50 },
    { id: 'amio', name: '아미오다론 150mg 바이알', category: 'medication', width: 30, height: 50 },
    { id: 'adenosine', name: '아데노신 6mg 바이알', category: 'medication', width: 25, height: 40 },
    { id: 'saline', name: '생리식염수 1000ml 백', category: 'medication', width: 80, height: 140 },
    { id: 'aspirin', name: '아스피린 81mg 정', category: 'medication', width: 40, height: 40 },
    { id: 'nitro', name: '니트로글리세린 스프레이', category: 'medication', width: 30, height: 70 },
    { id: 'gloves_latex', name: '라텍스 장갑 (박스)', category: 'supply', width: 120, height: 80 },
    { id: 'gloves_nitrile', name: '니트릴 장갑 (박스)', category: 'supply', width: 120, height: 80 },
    { id: 'sanitizer', name: '손 소독제', category: 'supply', width: 40, height: 90 },
    { id: 'iv_start', name: 'IV 시작 키트', category: 'supply', width: 80, height: 120 },
    { id: 'gauze', name: '멸균 거즈 4x4', category: 'supply', width: 60, height: 60 },
    { id: 'tape', name: '의료용 테이프', category: 'supply', width: 50, height: 50 },
    { id: 'syringe_10', name: '10cc 주사기', category: 'supply', width: 30, height: 100 },
    { id: 'needle_18', name: '18G 바늘', category: 'supply', width: 15, height: 50 },
    { id: 'tube_et', name: '기관 튜브 7.5', category: 'supply', width: 180, height: 30 },
    { id: 'laryngoscope', name: '후두경 블레이드 3', category: 'equipment', width: 140, height: 40 },
];

export const STORAGE_LAYOUTS: Record<string, StorageSection[]> = {
    'nursing_cart': [
        { id: 'top', name: '상단 선반', items: [], backgroundImageUrl: '/assets/images/Items/storages/Type=CartTop.png' },
        { id: 'd1', name: '서랍 1 (약물)', items: [], backgroundImageUrl: '/assets/images/Items/storages/Type=Drawer.png' },
        { id: 'd2', name: '서랍 2 (IV/검사)', items: [], backgroundImageUrl: '/assets/images/Items/storages/Type=Drawer.png' },
        { id: 'd3', name: '서랍 3 (물품)', items: [], backgroundImageUrl: '/assets/images/Items/storages/Type=Drawer.png' },
        { id: 'side', name: '측면 통', items: [], backgroundImageUrl: '/assets/images/Items/storages/EmergencyCart_Side 2.png' },
    ],
    'crash_cart': [
        { id: 'top', name: '상단 (모니터/제세동기)', items: [], backgroundImageUrl: '/assets/images/Items/storages/Type=CartTop.png' },
        { id: 'd1', name: '서랍 1 (기도)', items: [], backgroundImageUrl: '/assets/images/Items/storages/Type=Drawer.png' },
        { id: 'd2', name: '서랍 2 (호흡)', items: [], backgroundImageUrl: '/assets/images/Items/storages/Type=Drawer.png' },
        { id: 'd3', name: '서랍 3 (순환)', items: [], backgroundImageUrl: '/assets/images/Items/storages/Type=Drawer.png' },
        { id: 'd4', name: '서랍 4 (약물)', items: [], backgroundImageUrl: '/assets/images/Items/storages/Type=Drawer.png' },
    ],
    'storage': [
        { id: 'shelf1', name: '선반 A (수액)', items: [], backgroundImageUrl: '/assets/images/Items/storages/Type=Tray.png' },
        { id: 'shelf2', name: '선반 B (린넨)', items: [], backgroundImageUrl: '/assets/images/Items/storages/Type=Tray.png' },
        { id: 'shelf3', name: '선반 C (키트)', items: [], backgroundImageUrl: '/assets/images/Items/storages/Type=Tray.png' },
        { id: 'cabinet', name: '잠금 캐비닛', items: [], backgroundImageUrl: '/assets/images/Items/storages/Type=Drawer.png' },
    ]
};
