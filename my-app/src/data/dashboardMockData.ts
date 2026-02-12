import { DashboardActivity, Patient } from '../types/dashboard';

// ============================================
// Student Dashboard Mock Data
// ============================================

export const studentMockData = {
    userStats: {
        patientsCared: 24,
        simulationCount: 58,
        skills: { count: 12, avgScore: 85, label: '보유 스킬', sub: 'Skill' },
        diseases: { count: 8, avgScore: 72, label: '질환 지식', sub: 'Disease' },
        symptoms: { count: 15, avgScore: 91, label: '증상 지식', sub: 'Symptom' },
        diagnosis: { count: 10, avgScore: 94, label: '판단 능력', sub: 'Diagnosis' }
    },

    recentClasses: [
        {
            id: 1,
            title: '핵심술기: 활력징후 측정',
            category: 'Essential Skills',
            type: 'skill',
            progress: 75,
            lastAccess: '2025.12.05',
            description: '환자의 기본 건강 상태를 파악하기 위한 활력징후(혈압, 맥박, 호흡, 체온) 측정법을 학습합니다.',
            status: 'in-progress' as const,
            mode: 'training' as const,
            duration: '15:20',
            score: 85
        },
        {
            id: 2,
            title: '간호수행: 유치도뇨 (여)',
            category: 'Nursing Practice',
            type: 'skill',
            progress: 30,
            lastAccess: '2025.12.04',
            description: '여성 환자를 대상으로 한 유치도뇨관 삽입 및 관리 방법을 시뮬레이션을 통해 실습합니다.',
            status: 'in-progress' as const,
            mode: 'training' as const,
            duration: null,
            score: null
        },
        {
            id: 3,
            title: '의사결정: 호흡곤란 환자 간호',
            category: 'Clinical Judgment',
            type: 'diagnosis',
            progress: 0,
            lastAccess: '2025.12.01',
            description: '급성 호흡곤란을 호소하는 환자의 응급 처치 및 간호 중재 의사결정 과정을 훈련합니다.',
            status: 'not-started' as const,
            mode: 'evaluation' as const,
            duration: '00:00',
            score: 0
        },
        {
            id: 4,
            title: '질환심화: 심근경색(MI) 케어',
            category: 'Disease Knowledge',
            type: 'knowledge',
            progress: 100,
            lastAccess: '2025.11.28',
            description: '급성 심근경색 환자의 초기 사정부터 약물 투여, 모니터링까지의 핵심 간호 과정을 마스터합니다.',
            status: 'completed' as const,
            mode: 'evaluation' as const,
            duration: '22:15',
            score: 92
        },
        {
            id: 5,
            title: '증상관리: 통증 사정 및 중재',
            category: 'Symptom Management',
            type: 'diagnosis',
            progress: 45,
            lastAccess: '2025.11.25',
            description: '다양한 통증 척도를 활용한 사정법과 비약물적/약물적 중재 방법을 시뮬레이션으로 익힙니다.',
            status: 'in-progress' as const,
            mode: 'training' as const,
            duration: '08:45',
            score: 45
        }
    ] as DashboardActivity[],

    patientsList: [
        {
            id: 'p1',
            name: '김영희 (Kim Young-hee)',
            age: 67,
            gender: '여성',
            diagnosis: '급성 심근경색',
            chiefComplaint: '가슴 통증과 호흡곤란을 호소하며 응급실 내원. 심전도 상 ST 분절 상승 소견.',
            status: 'critical' as const,
            careScore: 92,
            careDuration: '45분',
            dateEncountered: '2025.11.28',
            scenarioTitle: 'MI 케어'
        },
        {
            id: 'p2',
            name: '이철수 (Lee Chul-soo)',
            age: 45,
            gender: '남성',
            diagnosis: '당뇨병성 케톤산증',
            chiefComplaint: '3일간의 구토와 복통, 의식 저하 증상으로 내원. 혈당 450mg/dL.',
            status: 'critical' as const,
            careScore: 88,
            careDuration: '60분',
            dateEncountered: '2025.12.05',
            scenarioTitle: '활력징후 측정'
        },
        {
            id: 'p3',
            name: '박민지 (Park Min-ji)',
            age: 28,
            gender: '여성',
            diagnosis: '요로감염',
            chiefComplaint: '배뇨 시 통증 및 빈뇨 증상으로 외래 방문. 유치도뇨 필요.',
            status: 'stable' as const,
            careScore: 95,
            careDuration: '30분',
            dateEncountered: '2025.12.04',
            scenarioTitle: '유치도뇨'
        },
        {
            id: 'p4',
            name: '정수영 (Jung Soo-young)',
            age: 52,
            gender: '여성',
            diagnosis: '천식 악화',
            chiefComplaint: '호흡곤란 및 천명음으로 응급실 내원. SpO2 88%.',
            status: 'critical' as const,
            careScore: 85,
            careDuration: '50분',
            dateEncountered: '2025.12.01',
            scenarioTitle: '호흡곤란 환자'
        }
    ] as Patient[],

    fullHistoryData: [
        { id: 1, createdDate: '2025.12.06', title: '핵심술기: 활력징후 측정', category: 'Essential Skills', mode: 'training' as const, score: 85, duration: '15:20', status: 'completed' as const },
        { id: 2, createdDate: '2025.12.05', title: '질환심화: 심근경색(MI) 케어', category: 'Disease Knowledge', mode: 'evaluation' as const, score: 92, duration: '22:10', status: 'completed' as const },
        { id: 3, createdDate: '2025.12.04', title: '간호수행: 유치도뇨 (여)', category: 'Nursing Practice', mode: 'training' as const, score: 0, duration: '05:00', status: 'failed' as const },
        { id: 4, createdDate: '2025.12.01', title: '증상관리: 통증 사정', category: 'Symptom Management', mode: 'evaluation' as const, score: 78, duration: '18:45', status: 'completed' as const },
        { id: 5, createdDate: '2025.11.28', title: '의사결정: 호흡곤란 환자', category: 'Clinical Judgment', mode: 'training' as const, score: 88, duration: '20:30', status: 'completed' as const },
        { id: 6, createdDate: '2025.11.25', title: '재난간호: 중증도 분류', category: 'Disaster Nursing', mode: 'evaluation' as const, score: 95, duration: '12:00', status: 'completed' as const },
    ] as DashboardActivity[]
};

// ============================================
// Master Dashboard Mock Data
// ============================================

export const masterMockData = {
    /**
     * Combines data from scenarioDetails with additional mock items
     */
    generateMockActivities: (scenarioDetails: any): DashboardActivity[] => {
        const baseData: DashboardActivity[] = Object.values(scenarioDetails).map((item: any) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            type: item.type,
            createdDate: item.date || item.createdDate,
            status: item.status,
            version: item.version || '1.0',
            ContributedBy: 'Me',
            views: item.views || 0,
            simulationCount: item.simulationCount || 0,
            userCount: item.userCount || 0,
            ...item
        }));

        // Add 15 more mock items
        const additionalMockData: DashboardActivity[] = Array.from({ length: 15 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (i * 7)); // Spread over weeks
            const isPublic = i % 2 === 0;
            return {
                id: `mock-${i}`,
                title: `테스트 시나리오 ${i + 1}`,
                category: i % 3 === 0 ? 'Essential Skills' : (i % 3 === 1 ? 'Emergency' : 'Nursing Practice'),
                type: 'VR',
                createdDate: date.toISOString().split('T')[0],
                status: isPublic ? 'active' as const : 'inactive' as const,
                version: `1.${i}.0`,
                ContributedBy: 'Me',
                views: Math.floor(Math.random() * 1000),
                simulationCount: Math.floor(Math.random() * 500),
                userCount: Math.floor(Math.random() * 200),
                className: ''
            };
        });

        return [...baseData, ...additionalMockData].sort((a, b) =>
            new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime()
        );
    }
};
