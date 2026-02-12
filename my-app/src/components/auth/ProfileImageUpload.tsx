import React, { useState, useRef } from "react";
import { Button } from "@/components/shared/ui";

interface ProfileImageUploadProps {
	onImageChange: (imageUrl: string | null) => void;
	currentImageUrl?: string | null;
}

/**
 * 프로필 이미지 업로드 컴포넌트
 * 
 * @param onImageChange - 이미지 변경 시 호출되는 콜백 함수 (이미지 URL 또는 null 전달)
 * @param currentImageUrl - 현재 프로필 이미지 URL (선택)
 */
export default function ProfileImageUpload({
	onImageChange,
	currentImageUrl,
}: ProfileImageUploadProps): React.ReactElement {
	const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Mock 이미지 업로드 함수 (실제 API 연동 시 Phase 8에서 변경)
	const mockUploadImage = async (file: File): Promise<string> => {
		// 시뮬레이션: 1초 대기 후 Pre-signed URL 반환
		await new Promise((resolve) => setTimeout(resolve, 1000));
		
		// Mock Pre-signed URL 생성 (실제로는 S3 Pre-signed URL)
		const mockImageUrl = URL.createObjectURL(file);
		return mockImageUrl;
	};

	// 파일 선택 핸들러
	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// 파일 유효성 검사
		if (!file.type.startsWith("image/")) {
			alert("이미지 파일만 업로드 가능합니다.");
			return;
		}

		// 파일 크기 제한 (5MB)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			alert("파일 크기는 5MB 이하여야 합니다.");
			return;
		}

		setIsUploading(true);

		try {
			// Mock 이미지 업로드
			const imageUrl = await mockUploadImage(file);
			setPreviewUrl(imageUrl);
			onImageChange(imageUrl);
		} catch (error) {
			console.error("이미지 업로드 실패:", error);
			alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
		} finally {
			setIsUploading(false);
			// 파일 입력 초기화
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	// 이미지 제거 핸들러
	const handleRemoveImage = () => {
		if (previewUrl && previewUrl.startsWith("blob:")) {
			URL.revokeObjectURL(previewUrl);
		}
		setPreviewUrl(null);
		onImageChange(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// 파일 선택 버튼 클릭
	const handleSelectButtonClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div>
			<label className="block mb-2 text-sm font-semibold text-gray-900">프로필 이미지</label>
			
			<div className="flex items-start gap-4">
				{/* 이미지 미리보기 */}
				<div className="flex-shrink-0">
					<div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
						{previewUrl ? (
							<img
								src={previewUrl}
								alt="프로필 미리보기"
								className="w-full h-full object-cover"
							/>
						) : (
							<svg
								className="w-12 h-12 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
						)}
					</div>
				</div>

				{/* 업로드 컨트롤 */}
				<div className="flex-1 space-y-2">
					<div className="flex gap-2">
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleFileSelect}
							className="hidden"
							disabled={isUploading}
						/>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={handleSelectButtonClick}
							disabled={isUploading}
						>
							{isUploading ? "업로드 중..." : "이미지 선택"}
						</Button>
						{previewUrl && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleRemoveImage}
								disabled={isUploading}
							>
								제거
							</Button>
						)}
					</div>
					<p className="text-xs text-gray-500">
						이미지 파일만 업로드 가능합니다. (최대 5MB)
					</p>
				</div>
			</div>
		</div>
	);
}
