/**
 * Enum 리스트 조회 API 응답 (GET /enum)
 * @see my-app/docs/api/API.md
 */

export interface GetEnumListResponseDto {
	ageUnit?: string[];
	bloodAboType?: string[];
	bloodRhType?: string[];
	characterType?: string[];
	characterSubType?: string[];
	drinkingFrequency?: string[];
	uploadPath?: string[];
	itemType?: string[];
	itemSpotMappingType?: string[];
	mobilityAid?: string[];
	painScaleType?: string[];
	religion?: string[];
	smokingAmount?: string[];
	smokingDuration?: string[];
	patientOrderHistoryType?: string[];
	medicationFrequency?: string[];
	medicationRoute?: string[];
	scenarioCategoryType?: string[];
	[key: string]: string[] | undefined;
}
