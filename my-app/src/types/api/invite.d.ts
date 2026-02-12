/**
 * Invite API Types (플레이스홀더)
 * Swagger 미반영. 백엔드 팀에 6자리 초대 코드 생성/검증 API 신규 개발 요청됨.
 * @see my-app/docs/api/API.md
 */

/** 초대 코드 생성 요청 (백엔드 신규 후 연동) */
export interface CreateInviteRequestDto {
	classId: number;
	expireDays: number;
	maxUses: number;
}

/** 생성된 초대 정보 */
export interface ClassInviteResponseDto {
	inviteCode: string; // 6자리
	token: string; // UUID
	expiresAt: string; // ISO DateTime
}

/** 코드로 참가 신청 요청 */
export interface JoinByCodeRequestDto {
	inviteCode: string;
}
