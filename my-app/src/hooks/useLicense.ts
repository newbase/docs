/**
 * License React Query Hooks
 * 라이센스 관리 React Query 훅
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
	getLicensesByOrganization,
	getLicenseById,
	createLicense,
	updateLicense,
	deleteLicense,
	UpdateLicenseRequest,
	UpdateLicenseResponse
} from '../services/licenseService';
import { License } from '../types/admin';

// Query Keys
export const licenseKeys = {
	all: ['licenses'] as const,
	lists: () => [...licenseKeys.all, 'list'] as const,
	byOrganization: (organizationId: string) => [...licenseKeys.lists(), 'organization', organizationId] as const,
	details: () => [...licenseKeys.all, 'detail'] as const,
	detail: (organizationId: string, licenseId: string) => [...licenseKeys.details(), organizationId, licenseId] as const,
};

/**
 * 조직의 라이센스 목록 조회
 */
export const useLicensesByOrganization = (
	organizationId: string,
	options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: licenseKeys.byOrganization(organizationId),
		queryFn: () => getLicensesByOrganization(parseInt(organizationId)),
		enabled: !!organizationId,
		staleTime: 3 * 60 * 1000,
		...options,
	});
};

/**
 * 라이센스 상세 조회
 */
export const useLicenseDetail = (
	_organizationId: string,
	licenseId: string,
	options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
	return useQuery({
		queryKey: licenseKeys.detail(_organizationId, licenseId),
		queryFn: () => getLicenseById(parseInt(licenseId)),
		enabled: !!_organizationId && !!licenseId,
		staleTime: 5 * 60 * 1000,
		...options,
	});
};

/**
 * 라이센스 생성
 */
export const useCreateLicense = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			organizationId,
			licenseData
		}: {
			organizationId: string;
			licenseData: any
		}) => createLicense({ ...licenseData, organizationId: parseInt(organizationId) }),
		onSuccess: (_result, variables) => {
			queryClient.invalidateQueries({
				queryKey: licenseKeys.byOrganization(variables.organizationId)
			});
		},
	});
};

/**
 * 라이센스 업데이트
 */
export const useUpdateLicense = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			_organizationId,
			licenseId,
			licenseData,
		}: {
			_organizationId: string;
			licenseId: string;
			licenseData: UpdateLicenseRequest;
		}) => updateLicense(parseInt(licenseId), licenseData as any),
		onSuccess: (_result, variables) => {
			queryClient.invalidateQueries({
				queryKey: licenseKeys.detail(variables._organizationId, variables.licenseId),
			});
			queryClient.invalidateQueries({
				queryKey: licenseKeys.byOrganization(variables._organizationId)
			});
		},
	});
};

/**
 * 라이센스 삭제
 */
export const useDeleteLicense = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			_organizationId,
			licenseId,
		}: {
			_organizationId: string;
			licenseId: string;
		}) => deleteLicense(parseInt(licenseId)),
		onSuccess: (_result, variables) => {
			// 해당 조직의 라이센스 목록 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: licenseKeys.byOrganization(variables._organizationId)
			});
		},
	});
};
