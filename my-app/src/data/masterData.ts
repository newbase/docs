
export interface MasterStats {
  totalStudents: number;
  activeClasses: number;
  simulationCount: number;
  averageScore: number;
}

export interface MasterActivity {
  id: number;
  type: string;
  student?: string;
  message?: string;
  scenario?: string;
  class?: string;
  category?: string;
  mode: string;
  duration: string;
  score: number | null;
  time: string;
}

export interface MasterStudent {
  id: number;
  name: string;
  studentId: string;
  class: string;
  progress: number;
  status: string;
}

export interface MasterOrganization {
  id: string;
  name: string;
  representative: string;
  businessNumber: string;
  address: string;
  manager: {
    name: string;
    email: string;
    phone: string;
    department: string;
  };
}

export interface MasterLicense {
  id: string;
  className: string;
  plan: string;
  subscriptionType: string;
  period: string;
  maxUsers: number | string;
  maxDevices: number | string;
  activeDevices?: number;
  activeUsers?: number;
  cumulativeUsers?: number;
  startDate: string;
  endDate: string;
  status: string;
}

export interface MasterUser {
  id: string;
  name: string;
  email: string;
  type: string;
  role: string;
  studentId: string;
  class: string;
  registeredAt: string;
  lastLoginAt: string;
  status: string;
}

export interface MasterDevice {
  id: string;
  name: string;
  modelName: string;
  purchasedFrom: string;
  registeredAt: string;
  lastLoginAt: string;
  status: string;
  assignedLicense: string | null;
}

export interface ClassParticipation {
  id: number;
  studentName: string;
  studentId: string;
  class: string;
  date: string;
  title: string;
  category: string;
  mode: string;
  score: number;
  duration: string;
  status: string;
}

export interface MasterData {
  stats: MasterStats;
  recentActivities: MasterActivity[];
  students: MasterStudent[];
  organization: MasterOrganization;
  licenses: MasterLicense[];
  users: MasterUser[];
  devices: MasterDevice[];
  classParticipation: ClassParticipation[];
}

export const masterData: MasterData = {
  stats: {
    totalStudents: 128,
    activeClasses: 5,
    simulationCount: 1542, // Updated from pendingReviews
    averageScore: 84.5
  },
  recentActivities: [
    {
      id: 1,
      type: 'submission',
      student: '김철수',
      scenario: '심폐소생술(CPR) 기초',
      category: 'Essential Skills',
      mode: 'training',
      duration: '10:00',
      score: 92,
      time: '10분 전'
    },
    {
      id: 2,
      type: 'enrollment',
      student: '이영희',
      class: '응급구조학 실습 A반',
      category: 'Course Enrollment',
      mode: '-',
      duration: '-',
      score: null,
      time: '1시간 전'
    },
    {
      id: 3,
      type: 'alert',
      message: '서버 점검 예정 (12/10 02:00)',
      category: 'System Notice',
      mode: '-',
      duration: '-',
      score: null,
      time: '3시간 전'
    },
    {
      id: 4,
      type: 'submission',
      student: '박민수',
      scenario: '정맥 주사 실습',
      category: 'Nursing Practice',
      mode: 'evaluation',
      duration: '15:30',
      score: 78,
      time: '5시간 전'
    },
    {
      id: 5,
      type: 'submission',
      student: '최지은',
      scenario: '호흡곤란 환자 간호',
      category: 'Clinical Judgment',
      mode: 'training',
      duration: '20:15',
      score: 88,
      time: '1일 전'
    }
  ],
  students: [
    { id: 1, name: '김철수', studentId: '20230001', class: 'A반', progress: 85, status: 'active' },
    { id: 2, name: '이영희', studentId: '20230002', class: 'A반', progress: 92, status: 'active' },
    { id: 3, name: '박민수', studentId: '20230003', class: 'B반', progress: 45, status: 'warning' },
    { id: 4, name: '최지은', studentId: '20230004', class: 'B반', progress: 10, status: 'danger' },
    { id: 5, name: '정우성', studentId: '20230005', class: 'C반', progress: 100, status: 'completed' },
  ],
  // 1) 기관정보 관리
  organization: {
    id: 'ORG001',
    name: '서울대학교병원',
    representative: '김원장',
    businessNumber: '211-82-00001',
    address: '서울특별시 종로구 대학로 101',
    manager: {
      name: '김원장',
      email: 'director.kim@snuh.org',
      phone: '+82 10-1234-5678',
      department: '의료정보팀'
    }
  },
  // 2) 라이센스 관리
  licenses: [
    {
      id: 'lic_001',
      className: '핵심술기 시뮬레이션 VR',
      plan: 'Pro',
      subscriptionType: 'device', // 기기구독
      period: '12개월',
      maxUsers: '-', // 기기구독이라 사용자수 무제한 또는 해당 없음
      maxDevices: 10,
      activeDevices: 4,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'active'
    },
    {
      id: 'lic_002',
      className: '간호수행 시뮬레이션 Mobile',
      plan: 'Basic',
      subscriptionType: 'user', // 사용자구독
      period: '6개월',
      maxUsers: 50,
      activeUsers: 32,
      cumulativeUsers: 45,
      maxDevices: '-',
      startDate: '2025-07-01',
      endDate: '2026-06-30',
      status: 'active'
    }
  ],
  // 3) 사용자 관리 (확장)
  users: [
    {
      id: 'user_001',
      name: '김철수',
      email: 'cheolsu@univ.ac.kr',
      type: 'regular', // 정회원
      role: 'student', // 수강생
      studentId: '20230001',
      class: 'A반',
      registeredAt: '2023-03-02',
      lastLoginAt: '2023-10-25 14:30',
      status: 'active'
    },
    {
      id: 'user_002',
      name: '이영희',
      email: 'younghee@univ.ac.kr',
      type: 'regular',
      role: 'student',
      studentId: '20230002',
      class: 'A반',
      registeredAt: '2023-03-02',
      lastLoginAt: '2023-10-24 09:15',
      status: 'active'
    },
    {
      id: 'user_003',
      name: '박민수',
      email: 'minsu@univ.ac.kr',
      type: 'regular',
      role: 'student',
      studentId: '20230003',
      class: 'B반',
      registeredAt: '2023-03-02',
      lastLoginAt: '2023-10-20 18:00',
      status: 'active'
    },
    {
      id: 'user_004',
      name: 'Guest_01',
      email: '-',
      type: 'guest', // 게스트
      role: 'student',
      studentId: '-',
      class: '-',
      registeredAt: '2023-10-01',
      lastLoginAt: '2023-10-01 10:00',
      status: 'inactive'
    },
    {
      id: 'user_005',
      name: '김교수',
      email: 'prof_kim@univ.ac.kr',
      type: 'regular',
      role: 'master',
      studentId: '-',
      class: '-',
      registeredAt: '2023-01-15',
      lastLoginAt: '2023-10-25 09:00',
      status: 'active'
    }
  ],
  // 4) 기기 관리
  devices: [
    {
      id: 'dev_001',
      name: 'VR_Lab_01',
      modelName: 'Oculus Quest 2',
      purchasedFrom: 'SK Telecom',
      registeredAt: '2023-01-10',
      lastLoginAt: '2023-10-24 15:00',
      status: 'active',
      assignedLicense: 'lic_001'
    },
    {
      id: 'dev_002',
      name: 'VR_Lab_02',
      modelName: 'Oculus Quest 2',
      purchasedFrom: 'SK Telecom',
      registeredAt: '2023-01-10',
      lastLoginAt: '2023-10-23 11:30',
      status: 'active',
      assignedLicense: 'lic_001'
    },
    {
      id: 'dev_003',
      name: 'VR_Lab_03',
      modelName: 'Pico 4',
      purchasedFrom: 'Pico Korea',
      registeredAt: '2023-02-15',
      lastLoginAt: '2023-10-20 14:00',
      status: 'inactive', // 수리 중 등
      assignedLicense: null
    },
    {
      id: 'dev_004',
      name: 'Tablet_01',
      modelName: 'Galaxy Tab S8',
      purchasedFrom: 'Samsung',
      registeredAt: '2023-03-01',
      lastLoginAt: '2023-10-25 10:00',
      status: 'active',
      assignedLicense: 'lic_002'
    }
  ],
  // 5) 클래스 참여 현황 (StudentDashboard 데이터 기반 확장)
  classParticipation: [
    { id: 1, studentName: '김철수', studentId: '20230001', class: 'A반', date: '2025.12.06', title: '핵심술기: 활력징후 측정', category: 'Essential Skills', mode: 'training', score: 85, duration: '15:20', status: 'completed' },
    { id: 2, studentName: '이영희', studentId: '20230002', class: 'A반', date: '2025.12.05', title: '질환심화: 심근경색(MI) 케어', category: 'Disease Knowledge', mode: 'evaluation', score: 92, duration: '22:10', status: 'completed' },
    { id: 3, studentName: '박민수', studentId: '20230003', class: 'B반', date: '2025.12.04', title: '간호수행: 유치도뇨 (여)', category: 'Nursing Practice', mode: 'training', score: 0, duration: '05:00', status: 'failed' },
    { id: 4, studentName: '최지은', studentId: '20230004', class: 'B반', date: '2025.12.01', title: '증상관리: 통증 사정', category: 'Symptom Management', mode: 'evaluation', score: 78, duration: '18:45', status: 'completed' },
    { id: 5, studentName: '정우성', studentId: '20230005', class: 'C반', date: '2025.11.28', title: '의사결정: 호흡곤란 환자', category: 'Clinical Judgment', mode: 'training', score: 88, duration: '20:30', status: 'completed' },
    { id: 6, studentName: '김철수', studentId: '20230001', class: 'A반', date: '2025.11.25', title: '재난간호: 중증도 분류', category: 'Disaster Nursing', mode: 'evaluation', score: 95, duration: '12:00', status: 'completed' },
    { id: 7, studentName: '이영희', studentId: '20230002', class: 'A반', date: '2025.11.24', title: '핵심술기: 활력징후 측정', category: 'Essential Skills', mode: 'training', score: 90, duration: '14:00', status: 'completed' },
    { id: 8, studentName: '박민수', studentId: '20230003', class: 'B반', date: '2025.11.20', title: '질환심화: 심근경색(MI) 케어', category: 'Disease Knowledge', mode: 'training', score: 65, duration: '25:00', status: 'completed' },
    { id: 9, studentName: '김철수', studentId: '20230001', class: 'A반', date: '2025.11.15', title: '간호수행: 유치도뇨 (여)', category: 'Nursing Practice', mode: 'evaluation', score: 88, duration: '16:00', status: 'completed' },
    { id: 10, studentName: '정우성', studentId: '20230005', class: 'C반', date: '2025.11.10', title: '증상관리: 통증 사정', category: 'Symptom Management', mode: 'training', score: 92, duration: '10:00', status: 'completed' }
  ]
};

