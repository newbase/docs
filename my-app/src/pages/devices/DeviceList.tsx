import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import EditDeviceModal from './modals/EditDeviceModal';
import { Device } from '../../types/admin';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from '@/components/shared/ui';

interface DeviceListProps {
    devices: Device[];
    showStats?: boolean;
    onDeviceUpdate?: (device: Device) => void;
}

export default function DeviceList({ devices, showStats = true, onDeviceUpdate }: DeviceListProps): React.ReactElement {
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

    // Calculate stats
    const deviceStats = {
        total: devices.length,
        active: devices.filter(d => d.status === 'active').length,
        inactive: devices.filter(d => d.status === 'inactive').length
    };

    const handleEdit = (device: Device) => {
        setSelectedDevice(device);
        setIsEditModalOpen(true);
    };

    const handleSave = (updatedDevice: Device) => {
        if (onDeviceUpdate) {
            onDeviceUpdate(updatedDevice);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
            active: { label: '활성', variant: 'default' },
            inactive: { label: '비활성', variant: 'destructive' }
        };
        return badges[status] || badges.active;
    };

    return (
        <>
            {showStats && (
                <div className="mb-6 flex gap-6 pl-2 pt-4 items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-base font-medium text-gray-600">활성 기기</span>
                        <span className="text-base font-bold text-green-600">{deviceStats.active}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-base font-medium text-gray-600">비활성 기기</span>
                        <span className="text-base font-bold text-gray-600">{deviceStats.inactive}</span>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>기기명</TableHead>
                            <TableHead>모델명</TableHead>
                            <TableHead>구매처</TableHead>
                            <TableHead>등록일</TableHead>
                            <TableHead>최종접속일</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>수정</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {devices.length > 0 ? (
                            devices.map((device) => {
                                const statusBadge = getStatusBadge(device.status);
                                return (
                                    <TableRow key={device.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="font-semibold text-gray-900">{device.deviceName}</TableCell>
                                        <TableCell>
                                            <Badge variant="default">{device.modelName}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">{device.purchaseSource}</TableCell>
                                        <TableCell className="text-sm text-gray-600">{device.registeredDate}</TableCell>
                                        <TableCell className="text-sm text-gray-600">{device.lastConnection || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusBadge.variant}>
                                                {statusBadge.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                                                onClick={() => handleEdit(device)}
                                                title="수정"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                    등록된 기기가 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <EditDeviceModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                device={selectedDevice}
                onSave={handleSave}
            />
        </>
    );
}
