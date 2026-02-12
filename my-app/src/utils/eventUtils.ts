import { AssetEvent, Event } from '../data/assetEvents';

/**
 * 이벤트 검증
 */
export function validateEvent(event: AssetEvent): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 공통 필수 필드 검증
    if (!event.key || event.key.trim() === '') {
        errors.push('Event key is required');
    }
    if (!event.displayName || event.displayName.trim() === '') {
        errors.push('Display name is required');
    }
    if (!event.description || event.description.trim() === '') {
        errors.push('Description is required');
    }
    if (!event.trigger) {
        errors.push('Trigger type is required');
    }


    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * 이벤트 ID 생성
 */
export function generateEventId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ev${timestamp}${random}`;
}

/**
 * 이벤트 details 파싱 (legacy support)
 */
export function parseEventDetails(details: string): Record<string, string> {
    const result: Record<string, string> = {};
    if (!details) return result;

    const parts = details.split(',');
    parts.forEach((part, index) => {
        result[`param${index + 1}`] = part.trim();
    });

    return result;
}

/**
 * 이벤트 details 빌드 (legacy support)
 */
export function buildEventDetails(params: Record<string, string>): string {
    return Object.values(params).join(',');
}

/**
 * 타겟 파싱
 */
export function parseEventTargets(targetString: string): string[] {
    if (!targetString) return [];
    return targetString.split(',').map(t => t.trim()).filter(t => t.length > 0);
}

/**
 * 타겟 빌드
 */
export function buildEventTargets(targets: string[]): string {
    return targets.join(',');
}

