import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/ui';
import type { OrganizationPostDto } from '@/types/api/organization-post';

interface OrganizationPostModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: { title: string; content: string }) => void;
	editPost?: OrganizationPostDto | null;
	isSubmitting?: boolean;
}

export default function OrganizationPostModal({
	isOpen,
	onClose,
	onSave,
	editPost,
	isSubmitting = false,
}: OrganizationPostModalProps): React.ReactElement {
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');

	useEffect(() => {
		if (editPost) {
			setTitle(editPost.title ?? '');
			setContent(editPost.content ?? '');
		} else {
			setTitle('');
			setContent('');
		}
	}, [editPost, isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;
		onSave({ title: title.trim(), content: content.trim() });
	};

	const isEdit = !!editPost;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isEdit ? '게시글 수정' : '게시글 작성'}
		>
			<div className="p-1">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="post_title" className="block text-sm font-medium text-gray-700 mb-1">
							제목
						</label>
						<input
							id="post_title"
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							placeholder="제목을 입력하세요"
							required
						/>
					</div>
					<div>
						<label htmlFor="post_content" className="block text-sm font-medium text-gray-700 mb-1">
							내용
						</label>
						<textarea
							id="post_content"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							rows={5}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							placeholder="내용을 입력하세요"
						/>
					</div>
					<div className="flex justify-end gap-2 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
						>
							취소
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
						>
							{isSubmitting ? '저장 중...' : isEdit ? '수정' : '등록'}
						</button>
					</div>
				</form>
			</div>
		</Modal>
	);
}
