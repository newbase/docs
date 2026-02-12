// Course (Class) API Types

export interface CourseListItemDto {
	courseId: number;
	title: string;
	scenarioCount: number;
	participantCount: number;
	startDate: string;
	endDate: string | null;
	isActive: boolean;
}

export interface GetCourseListByOrganizationResponseDto {
	courseList: CourseListItemDto[];
	totalCount: number;
	totalParticipantCount: number;
}

export interface CourseScenarioInfoDto {
	scenarioId: number;
	order: number;
}

export interface GetCourseDetailResponseDto {
	courseId: number;
	title: string;
	isPrivate: boolean;
	minPerfectCount: number | null;
	minExcellentOrHigherCount: number | null;
	minGoodOrHigherCount: number | null;
	minPlayCount: number | null;
	scenarioList: CourseScenarioInfoDto[];
}

export interface CreateCourseScenarioRequestDto {
	scenarioId: number;
	order: number;
}

export interface CreateCourseRequestDto {
	organizationId: number;
	organizationLicenseIdList: number[];
	title: string;
	isPrivate: boolean;
	isOpenClass?: boolean;
	enrollmentType?: 'online' | 'offline';
	recruitmentStartDate?: string;
	recruitmentEndDate?: string;
	recruitmentCapacity?: number;
	participationGuide?: string;
	subscriptionStartDate?: string;
	subscriptionEndDate?: string;
	subscriptionPeriodDays?: number;
	price?: number;
	discountRate?: number;
	discountPrice?: number;
	discountStartDate?: string;
	discountEndDate?: string;
	thumbnailImage?: string;
	password?: string;

	minPerfectCount?: number;
	minExcellentOrHigherCount?: number;
	minGoodOrHigherCount?: number;
	minPlayCount?: number;
	scenarioList: CreateCourseScenarioRequestDto[];
	isActive?: boolean;
}

export interface CreateCourseResponseDto {
	courseId: number;
}

export interface UpdateCourseScenarioRequestDto {
	scenarioId: number;
	order: number;
}

export interface UpdateCourseRequestDto {
	title?: string;
	isPrivate?: boolean;
	isOpenClass?: boolean;
	enrollmentType?: 'online' | 'offline';
	recruitmentStartDate?: string;
	recruitmentEndDate?: string;
	recruitmentCapacity?: number;
	participationGuide?: string;
	subscriptionStartDate?: string;
	subscriptionEndDate?: string;
	subscriptionPeriodDays?: number;
	price?: number;
	discountRate?: number;
	discountPrice?: number;
	discountStartDate?: string;
	discountEndDate?: string;
	thumbnailImage?: string;
	password?: string;

	minPerfectCount?: number;
	minExcellentOrHigherCount?: number;
	minGoodOrHigherCount?: number;
	minPlayCount?: number;
	scenarioList?: UpdateCourseScenarioRequestDto[];
	isActive?: boolean;
}
