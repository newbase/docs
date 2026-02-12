/**
 * Product Service
 * Swagger: Product API CRUD
 * @see my-app/docs/api/API.md
 */

import { apiClient, ApiError } from './apiClient';
import type {
	CreateProductRequestDto,
	CreateProductResponseDto,
	GetProductListResponseDto,
	GetProductDetailResponseDto,
	UpdateProductRequestDto,
	UpdateProductResponseDto,
	DeleteProductResponseDto,
} from '../types/api/product';

export const productService = {
	/** POST /product */
	create: async (data: CreateProductRequestDto): Promise<CreateProductResponseDto> => {
		const res = await apiClient.post<CreateProductResponseDto>('/product', data);
		return res;
	},

	/** GET /product/list */
	getList: async (params: { page: number; pageSize: number }): Promise<GetProductListResponseDto> => {
		const res = await apiClient.get<GetProductListResponseDto>('/product/list', { params });
		return res;
	},

	/** GET /product/{productId} */
	getDetail: async (productId: number): Promise<GetProductDetailResponseDto> => {
		try {
			const res = await apiClient.get<GetProductDetailResponseDto>(`/product/${productId}`);
			return res;
		} catch (error) {
			if (error instanceof ApiError && error.status === 404) {
				throw new Error('존재하지 않는 프로덕트입니다.');
			}
			throw error;
		}
	},

	/** PUT /product/{productId} */
	update: async (
		productId: number,
		data: UpdateProductRequestDto
	): Promise<UpdateProductResponseDto> => {
		const res = await apiClient.put<UpdateProductResponseDto>(`/product/${productId}`, data);
		return res;
	},

	/** DELETE /product/{productId} */
	delete: async (productId: number): Promise<DeleteProductResponseDto> => {
		try {
			const res = await apiClient.delete<DeleteProductResponseDto>(`/product/${productId}`);
			return res;
		} catch (error) {
			if (error instanceof ApiError && error.status === 404) {
				throw new Error('존재하지 않는 프로덕트입니다.');
			}
			throw error;
		}
	},
};
