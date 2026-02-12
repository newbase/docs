/**
 * Terms 관련 TypeScript 타입 정의
 * 
 * Swagger API 문서 기반으로 정의됨
 * 출처: https://api.scenario-studio-test.medicrew.me/swagger
 * 
 * @see my-app/docs/api/API.md
 */

/**
 * 약관 타입
 */
export type TermsType = 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY';

/**
 * 약관 항목
 * GET /terms/list
 */
export interface TermsListItemDto {
	termsId: number;
	type: TermsType;
	version: string;
	title: string;
	content: string;
	isRequired: boolean;
	createdAt: string; // ISO 8601 날짜
}

/**
 * 이용약관 리스트 조회 응답
 * GET /terms/list
 */
export interface GetTermsListResponseDto {
	termsList: TermsListItemDto[];
}
