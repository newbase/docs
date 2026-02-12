/**
 * curriculumIdList로 클래스명 조회
 * 발급 시 사용한 classesData와 동일한 소스 사용 — 목록에서 라이선스명 표시용
 */

import { classesData } from '@/data/classes';

/**
 * 커리큘럼 ID 배열에 해당하는 클래스의 title 반환.
 * 백엔드가 scenarioTitle을 주지 않을 때, 목록 "라이선스명" 표시에 사용.
 *
 * @param curriculumIdList - 라이선스에 저장된 커리큘럼 ID 배열 (응답의 curriculumIdList)
 * @returns 매칭되는 클래스명. 없으면 빈 문자열
 */
export function getClassNameFromCurriculumIds(curriculumIdList: number[] | undefined): string {
	if (!Array.isArray(curriculumIdList) || curriculumIdList.length === 0) {
		return '';
	}
	const idSet = new Set(curriculumIdList);
	const classes = Object.values(classesData);
	for (const cls of classes) {
		if (!cls.curriculum?.length) continue;
		const classIds = new Set(cls.curriculum.map((c) => c.id));
		const allContained = curriculumIdList.every((id) => classIds.has(id));
		if (allContained) {
			return cls.title ?? '';
		}
	}
	return '';
}
