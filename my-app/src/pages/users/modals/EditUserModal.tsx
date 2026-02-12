import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/ui';
import { User } from '../../../types/admin';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (user: User) => void;
}

interface FormData {
    name: string;
    email: string;
    role: string;
    status: string;
    password?: string;
    expirationDate?: string;
    organizationId?: number; // 기관 ID 추가
    organizationName?: string; // 기관명 추가 (표시용)
}

export default function EditUserModal({ isOpen, onClose, user, onSave }: EditUserModalProps): React.ReactElement {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        role: 'Student',
        status: 'active',
        password: '',
        expirationDate: '',
        organizationId: 3, // 임시: Medicrew Hospital3 고정
        organizationName: 'Medicrew Hospital3' // 임시: 고정 표시
    });

    const isGuest = user?.role === 'Guest' || user?.accountType === '게스트';

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || 'Student',
                status: user.status || 'active',
                password: '', // 엄격하게: 비밀번호는 항상 빈 문자열로 초기화 (보안상 이유)
                expirationDate: user.expirationDate || '',
                organizationId: 3, // 임시: Medicrew Hospital3 고정
                organizationName: 'Medicrew Hospital3' // 임시: 고정 표시
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            onSave({ ...user, ...formData } as User);
        }
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
                form="edit-user-form"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
                저장
            </button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="사용자 정보 수정" footer={footer} size="medium">
            <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">아이디</label>
                    <input
                        type="text"
                        name="loginId"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                        value={user?.loginId || user?.id || '아이디 없음'}
                        disabled={true}
                        readOnly
                    />
                    <p className="text-xs text-gray-500">아이디는 수정할 수 없습니다.</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">이름</label>
                    <input
                        type="text"
                        name="name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={true}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">이메일</label>
                    <input
                        type="email"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={true}
                    />
                </div>

                {!isGuest && (
                    <>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                비밀번호 <span className="text-sm text-gray-500 font-normal">(변경 시에만 입력)</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="변경할 비밀번호 입력 (8자 이상, 영문자+숫자 포함)"
                            />
                            <p className="text-xs text-gray-500">비밀번호를 변경하지 않으려면 비워두세요.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                권한 <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="role"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="Master">Master</option>
                                <option value="Student">Student</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                기관
                            </label>
                            <input
                                type="text"
                                name="organizationName"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                                value={formData.organizationName}
                                disabled={true}
                                readOnly
                            />
                            <p className="text-xs text-gray-500">
                                임시: Medicrew Hospital3 (organizationId: 3)로 고정되어 있습니다.
                                <br />
                                백엔드 API 구현 후 변경 가능하도록 업데이트 예정입니다.
                            </p>
                        </div>
                    </>
                )}

                {isGuest && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            유효기간 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="expirationDate"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            value={formData.expirationDate}
                            onChange={handleChange}
                            placeholder="YYYY-MM-DD"
                            required
                        />
                        <p className="text-xs text-gray-500">형식: YYYY.MM.DD 또는 YYYY-MM-DD</p>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        상태 <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="status"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        value={formData.status}
                        onChange={handleChange}
                        required
                    >
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                        <option value="withdrawal">탈퇴</option>
                    </select>
                </div>
            </form>
        </Modal>
    );
}
