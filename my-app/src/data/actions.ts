// ============================================
// Action Management Types & Interfaces
// ============================================

// Requirement types (for prerequisites)
export type RequirementType =
    | 'none'                    // 조건 없음
    | 'item_equipped'           // 아이템 착용 시
    | 'item_used'               // 아이템 사용 시
    | 'skill_completed'         // 스킬 완료 시
    | 'time_elapsed'            // 시간 경과 시
    | 'patient_state'           // 환자 상태 조건
    | 'vital_sign'              // 활력징후 조건
    | 'location'                // 위치 조건
    | 'dialogue_completed'      // 대화 완료 시
    | 'custom';                 // 커스텀 조건

export type ActionType = '대화'| '아이템' |'SBAR'|'EMR'|'동료호출'|'퀴즈'|'기타';

// Action start tracking (기존 대화: 대화창 오픈, 아이템: 아이템 잡기, SBAR: SBAR 오픈, EMR: EMR 탭 클릭, 퀴즈: 퀴즈 시작, 기타: 기타)
export type ActionStartTracking = 
    |'윈도우 오픈' 
    |'아이템 잡기' 
    |'동료호출' 
    |'메시지 팝업' 
    |'입력 시작'
    |'음성인식 시작' 
    |'기타';

// Action end tracking (기존 대화: 대화창 닫기, 아이템: 아이템 놓기, SBAR: SBAR 닫기, EMR: EMR 탭 닫기, 퀴즈: 퀴즈 종료, 기타: 기타)
export type ActionEndTracking = 
    |'완료 조건 충족' // 완료 조건 충족 시 감지
    |'실패 조건 충족' // 실패 조건 충족 시 감지
    |'인터랙션 종료 후 대기시간 초과' // 인터랙션 종료 후 대기시간 초과 시 감지
    |'입력 대기시간 초과' // 입력 대기시간 초과 시 감지
    |'음성인식 대기시간 초과' // 음성인식 대기시간 초과 시 감지
    |'완료 버튼 클릭' // 완료 버튼 클릭 시 감지 
    |'취소 버튼 클릭' // 취소/닫기 버튼 클릭 시 감지 
    |'윈도우 닫기' // 윈도우 닫기 시 감지
    |'기타'; // 기타 경우

// Action Complete Condition
export type ActionCompleteCondition = 
    |'발화완료' // 음성인식율 80% 이상 
    |'정답 수치 입력' // 정답 범위 내 수치 입력 완료
    |'정답 선택' // 정답 선택 완료 
    |'정답 도구 선택' // 적합한 도구 선택 후 사용 완료
    |'정답 스팟 선택' // 적합한 스팟 선택
    |'유효 인터랙션 회수 충족' // 정답 인터랙션 인식 범위 내 
    |'확인 완료' // 확인 완료  
    |'기타'; // 기타 경우

// Spot types 
export type SpotType = '환자'|'물품'|'장비'|'플레이어';

// Effect configuration
export interface ActionEffect {
    hapticVibration: boolean;      // 햅틱 진동
    warningSound?: boolean;         // 경고음 (실패 시)
    completionSound?: boolean;      // 완료알림음 (완료 시)
}

export interface Action {
    // 기본 정보
    key: string;                      // 고유 키
    name: string;                     // 액션명
    category: string;                 // 카테고리
    description: string;              // 설명

    // === 액션 시작 (Action Start) ===
    actionStartType: ActionStartTracking;           // 액션 시작 타입
    templateId?: string;              // 템플릿/아이템 선택

    // === 액션 실패 조건 (Action Failure) ===
    requiredConditionTarget?: string;         // 조건 대상
    requiredConditionType?: RequirementType;  // 조건 유형
    requiredConditionDetail?: string;         // 내용

    // === 실패 효과 (Failure Effect) ===
    failureEffect?: ActionEffect;     // 햅틱 진동, 경고음

    // 재시도 설정
    maxRetryCount?: number;           // 다시시도 회수

    // 재시도 힌트
    firstHintText?: string;            // 첫 번째 힌트
    secondHintText?: string;           // 두 번째 힌트
    thirdHintText?: string;            // 세 번째 힌트

    // 최종 실패 시 처리
    completeOnFinalFailure?: boolean;  // 최종 액션 실패 시 completion 처리 여부
    finalFailureMessage?: string;       // 최종 실패 메시지

    // === 액션 완료 (Action Complete) ===
    completeCondition?: ActionCompleteCondition;   // 완료 조건

    // === 완료 조건 (Action Complete Condition) ===
    correctToolUsed?: string;            // 유효 도구 사용
    correctSpotSelected?: string;        // 유효 스팟 선택
    validInteractionCount?: 'none' | 'partial' | 'full';    // 유효 인터랙션 회수 (3~5)
    correctTopic?: string;             // 정답 토픽
    correctInputValue?: number;          // 정답 입력 값 
    correctAnswer?: string;              // 정답 답변
    validTimeLimit?: number;           // 유효 시간 제한 (초)

    // 보상
    score?: number;                   // 획득 점수

    // 완료 효과
    completionEffect?: ActionEffect;  // 햅틱 진동, 완료알림음

    // 메타데이터
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    usageCount?: number;              // 사용 횟수 
}

// ============================================
// Mock Data
// ============================================

export const actions: Action[] = [
    {
        key: 'action_vital_bp_check',
        name: '혈압 측정',
        category: '활력징후',
        description: '비침습적 혈압계를 사용하여 환자의 혈압을 측정합니다.',

        // 액션 시작
        actionStartType: '아이템 잡기',

        // 액션 실패
        requiredConditionType: 'item_equipped',
        requiredConditionTarget: 'eq_mon_01',
        requiredConditionDetail: '바이탈 모니터 착용 필요',
        maxRetryCount: 3, // 3번 재시도 가능
        firstHintText : '놓친 것이 있는지 확인해 보세요',
        secondHintText: '환자의 좌측 상완에 커프를 감아주세요',
        finalFailureMessage: '제가 대신 감아드릴게요. 다음 할 일을 진행해주세요',
        failureEffect: {
            hapticVibration: true,
            warningSound: true
        },

        // 액션 완료
        completeCondition: '정답 도구 선택',
        correctToolUsed: 'eq_mon_01',
        correctSpotSelected: 'sp000201',
        validInteractionCount: 'none',
        score: 10,
        completionEffect: {
            hapticVibration: true,
            completionSound: true
        },

        createdAt: '2026-01-13',
        updatedAt: '2026-01-13',
        createdBy: 'admin',
        usageCount: 0
    },
    {
        key: 'action_med_epi_admin',
        name: '에피네프린 투여',
        category: '투약',
        description: '심정지 환자에게 에피네프린을 정맥 투여합니다.',

        // 액션 시작
        actionStartType: '아이템 잡기',
        templateId: 'med_epi_01',

        // 액션 실패
        requiredConditionType: 'patient_state',
        requiredConditionTarget: 'cardiac_arrest',
        requiredConditionDetail: '심정지 상태',
        maxRetryCount: 2,
        firstHintText: '정맥로를 통해 천천히 투여하세요',
        failureEffect: {
            hapticVibration: true,
            warningSound: true
        },

        // 액션 완료
        completeCondition: '정답 도구 선택',
        correctToolUsed: 'tool_syringe_01',
        correctSpotSelected: 'sp000202',
        score: 15,
        completionEffect: {
            hapticVibration: true,
            completionSound: true
        },

        createdAt: '2026-01-13',
        updatedAt: '2026-01-13',
        createdBy: 'admin',
        usageCount: 0
    },
    {
        key: 'action_dialogue_assessment',
        name: '환자 평가 대화',
        category: '기록',
        description: '환자 상태를 평가하기 위한 대화를 진행합니다.',

        // 액션 시작
        actionStartType: '윈도우 오픈',
        templateId: 'dialogue_assessment_01',

        // 액션 실패
        requiredConditionType: 'none',
        maxRetryCount: 5,
        firstHintText: '환자에게 현재 증상에 대해 물어보세요',
        failureEffect: {
            hapticVibration: false,
            warningSound: false
        },

        // 액션 완료
        completeCondition: '정답 스팟 선택',
        correctSpotSelected: 'sp000005',
        score: 5,
        completionEffect: {
            hapticVibration: false,
            completionSound: true
        },

        createdAt: '2026-01-13',
        updatedAt: '2026-01-13',
        createdBy: 'admin',
        usageCount: 0
    },
    {
        key: 'action_emr_record',
        name: 'EMR 기록',
        category: '기록',
        description: '환자의 활력징후를 EMR에 기록합니다.',

        // 액션 시작
        actionStartType: '윈도우 오픈',
        templateId: 'emr_vital_signs',

        // 액션 실패
        requiredConditionType: 'skill_completed',
        requiredConditionTarget: 'action_vital_bp_check',
        requiredConditionDetail: '혈압 측정 완료 필요',
        maxRetryCount: 3,
        firstHintText: '측정한 활력징후 값을 정확히 입력하세요',
        failureEffect: {
            hapticVibration: true,
            warningSound: false
        },

        // 액션 완료
        completeCondition: '정답 스팟 선택',
        correctSpotSelected: 'sp_emr_terminal',
        score: 8,
        completionEffect: {
            hapticVibration: false,
            completionSound: true
        },

        createdAt: '2026-01-13',
        updatedAt: '2026-01-13',
        createdBy: 'admin',
        usageCount: 0
    },
    {
        key: 'action_quiz_cpr',
        name: 'CPR 지식 퀴즈',
        category: '교육',
        description: 'CPR에 대한 지식을 확인하는 퀴즈입니다.',

        // 액션 시작
        actionStartType: '윈도우 오픈',
        templateId: 'quiz_cpr_basics',

        // 액션 실패
        requiredConditionType: 'none',
        maxRetryCount: 2,
        firstHintText: '성인 CPR의 압박 깊이는 최소 5cm입니다',
        failureEffect: {
            hapticVibration: true,
            warningSound: true
        },

        // 액션 완료
        completeCondition: '정답 선택',
        correctAnswer: '5cm',
        score: 20,
        completionEffect: {
            hapticVibration: false,
            completionSound: true
        },
        createdAt: '2026-01-13',
        updatedAt: '2026-01-13',
        createdBy: 'admin',
        usageCount: 0
    },
    {
        key: 'action_report_supervisor',
        name: '상급자 보고',
        category: '보고',
        description: '환자 상태를 상급자에게 보고합니다.',

        // 액션 시작
        actionStartType: '윈도우 오픈',
        templateId: 'report_sbar',

        // 액션 실패
        requiredConditionType: 'time_elapsed',
        requiredConditionTarget: '300',
        requiredConditionDetail: '5분 경과 후',
        maxRetryCount: 3,
        firstHintText: 'SBAR 형식에 맞춰 보고하세요',
        failureEffect: {
            hapticVibration: true,
            warningSound: false
        },

        // 액션 완료
        score: 12,
        completionEffect: {
            hapticVibration: false,
            completionSound: true
        },

        createdAt: '2026-01-13',
        updatedAt: '2026-01-13',
        createdBy: 'admin',
        usageCount: 0
    }
];

// ============================================
// Helper Functions
// ============================================

export const getActionsByCategory = (category: string): Action[] => {
    return actions.filter(action => action.category === category);
};

export const getActionByKey = (key: string): Action | undefined => {
    return actions.find(action => action.key === key);
};

export const getActionCategories = (): string[] => {
    return Array.from(new Set(actions.map(action => action.category)));
};

export const getRequirementTypeLabel = (type: RequirementType): string => {
    const labels: Record<RequirementType, string> = {
        none: '조건 없음',
        item_equipped: '아이템 착용',
        item_used: '아이템 사용',
        skill_completed: '스킬 완료',
        time_elapsed: '시간 경과',
        patient_state: '환자 상태',
        vital_sign: '활력징후',
        location: '위치',
        dialogue_completed: '대화 완료',
        custom: '커스텀'
    };
    return labels[type] || type;
};

export const getActionTypeLabel = (type: ActionType): string => {
    return type; // Already in Korean
};

export const getSpotTypeLabel = (type: SpotType): string => {
    return type; // Already in Korean
};
