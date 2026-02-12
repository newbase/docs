export type Role = 'guest' | 'student' | 'master' | 'admin';

/**
 * 백엔드 role 숫자를 프론트엔드 role 문자열로 변환
 * 
 * @param roleNumber - 백엔드에서 반환하는 role 숫자 (0: guest, 1: student, 2: master, 5: admin)
 * @returns 프론트엔드 role 문자열 ('guest' | 'student' | 'master' | 'admin')
 * 
 * @example
 * convertRoleNumberToString(0) // 'guest'
 * convertRoleNumberToString(1) // 'student'
 * convertRoleNumberToString(2) // 'master'
 * convertRoleNumberToString(5) // 'admin'
 */
export const convertRoleNumberToString = (roleNumber: number): Role => {
	const roleMap: Record<number, Role> = {
		0: 'guest',
		1: 'student',
		2: 'master',
		5: 'admin'
	};
	
	return roleMap[roleNumber] || 'guest';
};

export const getRoleBadgeClasses = (role: string): string => {
    const classes: Record<string, string> = {
        guest: 'text-green-600 border-green-600 bg-green-50',
        student: 'text-blue-500 border-blue-500 bg-blue-50',
        master: 'text-purple-600 border-purple-600 bg-purple-50',
        admin: 'text-red-500 border-red-500 bg-red-50'
    };
    return classes[role] || 'text-gray-500 border-gray-500 bg-gray-50';
};

export const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
        guest: 'Guest',
        student: 'Student',
        master: 'Master',
        admin: 'Admin'
    };
    return labels[role] || role;
};

export type LicenseType = 'pro' | 'pro_class' | 'basic_personal' | 'basic_class' | 'pro_univ_student' | 'pro_univ_master';

interface Badge {
    label: string;
    className: string;
}

export const getLicenseBadgeClasses = (license: string): Badge => {
    // Default primary color style
    const primaryStyle = 'text-blue-600 border-blue-600 bg-blue-50';
    const guestStyle = 'text-green-600 border-green-600 bg-green-50';

    const badges: Record<string, Badge> = {
        guest: { label: 'GUEST', className: guestStyle },
        pro: { label: 'PRO', className: primaryStyle },
        pro_class: { label: 'PRO', className: primaryStyle },
        basic_personal: { label: 'BASIC', className: primaryStyle },
        basic_class: { label: 'BASIC', className: primaryStyle },
        pro_univ_student: { label: 'PRO', className: primaryStyle },
        pro_univ_master: { label: 'PRO', className: primaryStyle }
    };
    return badges[license] || { label: 'FREE', className: 'text-gray-500 border-gray-500 bg-gray-50' };
};

/**
 * 게스트 만료일 포맷팅 함수
 * @param expirationDate - 백엔드에서 받은 만료일 (ISO 8601) 또는 null
 * @returns 포맷팅된 만료일 문자열 (예: "2026. 01. 28.")
 * @note 백엔드 작업 완료 전까지는 임시로 "오늘 + 7일" 반환
 */
export const getGuestExpirationDate = (expirationDate?: string | null): string => {
    // 백엔드에서 만료일을 제공하는 경우
    if (expirationDate) {
        const date = new Date(expirationDate);
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    
    // 백엔드 작업 완료 전까지 임시 Mock 데이터 (오늘 + 7일)
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

// License-based feature access for Master users
export const isProLicense = (license?: LicenseType): boolean => {
    if (!license) return false;
    return license.startsWith('pro');
};

export const hasStudioAccess = (role: Role, license?: LicenseType): boolean => {
    return role === 'admin' || (role === 'master' && isProLicense(license));
};

export const hasNaturalLanguageAccess = (role: Role, license?: LicenseType): boolean => {
    return role === 'admin' || (role === 'master' && isProLicense(license));
};
