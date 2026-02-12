/**
 * 목업 클래스 데이터
 * 실제 API 연동 시 data/queries/useClasses.ts로 대체
 */
import { ClassItem, CurriculumItem } from '../classes';

export const mockClassesData: Record<string, ClassItem> = {
    '001': {
        id: '001',
        type: 'ls',
        title: '핵심술기 시뮬레이션',
        subtitle: '술기 중심 시나리오',
        description: '활력 징후, 정맥 주사, 카테터 삽입 등 20여 종의 핵심술기 절차 훈련',
        thumbnail: '/images/classes/step1-thumbnail.jpg',
        duration: '7~15분',
        patientType: '성인남/여',
        participationPeriod: {
            startDate: '2025-01-01',
            endDate: '2026-12-31'
        },
        completionRequirements: {
            minScenarios: 15,
            minPassingScore: 80,
            requireAllScenarios: false
        },
        maxParticipants: 30,
        currentParticipants: 15,
        completionRate: 75,
        creatorId: 'MasterUser01',
        createdDate: '2025-10-01',
        isForSale: true,
        classType: '오픈',
        category: 'new-nurse',
        organizationName: '서울대학교병원',
        price: 99000,
        isNew: true,
        isRecommended: true,
        educationVenue: '서울대학교병원 시뮬레이션센터',
        educationSchedule: '매주 화·목 14:00',
        recruitmentPeriod: { startDate: '2025-11-01', endDate: '2026-03-31' },
        curriculum: [
            { id: 1, code: 'LS001', name: '활력징후 측정', duration: '7분', platform: 'VR', isNew: true, type: 'scenario' },
            { id: 2, code: 'LS002', name: '유치도뇨 (여)', duration: '10분', platform: 'VR', type: 'scenario' },
            { 
                id: 3, 
                code: 'LS003', 
                name: '경구투약', 
                duration: '5분', 
                platform: '모바일', 
                type: 'video',
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                includes: '경구투약의 기본 원칙과 절차를 학습합니다.\n\n- 약물의 종류와 특성\n- 투약 전 확인 사항\n- 환자 상태 확인\n- 투약 후 모니터링\n- 부작용 대응 방법',
                author: '서울대학교병원',
                authorType: 'institution'
            },
            { id: 4, code: 'LS004', name: '유치도뇨 (남)', duration: '10분', platform: 'VR', type: 'scenario' },
            { id: 5, code: 'LS005', name: '근육주사', duration: '8분', platform: '모바일', type: 'scenario' },
            { 
                id: 6, 
                code: 'LS006', 
                name: '배출관장', 
                duration: '7분', 
                platform: 'VR', 
                type: 'scenario' 
            },
            { 
                id: 7, 
                code: 'LS007', 
                name: '피하주사', 
                duration: '6분', 
                platform: '모바일',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
                includes: '피하주사 기법과 주의사항을 상세히 설명합니다.\n\n주요 내용:\n- 주사 부위 선택\n- 주사 각도와 깊이\n- 주사 전 준비사항\n- 주사 후 관리',
                author: '연세의료원',
                authorType: 'institution'
            },
            { id: 8, code: 'LS008', name: '말초산소포화도 측정과 심전도 모니터', duration: '10분', platform: 'VR' },
            { 
                id: 9, 
                code: 'LS009', 
                name: '피내주사', 
                duration: '6분', 
                platform: '모바일',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
                includes: '피내주사의 정확한 시행 방법을 학습합니다.\n\n학습 목표:\n- 피내주사의 적응증 이해\n- 정확한 주사 기법 습득\n- 합병증 예방 방법',
                author: '김의사',
                authorType: 'individual'
            },
            { id: 10, code: 'LS010', name: '비강 캐놀라를 이용한 산소요법', duration: '8분', platform: 'VR' }
        ]
    },
    '002': {
        id: '002',
        type: 'ao',
        title: '간호수행 시뮬레이션',
        subtitle: '질환 중심 시나리오',
        description: '폐렴, 심근경색, 서맥, 분만 등 질환 중심 시나리오로 신규 의료진들의 병원 실무 적응 필수 코스',
        duration: '7~15분',
        patientType: '성인, 노인, 소아, 임산부',
        participationPeriod: { startDate: '2025-06-01', endDate: '2026-12-31' },
        classType: '오픈',
        category: 'nursing-college',
        organizationName: '연세의료원',
        price: 0,
        educationVenue: '연세의료원 교육관 A동',
        educationSchedule: '매주 수요일 10:00',
        recruitmentPeriod: { startDate: '2025-12-01', endDate: '2026-06-30' },
        curriculum: [
            { id: 21, code: 'AO001', name: '폐렴', duration: '12분', platform: 'VR' },
            { id: 22, code: 'AO002', name: '서맥', duration: '10분', platform: 'VR' },
            { id: 23, code: 'AO003', name: '식도정맥류출혈', duration: '15분', platform: 'VR', isNew: true },
            { id: 24, code: 'AO004', name: '전해질불균형', duration: '10분', platform: '모바일' },
            { id: 25, code: 'AO005', name: '급성심근경색', duration: '15분', platform: 'VR' }
        ],
        maxParticipants: 20,
        currentParticipants: 18,
        completionRate: 92,
        creatorId: 'MasterUser02',
        createdDate: '2025-10-05'
    },
    '003': {
        id: '003',
        type: 'md',
        title: '의사결정 시뮬레이션',
        subtitle: '증상 중심 시나리오',
        description: '흉통, 호흡곤란, 쇼크 등 환자증상과 상황을 파악하고 신속하고 적합한 의사결정 역량 훈련',
        duration: '10~20분',
        patientType: '다양',
        curriculum: [
            { id: 31, code: 'MD001', name: '흉통', duration: '15분', platform: 'VR' },
            { id: 32, code: 'MD002', name: '호흡곤란', duration: '18분', platform: 'VR', isNew: true },
            { id: 33, code: 'MD003', name: '쇼크', duration: '20분', platform: 'VR' }
        ],
        maxParticipants: 50,
        currentParticipants: 12,
        completionRate: 45,
        creatorId: 'AdminUser',
        createdDate: '2025-10-15'
    },
    '004': {
        id: '004',
        type: 'mb',
        title: '필수의료 시뮬레이션',
        subtitle: '모바일 앱 Classes',
        description: '이론으로 배우고 간편하게 시뮬레이션하세요',
        duration: '10~20분',
        participationPeriod: { startDate: '2025-08-01', endDate: '2026-12-31' },
        classType: '오픈',
        category: 'disaster-emergency',
        organizationName: '삼성서울병원',
        price: 49000,
        onlineUrl: 'https://edu.samsunghospital.com/simulation',
        onlinePlatform: '웹·모바일',
        curriculum: [
            { id: 41, code: 'MB001', name: '신경계사정', duration: '7분', includes: 'GCS (의식사정), 동공반응, 근력사정', platform: 'mobile' },
            { id: 42, code: 'MB002', name: '주사 실무', duration: '5분', includes: '체혈 20 cases, 정맥주사 20 cases', platform: 'mobile', isNew: true },
            { id: 43, code: 'MB003', name: '재난환자 중증도분류', duration: '5분', includes: '대형버스 교통사고, 요양원 화재사고, 물류창고 화재사고, 경기장 방사선 유출사고', platform: 'mobile' },
            { id: 44, code: 'MB004', name: 'ACLS', duration: '10분', includes: '제세동 필요 시나리오, 제세동 불필요 시나리오', platform: 'mobile' },
            { id: 45, code: 'MB005', name: '호흡기 강염병 대응', duration: '8분', platform: 'mobile' }
        ],
        maxParticipants: 100,
        currentParticipants: 85,
        completionRate: 68,
        creatorId: 'MasterUser01',
        createdDate: '2025-10-15'
    },
    '005': {
        id: '005',
        type: 'sc',
        title: '신경계사정 시뮬레이션',
        subtitle: '신경계사정 시뮬레이션',
        description: '신경계사정 시뮬레이션',
        curriculum: [
            { id: 51, code: 'SC001', name: '신경계사정', duration: '7분', platform: 'VR' },
        ],
        maxParticipants: 10,
        currentParticipants: 2,
        completionRate: 20,
        creatorId: 'NewMaster',
        createdDate: '2025-10-24'
    },
    // Mock Data for Pagination Testing
    '006': {
        id: '006', type: 'ls', title: '응급 처치 기초', subtitle: '기본 응급 처치', description: '심폐소생술 및 기본 응급 처치',
        participationPeriod: { startDate: '2025-01-01', endDate: '2026-12-31' },
        classType: '오픈',
        category: 'disaster-emergency',
        organizationName: '서울아산병원',
        price: 79000,
        educationVenue: '서울아산병원 응급의료센터',
        educationSchedule: '매월 1·3주 토요일',
        recruitmentPeriod: { startDate: '2026-01-01', endDate: '2026-12-31' },
        curriculum: [{ id: 61, code: 'LS021', name: '심폐소생술', duration: '10분', platform: 'VR' }],
        maxParticipants: 20, currentParticipants: 5, completionRate: 10, creatorId: 'Admin01', createdDate: '2024-11-01'
    },
    '007': {
        id: '007', type: 'ao', title: '중환자 간호', subtitle: 'ICU 실습', description: '중환자실 환경에서의 간호 실습',
        participationPeriod: { startDate: '2025-03-01', endDate: '2026-12-31' },
        classType: '오픈',
        category: 'new-nurse',
        organizationName: '세브란스병원',
        price: 0,
        educationVenue: '세브란스병원 중환자실 시뮬레이션실',
        educationSchedule: '매주 금요일 09:00',
        recruitmentPeriod: { startDate: '2025-09-01', endDate: '2026-02-28' },
        curriculum: [{ id: 71, code: 'AO010', name: '인공호흡기 관리', duration: '20분', platform: 'VR' }],
        maxParticipants: 15, currentParticipants: 15, completionRate: 100, creatorId: 'Master02', createdDate: '2024-11-05', password: '1234'
    },
    '008': {
        id: '008', type: 'md', title: '감염 관리', subtitle: '병원 내 감염 예방', description: '표준 주의 및 격리 주의 지침',
        participationPeriod: { startDate: '2025-04-01', endDate: '2026-12-31' },
        classType: '오픈',
        category: 'nursing-college',
        organizationName: '고려대학교병원',
        price: 59000,
        onlineUrl: 'https://simulation.kumc.or.kr',
        onlinePlatform: '온라인 플랫폼',
        curriculum: [{ id: 81, code: 'MD004', name: '손위생', duration: '5분', platform: 'mobile' }],
        maxParticipants: 50, currentParticipants: 40, completionRate: 80, creatorId: 'Admin02', createdDate: '2024-11-10'
    },
    '009': {
        id: '009', type: 'mb', title: '노인 간호', subtitle: '요양병원 실무', description: '노인 환자 특성 이해 및 간호',
        curriculum: [{ id: 91, code: 'MB006', name: '낙상 예방', duration: '8분', platform: '모바일' }],
        maxParticipants: 40, currentParticipants: 10, completionRate: 25, creatorId: 'Master03', createdDate: '2024-11-15'
    },
    '010': {
        id: '010', type: 'ls', title: '수술 간호', subtitle: 'OR 실습', description: '수술 전후 간호 및 무균술',
        curriculum: [{ id: 101, code: 'LS022', name: '수술 가운 착용', duration: '12분', platform: 'VR' }],
        maxParticipants: 25, currentParticipants: 20, completionRate: 90, creatorId: 'Admin01', createdDate: '2024-11-20', password: '1234'
    },
    '011': {
        id: '011', type: 'ao', title: '정신 간호', subtitle: '정신과 병동 실습', description: '치료적 의사소통 및 위기 중재',
        curriculum: [{ id: 111, code: 'AO011', name: '대화 기법', duration: '15분', platform: 'mobile' }],
        maxParticipants: 30, currentParticipants: 5, completionRate: 15, creatorId: 'Master01', createdDate: '2024-11-25'
    },
    '012': {
        id: '012', type: 'md', title: '아동 간호', subtitle: '소아청소년과 실습', description: '아동 발달 단계별 간호',
        curriculum: [{ id: 121, code: 'MD005', name: '예방접종', duration: '8분', platform: '모바일' }],
        maxParticipants: 35, currentParticipants: 30, completionRate: 85, creatorId: 'Master02', createdDate: '2024-11-30'
    },
    '013': {
        id: '013', type: 'mb', title: '지역사회 간호', subtitle: '보건소 실습', description: '가정 방문 간호 및 건강 증진',
        curriculum: [{ id: 131, code: 'MB007', name: '혈당 측정', duration: '5분', platform: 'mobile' }],
        maxParticipants: 60, currentParticipants: 10, completionRate: 10, creatorId: 'Admin03', createdDate: '2024-12-02', password: '1234'
    },
    '014': {
        id: '014', type: 'ls', title: '재활 간호', subtitle: '재활 병동 실습', description: '재활 훈련 및 일상생활 보조',
        curriculum: [{ id: 141, code: 'LS023', name: '보행 보조', duration: '10분', platform: 'VR' }],
        maxParticipants: 20, currentParticipants: 18, completionRate: 95, creatorId: 'Master03', createdDate: '2024-12-08'
    },
    '015': {
        id: '015', type: 'ao', title: '종양 간호', subtitle: '암 병동 실습', description: '항암 화학 요법 및 통증 관리',
        curriculum: [{ id: 151, code: 'AO012', name: '항암제 투여', duration: '15분', platform: 'VR' }],
        maxParticipants: 15, currentParticipants: 5, completionRate: 30, creatorId: 'Admin01', createdDate: '2024-12-12'
    },
    '016': {
        id: '016', type: 'md', title: '여성 건강 간호', subtitle: '산부인과 실습', description: '임신, 분만, 산욕기 간호',
        curriculum: [{ id: 161, code: 'MD006', name: '태아 심음 청취', duration: '8분', platform: '모바일' }],
        maxParticipants: 25, currentParticipants: 12, completionRate: 50, creatorId: 'Master01', createdDate: '2024-12-18', password: '1234'
    },
    '017': {
        id: '017', type: 'mb', title: '투석 간호', subtitle: '인공신장실 실습', description: '혈액 투석 및 복막 투석 간호',
        curriculum: [{ id: 171, code: 'MB008', name: '투석기 조작', duration: '20분', platform: 'VR' }],
        maxParticipants: 10, currentParticipants: 8, completionRate: 80, creatorId: 'Admin02', createdDate: '2024-12-20'
    },
    '018': {
        id: '018', type: 'ls', title: '호스피스 간호', subtitle: '완화의료', description: '임종 간호 및 사별 가족 돌봄',
        curriculum: [{ id: 181, code: 'LS024', name: '임종 간호', duration: '12분', platform: '모바일' }],
        maxParticipants: 15, currentParticipants: 3, completionRate: 20, creatorId: 'Master03', createdDate: '2024-12-22'
    },
    '019': {
        id: '019', type: 'ao', title: '보건 교육', subtitle: '환자 교육', description: '효과적인 보건 교육 방법',
        curriculum: [{ id: 191, code: 'AO013', name: '교육 자료 제작', duration: '15분', platform: 'mobile' }],
        maxParticipants: 40, currentParticipants: 35, completionRate: 90, creatorId: 'Admin03', createdDate: '2024-12-23'
    },
    '020': {
        id: '020', type: 'md', title: '간호 관리', subtitle: '간호 단위 관리', description: '인력 관리 및 물품 관리',
        curriculum: [{ id: 201, code: 'MD007', name: '근무표 작성', duration: '30분', platform: 'mobile' }],
        maxParticipants: 10, currentParticipants: 10, completionRate: 100, creatorId: 'Master01', createdDate: '2024-12-25', password: '1234'
    }
};
