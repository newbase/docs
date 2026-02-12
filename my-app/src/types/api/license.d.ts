// License API Types

export interface LicenseDetailDto {
	organizationLicenseId: number;
	scenarioTitle: string;
	type: 'USER' | 'DEVICE' | 'LIFETIME' | 'DEMO';
	quantity?: number;
	startAt: string;
	endAt?: string;
	status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXPIRING_SOON';
	createdAt: string;
	plan: 'BASIC' | 'PRO';
	validityPeriod?: number;
	validityPeriodUnit?: 'MONTH' | 'YEAR';
	curriculumIdList: number[];
}

export interface GetLicenseListResponseDto {
	licenseList: LicenseDetailDto[];
	totalCount: number;
}

export interface CreateLicenseRequestDto {
	organizationId: number;
	type: 'USER' | 'DEVICE' | 'LIFETIME' | 'DEMO';
	plan: 'BASIC' | 'PRO';
	quantity?: number;
	validityPeriod?: number;
	validityUnit?: 'MONTH' | 'YEAR';
	startDate: string;
	endDate: string;
	curriculumIdList: number[];
}

export interface CreateLicenseResponseDto {
	message: string;
}

export interface UpdateLicenseRequestDto {
	type: 'USER' | 'DEVICE' | 'LIFETIME' | 'DEMO';
	plan: 'BASIC' | 'PRO';
	quantity?: number;
	validityPeriod?: number;
	validityPeriodUnit?: 'MONTH' | 'YEAR';
	startDate: string;
	endDate?: string;
	curriculumIdList: number[];
}

export interface UpdateLicenseResponseDto {
	message: string;
	license?: LicenseDetailDto;
	deactivatedUsers?: { id: number; name: string }[];
}

export interface OrganizationCurriculumDto {
	curriculumId: number;
	title: string;
}

export interface GetCurriculumListByOrganizationResponseDto {
	curriculumList: OrganizationCurriculumDto[];
	totalCount: number;
}
