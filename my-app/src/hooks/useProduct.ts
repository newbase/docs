/**
 * Product React Query Hooks
 * Phase 10: 상품 관리
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { productService } from '../services/productService';
import type {
	GetProductListResponseDto,
	GetProductDetailResponseDto,
	CreateProductRequestDto,
	CreateProductResponseDto,
	UpdateProductRequestDto,
	UpdateProductResponseDto,
	DeleteProductResponseDto,
} from '../types/api/product';

export interface GetProductListParams {
	page: number;
	pageSize: number;
}

export const productKeys = {
	all: ['product'] as const,
	lists: () => [...productKeys.all, 'list'] as const,
	list: (params: GetProductListParams) => [...productKeys.lists(), params] as const,
	details: () => [...productKeys.all, 'detail'] as const,
	detail: (id: number) => [...productKeys.details(), id] as const,
};

/**
 * 상품 리스트 조회
 * GET /product/list
 */
export const useProductList = (
	params: GetProductListParams,
	options?: Omit<UseQueryOptions<GetProductListResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: productKeys.list(params),
		queryFn: () => productService.getList(params),
		staleTime: 3 * 60 * 1000,
		...options,
	});
};

/**
 * 상품 상세 조회
 * GET /product/{productId}
 */
export const useProductDetail = (
	productId: number,
	options?: Omit<UseQueryOptions<GetProductDetailResponseDto>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: productKeys.detail(productId),
		queryFn: () => productService.getDetail(productId),
		enabled: !!productId && productId > 0,
		staleTime: 5 * 60 * 1000,
		...options,
	});
};

/**
 * 상품 생성
 * POST /product
 */
export const useCreateProduct = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateProductRequestDto) => productService.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: productKeys.lists(), exact: false });
		},
	});
};

/**
 * 상품 수정
 * PUT /product/{productId}
 */
export const useUpdateProduct = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			productId,
			data,
		}: {
			productId: number;
			data: UpdateProductRequestDto;
		}) => productService.update(productId, data),
		onSuccess: (_result, variables) => {
			queryClient.invalidateQueries({
				queryKey: productKeys.detail(variables.productId),
			});
			queryClient.invalidateQueries({ queryKey: productKeys.lists(), exact: false });
		},
	});
};

/**
 * 상품 삭제
 * DELETE /product/{productId}
 */
export const useDeleteProduct = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (productId: number) => productService.delete(productId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: productKeys.lists(), exact: false });
		},
	});
};
