import { ClassInvite, CreateInviteRequest } from '../types/class';
import { v4 as uuidv4 } from 'uuid';

/**
 * 클래스 초대 관련 서비스
 * 
 * ⚠️ 주의: 현재 Swagger Spec에 초대 관련 엔드포인트가 정의되어 있지 않습니다.
 * 백엔드 팀에 확인이 필요하며, 현재는 Mock 데이터로 동작합니다.
 * 향후 /course/invite 또는 /course/code 관련 API가 추가되면 연동 예정입니다.
 */
export const classInviteService = {
  /**
   * 새로운 초대 생성
   */
  createInvite: async (request: CreateInviteRequest): Promise<ClassInvite> => {
    // 실제 구현에서는 API 호출
    await new Promise(resolve => setTimeout(resolve, 800));

    const now = new Date();
    let expiresAt = new Date();
    
    if (request.expirationDays && request.expirationDays > 0) {
      expiresAt.setDate(now.getDate() + request.expirationDays);
    } else {
      // 무기한인 경우 매우 먼 미래로 설정 (또는 백엔드 규칙에 따름)
      expiresAt.setFullYear(now.getFullYear() + 100);
    }

    return {
      id: `INV-${Date.now()}`,
      classId: request.classId,
      token: uuidv4(),
      inviteCode: generateInviteCode(),
      expiresAt: expiresAt.toISOString(),
      maxUses: request.maxUses,
      currentUses: 0,
      createdBy: 'USR001', // 현재 로그인한 사용자 ID (Mock)
      createdAt: now.toISOString(),
      status: 'active'
    };
  },

  /**
   * 토큰으로 초대 정보 조회
   */
  getInviteByToken: async (token: string): Promise<ClassInvite | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock 데이터 반환
    return {
      id: 'INV-123456',
      classId: '001',
      token: token,
      inviteCode: 'ABC123',
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
      currentUses: 5,
      createdBy: 'USR001',
      createdAt: new Date().toISOString(),
      status: 'active'
    };
  },

  /**
   * 초대 코드로 초대 정보 조회
   */
  getInviteByCode: async (code: string): Promise<ClassInvite | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: 'INV-123456',
      classId: '001',
      token: 'mock-token-uuid',
      inviteCode: code.toUpperCase(),
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
      currentUses: 5,
      createdBy: 'USR001',
      createdAt: new Date().toISOString(),
      status: 'active'
    };
  },

  /**
   * 초대 수락 (클래스 참여)
   */
  acceptInvite: async (token: string, userId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`User ${userId} accepted invite ${token}`);
    return true;
  }
};

/**
 * 6자리 영문 대문자 및 숫자 조합의 초대 코드 생성
 * 가독성을 위해 0, O, 1, I 제외
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
