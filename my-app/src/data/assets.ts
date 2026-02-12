export type AssetType = '캐릭터' | '맵' | '장비' | '도구' | '약물';

export type ToolType = 'equipment' | 'responsive' | 'use_spot' | 'checking_a' | 'user_grab' | 'value_int' | 'etc';

export interface AssetSpot {
    key: string;
    name: string;
    location: { x: number; y: number; z: number };
    size: number;
}

export interface Asset {
    key: string;
    name: string;
    englishName?: string;
    type: AssetType;
    category: string;
    description: string;
    isPlayable: boolean;
    createdAt: string;
    thumbnail?: string;
    toolType?: ToolType;
    spots?: AssetSpot[];
}

export const assets: Asset[] = [
    {
        key: 'char_nurse_01',
        name: '간호사 A',
        type: '캐릭터',
        category: '의료인력',
        description: '기본 간호사 캐릭터 모델',
        isPlayable: true,
        createdAt: '2025-10-01',
        thumbnail: 'https://images.unsplash.com/photo-1576091160550-217359f481c3?w=100&h=100&fit=crop',
    },
    {
        key: 'char_patient_01',
        name: '환자 김철수',
        type: '캐릭터',
        category: '환자',
        description: '복통을 호소하는 중년 남성 환자',
        isPlayable: true,
        createdAt: '2025-10-05',
        thumbnail: 'https://images.unsplash.com/photo-1584515933487-782709d42969?w=100&h=100&fit=crop',
    },
    {
        key: 'map_hospital_er',
        name: '응급실',
        type: '맵',
        category: '실내',
        description: '대형 병원 응급실 배경',
        isPlayable: true,
        createdAt: '2025-09-15',
        thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&h=100&fit=crop',
    },
    {
        key: 'map_hospital_ward',
        name: '일반 병동',
        type: '맵',
        category: '실내',
        description: '4인실 구성의 일반 병동 배경',
        isPlayable: true,
        createdAt: '2025-09-20',
        thumbnail: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=100&h=100&fit=crop',
    },
    {
        key: 'eq_steth_01',
        name: '청진기',
        type: '장비',
        category: '진단도구',
        description: '디지털 청진기 모델',
        isPlayable: true,
        createdAt: '2025-10-10',
        thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&h=100&fit=crop',
        toolType: 'responsive',
    },
    {
        key: 'eq_mon_01',
        name: '바이탈 모니터',
        type: '장비',
        category: '모니터링',
        description: '환자 상태 감시용 모니터',
        isPlayable: true,
        createdAt: '2025-10-12',
        thumbnail: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=100&h=100&fit=crop',
    },
    {
        key: 'tool_syringe_01',
        name: '주사기',
        type: '도구',
        category: '처치도구',
        description: '5cc 일회용 주사기',
        isPlayable: true,
        createdAt: '2025-10-15',
        thumbnail: 'https://images.unsplash.com/photo-1542385151-efd9000782a0?w=100&h=100&fit=crop',
        toolType: 'use_spot',
    },
    {
        key: 'tool_iv_set_01',
        name: 'IV 세트',
        type: '도구',
        category: '처치도구',
        description: '정맥 주사 세트',
        isPlayable: true,
        createdAt: '2025-10-16',
        thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&h=100&fit=crop',
    },
    {
        key: 'med_epi_01',
        name: '에피네프린',
        type: '약물',
        category: '응급약물',
        description: '심정지 시 사용하는 응급 약물',
        isPlayable: true,
        createdAt: '2025-11-01',
        thumbnail: 'https://images.unsplash.com/photo-1628771065518-0d82f1958462?w=100&h=100&fit=crop',
    },
    {
        key: 'med_prop_01',
        name: '프로포폴',
        type: '약물',
        category: '마취제',
        description: '정맥 투여용 마취 유도제',
        isPlayable: true,
        createdAt: '2025-11-05',
        thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?w=100&h=100&fit=crop',
    },
    {
        key: 'char_nurse_02',
        name: '간호사 B',
        type: '캐릭터',
        category: '의료인력',
        description: '선임 간호사 캐릭터 모델',
        isPlayable: true,
        createdAt: '2025-11-10',
        thumbnail: 'https://images.unsplash.com/photo-1579684385109-a212127468e3?w=100&h=100&fit=crop',
    },
    {
        key: 'char_doc_01',
        name: '의사 박준호',
        type: '캐릭터',
        category: '의료인력',
        description: '응급의학과 전문의 캐릭터',
        isPlayable: true,
        createdAt: '2025-11-12',
        thumbnail: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b1f8?w=100&h=100&fit=crop',
    },
    {
        key: 'map_hospital_icu',
        name: '중환자실',
        type: '맵',
        category: '실내',
        description: '중환자실(ICU) 배경',
        isPlayable: true,
        createdAt: '2025-09-25',
        thumbnail: 'https://images.unsplash.com/photo-1519494140681-8917ad0a955b?w=100&h=100&fit=crop',
    },
    {
        key: 'eq_vent_01',
        name: '인공호흡기',
        type: '장비',
        category: '치료장비',
        description: '기계적 환기 장치',
        isPlayable: true,
        createdAt: '2025-10-20',
        thumbnail: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=100&h=100&fit=crop',
    },
    {
        key: 'tool_gauze_01',
        name: '거즈',
        type: '도구',
        category: '처치도구',
        description: '멸균 거즈 팩',
        isPlayable: true,
        createdAt: '2025-10-22',
        thumbnail: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=100&h=100&fit=crop',
    },
    {
        key: 'med_heparin_01',
        name: '헤파린',
        type: '약물',
        category: '항응고제',
        description: '혈액 응고 저해제',
        isPlayable: true,
        createdAt: '2025-11-15',
        thumbnail: 'https://images.unsplash.com/photo-1628771065518-0d82f1958462?w=100&h=100&fit=crop',
    },
    {
        key: 'char_patient_02',
        name: '환자 이지혜',
        type: '캐릭터',
        category: '환자',
        description: '호흡곤란 환자 정체 불명',
        isPlayable: true,
        createdAt: '2025-11-20',
        thumbnail: 'https://images.unsplash.com/photo-1584036534515-055a8868352b?w=100&h=100&fit=crop',
    },
    {
        key: 'map_hospital_op',
        name: '수술실',
        type: '맵',
        category: '실내',
        description: '클린룸 수술실 배경',
        isPlayable: true,
        createdAt: '2025-10-01',
        thumbnail: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=100&h=100&fit=crop',
    },
    {
        key: 'eq_defib_01',
        name: '제세동기',
        type: '장비',
        category: '응급장비',
        description: '자동 심장 충격기',
        isPlayable: true,
        createdAt: '2025-10-25',
        thumbnail: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=100&h=100&fit=crop',
    },
    {
        key: 'med_atropine_01',
        name: '아트로핀',
        type: '약물',
        category: '응급약물',
        description: '서맥 시 사용하는 응급 약물',
        isPlayable: true,
        createdAt: '2025-11-25',
        thumbnail: 'https://images.unsplash.com/photo-1628771065518-0d82f1958462?w=100&h=100&fit=crop',
    },
];
