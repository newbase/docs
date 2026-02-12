/**
 * License Utility Functions
 * 라이센스 관련 유틸리티 함수
 */

import { LicenseDetailDto } from '@/types/api/license';
import { License } from '@/types/admin';

/**
 * LicenseDetailDto를 License 타입으로 변환
 * 
 * @param dto - Backend API 응답 DTO
 * @returns License 타입 객체
 */
export const convertLicenseDtoToLicense = (dto: LicenseDetailDto): License => {
	// 라이센스 타입 변환
	const getLicenseType = (type: LicenseDetailDto['type']): string => {
		const typeMap: Record<LicenseDetailDto['type'], string> = {
			USER: '사용자',
			DEVICE: '기기',
			LIFETIME: '평생',
			DEMO: '데모',
		};
		return typeMap[type] || type;
	};

	// 상태 변환
	const getStatus = (status: LicenseDetailDto['status']): License['status'] => {
		const statusMap: Record<LicenseDetailDto['status'], License['status']> = {
			ACTIVE: 'active',
			INACTIVE: 'pending',
			EXPIRED: 'expired',
			EXPIRING_SOON: 'expiring',
		};
		return statusMap[status] || 'pending';
	};

	// 기간 계산
	const getDuration = (): string => {
		if (!dto.validityPeriod || !dto.validityPeriodUnit) {
			return dto.type === 'LIFETIME' ? '평생' : '-';
		}
		
		const unitMap: Record<string, string> = {
			MONTH: '개월',
			YEAR: '년',
		};
		
		return `${dto.validityPeriod}${unitMap[dto.validityPeriodUnit] || ''}`;
	};

	// 날짜 포맷 변환 (ISO → YYYY.MM.DD)
	const formatDate = (isoDate: string | null | undefined): string => {
		if (!isoDate) return '-';
		try {
			const date = new Date(isoDate);
			if (isNaN(date.getTime())) return '-';
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${year}.${month}.${day}`;
		} catch {
			return '-';
		}
	};

	// 플랫폼 정보 (현재 DTO에 없으므로 기본값)
	const getPlatform = (): string => {
		// TODO: DTO에 platform 정보가 추가되면 사용
		return 'Web/Mobile';
	};

	return {
		id: String(dto.organizationLicenseId),
		className: dto.scenarioTitle,
		subscriptionPlan: dto.plan, // 'BASIC' | 'PRO'
		plan: dto.plan,
		platform: getPlatform(),
		licenseType: getLicenseType(dto.type),
		subscriptionType: getLicenseType(dto.type),
		duration: getDuration(),
		period: getDuration(),
		activeUsers: dto.quantity || 0, // TODO: Real API에서 실제 활성 사용자 수 필요
		maxUsers: dto.quantity || '무제한',
		totalUsers: 0, // TODO: Real API에서 누적 사용자 수 필요
		cumulativeUsers: 0,
		activeDevices: 0, // TODO: Real API에서 기기 정보 필요
		// maxDevices는 number 타입이므로 '무제한' 대신 undefined 사용 (DEVICE 타입은 무제한이므로 undefined)
		maxDevices: dto.type === 'DEVICE' ? undefined : 0,
		startDate: formatDate(dto.startAt),
		endDate: dto.endAt ? formatDate(dto.endAt) : null,
		status: getStatus(dto.status),
	};
};

/**
 * 라이센스 타입 배지 색상 반환
 * 
 * @param type - 라이센스 타입
 * @returns Tailwind CSS 클래스
 */
export const getLicenseTypeBadgeColor = (type: string): string => {
	const colorMap: Record<string, string> = {
		'사용자': 'bg-blue-100 text-blue-800',
		'기기': 'bg-purple-100 text-purple-800',
		'평생': 'bg-green-100 text-green-800',
		'데모': 'bg-gray-100 text-gray-800',
	};
	return colorMap[type] || 'bg-gray-100 text-gray-800';
};

/**
 * 라이센스 상태 배지 정보 반환
 * 
 * @param status - 라이센스 상태
 * @returns 배지 레이블과 variant
 */
export const getLicenseStatusBadge = (status: License['status']): { 
	label: string; 
	variant: 'default' | 'secondary' | 'destructive' | 'outline' 
} => {
	const badges: Record<License['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
		active: { label: '활성', variant: 'default' },
		expiring: { label: '만료임박', variant: 'destructive' },
		expired: { label: '만료', variant: 'destructive' },
		pending: { label: '대기', variant: 'secondary' },
	};
	return badges[status] || badges.pending;
};

/**
 * 라이센스 만료까지 남은 일수 계산
 * 
 * @param endDate - 종료일 (YYYY.MM.DD 형식)
 * @returns 남은 일수 (만료된 경우 음수)
 */
export const getDaysUntilExpiry = (endDate: string | null | undefined): number | null => {
	if (!endDate || endDate === '-') return null;
	
	try {
		const [year, month, day] = endDate.split('.').map(Number);
		const end = new Date(year, month - 1, day);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		end.setHours(0, 0, 0, 0);
		
		const diffTime = end.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		
		return diffDays;
	} catch {
		return null;
	}
};

/**
 * 라이센스 사용률 계산
 * 
 * @param activeUsers - 현재 활성 사용자 수
 * @param maxUsers - 최대 사용자 수
 * @returns 사용률 (0-100) 또는 null
 */
export const getLicenseUsagePercentage = (
	activeUsers: number | string | undefined,
	maxUsers: number | string | undefined
): number | null => {
	if (!activeUsers || !maxUsers || maxUsers === '무제한') return null;
	
	const active = typeof activeUsers === 'string' ? parseInt(activeUsers) : activeUsers;
	const max = typeof maxUsers === 'string' ? parseInt(maxUsers) : maxUsers;
	
	if (isNaN(active) || isNaN(max) || max === 0) return null;
	
	return Math.round((active / max) * 100);
};
