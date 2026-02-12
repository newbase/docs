import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/ui';
import { FileSpreadsheet, X, Users as UsersIcon } from 'lucide-react';
import { User } from '../../../types/admin';

interface LicenseInfo {
    hasDeviceLicense: boolean;
    maxUsers: number | null;
    currentUsers: number;
    availableSlots?: number;
}

interface CreateGuestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (guests: Partial<User>[]) => void;
    licenseInfo?: LicenseInfo;
}

export default function CreateGuestModal({ isOpen, onClose, onSave, licenseInfo }: CreateGuestModalProps): React.ReactElement {
    const [mode, setMode] = useState<'auto' | 'upload'>('auto');
    const [quantity, setQuantity] = useState<number>(10);
    const [prefix, setPrefix] = useState<string>('Guest');
    const [duration, setDuration] = useState<number>(30); // Default 30 days
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [password, setPassword] = useState<string>('1234');

    // Update max quantity based on license limit
    useEffect(() => {
        if (licenseInfo && !licenseInfo.hasDeviceLicense && licenseInfo.availableSlots !== undefined) {
            const maxAllowed = Math.max(0, licenseInfo.availableSlots);
            if (quantity > maxAllowed) {
                setQuantity(maxAllowed);
            }
        }
    }, [licenseInfo, quantity]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext && ['xlsx', 'xls', 'csv'].includes(ext)) {
                setUploadedFile(file);
            } else {
                alert('지원하지 않는 파일 형식입니다. .xlsx, .xls, .csv 파일만 업로드 가능합니다.');
            }
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'auto') {
            // Auto-generate guest accounts
            const guests: Partial<User>[] = [];
            const today = new Date();
            const expirationDate = new Date(today);
            expirationDate.setDate(today.getDate() + duration);
            const expirationDateString = expirationDate.toLocaleDateString('ko-KR');

            for (let i = 1; i <= quantity; i++) {
                guests.push({
                    id: `GUEST${Date.now()}_${i}`,
                    name: `${prefix}${i}`,
                    email: '',
                    accountType: '게스트',
                    role: 'Guest',
                    registeredDate: today.toLocaleDateString('ko-KR'),
                    lastLogin: undefined,
                    status: 'active',
                    expirationDate: expirationDateString,
                    password: password // Add password
                });
            }
            onSave(guests);
        } else {
            // File upload mode
            if (!uploadedFile) {
                alert('파일을 선택해주세요.');
                return;
            }
            // TODO: Parse file and create guests
            alert('파일 업로드 기능은 백엔드 연동 후 구현됩니다.');
        }

        // Reset form
        setQuantity(10);
        setPrefix('Guest');
        setDuration(30);
        setPassword('1234');
        setUploadedFile(null);
        onClose();
    };

    const footer = (
        <>
            <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={onClose}
            >
                취소
            </button>
            <button
                type="submit"
                form="create-guest-form"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!licenseInfo?.hasDeviceLicense && licenseInfo?.availableSlots !== undefined && licenseInfo.availableSlots <= 0}
            >
                {mode === 'auto' ? '생성' : '업로드'}
            </button>
        </>
    );

    // Calculate max allowed quantity
    const maxAllowedQuantity = licenseInfo?.hasDeviceLicense 
        ? 100 
        : (licenseInfo?.availableSlots !== undefined ? Math.max(0, licenseInfo.availableSlots) : 100);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="게스트 계정 생성" footer={footer} size="medium">
            <form id="create-guest-form" onSubmit={handleSubmit} className="space-y-4">
                {/* License Info */}
                {licenseInfo && (
                    <div className={`p-4 rounded-lg border ${licenseInfo.hasDeviceLicense 
                        ? 'bg-green-50 border-green-200' 
                        : licenseInfo.availableSlots !== undefined && licenseInfo.availableSlots > 0
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-red-50 border-red-200'
                    }`}>
                        {licenseInfo.hasDeviceLicense ? (
                            <p className="text-sm text-green-800 font-medium">
                                ✓ 기기 라이선스: 사용자 수 제한 없음
                            </p>
                        ) : (
                            <div className="text-sm">
                                <p className={`font-medium ${licenseInfo.availableSlots !== undefined && licenseInfo.availableSlots <= 0 ? 'text-red-800' : 'text-blue-800'}`}>
                                    사용자 라이선스: {licenseInfo.currentUsers}명 / {licenseInfo.maxUsers}명
                                    {licenseInfo.availableSlots !== undefined && (
                                        <span className="ml-2">
                                            {licenseInfo.availableSlots > 0 
                                                ? `(추가 가능: ${licenseInfo.availableSlots}명)` 
                                                : '(한도 초과)'
                                            }
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Mode Selection */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">생성 방식</label>
                    <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="mode"
                                value="auto"
                                checked={mode === 'auto'}
                                onChange={(e) => setMode((e.target as HTMLInputElement).value as 'auto' | 'upload')}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            자동 생성
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="mode"
                                value="upload"
                                checked={mode === 'upload'}
                                onChange={(e) => setMode((e.target as HTMLInputElement).value as 'auto' | 'upload')}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            파일 업로드
                        </label>
                    </div>
                </div>

                {mode === 'auto' ? (
                    <>
                        {/* Auto-generate mode */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                생성 개수 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                value={quantity}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value) || 1;
                                    const clampedValue = Math.min(Math.max(1, value), maxAllowedQuantity);
                                    setQuantity(clampedValue);
                                }}
                                min="1"
                                max={maxAllowedQuantity}
                                required
                            />
                            <p className="text-xs text-gray-500">
                                {licenseInfo?.hasDeviceLicense 
                                    ? '1~100개까지 생성 가능합니다.'
                                    : `1~${maxAllowedQuantity}개까지 생성 가능합니다. (라이선스 한도 내)`
                                }
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                이름 접두사 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value)}
                                required
                                placeholder="Guest"
                            />
                            <p className="text-xs text-gray-500">
                                생성 예시: {prefix}1, {prefix}2, {prefix}3, ...
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                비밀번호 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="1234"
                            />
                            <p className="text-xs text-gray-500">
                                모든 생성 계정에 동일하게 적용됩니다.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                유효 기간 (일) <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                                    min="1"
                                    max="365"
                                    required
                                />
                                <span className="text-gray-600">일</span>
                            </div>
                            <p className="text-xs text-gray-500">
                                생성일로부터 자동 계산됩니다. (기본 30일)
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                                <UsersIcon size={16} />
                                생성될 계정 수: <strong className={`${quantity > maxAllowedQuantity ? 'text-red-600' : 'text-blue-600'}`}>
                                    {quantity}개
                                </strong>
                                {!licenseInfo?.hasDeviceLicense && licenseInfo && (
                                    <span className="text-xs text-gray-500 ml-2">
                                        (추가 후: {licenseInfo.currentUsers + quantity}명 / {licenseInfo.maxUsers}명)
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <span>🕒</span>
                                계정 만료일: <strong className="text-gray-900">
                                    {(() => {
                                        const d = new Date();
                                        d.setDate(d.getDate() + duration);
                                        return d.toLocaleDateString('ko-KR');
                                    })()}
                                </strong>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* File upload mode */}
                        <div className="modal-form-group">
                            <label className="modal-form-label required">스프레드시트 파일</label>
                            <div className="modal-file-upload" onClick={() => document.getElementById('guest-file-input')?.click()}>
                                <input
                                    id="guest-file-input"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileChange}
                                />
                                <FileSpreadsheet size={32} style={{ color: 'var(--text-sub)', margin: '0 auto 0.5rem' }} />
                                <p className="modal-file-upload-text">
                                    클릭하여 파일 선택<br />
                                    <small>지원 형식: .xlsx, .xls, .csv</small>
                                </p>
                            </div>

                            {uploadedFile && (
                                <div className="modal-file-list">
                                    <div className="modal-file-item">
                                        <span className="modal-file-item-name">
                                            <FileSpreadsheet size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                                            {uploadedFile.name}
                                        </span>
                                        <button
                                            type="button"
                                            className="modal-file-item-remove"
                                            onClick={removeFile}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50 p-4 rounded-lg mt-4">
                                <div className="text-sm font-medium mb-2">파일 형식 안내</div>
                                <div className="text-xs text-gray-600">
                                    • 첫 번째 행: 헤더 (이름, 이메일)<br />
                                    • 두 번째 행부터: 데이터<br />
                                    • 이메일은 선택사항 (없으면 자동 생성)
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </form>
        </Modal>
    );
}
