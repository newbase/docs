/**
 * 클래스 생성 위저드용 Mock 데이터
 * - 오픈클래스/마이클래스 생성 시 기관 선택 드롭다운 등에서 사용
 */

export interface MockOrganizationForClassCreate {
    organizationId: number;
    title: string;
}

/** 클래스 생성 시 기관 선택용 mock 기관 목록 */
export const mockOrganizationsForClassCreate: MockOrganizationForClassCreate[] = [
    { organizationId: 1, title: '메디크루 병원' },
    { organizationId: 2, title: '서울대학교병원' },
    { organizationId: 3, title: '연세세브란스병원' },
    { organizationId: 4, title: '삼성서울병원' },
    { organizationId: 5, title: '서울아산병원' },
    { organizationId: 6, title: '고려대학교병원' },
];
