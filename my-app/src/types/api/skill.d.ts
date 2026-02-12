/**
 * 스킬·액션 API 타입 (Phase 3)
 * GET /skill/category/list, GET /skill/list, GET /action/list
 * @see my-app/docs/api/API.md
 */

export interface SkillCategoryDto {
	skillCategoryId: number;
	name?: string;
	title?: string;
}

export interface SkillCategoryListResponseDto {
	list?: SkillCategoryDto[];
	skillCategoryList?: SkillCategoryDto[];
}

export interface SkillDto {
	skillId: number;
	skillCategoryId?: number;
	name?: string;
	title?: string;
}

export interface SkillListResponseDto {
	list?: SkillDto[];
	skillList?: SkillDto[];
}

export interface ActionDto {
	actionId: number;
	skillId?: number;
	name?: string;
	title?: string;
}

export interface ActionListResponseDto {
	list?: ActionDto[];
	actionList?: ActionDto[];
}
