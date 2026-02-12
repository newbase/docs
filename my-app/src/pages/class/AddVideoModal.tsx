import React, { useState, useRef } from 'react';
import { Modal, Button, Input } from '@/components/shared/ui';
import { VideoLecture, AuthorType } from '../../types/curriculum';
import { Upload, X, Loader2 } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface AddVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (video: VideoLecture) => void;
}

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

export default function AddVideoModal({
    isOpen,
    onClose,
    onAdd
}: AddVideoModalProps): React.ReactElement {
    const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [durationSeconds, setDurationSeconds] = useState<number>(0);
    const [authorName, setAuthorName] = useState('');
    const [authorType, setAuthorType] = useState<AuthorType>('institution');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isReadingDuration, setIsReadingDuration] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        // 파일 크기 검증
        if (file.size > MAX_FILE_SIZE) {
            return `파일 크기는 ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB를 초과할 수 없습니다.`;
        }

        // 파일 형식 검증
        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
            return '지원하지 않는 파일 형식입니다. MP4, WebM, MOV, AVI 파일만 업로드 가능합니다.';
        }

        return null;
    };

    const getVideoDuration = (file: File): Promise<number> => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const url = URL.createObjectURL(file);

            video.addEventListener('loadedmetadata', () => {
                URL.revokeObjectURL(url);
                resolve(video.duration);
            });

            video.addEventListener('error', (e) => {
                URL.revokeObjectURL(url);
                reject(new Error('동영상 파일을 읽을 수 없습니다.'));
            });

            video.src = url;
        });
    };

    // 초를 MM:SS 형식으로 변환
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setError('');
        setSelectedFile(file);
        
        // 동영상 duration 자동 읽기
        setIsReadingDuration(true);
        try {
            const durationInSeconds = await getVideoDuration(file);
            setDurationSeconds(durationInSeconds);
        } catch (err) {
            // duration을 읽지 못해도 에러로 표시하지 않음
            setDurationSeconds(0);
        } finally {
            setIsReadingDuration(false);
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileUpload = async (): Promise<string | null> => {
        if (!selectedFile) return null;

        setIsUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('title', title);
            formData.append('duration', formatDuration(durationSeconds));
            formData.append('authorName', authorName);
            formData.append('authorType', authorType);
            if (description.trim()) {
                formData.append('description', description);
            }

            // FormData를 사용한 업로드 (apiClient는 JSON만 지원하므로 직접 fetch 사용)
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
            const token = localStorage.getItem('medicrew_access_token');

            const xhr = new XMLHttpRequest();

            return new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        setUploadProgress(percentComplete);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            resolve(response.url || response.data?.url || null);
                        } catch {
                            resolve(null);
                        }
                    } else {
                        try {
                            const errorData = JSON.parse(xhr.responseText);
                            reject(new Error(errorData.message || '업로드에 실패했습니다.'));
                        } catch {
                            reject(new Error('업로드에 실패했습니다.'));
                        }
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('네트워크 오류가 발생했습니다.'));
                });

                xhr.addEventListener('abort', () => {
                    reject(new Error('업로드가 취소되었습니다.'));
                });

                xhr.open('POST', `${API_BASE_URL}/videos/upload`);
                if (token) {
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                }
                xhr.send(formData);
            });
        } catch (err) {
            throw err;
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSubmit = async () => {
        // 필수 필드 검증
        if (!title.trim() || !authorName.trim()) {
            setError('모든 필수 정보를 입력해주세요.');
            return;
        }

        if (uploadMethod === 'url' && !url.trim()) {
            setError('동영상 URL을 입력해주세요.');
            return;
        }

        if (uploadMethod === 'file') {
            if (!selectedFile) {
                setError('동영상 파일을 선택해주세요.');
                return;
            }
            if (durationSeconds === 0) {
                setError('동영상 정보를 읽는 중입니다. 잠시 후 다시 시도해주세요.');
                return;
            }
        }

        setError('');

        try {
            let videoUrl: string = url;

            // 파일 업로드인 경우
            if (uploadMethod === 'file' && selectedFile) {
                const uploadedUrl = await handleFileUpload();
                if (!uploadedUrl) {
                    setError('업로드된 동영상 URL을 가져올 수 없습니다.');
                    return;
                }
                videoUrl = uploadedUrl as string;
            }

            const newVideo: VideoLecture = {
                id: `video-${Date.now()}`,
                title,
                url: videoUrl,
                duration: uploadMethod === 'file' ? formatDuration(durationSeconds) : '00:00',
                author: {
                    name: authorName,
                    type: authorType
                },
                description: description.trim() || undefined
            };

            onAdd(newVideo);
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : '동영상 업로드 중 오류가 발생했습니다.');
        }
    };

    const resetForm = () => {
        setUploadMethod('url');
        setTitle('');
        setUrl('');
        setSelectedFile(null);
        setDurationSeconds(0);
        setAuthorName('');
        setAuthorType('institution');
        setDescription('');
        setError('');
        setIsUploading(false);
        setUploadProgress(0);
        setIsReadingDuration(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={resetForm} title="동영상 강의 추가">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        강의 제목 <span className="text-red-500">*</span>
                    </label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="강의 제목을 입력하세요"
                        disabled={isUploading}
                    />
                </div>

                {/* 업로드 방식 선택 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        업로드 방식 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="uploadMethod"
                                value="url"
                                checked={uploadMethod === 'url'}
                                onChange={() => {
                                    setUploadMethod('url');
                                    setSelectedFile(null);
                                    setError('');
                                }}
                                disabled={isUploading}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">URL 입력</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="uploadMethod"
                                value="file"
                                checked={uploadMethod === 'file'}
                                onChange={() => {
                                    setUploadMethod('file');
                                    setUrl('');
                                    setError('');
                                }}
                                disabled={isUploading}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">파일 업로드</span>
                        </label>
                    </div>
                </div>

                {/* URL 입력 방식 */}
                {uploadMethod === 'url' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            동영상 URL <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/video"
                            disabled={isUploading}
                        />
                    </div>
                )}

                {/* 파일 업로드 방식 */}
                {uploadMethod === 'file' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            동영상 파일 <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                onChange={handleFileSelect}
                                disabled={isUploading}
                                className="hidden"
                                id="video-file-input"
                            />
                            <label
                                htmlFor="video-file-input"
                                className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                                    isUploading
                                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            >
                                <Upload size={20} className="text-gray-500" />
                                <span className="text-sm text-gray-700">
                                    {selectedFile ? selectedFile.name : '동영상 파일 선택'}
                                </span>
                            </label>
                            {selectedFile && (
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">{selectedFile.name}</span>
                                        <span className="text-xs text-gray-500">
                                            ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeSelectedFile}
                                        disabled={isUploading}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            <p className="text-xs text-gray-500">
                                최대 1GB, MP4, WebM, MOV, AVI 형식만 지원됩니다.
                            </p>
                        </div>
                    </div>
                )}

                {/* 업로드 진행 상태 */}
                {isUploading && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">업로드 중...</span>
                            <span className="text-gray-500">{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* 소요시간 자동 읽기 상태 표시 (파일 업로드 방식일 때만) */}
                {uploadMethod === 'file' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        {isReadingDuration ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                <span>동영상 정보 읽는 중...</span>
                            </>
                        ) : durationSeconds > 0 ? (
                            <span>소요 시간: <strong className="text-gray-900">{formatDuration(durationSeconds)}</strong></span>
                        ) : selectedFile ? (
                            <span className="text-gray-500">동영상 정보를 읽는 중...</span>
                        ) : null}
                    </div>
                )}

                <div className="border-t border-gray-100 pt-4 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        저작자 설정 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-6 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="authorType"
                                value="institution"
                                checked={authorType === 'institution'}
                                onChange={() => setAuthorType('institution')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">기관</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="authorType"
                                value="individual"
                                checked={authorType === 'individual'}
                                onChange={() => setAuthorType('individual')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">개인</span>
                        </label>
                    </div>
                    <Input
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder={authorType === 'institution' ? "기관명을 입력하세요" : "작가명을 입력하세요"}
                        disabled={isUploading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        설명
                    </label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="강의에 대한 설명을 입력하세요"
                        disabled={isUploading}
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="secondary" onClick={resetForm} disabled={isUploading}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                업로드 중...
                            </>
                        ) : (
                            '추가'
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
