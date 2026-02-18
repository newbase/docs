/**
 * 프로덕트 판매유형(salesType)과 프로덕트 정보 일치 검사
 * - online: 온라인 판매 (가격·온라인 URL/플랫폼 중심)
 * - agency: 기관판매 (교육장소·모집기간·기관 대상 중심)
 */
import type { ClassItem } from '../data/classes';

export type SalesType = 'online' | 'agency';

/**
 * 프로덕트 필드로 기대되는 salesType 추론
 * - 가격이 있고 (onlineUrl 또는 onlinePlatform) 있으면 → online
 * - isForSale && price > 0 && 교육장소 없으면 → online
 * - educationVenue 있거나 (가격 0 또는 없음 && 온라인 URL 없음) → agency
 */
export function inferSalesTypeFromProduct(item: ClassItem): SalesType | null {
    const price = item.price ?? 0;
    const hasOnlineChannel = !!(item.onlineUrl || item.onlinePlatform);
    const hasEducationVenue = !!item.educationVenue;
    const hasRecruitmentPeriod = !!item.recruitmentPeriod;
    const isForSale = item.isForSale === true;

    if (hasOnlineChannel && price > 0) return 'online';
    if (isForSale && price > 0) return 'online'; // 오픈 판매(온라인/대면 혼합 가능)
    if (hasEducationVenue && !hasOnlineChannel) return 'agency';
    if (hasRecruitmentPeriod && !hasOnlineChannel && price === 0) return 'agency';
    if (price === 0 && !hasOnlineChannel) return 'agency';
    return null;
}

/**
 * 프로덕트의 salesType이 실제 프로덕트 정보와 일치하는지 검사
 */
export function isSalesTypeConsistentWithProduct(
    item: ClassItem & { salesType?: string }
): { consistent: boolean; expected: SalesType | null; actual: string | undefined } {
    const expected = inferSalesTypeFromProduct(item);
    const actual = item.salesType as SalesType | undefined;
    const consistent = expected == null || actual === expected;
    return { consistent, expected, actual };
}
