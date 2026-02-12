/**
 * Dashboard API Types (플레이스홀더)
 * Swagger 미정의. 백엔드 신규 개발 후 연동.
 * @see my-app/docs/api/API.md
 */

/** 학생 대시보드 응답 */
export interface StudentDashboardResponseDto {
	summaryStats?: { 실습수?: number; 스킬수?: number; 판단능력점수?: number };
	recentActivities?: Array<{ scenarioId: number; title: string; score?: number; performedAt: string }>;
}

/** 마스터 대시보드 응답 */
export interface MasterDashboardResponseDto {
	managedOrgStats?: { 이수율?: number; 활성사용자수?: number };
	classPerformance?: Array<{ classId: number; title: string; 평균점수?: number; 인기순위?: number }>;
}

/** 어드민 대시보드 - 요약 (GET /admin/dashboard/summary) */
export interface GetAdminSummaryResponseDto {
	totalOrganizationCount?: number;
	totalActiveUserCount?: number;
	totalLicenseSales?: number;
	totalClassCount?: number;
	systemHealthStatus?: string;
}

/** 어드민 대시보드 - 트렌드 (GET /admin/dashboard/charts) */
export interface GetAdminTrendResponseDto {
	signupTrend?: Array<{ date: string; count: number }>;
	simulationTrend?: Array<{ date: string; count: number }>;
	salesTrend?: Array<{ month: string; count: number }>;
}

/** 어드민 대시보드 - 활동/알림 (GET /admin/dashboard/notifications) */
export interface GetAdminActivityLogsDto {
	recentSignups?: Array<{ name: string; organizationName: string; createdAt: string }>;
	recentLicenseExpirations?: Array<{ organizationName: string; remainingDays: number }>;
	errorLogs?: Array<{ message: string; severity: string; timestamp: string }>;
}

/** 어드민 - 기관별 성과 (GET /admin/dashboard/org-status) */
export interface GetOrgPerformanceRankingDto {
	topPerformingOrgs?: Array<{ organizationId: number; name: string; 이수율?: number }>;
	lowActivityOrgs?: Array<{ organizationId: number; name: string }>;
}
