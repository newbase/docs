/**
 * 날짜/시간 포맷팅 유틸리티
 * Date Formatting Utilities
 * 
 * ISO 8601 형식의 날짜/시간을 다양한 형식으로 변환하는 함수들
 */

/**
 * ISO 8601 날짜를 한국 형식으로 변환
 * @param isoDate ISO 8601 형식 날짜 문자열 (예: "2025-01-15T10:30:00Z")
 * @returns "2025년 1월 15일" 형식 문자열
 * 
 * @example
 * formatDate("2025-01-15T10:30:00Z") // "2025년 1월 15일"
 */
export const formatDate = (isoDate: string | null | undefined): string => {
	if (!isoDate) return '-';
	
	try {
		const date = new Date(isoDate);
		if (isNaN(date.getTime())) return '-';
		
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		
		return `${year}년 ${month}월 ${day}일`;
	} catch {
		return '-';
	}
};

/**
 * ISO 8601 날짜를 YYYY-MM-DD 형식으로 변환
 * @param isoDate ISO 8601 형식 날짜 문자열
 * @returns "2025-01-15" 형식 문자열
 * 
 * @example
 * formatDateShort("2025-01-15T10:30:00Z") // "2025-01-15"
 */
export const formatDateShort = (isoDate: string | null | undefined): string => {
	if (!isoDate) return '-';
	
	try {
		const date = new Date(isoDate);
		if (isNaN(date.getTime())) return '-';
		
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		
		return `${year}-${month}-${day}`;
	} catch {
		return '-';
	}
};

/**
 * ISO 8601 날짜를 날짜+시간 형식으로 변환
 * @param isoDate ISO 8601 형식 날짜 문자열
 * @returns "2025-01-15 10:30" 형식 문자열
 * 
 * @example
 * formatDateTime("2025-01-15T10:30:00Z") // "2025-01-15 10:30"
 */
export const formatDateTime = (isoDate: string | null | undefined): string => {
	if (!isoDate) return '-';
	
	try {
		const date = new Date(isoDate);
		if (isNaN(date.getTime())) return '-';
		
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		
		return `${year}-${month}-${day} ${hours}:${minutes}`;
	} catch {
		return '-';
	}
};

/**
 * ISO 8601 날짜를 날짜+시간+초 형식으로 변환
 * @param isoDate ISO 8601 형식 날짜 문자열
 * @returns "2025-01-15 10:30:45" 형식 문자열
 * 
 * @example
 * formatDateTimeWithSeconds("2025-01-15T10:30:45Z") // "2025-01-15 10:30:45"
 */
export const formatDateTimeWithSeconds = (isoDate: string | null | undefined): string => {
	if (!isoDate) return '-';
	
	try {
		const date = new Date(isoDate);
		if (isNaN(date.getTime())) return '-';
		
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	} catch {
		return '-';
	}
};

/**
 * ISO 8601 날짜를 한국어 날짜+시간 형식으로 변환
 * @param isoDate ISO 8601 형식 날짜 문자열
 * @returns "2025년 1월 15일 10:30" 형식 문자열
 * 
 * @example
 * formatDateTimeKorean("2025-01-15T10:30:00Z") // "2025년 1월 15일 10:30"
 */
export const formatDateTimeKorean = (isoDate: string | null | undefined): string => {
	if (!isoDate) return '-';
	
	try {
		const date = new Date(isoDate);
		if (isNaN(date.getTime())) return '-';
		
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		
		return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
	} catch {
		return '-';
	}
};

/**
 * 상대 시간 표시 (예: "3일 전", "방금 전")
 * @param isoDate ISO 8601 형식 날짜 문자열
 * @returns 상대 시간 문자열
 * 
 * @example
 * formatRelativeTime("2025-01-20T10:30:00Z") // "3일 전" (오늘이 2025-01-23인 경우)
 */
export const formatRelativeTime = (isoDate: string | null | undefined): string => {
	if (!isoDate) return '-';
	
	try {
		const date = new Date(isoDate);
		if (isNaN(date.getTime())) return '-';
		
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		
		// 미래 날짜
		if (diffMs < 0) {
			const futureDiffMs = Math.abs(diffMs);
			const futureDiffDays = Math.floor(futureDiffMs / (1000 * 60 * 60 * 24));
			
			if (futureDiffDays === 0) return '오늘';
			if (futureDiffDays === 1) return '내일';
			if (futureDiffDays < 7) return `${futureDiffDays}일 후`;
			if (futureDiffDays < 30) return `${Math.floor(futureDiffDays / 7)}주 후`;
			if (futureDiffDays < 365) return `${Math.floor(futureDiffDays / 30)}개월 후`;
			return `${Math.floor(futureDiffDays / 365)}년 후`;
		}
		
		// 과거 날짜
		const diffSeconds = Math.floor(diffMs / 1000);
		const diffMinutes = Math.floor(diffSeconds / 60);
		const diffHours = Math.floor(diffMinutes / 60);
		const diffDays = Math.floor(diffHours / 24);
		
		if (diffSeconds < 60) return '방금 전';
		if (diffMinutes < 60) return `${diffMinutes}분 전`;
		if (diffHours < 24) return `${diffHours}시간 전`;
		if (diffDays === 0) return '오늘';
		if (diffDays === 1) return '어제';
		if (diffDays < 7) return `${diffDays}일 전`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
		return `${Math.floor(diffDays / 365)}년 전`;
	} catch {
		return '-';
	}
};

/**
 * 두 날짜 사이의 일수 계산
 * @param startDate 시작 날짜 (ISO 8601)
 * @param endDate 종료 날짜 (ISO 8601)
 * @returns 일수 (양수)
 * 
 * @example
 * getDaysBetween("2025-01-15T00:00:00Z", "2025-01-20T00:00:00Z") // 5
 */
export const getDaysBetween = (
	startDate: string | null | undefined, 
	endDate: string | null | undefined
): number => {
	if (!startDate || !endDate) return 0;
	
	try {
		const start = new Date(startDate);
		const end = new Date(endDate);
		
		if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
		
		const diffMs = Math.abs(end.getTime() - start.getTime());
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		
		return diffDays;
	} catch {
		return 0;
	}
};

/**
 * 날짜가 과거인지 확인
 * @param isoDate ISO 8601 형식 날짜 문자열
 * @returns true if 과거, false if 현재/미래
 * 
 * @example
 * isPastDate("2024-01-15T00:00:00Z") // true (2026년 기준)
 */
export const isPastDate = (isoDate: string | null | undefined): boolean => {
	if (!isoDate) return false;
	
	try {
		const date = new Date(isoDate);
		if (isNaN(date.getTime())) return false;
		
		return date.getTime() < new Date().getTime();
	} catch {
		return false;
	}
};

/**
 * 날짜가 미래인지 확인
 * @param isoDate ISO 8601 형식 날짜 문자열
 * @returns true if 미래, false if 현재/과거
 * 
 * @example
 * isFutureDate("2027-01-15T00:00:00Z") // true (2026년 기준)
 */
export const isFutureDate = (isoDate: string | null | undefined): boolean => {
	if (!isoDate) return false;
	
	try {
		const date = new Date(isoDate);
		if (isNaN(date.getTime())) return false;
		
		return date.getTime() > new Date().getTime();
	} catch {
		return false;
	}
};

/**
 * 현재 날짜를 ISO 8601 형식으로 반환
 * @returns ISO 8601 형식 문자열
 * 
 * @example
 * getCurrentDateISO() // "2025-01-23T10:30:00.000Z"
 */
export const getCurrentDateISO = (): string => {
	return new Date().toISOString();
};

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns YYYY-MM-DD 형식 문자열
 * 
 * @example
 * getCurrentDate() // "2025-01-23"
 */
export const getCurrentDate = (): string => {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	
	return `${year}-${month}-${day}`;
};

/**
 * N일 전/후 날짜를 ISO 8601 형식으로 반환
 * @param days 일수 (양수: 미래, 음수: 과거)
 * @returns ISO 8601 형식 문자열
 * 
 * @example
 * getDateOffset(7) // 7일 후
 * getDateOffset(-30) // 30일 전
 */
export const getDateOffset = (days: number): string => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date.toISOString();
};

/**
 * N일 전/후 날짜를 YYYY-MM-DD 형식으로 반환
 * @param days 일수 (양수: 미래, 음수: 과거)
 * @returns YYYY-MM-DD 형식 문자열
 * 
 * @example
 * getDateOffsetShort(7) // "2025-01-30" (오늘이 2025-01-23인 경우)
 * getDateOffsetShort(-30) // "2024-12-24"
 */
export const getDateOffsetShort = (days: number): string => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	
	return `${year}-${month}-${day}`;
};
