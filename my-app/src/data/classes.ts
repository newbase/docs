/**
 * @deprecated 이 파일은 하위 호환성을 위해 유지됩니다.
 * 새로운 코드는 data/queries/useClasses.ts와 data/mock/classes.ts를 사용하세요.
 */
import { mockClassesData } from './mock/classes';

/**
 * 클래스 데이터 구조
 * 
 * 용어 정의:
 * - 클래스명 (Class Name): 각 step의 title 속성
 *   예: 'STEP 1: Learn Skills', 'STEP 2: Act Orders'
 * 
 * - 시나리오명 (Scenario Name): curriculum 배열 내 각 항목의 name 속성
 *   예: '활력징후 측정', '유치도뇨 (여)', '폐렴', '서맥'
 * 
 * 구조:
 * - class id: 001, 002, 003, 004, 005...
 * - class type: ls, ao, md, mb
 * - title: 클래스명
 * - subtitle: 클래스 부제목
 * - description: 클래스 설명
 * - curriculum: 시나리오 배열
 *   - id: 시나리오 ID
 *   - code: 시나리오 코드 (class type+id)
 *   - name: 시나리오명
 *   - duration: 소요 시간
 *   - platform: 지원 플랫폼 (vr, mobile, both)
 *   - isNew: 신규 여부
 */
export interface CurriculumItem {
    id: number;
    code: string;
    name: string;
    duration: string;
    platform: string;
    isNew?: boolean;
    includes?: string;
    type?: 'video' | 'scenario'; // 'video' | 'scenario'
    author?: string;
    authorType?: 'institution' | 'individual';
    url?: string; // 동영상 강의 URL (type이 'video'일 때 사용)
}

export interface ClassItem {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    description: string;
    thumbnail?: string;
    duration?: string;
    patientType?: string;
    curriculum: CurriculumItem[];
    // New fields for detail view
    participationPeriod?: {
        startDate: string;
        endDate: string;
    };
    completionRequirements?: {
        minScenarios: number;
        minPassingScore: number;
        requireAllScenarios: boolean;
    };
    maxParticipants?: number;
    currentParticipants?: number;
    completionRate?: number; // 0-100
    creatorId?: string;
    createdDate?: string; // YYYY-MM-DD
    password?: string; // New field for private class access
    isForSale?: boolean; // New field for admin sale status
    // Admin-specific fields
    saleStatus?: 'available' | 'unavailable'; // 판매상태
    organizationId?: number; // 교육기관 ID (판매가능일 때)
    organizationName?: string; // 교육기관명 (표시용)
    price?: number; // 수강료
    discountPrice?: number; // 할인 금액 (할인 적용 시 실제 가격 = price - discountPrice)
    discountType?: 'none' | 'event' | 'hospital_association'; // 할인 유형
    // UX-design 추가 필드 (하위 호환성)
    organizationLogo?: string; // 기관 로고
    discountInfo?: string; // 할인 정보
    paymentNote?: string; // 결제 관련 메모
    educationSchedule?: string; // 교육 일정
    educationVenue?: string; // 교육 장소
    recruitmentPeriod?: {
        startDate: string;
        endDate: string;
    };
    onlineUrl?: string; // 온라인 URL
    onlinePlatform?: string; // 온라인 플랫폼
    participationMethod?: string; // 참여방법
    participationInfo?: string; // 참여 안내
    category?: 'new-nurse' | 'nursing-college' | 'disaster-emergency' | 'general';
    isNew?: boolean; // 신규 클래스
    isRecommended?: boolean; // 추천 클래스
    isActive?: boolean; // 활성 상태
    classType?: string; // 클래스 타입 (오픈/마이 등)
    productType?: '콘텐츠' | '상품' | '서비스'; // 프로덕트 유형
    /** 판매유형: online(온라인 판매) | agency(기관판매). 프로덕트 정보(가격·온라인URL·교육장소 등)와 일치해야 함 */
    salesType?: 'online' | 'agency';
    enrollmentType?: 'scheduled' | 'ongoing'; // 모집 타입
    courseStartDate?: string; // 코스 시작일
    courseEndDate?: string; // 코스 종료일
}

// 하위 호환성을 위한 export
export const classesData: Record<string, ClassItem> = mockClassesData;
