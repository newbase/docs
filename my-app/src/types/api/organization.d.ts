// Organization API Types

export interface OrganizationInfoDto {
	organizationId: number;
	title: string;
	logo?: string;
	createdAt: string;
	organizationTypeTitle: string;
	/** 대한병원협회 정회원 여부 */
	isKhaRegularMember?: boolean;
	licenseType?: 'USER' | 'DEVICE' | 'LIFETIME' | 'DEMO';
	licenseStatus?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXPIRING_SOON';
	deviceCount: number;
	userCount: number;
	licenseExpiryDate?: string;
	countryId: number;
	countryName: string;
}

export interface GetOrganizationCountResponseDto {
	totalCount: number;
	activeCount: number;
	newCount: number;
	expiringSoonCount: number;
}

export interface GetOrganizationListResponseDto {
	organizationList: OrganizationInfoDto[];
	totalCount: number;
}

export interface OrganizationListCountryDto {
	id: number;
	title: string;
}

export interface OrganizationListOrganizationTypeDto {
	id: number;
	title: string;
}

export interface OrganizationListCountryCallingCodeDto {
	id: number;
	code: string;
	title: string;
}

export interface GetOrganizationDetailResponseDto {
	organizationId: number;
	title: string;
	logo?: string;
	country: OrganizationListCountryDto;
	organizationType: OrganizationListOrganizationTypeDto;
	countryCallingCode: OrganizationListCountryCallingCodeDto;
	businessRegistrationNumber?: string;
	managerName?: string;
	department?: string;
	phoneNumber?: string;
	email?: string;
	createdAt: string;
	licenseStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXPIRING_SOON';
	/** 제휴기관 여부 */
	isPartner?: boolean;
	/** 제휴기관 수수료율 (%) */
	commissionRate?: number;
	/** 대한병원협회 정회원 여부 */
	isKhaRegularMember?: boolean;
}

export interface CreateOrganizationRequestDto {
	title: string;
	countryId: number;
	organizationTypeId: number;
	businessRegistrationNumber?: string;
	managerName?: string;
	department?: string;
	countryCallingCodeId: number;
	phoneNumber?: string;
	email?: string;
	/** 제휴기관 여부 */
	isPartner?: boolean;
	/** 제휴기관 수수료율 (%) */
	commissionRate?: number;
	/** 대한병원협회 정회원 여부 */
	isKhaRegularMember?: boolean;
}

export interface CreateOrganizationResponseDto {
	message: string;
}

export interface UpdateOrganizationBodyDto {
	title?: string;
	countryId: number;
	organizationTypeId: number;
	businessRegistrationNumber?: string;
	managerName?: string;
	department?: string;
	countryCallingCodeId: number;
	phoneNumber?: string;
	email?: string;
	/** 제휴기관 여부 */
	isPartner?: boolean;
	/** 제휴기관 수수료율 (%) */
	commissionRate?: number;
	/** 대한병원협회 정회원 여부 */
	isKhaRegularMember?: boolean;
}

export interface UpdateOrganizationResponseDto {
	message: string;
}

export interface OrganizationTypeInfoDto {
	organizationTypeId: number;
	title: string;
}

export interface GetOrganizationTypeListResponseDto {
	organizationTypeList: OrganizationTypeInfoDto[];
}

export interface CountryInfoDto {
	countryId: number;
	title: string;
}

export interface GetCountryListResponseDto {
	countryList: CountryInfoDto[];
}

export interface CountryCallingCodeInfoDto {
	countryCallingCodeId: number;
	code: string;
	title: string;
}

export interface GetCountryCallingCodeListResponseDto {
	countryCallingCodeList: CountryCallingCodeInfoDto[];
}
