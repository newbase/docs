/**
 * 시나리오 상세 정보 데이터
 */
import { Scenario, ChecklistItem as BaseChecklistItem } from '../types/admin';

export type ChecklistItem = BaseChecklistItem;
export type ScenarioDetail = Scenario;

export const scenarioDetails: Record<number, ScenarioDetail> = {
  1: {
    id: 1,
    title: '활력징후 측정',
    classId: '001',
    learningObjectives: ['술기절차'],
    duration: '7분',
    supportedDevices: ['MetaQuest 2', 'MetaQuest 3S', 'MetaQuest 3'],
    platform: 'VR',
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID', // 실제 유튜브 링크로 교체
    handover: '환자는 65세 남성으로, 고혈압으로 인한 두통을 호소하며 내원했습니다. 활력징후 측정이 필요한 상황입니다.',
    keyTasks: [
      '체온 측정',
      '맥박 측정',
      '호흡 측정',
      '혈압 측정',
      '의식 상태 확인'
    ],
    simulationExamples: [
      {
        activities: '체온 측정',
        image: '/images/scenario1-example1.jpg' // 실제 이미지 경로로 교체
      },
      {
        activities: '혈압 측정',
        image: '/images/scenario1-example2.jpg'
      }
    ],
    createdDate: '2026-01-15',
    updatedDate: '2026-01-20',
    requiredPremium: false,
    ContributedBy: 'Medicrew',
    category: 'Essential Skills',
    views: 1250,
    simulationCount: 850,
    userCount: 420,
    status: 'active',
    isPublic: true,
    version: '1.0.0',
    averageDuration: '5분 30초',
    averageScore: 92,
    patient: '65세 남성',
    map: '일반병동',
    mapId: 'single_room',
    availableItemIds: ['monitor', 'iv_pump'],
    roles: ['응급의학과 의사', '책임 간호사 (Charge Nurse)', '보호자', '표준화 환자'],
    participatingRoles: ['응급의학과 의사', '책임 간호사 (Charge Nurse)'],
    authors: ['Medicrew'],
    organization: 'Medicrew',
    licenseType: 'CC BY',
    sourceType: 'original',
    year: '2026',
    checklist: [
      {
        id: 'chk_1',
        order: 1,
        evaluationType: 'performance',
        eventName: '환자 도착',
        taskType: 'To-do',
        taskName: '손 위생',
        description: '환자 접촉 전 손 소독을 시행한다.',
        score: 10,
        feedback: '환자 환경에 들어가기 전 손 위생은 감염 관리의 가장 기본입니다.',
        status: 'success'
      },
      {
        id: 'chk_2',
        order: 2,
        evaluationType: 'performance',
        eventName: '환자 도착',
        taskType: 'To-do',
        taskName: '환자 확인',
        description: '개방형 질문으로 환자의 이름과 등록번호를 확인한다.',
        score: 15,
        feedback: '환자 안전을 위해 반드시 두 가지 이상의 식별자를 사용하여 환자를 확인해야 합니다.',
        status: 'success'
      },
      {
        id: 'chk_3',
        order: 3,
        evaluationType: 'performance',
        eventName: '활력징후 측정',
        taskType: 'Decision',
        taskName: '체온 측정',
        description: '고막 체온계를 사용하여 체온을 측정한다.',
        score: 15,
        feedback: '적절한 체온계 선택과 올바른 측정 방법이 중요합니다.',
        status: 'success'
      },
      {
        id: 'chk_4',
        order: 4,
        evaluationType: 'performance',
        eventName: '활력징후 측정',
        taskType: 'Must-not',
        taskName: '오염된 장비 사용 금지',
        description: '소독되지 않은 커프나 체온계를 사용하지 않는다.',
        score: -10,
        feedback: '교차 감염 예방을 위해 사용 전후장비 소독 상태를 확인해야 합니다.',
        status: 'fail'
      }
    ],
    resultMetadata: {
      stats: [
        { label: '총점', value: '85', sub: '/ 100점', color: 'text-blue-600' },
        { label: '성공률', value: '92', sub: '%', color: 'text-green-600' },
        { label: 'Must-not', value: '1', sub: '회 위반', color: 'text-red-600' },
        { label: '소요시간', value: '12:45', sub: '분', color: 'text-gray-600' },
      ],
      tables: [
        { title: '수행결과 평가', type: 'performance' }
      ]
    }
  },
  2: {
    id: 2,
    title: '유치도뇨 (여)',
    classId: '001',
    learningObjectives: ['질환별 간호수행'],
    duration: '10분',
    supportedDevices: ['MetaQuest 2', 'MetaQuest 3S', 'MetaQuest 3'],
    platform: 'VR',
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
    thumbnail: '/images/scenarios/catheterization-female-thumbnail.jpg',
    handover: '환자는 45세 여성으로, 수술 후 배뇨가 어려운 상황입니다. 유치도뇨가 필요합니다.',
    keyTasks: [
      '환자 상태 확인',
      '무균 조작 준비',
      '도뇨관 삽입',
      '배뇨 확인 및 기록'
    ],
    simulationExamples: [
      {
        activities: '무균 조작 준비',
        image: '/images/scenario2-example1.jpg'
      },
      {
        activities: '도뇨관 삽입',
        image: '/images/scenario2-example2.jpg'
      }
    ],
    createdDate: '2026-01-10',
    updatedDate: '2026-01-15',
    requiredPremium: true,
    ContributedBy: 'james',
    category: 'Nursing Practice',
    views: 890,
    simulationCount: 450,
    userCount: 210,
    status: 'active',
    isPublic: true,
    version: '1.2.0',
    averageDuration: '8분 45초',
    averageScore: 88,
    patient: '45세 여성',
    map: '외과병동',
    authors: ['james'],
    organization: 'Medicrew',
    licenseType: 'CC BY-SA',
    sourceType: 'original',
    year: '2026',
    checklist: [
      {
        id: 'chk_2_1',
        order: 1,
        evaluationType: 'equipment',
        eventName: '준비',
        taskType: 'To-do',
        taskName: '도뇨 세트',
        description: '도뇨 세트를 준비하고 멸균 상태를 확인한다.',
        score: 10,
        feedback: '멸균 유효 기간 및 포장 상태 확인이 필수입니다.',
        status: 'success',
        value: '준비 완료'
      },
      {
        id: 'chk_2_2',
        order: 2,
        evaluationType: 'equipment',
        eventName: '준비',
        taskType: 'To-do',
        taskName: '멸균 장갑',
        description: '자신의 사이즈에 맞는 멸균 장갑을 준비한다.',
        score: 10,
        feedback: '적절한 사이즈의 장갑은 술기의 정확도를 높입니다.',
        status: 'success',
        value: '준비 완료'
      },
      {
        id: 'chk_2_3',
        order: 1,
        evaluationType: 'procedure',
        eventName: '시행',
        taskType: 'To-do',
        taskName: '손 위생 및 장갑 착용',
        description: '물과 비누로 손 위생 후 멸균 장갑을 착용한다.',
        score: 20,
        feedback: '술기 시작 전 감염 관리는 기본입니다.',
        status: 'success'
      },
      {
        id: 'chk_2_4',
        order: 2,
        evaluationType: 'procedure',
        eventName: '시행',
        taskType: 'Decision',
        taskName: '윤활제 도포',
        description: '도뇨관 끝 2.5~5cm 부위에 윤활제를 바른다.',
        score: 20,
        feedback: '환자의 통증을 줄여주는 중요한 단계입니다.',
        status: 'partial'
      }
    ],
    resultMetadata: {
      stats: [
        { label: '술기 점수', value: '75', sub: '/ 100점', color: 'text-indigo-600' },
        { label: '무균술 준수', value: 'Fail', sub: '(오염 발생)', color: 'text-red-600' },
        { label: '배뇨량', value: '450', sub: 'ml', color: 'text-green-600' },
        { label: '수행 시간', value: '15:20', sub: '분', color: 'text-gray-600' },
      ],
      tables: [
        { title: '도구 준비 평가', type: 'equipment' },
        { title: '술기 절차 평가', type: 'procedure' }
      ]
    }
  },
  3: {
    id: 3,
    title: '경구투약',
    classId: '001',
    learningObjectives: ['투약 원칙 준수'],
    duration: '5분',
    supportedDevices: ['Mobile'],
    platform: 'PC',
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
    handover: '환자는 50세 남성으로, 고혈압 약물 복용이 필요합니다.',
    keyTasks: [
      '처방 확인',
      '환자 확인',
      '약물 확인',
      '투약 설명',
      '투약 및 기록'
    ],
    simulationExamples: [],
    createdDate: '2026-01-01',
    updatedDate: '2026-01-05',
    requiredPremium: false,
    ContributedBy: 'Medicrew',
    category: 'Essential Skills',
    views: 500,
    simulationCount: 200,
    userCount: 150,
    status: 'active',
    isPublic: true,
    version: '1.0.0',
    averageDuration: '4분',
    averageScore: 95,
    patient: '50세 남성',
    map: '일반병동',
    mapId: 'ward_room',
    availableItemIds: ['nursing_cart', 'storage', 'monitor'],
    roles: ['간호사', '환자'],
    participatingRoles: ['간호사'],
    authors: ['Medicrew'],
    organization: 'Medicrew',
    licenseType: 'CC BY-NC',
    sourceType: 'original',
    year: '2026',
    checklist: [
      {
        id: 'chk_3_1',
        order: 1,
        evaluationType: 'performance',
        eventName: '투약 준비',
        taskType: 'To-do',
        taskName: '손 위생',
        description: '약물 준비 전 손 소독을 시행한다.',
        score: 10,
        feedback: '감염 예방을 위해 모든 처치 전 손 위생은 필수입니다.',
        status: 'success'
      },
      {
        id: 'chk_3_2',
        order: 1,
        evaluationType: 'assessment',
        eventName: '환자 평가',
        taskType: 'Decision',
        taskName: '의식 상태 사정',
        description: '환자의 의식 상태를 GCS 척도로 사정한다.',
        score: 20,
        feedback: '투약 전 환자의 상태 분류는 필수 절차입니다.',
        status: 'success',
        value: 'Alert',
        correctValue: 'Alert'
      },
      {
        id: 'chk_3_3',
        order: 2,
        evaluationType: 'assessment',
        eventName: '환자 평가',
        taskType: 'Decision',
        taskName: '삼킴 곤란 여부',
        description: '경구 투약 가능 여부를 위해 삼킴 기능을 확인한다.',
        score: 20,
        feedback: '기도 흡인 예방을 위해 반드시 확인해야 합니다.',
        status: 'fail',
        value: '확인 안함',
        correctValue: '가능'
      }
    ],
    resultMetadata: {
      stats: [
        { label: '정확도', value: '95', sub: '%', color: 'text-blue-600' },
        { label: '5 Rights 준수', value: '5/5', sub: '항목', color: 'text-green-600' },
        { label: 'Must-not', value: '0', sub: '회 위반', color: 'text-gray-600' },
        { label: '준비 시간', value: '04:20', sub: '분', color: 'text-gray-600' },
      ],
      tables: [
        { title: '수행결과 평가', type: 'performance' },
        { title: '환자 평가', type: 'assessment' }
      ]
    }
  },
  // 추가 시나리오들...
  4: {
    id: 4,
    title: '활력징후 측정 (심화 - 응급 상황)',
    classId: '001',
    learningObjectives: ['긴박한 환경에서의 정확한 V/S 측정', '이상 징후 즉각 보고'],
    duration: '12분',
    supportedDevices: ['MetaQuest 2', 'MetaQuest 3', 'PC'],
    platform: 'VR',
    videoUrl: '',
    handover: '환자는 72세 여성으로, 급성 심근경색 의심으로 응급실 내원하였습니다. 현재 가슴 답답함을 호소하고 있으며, 즉각적인 활력징후 측정이 필요합니다.',
    keyTasks: [
      '심전도 모니터 연결',
      '신속한 혈압 및 산소포화도 측정',
      '흉통 사정',
      '의료진 노티'
    ],
    simulationExamples: [],
    createdDate: '2026-01-20',
    updatedDate: '2026-01-22',
    requiredPremium: true,
    ContributedBy: '간호교육팀 김철수',
    organization: '한국종합병원',
    category: 'Essential Skills',
    views: 120,
    simulationCount: 45,
    userCount: 30,
    status: 'active',
    isPublic: true,
    version: '1.0.2',
    averageDuration: '11분',
    averageScore: 82,
    patient: '72세 여성',
    map: '응급실 (ER)',
    mapId: 'er_trauma',
    availableItemIds: ['monitor', 'crash_cart', 'iv_pump'],
    roles: ['응급실 간호사', '응급의학과 의사'],
    participatingRoles: ['응급실 간호사'],
    authors: ['김철수', '이영희'],
    licenseType: 'CC BY-NC',
    sourceType: 'customized',
    originalSourceTitle: '활력징후 측정',
    originalSourceAuthor: 'Medicrew',
    year: '2026',
    baseScenarioId: 1,
    customHistory: [
      {
        version: '1.0.0',
        date: '2026-01-20',
        author: '김철수',
        organization: '한국종합병원',
        changes: '원본 시나리오를 응급 상황에 맞게 수정. 심전도 모니터링 추가, 응급 프로토콜 반영'
      },
      {
        version: '1.0.1',
        date: '2026-01-21',
        author: '이영희',
        organization: '한국종합병원',
        changes: '체크리스트 항목 보완, 응급 상황별 분기 시나리오 추가'
      },
      {
        version: '1.0.2',
        date: '2026-01-22',
        author: '김철수',
        organization: '한국종합병원',
        changes: '피드백 반영하여 난이도 조정, 타이머 설정 변경'
      }
    ],
    checklist: [
      {
        id: 'chk_4_1',
        order: 1,
        evaluationType: 'performance',
        eventName: '응급 처치',
        taskType: 'To-do',
        taskName: '모니터 부착',
        description: '3-lead EKG 모니터를 신속히 부착한다.',
        score: 20,
        feedback: '응급 상황에서는 빠른 모니터링 시작이 중요합니다.',
        status: 'success'
      }
    ]
  },
  5: {
    id: 5,
    title: '활력징후 측정 (소아 - 발열 환자)',
    classId: '001',
    learningObjectives: ['소아 환자의 협조 유도', '정확한 고막 체온 측정'],
    duration: '10분',
    supportedDevices: ['MetaQuest 2', 'MetaQuest 3'],
    platform: 'VR',
    videoUrl: '',
    handover: '환자는 5세 남아로, 39도 이상의 고열로 내원하였습니다. 보채는 아이를 달래며 정확한 활력징후를 측정해야 합니다.',
    keyTasks: [
      '환자 및 보호자 라포 형성',
      '체온 측정',
      '맥박 측정',
      '해열제 투여 여부 확인'
    ],
    simulationExamples: [],
    createdDate: '2026-01-25',
    updatedDate: '2026-01-26',
    requiredPremium: true,
    ContributedBy: '소아청소년과 전문간호사 박지민',
    organization: '서울어린이병원',
    category: 'Essential Skills',
    views: 80,
    simulationCount: 20,
    userCount: 15,
    status: 'active',
    isPublic: true,
    version: '1.0.0',
    averageDuration: '9분',
    averageScore: 88,
    patient: '5세 남아',
    map: '소아병동',
    mapId: 'pediatric_ward',
    availableItemIds: ['thermometer_ear', 'pulse_oximeter_pediatric'],
    roles: ['소아과 간호사', '보호자'],
    participatingRoles: ['소아과 간호사'],
    authors: ['박지민'],
    licenseType: 'CC BY-NC-SA',
    sourceType: 'customized',
    originalSourceTitle: '활력징후 측정',
    originalSourceAuthor: 'Medicrew',
    year: '2026',
    baseScenarioId: 1,
    customHistory: [
      {
        version: '1.0.0',
        date: '2026-01-25',
        author: '박지민',
        organization: '서울어린이병원',
        changes: '소아 환자 특성에 맞춰 대사 및 모션 수정, 체온 측정 도구 변경'
      }
    ],
    checklist: []
  }
};
