/**
 * 간소화된 기관 목록 Mock 데이터
 * Organization Simple List Mock Data
 * 
 * @description
 * AddMemberModal, 필터링 등에서 사용하는 간소화된 기관 목록
 * id와 name만 포함
 */

export interface OrganizationSimple {
	id: number;
	name: string;
}

/**
 * Mock 기관 목록 데이터
 */
export const organizationSimpleList: OrganizationSimple[] = [
	{ id: 1, name: '서울대학교병원' },
	{ id: 2, name: '연세대학교병원' },
	{ id: 3, name: '삼성서울병원' },
	{ id: 4, name: '서울아산병원' },
	{ id: 5, name: '강남세브란스병원' },
	{ id: 6, name: '분당서울대병원' },
	{ id: 7, name: '가톨릭대학교 서울성모병원' },
	{ id: 8, name: '고려대학교안암병원' },
	{ id: 9, name: '한양대학교병원' },
	{ id: 10, name: '경희대학교병원' },
	{ id: 11, name: '이화여자대학교의료원' },
	{ id: 12, name: '중앙대학교병원' },
	{ id: 13, name: '건국대학교병원' },
	{ id: 14, name: '인하대학교병원' },
	{ id: 15, name: '가천대학교 길병원' },
	{ id: 16, name: '순천향대학교 서울병원' },
	{ id: 17, name: '단국대학교병원' },
	{ id: 18, name: '원광대학교병원' },
	{ id: 19, name: '동아대학교병원' },
	{ id: 20, name: '부산대학교병원' },
];

/**
 * 기관 검색 함수
 * @param query 검색어 (기관명)
 * @returns 검색 결과
 */
export const searchOrganizations = (query: string): OrganizationSimple[] => {
	if (!query.trim()) {
		return organizationSimpleList;
	}
	
	const lowerQuery = query.toLowerCase();
	return organizationSimpleList.filter(org => 
		org.name.toLowerCase().includes(lowerQuery)
	);
};

/**
 * ID로 기관 찾기
 * @param id 기관 ID
 * @returns 기관 정보 또는 undefined
 */
export const getOrganizationById = (id: number): OrganizationSimple | undefined => {
	return organizationSimpleList.find(org => org.id === id);
};
