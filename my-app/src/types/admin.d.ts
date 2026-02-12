export interface Organization {
    id: string;
    name: string;
    logo?: string;
    representative?: string;
    businessNumber?: string;
    address?: string;
    country?: string;
    type?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    department?: string;
    position?: string;
    registeredDate?: string;
    /** 제휴기관 여부 */
    isPartner?: boolean;
    status: 'active' | 'inactive' | string;
    licenseType?: string;
    licenseCount?: number;
    deviceCount?: number;
    userCount?: number;
    expiryDate?: string;
    manager?: {
        name: string;
        email: string;
        phone: string;
        department: string;
    };
}

export interface License {
    id: string;
    className: string;
    subscriptionPlan?: string;
    plan?: string;
    platform?: string;
    licenseType?: string;
    subscriptionType?: string;
    duration?: string;
    period?: string;
    activeUsers?: number | string;
    maxUsers?: number | string;
    totalUsers?: number;
    cumulativeUsers?: number;
    activeDevices?: number;
    maxDevices?: number;
    startDate: string;
    endDate?: string | null;
    status: 'active' | 'expiring' | 'expired' | 'pending';
}

export interface User {
    id: string | number;
    name: string;
    email?: string;
    type?: 'regular' | 'guest';
    accountType?: string;
    customerType?: string;
    organizationName?: string;
    role: string;
    studentId?: string;
    class?: string;
    registeredAt?: string;
    registeredDate?: string;
    lastLoginAt?: string;
    lastLogin?: string;
    status: 'active' | 'inactive' | 'warning' | 'danger' | 'completed' | 'withdrawal' | string;
    simulationCount?: number;
    classCount?: number;
    department?: string;
    position?: string;
    specialty?: string;
    expirationDate?: string;
    password?: string;
    loginId?: string;
    phoneNumber?: string;
}

export interface Device {
    id: string;
    deviceName?: string;
    name?: string;
    modelName: string;
    purchaseSource?: string;
    purchasedFrom?: string;
    registeredDate?: string;
    registeredAt?: string;
    lastConnection?: string;
    lastLoginAt?: string;
    status: 'active' | 'inactive';
    assignedLicense?: string | null;
}

/** 시나리오 플랫폼: VR | Mobile | PC 중 1개 */
export type ScenarioPlatform = 'VR' | 'Mobile' | 'PC';

export interface Scenario {
    id: number;
    title: string;
    classId: string;
    learningObjectives: string[];
    duration: string;
    supportedDevices: string[];
    videoUrl: string;
    thumbnail?: string;
    handover: string;
    keyTasks: string[];
    simulationExamples: { activities: string; image: string; title?: string }[];
    createdDate: string;
    updatedDate: string;
    requiredPremium: boolean;
    ContributedBy: string;
    category: string;
    views: number;
    simulationCount: number;
    userCount: number;
    status: 'active' | 'inactive' | string;
    isPublic: boolean;
    version: string;
    averageDuration: string;
    averageScore: number;
    // Additional fields for list view if needed
    name?: string; // ScenarioList uses .name, ScenarioDetail uses .title. Mismatch?
    // classesData might have different structure than scenarioDetails.
    // In ScenarioList: scenario.name, scenario.platform, scenario.isNew
    /** 시나리오 플랫폼: VR | Mobile | PC 중 1개 */
    platform?: ScenarioPlatform;
    isNew?: boolean;
    includes?: string; // Used in search
    className?: string; // Added during map
    classType?: string; // Added during map
    patient?: string;
    map?: string;
    mapId?: string;
    availableItemIds?: string[];
    roles?: string[];
    participatingRoles?: string[];
    checklist?: ChecklistItem[];
    resultMetadata?: {
        stats: ResultStat[];
        tables?: ResultTable[];
        checklist?: ChecklistItem[];
    };
    authors?: string[];
    organization?: string;
    licenseType?: string;
    sourceType?: 'original' | 'customized';
    originalSourceTitle?: string;
    originalSourceAuthor?: string;
    year?: string;
    baseScenarioId?: number;
    customHistory?: Array<{
        version: string;
        date: string;
        author: string;
        organization?: string;
        changes: string;
    }>;
}

export interface ResultStat {
    label: string;
    value: string;
    sub?: string;
    color?: string;
}

export type EvaluationType = 'performance' | 'assessment' | 'equipment' | 'procedure';

export interface ResultTable {
    title: string;
    type: EvaluationType;
    items?: ChecklistItem[]; // 이 테이블에 포함될 항목들
    config?: any;
}

export interface ChecklistItem {
    id: string;
    order: number;
    evaluationType?: EvaluationType; // 평가 유형
    eventName: string;
    stateId?: string; // 연결된 state ID (호환성 유지)
    taskType: 'To-do' | 'Decision' | 'Must-not';
    taskName: string;
    description: string;
    score: number;
    feedback: string;
    status?: 'success' | 'fail' | 'partial' | string; // 수행 결과
    value?: string; // 환자 평가 등에서의 입력값
    correctValue?: string; // 정답값
}

export interface AdminActivity {
    id: number;
    type: 'user_registration' | 'license_purchase' | 'client_onboarding' | 'class_creation' | 'scenario_published' | 'license_renewal' | 'support_ticket' | 'license_expiring' | string;
    title: string;
    description: string;
    organizationId?: string;
    organizationName?: string;
    createdDate: string;
    status: 'completed' | 'active' | 'published' | 'in_progress' | 'resolved' | 'warning' | string;

    // Optional specific fields
    userName?: string;
    userEmail?: string;
    userRole?: string;

    licenseType?: string;
    licenseCount?: number;
    amount?: number;
    currency?: string;
    expiryDate?: string;
    daysRemaining?: number;

    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;

    className?: string;
    classType?: string;
    instructorName?: string;

    scenarioTitle?: string;
    scenarioType?: string;
    masterName?: string;

    ticketType?: string;
    priority?: string;
    assignedTo?: string;
}

export interface Note {
    id: string;
    adminId: string;
    adminName: string;
    createdAt: string;
    content: string;
    links: string[];
    attachments: string[];
    images: string[];
}
