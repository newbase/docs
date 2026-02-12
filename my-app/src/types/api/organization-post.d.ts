/**
 * 기관 게시글 API 타입 (Phase 4)
 * POST/GET/PUT/DELETE /organization-post
 * @see my-app/docs/api/API.md
 */

export interface OrganizationPostDto {
	organizationPostId: number;
	organizationId: number;
	title?: string;
	content?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface GetOrganizationPostListParams {
	organizationId: number;
	page: number;
	pageSize: number;
}

export interface GetOrganizationPostListResponseDto {
	organizationPostList?: OrganizationPostDto[];
	list?: OrganizationPostDto[];
	totalCount?: number;
}

export interface CreateOrganizationPostRequestDto {
	organizationId: number;
	title: string;
	content?: string;
}

export interface CreateOrganizationPostResponseDto {
	organizationPostId?: number;
	message?: string;
}

export interface UpdateOrganizationPostRequestDto {
	title?: string;
	content?: string;
}

export interface UpdateOrganizationPostResponseDto {
	message?: string;
}
