import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, SimpleSelect } from '@/components/shared/ui';
import { License } from '../../../types/admin';

interface LicenseSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    license: License | null;
    onSave: (license: License) => void;
}

interface FormData {
    subscriptionPlan: string;
    maxUsers: number | string;
    status: 'active' | 'expiring' | 'expired' | 'pending';
    startDate: string;
    endDate: string;
}

export default function LicenseSettingsModal({ isOpen, onClose, license, onSave }: LicenseSettingsModalProps): React.ReactElement {
    const [formData, setFormData] = useState<FormData>({
        subscriptionPlan: 'Basic',
        maxUsers: 10,
        status: 'active',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (license) {
            setFormData({
                subscriptionPlan: license.subscriptionPlan || 'Basic',
                maxUsers: license.maxUsers || 10,
                status: license.status || 'active',
                startDate: license.startDate || '',
                endDate: license.endDate || ''
            });
        }
    }, [license]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (license) {
            const updatedLicense: License = {
                ...license,
                ...formData,
                maxUsers: typeof formData.maxUsers === 'string' ? parseInt(formData.maxUsers) : formData.maxUsers
            };
            onSave(updatedLicense);
        }
        onClose();
    };

    const footer = (
        <div className="flex justify-end gap-2">
            <Button
                type="submit"
                form="license-settings-form"
                variant="primary"
            >
                저장
            </Button>
            <Button
                variant="ghost"
                onClick={onClose}
            >
                취소
            </Button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="라이센스 설정" footer={footer} size="medium">
            <form id="license-settings-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Input
                        label="제품명"
                        type="text"
                        value={license?.className || ''}
                        disabled
                    />
                    <p className="text-xs text-gray-500 ml-0.5">제품명은 수정할 수 없습니다.</p>
                </div>

                <SimpleSelect
                    label="구독 플랜"
                    name="subscriptionPlan"
                    value={formData.subscriptionPlan}
                    onChange={handleChange}
                    required
                >
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Class">Class</option>
                    <option value="Enterprise">Enterprise</option>
                </SimpleSelect>

                <Input
                    label="최대 사용자 수"
                    type="number"
                    name="maxUsers"
                    value={formData.maxUsers}
                    onChange={handleChange}
                    min="1"
                    required
                />

                <SimpleSelect
                    label="상태"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                >
                    <option value="active">활성</option>
                    <option value="expiring">만료임박</option>
                    <option value="expired">만료</option>
                    <option value="pending">대기</option>
                </SimpleSelect>

                <Input
                    label="시작일"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                />

                <div className="space-y-2">
                    <Input
                        label="종료일"
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 ml-0.5">Lifetime 라이센스는 종료일을 비워두세요.</p>
                </div>
            </form>
        </Modal>
    );
}
