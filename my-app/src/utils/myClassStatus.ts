/**
 * 마이클래스 상태: 참여가능 | 참여중 | 이수완료 | 종료
 * - 참여가능(eligible): 수강신청 완료, 프로덕트 사용자 등록
 * - 참여중(participating): 세션 시작 클릭, 초대 수락
 * - 이수완료(completed): 이수조건 도달 → 이수증 다운로드 가능
 * - 종료(ended): 수강기간 종료 (저장값 아님, participationPeriod.endDate로 계산)
 */

const MY_CLASS_STATUS_KEY = 'myClassStatus';
const PARTICIPATING_CLASSES_KEY = 'participatingClasses';

export type MyClassStoredStatus = 'eligible' | 'participating' | 'completed';

export type MyClassDisplayStatus = MyClassStoredStatus | 'ended';

export function getMyClassStatusMap(): Record<string, MyClassStoredStatus> {
  try {
    const raw = localStorage.getItem(MY_CLASS_STATUS_KEY) || '{}';
    return JSON.parse(raw) as Record<string, MyClassStoredStatus>;
  } catch {
    return {};
  }
}

/**
 * 클래스 상태 저장. participatingClasses에도 반영해 목록 노출/링크 분기에 사용.
 */
export function setMyClassStatus(classId: string, status: MyClassStoredStatus): void {
  const map = getMyClassStatusMap();
  map[classId] = status;
  localStorage.setItem(MY_CLASS_STATUS_KEY, JSON.stringify(map));

  const participating = JSON.parse(localStorage.getItem(PARTICIPATING_CLASSES_KEY) || '{}') as Record<string, boolean>;
  participating[classId] = true;
  localStorage.setItem(PARTICIPATING_CLASSES_KEY, JSON.stringify(participating));
}

/**
 * 표시용 상태: 수강기간 종료면 'ended', 아니면 저장된 상태 반환.
 */
export function getDisplayStatus(
  storedStatus: MyClassStoredStatus | undefined,
  endDateStr: string | undefined
): MyClassDisplayStatus {
  if (!storedStatus) return 'eligible';
  if (endDateStr && new Date() > new Date(endDateStr)) return 'ended';
  return storedStatus;
}

export const DISPLAY_STATUS_LABELS: Record<MyClassDisplayStatus, string> = {
  eligible: '참여가능',
  participating: '참여중',
  completed: '이수완료',
  ended: '종료',
};
