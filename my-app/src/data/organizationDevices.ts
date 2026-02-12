// Mock data for organization devices
import { Device } from '../types/admin';

export const organizationDevices: Record<string, Device[]> = {
    'ORG001': [
        {
            id: 'DEV001',
            deviceName: 'VR Headset 01',
            modelName: 'Meta Quest 3',
            purchaseSource: 'Meta Store',
            registeredDate: '2025-01-20',
            lastConnection: '2025-12-10',
            status: 'active'
        },
        {
            id: 'DEV002',
            deviceName: 'VR Headset 02',
            modelName: 'Meta Quest 3',
            purchaseSource: 'Meta Store',
            registeredDate: '2025-01-20',
            lastConnection: '2025-12-09',
            status: 'active'
        },
        {
            id: 'DEV003',
            deviceName: 'Mobile Device 01',
            modelName: 'Galaxy S23',
            purchaseSource: 'Samsung Store',
            registeredDate: '2025-02-15',
            lastConnection: '2025-12-08',
            status: 'active'
        },
        {
            id: 'DEV004',
            deviceName: 'Mobile Device 02',
            modelName: 'iPhone 15 Pro',
            purchaseSource: 'Apple Store',
            registeredDate: '2025-03-01',
            lastConnection: '2025-11-25',
            status: 'inactive'
        }
    ],
    'ORG002': [
        {
            id: 'DEV001',
            deviceName: 'VR Headset 01',
            modelName: 'Meta Quest 3',
            purchaseSource: 'Meta Store',
            registeredDate: '2025-02-25',
            lastConnection: '2025-12-10',
            status: 'active'
        },
        // ... (lines 14-61 unchanged fundamentally, just typed)
        {
            id: 'DEV002',
            deviceName: 'VR Headset 02',
            modelName: 'Meta Quest 3',
            purchaseSource: 'Meta Store',
            registeredDate: '2025-02-25',
            lastConnection: '2025-12-09',
            status: 'active'
        },
        {
            id: 'DEV003',
            deviceName: 'VR Headset 03',
            modelName: 'Meta Quest 3',
            purchaseSource: 'Amazon',
            registeredDate: '2025-03-10',
            lastConnection: '2025-11-20',
            status: 'inactive'
        }
    ],
    'ORG007': [
        {
            id: 'DEV004',
            deviceName: 'Training Room A - VR 01',
            modelName: 'Meta Quest 3',
            purchaseSource: '직접구매',
            registeredDate: '2025-07-25',
            lastConnection: '2025-12-11',
            status: 'active'
        },
        {
            id: 'DEV005',
            deviceName: 'Training Room A - VR 02',
            modelName: 'Meta Quest 3',
            purchaseSource: '직접구매',
            registeredDate: '2025-07-25',
            lastConnection: '2025-12-11',
            status: 'active'
        },
        {
            id: 'DEV006',
            deviceName: 'Mobile Device 01',
            modelName: 'Galaxy S23',
            purchaseSource: 'Samsung Store',
            registeredDate: '2025-08-01',
            lastConnection: '2025-12-08',
            status: 'active'
        }
    ]
};

export const getDevicesByOrgId = (orgId: string): Device[] => {
    return organizationDevices[orgId] || [];
};

export const getDeviceStats = (orgId: string) => {
    const devices: Device[] = getDevicesByOrgId(orgId);
    return {
        total: devices.length,
        active: devices.filter(d => d.status === 'active').length,
        inactive: devices.filter(d => d.status === 'inactive').length
    };
};

// Get devices by license ID
// Filters devices by assignedLicense field if available, otherwise returns all devices in the organization
export const getDevicesByLicenseId = (orgId: string, licenseId: string): Device[] => {
    const devices = getDevicesByOrgId(orgId);
    // Filter by assignedLicense if available, otherwise return all devices
    return devices.filter(d => !d.assignedLicense || d.assignedLicense === licenseId);
};
