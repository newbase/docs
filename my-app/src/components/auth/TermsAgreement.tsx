import React, { useState, useEffect } from "react";
import { TermsListItemDto, GetTermsListResponseDto } from "@/types/terms";
import { mockTermsListResponse } from "@/data/mock/user";
import { Button } from "@/components/shared/ui";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/shared/ui/dialog";

interface TermsAgreementProps {
	onTermsChange: (termsIdList: number[]) => void;
	requiredTermsIds?: number[];
}

/**
 * 이용약관 동의 컴포넌트
 * 
 * @param onTermsChange - 약관 동의 변경 시 호출되는 콜백 함수 (동의한 약관 ID 리스트 전달)
 * @param requiredTermsIds - 필수 약관 ID 리스트 (기본값: 모든 필수 약관)
 */
export default function TermsAgreement({
	onTermsChange,
	requiredTermsIds,
}: TermsAgreementProps): React.ReactElement {
	const [termsList, setTermsList] = useState<TermsListItemDto[]>([]);
	const [agreedTermsIds, setAgreedTermsIds] = useState<Set<number>>(new Set());
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [selectedTerm, setSelectedTerm] = useState<TermsListItemDto | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

	// 약관 리스트 조회 (Mock)
	useEffect(() => {
		const fetchTermsList = async () => {
			setIsLoading(true);
			try {
				// Mock 데이터 사용 (실제 API 연동 시 Phase 8에서 변경)
				await new Promise((resolve) => setTimeout(resolve, 500)); // 시뮬레이션 지연
				const response: GetTermsListResponseDto = mockTermsListResponse;
				setTermsList(response.termsList);
			} catch (error) {
				console.error("약관 리스트 조회 실패:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTermsList();
	}, []);

	// 필수 약관 ID 리스트 계산
	const requiredIds = requiredTermsIds || termsList.filter((term) => term.isRequired).map((term) => term.termsId);

	// 전체 동의 여부 계산
	const isAllAgreed = termsList.length > 0 && requiredIds.every((id) => agreedTermsIds.has(id));

	// 약관 동의 변경 핸들러
	const handleTermToggle = (termsId: number) => {
		const newAgreedTerms = new Set(agreedTermsIds);
		if (newAgreedTerms.has(termsId)) {
			newAgreedTerms.delete(termsId);
		} else {
			newAgreedTerms.add(termsId);
		}
		setAgreedTermsIds(newAgreedTerms);
		onTermsChange(Array.from(newAgreedTerms));
	};

	// 전체 동의/해제 핸들러
	const handleAllAgreeToggle = () => {
		if (isAllAgreed) {
			// 전체 해제
			setAgreedTermsIds(new Set());
			onTermsChange([]);
		} else {
			// 전체 동의 (필수 약관만)
			const newAgreedTerms = new Set(requiredIds);
			setAgreedTermsIds(newAgreedTerms);
			onTermsChange(Array.from(newAgreedTerms));
		}
	};

	// 약관 상세 보기
	const handleViewTerm = (term: TermsListItemDto) => {
		setSelectedTerm(term);
		setIsDialogOpen(true);
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="h-6 bg-gray-200 rounded animate-pulse" />
				<div className="h-20 bg-gray-200 rounded animate-pulse" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* 전체 동의 */}
			<div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
				<input
					type="checkbox"
					id="agree_all"
					checked={isAllAgreed}
					onChange={handleAllAgreeToggle}
					className="mt-1 w-5 h-5 text-brand-500 bg-white border-gray-300 rounded focus:ring-brand-500 focus:ring-2 cursor-pointer"
				/>
				<label htmlFor="agree_all" className="flex-1 text-base font-semibold text-gray-900 cursor-pointer">
					전체 동의
				</label>
			</div>

			{/* 약관 항목들 */}
			<div className="space-y-3 border-t border-gray-200 pt-4">
				{termsList.map((term) => {
					const isAgreed = agreedTermsIds.has(term.termsId);
					const isRequired = term.isRequired;
					const isRequiredAgreed = isRequired && isAgreed;

					return (
						<div
							key={term.termsId}
							className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
								isAgreed ? "bg-brand-50 border-brand-200" : "bg-white border-gray-200"
							}`}
						>
							<input
								type="checkbox"
								id={`term_${term.termsId}`}
								checked={isAgreed}
								onChange={() => handleTermToggle(term.termsId)}
								className="mt-1 w-4 h-4 text-brand-500 bg-white border-gray-300 rounded focus:ring-brand-500 focus:ring-2 cursor-pointer"
							/>
							<div className="flex-1">
								<label
									htmlFor={`term_${term.termsId}`}
									className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer"
								>
									<span>{term.title}</span>
									{isRequired && (
										<span className="px-2 py-0.5 text-xs font-semibold text-red-600 bg-red-50 rounded">
											필수
										</span>
									)}
									{!isRequired && (
										<span className="px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded">
											선택
										</span>
									)}
								</label>
								<button
									type="button"
									onClick={() => handleViewTerm(term)}
									className="mt-1 text-xs text-brand-500 hover:text-brand-700 hover:underline"
								>
									약관 전문 보기
								</button>
							</div>
							{isRequiredAgreed && (
								<span className="text-xs font-medium text-green-600">✓</span>
							)}
						</div>
					);
				})}
			</div>

			{/* 필수 약관 미동의 경고 */}
			{!isAllAgreed && requiredIds.length > 0 && (
				<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
					<p className="text-sm text-yellow-800">
						<span className="font-semibold">필수 약관</span>에 모두 동의해주세요.
					</p>
				</div>
			)}

			{/* 약관 상세 보기 다이얼로그 */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold">{selectedTerm?.title}</DialogTitle>
						<DialogDescription>
							{selectedTerm?.type === "TERMS_OF_SERVICE" ? "서비스 이용약관" : "개인정보 처리방침"} · 버전{" "}
							{selectedTerm?.version}
						</DialogDescription>
					</DialogHeader>
					<div className="mt-4 p-4 bg-gray-50 rounded-lg">
						<div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-gray-700">
							{selectedTerm?.content || "약관 내용이 없습니다."}
						</div>
					</div>
					<div className="flex justify-end gap-2 mt-4">
						<Button
							type="button"
							variant="secondary"
							onClick={() => setIsDialogOpen(false)}
						>
							닫기
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
