/**
 * Health Service
 * Swagger: GET /health
 */

import { apiClient } from './apiClient';

export const getHealth = async (): Promise<{ status?: string }> => {
	return await apiClient.get<{ status?: string }>('/health');
};
