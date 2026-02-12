export interface Simulation {
    id: number;
    createdDate: string;
    username: string;
    classId: string;
    className: string;
    category: string;
    title: string;
    scenarioId: string;
    mode: string;
    score: number;
    duration: string;
    simulationStatus: string;
    simulationScore: string;
    platform: string;
}

export const simulations: Simulation[] = [
    {
        id: 1,
        createdDate: '2025-12-09 14:30',
        username: '김학생',
        classId: 'CLASS_001',
        className: '간호학과 2학년 A반',
        category: 'Essential Skills',
        title: '활력징후 측정',
        scenarioId: 'SC_001',
        mode: 'training',
        score: 85,
        duration: '15:20',
        simulationStatus: 'completed',
        simulationScore: '85점',
        platform: 'mobile'
    },
    {
        id: 2,
        createdDate: '2025-12-09 13:15',
        username: '이철수',
        classId: 'CLASS_002',
        className: '응급구조학과 1학년',
        category: 'Clinical Judgment',
        title: '흉통 환자 사정',
        scenarioId: 'SC_005',
        mode: 'evaluation',
        score: 92,
        duration: '20:10',
        simulationStatus: 'completed',
        simulationScore: '92점',
        platform: 'vr'
    },
    {
        id: 3,
        createdDate: '2025-12-09 11:00',
        username: '박지민',
        classId: 'CLASS_001',
        className: '간호학과 2학년 A반',
        category: 'Nursing Practice',
        title: '비위관 삽입',
        scenarioId: 'SC_003',
        mode: 'training',
        score: 78,
        duration: '18:45',
        simulationStatus: 'completed',
        simulationScore: '78점',
        platform: 'mobile'
    },
    {
        id: 4,
        createdDate: '2025-12-08 16:20',
        username: '최영희',
        classId: 'CLASS_003',
        className: '임상병리학과 3학년',
        category: 'Disease Knowledge',
        title: '당뇨병성 케톤산증 관리',
        scenarioId: 'SC_012',
        mode: 'evaluation',
        score: 88,
        duration: '25:30',
        simulationStatus: 'completed',
        simulationScore: '88점',
        platform: 'vr'
    },
    {
        id: 5,
        createdDate: '2025-12-08 10:45',
        username: '정우성',
        classId: 'CLASS_001',
        className: '간호학과 2학년 A반',
        category: 'Essential Skills',
        title: '정맥 주사',
        scenarioId: 'SC_002',
        mode: 'training',
        score: 95,
        duration: '12:15',
        simulationStatus: 'completed',
        simulationScore: '95점',
        platform: 'mobile'
    }
];