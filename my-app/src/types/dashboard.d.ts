export interface DashboardActivity {
    id: number | string;
    title: string;
    category?: string;
    type?: string;
    createdDate?: string;
    simulationDate?: string;
    lastAccess?: string;
    version?: string;
    status?: 'active' | 'inactive' | 'completed' | 'failed' | 'in-progress' | 'not-started';
    views?: number;
    simulationCount?: number;
    userCount?: number;
    ContributedBy?: string;
    className?: string;
    username?: string;
    simulationName?: string;
    simulationMode?: 'training' | 'evaluation';
    score?: number | null;
    duration?: string | null;
    description?: string;
    progress?: number;
    mode?: 'training' | 'evaluation';
    // 클래스 및 시뮬레이션 링크용 필드
    classId?: string;
    sessionId?: string;
    scenarioId?: string;
}

export interface PatientStats {
    patientsCared: number;
    simulationCount: number;
    skills: { count: number; avgScore: number; label: string; sub: string };
    diseases: { count: number; avgScore: number; label: string; sub: string };
    symptoms: { count: number; avgScore: number; label: string; sub: string };
    diagnosis: { count: number; avgScore: number; label: string; sub: string };
}

export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    diagnosis: string;
    chiefComplaint: string;
    status: 'stable' | 'critical';
    careScore: number;
    careDuration: string;
    dateEncountered: string;
    scenarioTitle: string;
}
