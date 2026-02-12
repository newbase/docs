export interface ClassInvite {
  id: string;
  classId: string;
  token: string; // 고유 토큰 (URL용)
  inviteCode: string; // 6-8자리 코드 (입력용)
  expiresAt: string; // ISO 8601
  maxUses?: number; // 최대 사용 횟수 (null이면 무제한)
  currentUses: number;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface CreateInviteRequest {
  classId: string;
  expirationDays?: number; // 7, 14, 30, 60, 90, 0(무기한)
  maxUses?: number;
}
