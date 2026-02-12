import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/ui';
import { Device } from '../../../types/admin';

interface EditDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
    device: Device | undefined;
    onSave: (device: Device) => void;
}

interface DeviceFormData {
    deviceName: string;
    modelName: string;
    purchaseSource: string;
    status: 'active' | 'inactive';
}

export default function EditDeviceModal({ isOpen, onClose, device, onSave }: EditDeviceModalProps): React.ReactElement {
    const [formData, setFormData] = useState<DeviceFormData>({
        deviceName: '',
        modelName: '',
        purchaseSource: '',
        status: 'active'
    });

    useEffect(() => {
        if (device) {
            setFormData({
                deviceName: device.deviceName || '',
                modelName: device.modelName || '',
                purchaseSource: device.purchaseSource || '',
                status: (device.status as 'active' | 'inactive') || 'active'
            });
        }
    }, [device]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (device) {
            onSave({ ...device, ...formData });
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
                form="edit-device-form"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
                저장
            </button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="기기 정보 수정" footer={footer} size="medium">
            <form id="edit-device-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        기기명 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="deviceName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        value={formData.deviceName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">모델명</label>
                    <input
                        type="text"
                        name="modelName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed text-gray-500"
                        value={formData.modelName}
                        disabled
                    />
                    <p className="text-xs text-gray-500">모델명은 수정할 수 없습니다.</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">구매처</label>
                    <input
                        type="text"
                        name="purchaseSource"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        value={formData.purchaseSource}
                        onChange={handleChange}
                    />
                </div>

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
                    </select>
                </div>
            </form>
        </Modal>
    );
}
