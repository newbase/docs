// ============================================
// Types & Interfaces
// ============================================
export type TriggerType = 'after_time' | 'add_time' | 'npc_spawn' | 'emr_popup' | 'skill_complete_one';
export type FunctionType = 'open_stage' | 'close_stage' | 'in_stage' | 'talk' | 'send_message' | 'remove_dialogue';
export type EventCategory = 'patient_event' | 'npc_event' | 'emr_update' | 'player_event';
export type EventStatus = 'active' | 'inactive';
export type RoleType = 'Nurse' | 'Doctor' | 'Patient' | 'Caregiver';
export type ParameterValueType = 'string' | 'number' | 'boolean' | 'category';
export type ResourceType = 'text' | 'sound' | 'animation' | '3d_model' | 'texture' | '2d_image' | 'particle';
// 분류 (Classification) 타입들
export type PatientClassification =
  | 'Adult_Male' | 'Adult_Female' | 'Elderly_Male' | 'Elderly_Female' | 'Pregnant' | 'Pediatric' | 'Newborn';

export const PATIENT_CLASSIFICATIONS: { value: PatientClassification; label: string }[] = [
  { value: 'Adult_Male', label: '성인남성' },
  { value: 'Adult_Female', label: '성인여성' },
  { value: 'Elderly_Male', label: '노인남성' },
  { value: 'Elderly_Female', label: '노인여성' },
  { value: 'Pregnant', label: '임산부' },
  { value: 'Pediatric', label: '소아' },
  { value: 'Newborn', label: '신생아' },
];

export type NPCClassification =
  | 'Caregiver' | 'Doctor' | 'Nurse' | 'Paramedic';

export const NPC_CLASSIFICATIONS: { value: NPCClassification; label: string }[] = [
  { value: 'Caregiver', label: '보호자' },
  { value: 'Doctor', label: '의사' },
  { value: 'Nurse', label: '간호사' },
  { value: 'Paramedic', label: '응급구조사' },
];

export type PatientType = PatientClassification; // 기존 타입 호환을 위해 유지

// 검사 결과 인터페이스
export interface LabResult {
  key: string;
  name: string;
  specimen?: string; // 검체명
  value: string;
  unit: string;
}
// 영상 검사 결과 인터페이스
export interface ImagingResult {
  key: string;
  type: string;        // 검사항목 (X-ray, CT, MRI, ECG 등)
  location: string;    // 검사부위
  rhythm?: string;     // ECG 리듬 (Type이 ECG일 경우)
  url: string;         // 이미지 URL
  description?: string; // 소견/설명
}

// 시진 결과 인터페이스
export interface InspectionResult {
  key: string;
  type: 'General' | 'Chest' | 'Abdomen' | 'Skin' | 'Extremities';
  location: string;    // Eyes, Heart area, LUQ, Hands 등
  finding: string;     // Jaundice, Respiratory distress, Distention, Cyanosis 등
}

// 청진음 결과 인터페이스
export interface AuscultationResult {
  key: string;
  type: 'Breath' | 'Heart' | 'Bowel';
  location: string;    // RUL, LUL, Mitral Area, RLQ 등
  finding: string;     // Crackles, Murmur, Normal 등
}

// 타진음 결과 인터페이스
export interface PercussionResult {
  key: string;
  type: 'Chest' | 'Abdomen';
  location: string;    // Lung fields, Liver, RLQ 등
  finding: string;     // Resonance, Dullness, Tympany 등
}

// 촉진 결과 인터페이스
export interface PalpationResult {
  key: string;
  type: 'Chest' | 'Abdomen' | 'Extremities' | 'Other';
  location: string;    // Apex, RUQ, McBurney's, Pulse points 등
  finding: string;     // Tenderness, Mass, Thrill, Rebound Tenderness 등
}

// 환자 상태 데이터 확장
export interface PatientData {
  patientType: PatientType;
  symptomName?: string;         // 증상명 (흉통, 호흡곤란 등)
  symptomPattern?: string;      // 증상양상
  severity?: string;            // 중증도
  location?: string;            // 증상위치 (기존 단일값)
  locations?: string[];         // 증상위치 (복수 선택 - assets_Spot.csv key)
  onset?: string;               // 발생시기
  frequency?: string;           // 발생빈도
  precipitatingFactor?: string; // 유발요인
  relievingFactor?: string;     // 완화요인
  duration?: string;            // 지속시간
  chiefComplaint?: string;      // 주호소
  painScale?: number;           // 통증척도 (0-10)
  painScaleTool?: string;       // 통증측정 도구 (NRS, VAS, FPS-R 등)
  auscultationResults?: AuscultationResult[]; // 청진음 결과들
  percussionResults?: PercussionResult[];     // 타진음 결과들
  palpationResults?: PalpationResult[];       // 촉진 결과들
  inspectionResults?: InspectionResult[];     // 시진 결과들
  pittingTest?: string;         // 압흔 테스트
  vitals?: {
    sbp?: number;
    sbp_max?: number;
    dbp?: number;
    dbp_max?: number;
    hr?: number;
    hr_max?: number;
    rr?: number;
    rr_max?: number;
    bt?: number;
    bt_max?: number;
    spo2?: number;
    spo2_max?: number;
    bst?: number;
    bst_max?: number;
    ecg?: string;
  };
  mentalStatus?: {
    gcs_score?: string;
    gcs_status?: string;
    orientation?: string;
  };
  pupilResponse?: {
    right_size?: number;
    right_shape?: string;
    right_reaction?: string;
    left_size?: number;
    left_shape?: string;
    left_reaction?: string;
  };
  motorPower?: {
    upper_right?: string;
    upper_left?: string;
    lower_right?: string;
    lower_left?: string;
    gait?: string;             // 보행 양상
    muscleTone?: string;       // 근긴장도
    abnormalMovement?: string; // 이상운동 (Tremor 등)
  };
  cranialNerves?: {
    eom?: string;              // Extraocular Movements
    facialSymmetry?: string;   // Facial Symmetry (CN VII)
    gagReflex?: string;        // Gag Reflex (CN IX, X)
    tongueDeviation?: string;  // Tongue Deviation (CN XII)
    hearing?: string;          // Hearing (CN VIII) - Optional expansion
  };
  prompt?: string;              // 증상 내용/설명
  labResults?: LabResult[];
  imagingResults?: ImagingResult[];
  spotId?: string; // assets_Spot.csv의 key
}

// EMR 데이터 파라미터
export interface EMRData {
  patientInfo?: string;
  order?: string;
  io?: string;
  nursingNote?: string;
  labResults?: LabResult[];
}

// 이벤트 리소스
export interface EventResource {
  id: string;
  type: ResourceType;
  name: string;
  path: string;
  description?: string;
}

// 이벤트 파라미터
export interface EventParameter {
  key: string;
  name: string;
  value: string;
  valueType: ParameterValueType;
  description: string;
  example: string;
  required: boolean;
  categoryOptions?: string[];
}

// 반복 설정
export type RepeatType = 'None' | 'Periodic' | 'Random';

export interface RepeatSettings {
  type: RepeatType;
  interval?: number;
  intervalMin?: number;
  intervalMax?: number;
}

export type ActionType =
  | 'symptom_info'     // 증상 정보
  | 'change_patient_data'
  | 'play_animation'
  | 'play_voice'
  | 'play_sound'
  | 'change_3d_model'
  | 'change_texture'
  | 'play_particle'
  | 'quiz'
  | 'send_message'
  | 'item_action'      // 아이템 착용/제거 통합
  | 'emr_update'       // EMR 업데이트
  | 'apply_symptom';   // 환자 증상 템플릿 적용

// 액션별 파라미터 인터페이스
export interface VoiceParams {
  text: string;
  voice: string;
  tone?: string;
  volume: number;
  speed: number;
}

export interface SoundParams {
  category: string;
  name: string;
  triggerType: 'auto' | 'spot_click';
  targetIds?: string[];
  url: string;
}

export interface AnimationParams {
  category: string;
  name: string;
  url: string;
}

export interface ModelParams {
  category: string;
  name: string;
  url: string;
}

export interface TextureParams {
  category: string;
  name: string;
  spotId: string;
  url: string;
}

export interface ItemParams {
  itemKey: string;
  itemType: string;
  category: string;
  name: string;
  action: 'wear' | 'remove';
  position?: string;
}

export interface SymptomParams extends Partial<PatientData> {
  symptomKey?: string;          // 적용할 증상 템플릿 키
  extraParameters?: Array<{ key: string; value: string }>;
}

export interface EventAction {
  id: string;
  type: ActionType;
  params: any;
  repeatSettings?: RepeatSettings;
}

// 통합된 이벤트 인터페이스
export interface Event {
  id: string;
  key: string;
  displayName: string;
  description: string;
  category: EventCategory;
  trigger: TriggerType;
  roleTypes: RoleType[];
  status: EventStatus;
  source: 'preset' | 'asset';
  resources: EventResource[];
  cooldown?: number;
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  usageCount: number;
  notes?: string;
  parameters: EventParameter[];
  target?: string[];
  classification?: string; // 환자분류 또는 NPC분류
  repeatSettings?: RepeatSettings;
  patientData?: PatientData;
  emrData?: EMRData;
  actions?: EventAction[];
}

export type AssetEvent = Event;

// ============================================
// Preset Data
// ============================================

export const presetEvents: Event[] = [];
// Preset 데이터는 새로운 Event 구조에 맞지 않아 제거됨
// UI에서 source='asset'만 표시하므로 문제없음

// Combined Export
// ============================================

export const assetEvents: AssetEvent[] = [
  ...presetEvents
];
