import { PatientData } from './assetEvents';

export interface SymptomTemplate extends PatientData {
    id: string;
    key: string;
    displayName: string;
    description: string;
    category: string;
    tags?: string[];
    createdDate: string;
    updatedDate: string;
}

export const SYMPTOM_CATEGORIES_BY_TYPE: Record<string, string[]> = {
    'Adult_Male': ['심혈관계', '호흡기계', '소화기계', '신경계', '근골격계', '피부', '정신건강', '응급/기타'],
    'Adult_Female': ['심혈관계', '호흡기계', '소화기계', '신경계', '근골격계', '피부', '정신건강', '응급/기타'],
    'Elderly_Male': ['심혈관계', '호흡기계', '소화기계', '신경계', '근골격계', '피부', '정신건강', '응급/기타'],
    'Elderly_Female': ['심혈관계', '호흡기계', '소화기계', '신경계', '근골격계', '피부', '정신건강', '응급/기타'],
    'Pregnant': ['산과', '호흡기계', '심혈관계', '내분비계', '응급/기타'],
    'Pediatric': ['발달/심리', '호흡기계', '소화기계', '감염성', '알레르기/면역', '응급/기타'],
    'Newborn': ['발달/심리', '호흡기계', '소화기계', '감염성', '응급/기타'],
};

export const symptomTemplates: SymptomTemplate[] = [
    {
        id: 'symp_01',
        key: 'mi_chest_pain',
        displayName: '심근경색 흉통',
        description: '급성 심근경색(AMI) 환자의 전형적인 흉통 및 활력징후',
        category: '심혈관계',
        tags: ['MI', 'Chest Pain', 'Emergency'],
        patientType: 'Adult_Male',
        symptomName: '흉통',
        chiefComplaint: '가슴이 조이는 듯이 아파요',
        prompt: '[증상양상]\n가슴을 쥐어짜는 듯한 압박통\n\n[증상기간]\n30분 이상 지속\n\n[증상의 정도]\nNRS 8점\n\n[증상의 특징]\n식은땀을 흘리며 안절부절 못함\n\n[발생시기]\n휴식 중 갑자기 발생\n\n[지속시간]\n지속적임\n\n[발생/완화요인]\n안정 시에도 호전되지 않음',
        vitals: {
            sbp: 90,
            sbp_max: 100,
            dbp: 60,
            dbp_max: 70,
            hr: 110,
            hr_max: 120,
            rr: 24,
            rr_max: 28,
            bt: 36.5,
            bt_max: 36.8,
            spo2: 94,
            spo2_max: 96,
            ecg: 'ST Elevation'
        },
        mentalStatus: {
            gcs_score: 'E4V5M6',
            gcs_status: 'Alert',
            orientation: '시간, 장소, 사람'
        },
        painScale: 8,
        painScaleTool: 'NRS',
        createdDate: '2026-01-11',
        updatedDate: '2026-01-11'
    },
    {
        id: 'symp_02',
        key: 'pneumonia_resp',
        displayName: '폐렴 호흡곤란',
        description: '강한 기침과 호흡곤란을 동반한 고열 환자',
        category: '호흡기계',
        tags: ['Pneumonia', 'Fever', 'Dyspnea'],
        patientType: 'Elderly_Female',
        symptomName: '호흡곤란',
        chiefComplaint: '숨이 차고 기침이 계속 나요',
        prompt: '[증상양상]\n얕고 빠른 호흡\n\n[증상기간]\n3일 전부터 악화됨\n\n[증상의 정도]\n중등도\n\n[증상의 특징]\n노란색 객담 동반\n\n[발생시기]\n활동 시 심해짐\n\n[지속시간]\n간헐적임\n\n[발생/완화요인]\n좌위(Sitting position) 시 약간 호전',
        vitals: {
            sbp: 120,
            sbp_max: 130,
            dbp: 80,
            dbp_max: 85,
            hr: 95,
            hr_max: 105,
            rr: 28,
            rr_max: 32,
            bt: 38.5,
            bt_max: 39.2,
            spo2: 88,
            spo2_max: 91,
            ecg: 'Sinus Tachycardia'
        },
        mentalStatus: {
            gcs_score: 'E4V5M6',
            gcs_status: 'Alert',
            orientation: '시간, 장소, 사람'
        },
        createdDate: '2026-01-11',
        updatedDate: '2026-01-11'
    }
];
