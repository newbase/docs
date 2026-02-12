// Device API Types

export interface DeviceTypeDto {
	deviceTypeId: number;
	title: string;
}

export interface GetDeviceTypeListResponseDto {
	deviceTypeList: DeviceTypeDto[];
}

export interface RegisterDeviceRequestDto {
	title: string;
	model: string;
	deviceId: string;
	deviceTypeId: number;
}

export interface RegisterDeviceResponseDto {
	classDeviceMappingId: number;
}

export interface UpdateDeviceRequestDto {
	title: string;
	purchaseSource?: string;
	isActive: boolean;
}

export interface UpdateDeviceResponseDto {
	message: string;
}

export interface DeviceLicenseInfoDto {
	organizationLicenseId: number;
}

export interface DeviceScenarioInfoDto {
	scenarioTitle: string;
	additionalScenarioCount: number;
}

export interface OrganizationDeviceDetailDto {
	deviceId: number;
	deviceTitle: string;
	deviceModel: string;
	deviceDeviceId: string;
	deviceType: string;
	purchaseSource?: string;
	createdAt: string;
	lastSigninAt?: string;
	registeredLicenseIds: DeviceLicenseInfoDto[];
	scenarioInfo: DeviceScenarioInfoDto;
}

export interface OrganizationDeviceStatsDto {
	totalDeviceCount: number;
	activeDeviceCount: number;
	inactiveDeviceCount: number;
}

export interface GetOrganizationDeviceListResponseDto {
	deviceList: OrganizationDeviceDetailDto[];
	deviceStats: OrganizationDeviceStatsDto;
	totalCount: number;
}

export interface RegisterDeviceLicenseRequestDto {
	organizationLicenseId: number;
	deviceIdList: number[];
}

export interface RegisterDeviceLicenseResponseDto {
	message: string;
}

export interface UpdateDeviceLicenseRequestDto {
	deviceIdList: number[];
}

export interface UpdateDeviceLicenseResponseDto {
	message: string;
}
