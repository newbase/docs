/**
 * File Service
 * 파일 업로드 관련 API (Pre-signed URL, S3 직접 업로드)
 */

import { apiClient, ApiError } from './apiClient';

/** Swagger: PresignedUploadUrlResponseDto - preSignedUrl, fileUrl */
export interface PresignedUploadResponseDto {
	preSignedUrl: string;
	fileUrl: string;
	[key: string]: unknown;
}

/**
 * Pre-signed URL 발급
 * Swagger: POST /file/presigned-url
 * - fileType, fileName, uploadPath(required, enum: CREATOR | USER | EDU)
 */
export const getPresignedUploadUrl = async (params: {
	fileType: string;
	fileName: string;
	uploadPath?: 'CREATOR' | 'USER' | 'EDU';
}): Promise<PresignedUploadResponseDto> => {
	try {
		const body = {
			fileType: params.fileType,
			fileName: params.fileName,
			uploadPath: params.uploadPath ?? 'CREATOR',
		};
		const response = await apiClient.post<PresignedUploadResponseDto>('/file/presigned-url', body);
		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message || 'Pre-signed URL 발급에 실패했습니다.');
		}
		throw error;
	}
};

/**
 * S3에 파일 직접 업로드 (Pre-signed URL 사용)
 * 엄격하게: presignedUrl은 전체 URL이므로 fetch 직접 사용 (apiClient 미사용)
 */
export const uploadToS3 = async (presignedUrl: string, file: File): Promise<void> => {
	const response = await fetch(presignedUrl, {
		method: 'PUT',
		body: file,
		headers: {
			'Content-Type': file.type || 'application/octet-stream',
		},
	});
	if (!response.ok) {
		throw new Error(`S3 업로드 실패: ${response.status} ${response.statusText}`);
	}
};

/**
 * Pre-signed URL 발급 후 S3 업로드까지 한 번에 수행
 * @returns 업로드된 파일의 최종 URL (fileUrl)
 */
export const uploadFileViaPresignedUrl = async (file: File): Promise<string> => {
	const { preSignedUrl, fileUrl } = await getPresignedUploadUrl({
		fileType: file.type || 'application/octet-stream',
		fileName: file.name,
		uploadPath: 'CREATOR',
	});
	await uploadToS3(preSignedUrl, file);
	return fileUrl;
};
