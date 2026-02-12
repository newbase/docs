/**
 * Product API Types (Swagger 기반)
 * @see my-app/docs/api/API.md
 */

export interface CreateProductRequestDto {
	title: string;
	scenarioIdList: number[];
}

export interface CreateProductResponseDto {
	productId: number;
}

export interface ProductListItemDto {
	productId: number;
	title: string;
	scenarioCount: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface GetProductListResponseDto {
	productList: ProductListItemDto[];
	totalCount: number;
}

export interface ProductScenarioInfoDto {
	scenarioId: number;
}

export interface GetProductDetailResponseDto {
	productId: number;
	title: string;
	isActive: boolean;
	scenarioList: ProductScenarioInfoDto[];
}

export interface UpdateProductRequestDto {
	title: string;
	scenarioIdList: number[];
}

export interface UpdateProductResponseDto {
	message: string;
}

export interface DeleteProductResponseDto {
	message: string;
}
