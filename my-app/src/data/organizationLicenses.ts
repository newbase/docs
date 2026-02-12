// Mock data for organization licenses
import { License } from '../types/admin';

export const organizationLicenses: Record<string, License[]> = {
    'ORG001': [
        {
            id: 'LIC001',
            className: 'MediCrew VR Simulation',
            subscriptionPlan: 'Enterprise',
            platform: 'VR',
            licenseType: '사용자구독',
            duration: '12개월',
            activeUsers: 85,
            maxUsers: 100,
            totalUsers: 142,
            startDate: '2025-01-15',
            endDate: '2026-01-15',
            status: 'active'
        },
        {
            id: 'LIC002',
            className: 'MediCrew Mobile',
            subscriptionPlan: 'Pro',
            platform: 'Mobile',
            licenseType: '사용자구독',
            duration: '6개월',
            activeUsers: 45,
            maxUsers: 50,
            totalUsers: 68,
            startDate: '2025-07-01',
            endDate: '2026-01-01',
            status: 'active'
        }
    ],
    'ORG002': [
        {
            id: 'LIC003',
            className: 'MediCrew VR Simulation',
            subscriptionPlan: 'Pro',
            platform: 'VR',
            licenseType: '기기구독',
            duration: '12개월',
            activeUsers: 0,
            maxUsers: 50,
            totalUsers: 0,
            startDate: '2025-02-20',
            endDate: '2026-02-20',
            status: 'active'
        }
    ],
    'ORG003': [
        {
            id: 'LIC004',
            className: 'MediCrew VR Simulation',
            subscriptionPlan: 'Enterprise',
            platform: 'VR',
            licenseType: '사용자구독',
            duration: 'Lifetime',
            activeUsers: 195,
            maxUsers: 200,
            totalUsers: 312,
            startDate: '2025-03-10',
            endDate: null,
            status: 'active'
        },
        {
            id: 'LIC005',
            className: 'MediCrew Class',
            subscriptionPlan: 'Class',
            platform: 'VR',
            licenseType: '사용자구독',
            duration: '3개월',
            activeUsers: 28,
            maxUsers: 30,
            totalUsers: 45,
            startDate: '2025-10-01',
            endDate: '2025-12-31',
            status: 'expiring'
        }
    ],
    'ORG006': [
        {
            id: 'LIC006',
            className: 'MediCrew VR Simulation',
            subscriptionPlan: 'Enterprise',
            platform: 'VR',
            licenseType: '사용자구독',
            duration: '12개월',
            activeUsers: 280,
            maxUsers: 300,
            totalUsers: 456,
            startDate: '2025-06-18',
            endDate: '2025-12-18',
            status: 'expiring'
        }
    ]
};

export const getLicensesByOrgId = (orgId: string): License[] => {
    const result = organizationLicenses[orgId] || [];
    return result;
};

export const getLicenseStats = (orgId: string) => {
    const licenses: License[] = getLicensesByOrgId(orgId);
    return {
        total: licenses.length,
        active: licenses.filter(l => l.status === 'active').length,
        expiring: licenses.filter(l => l.status === 'expiring').length,
        expired: licenses.filter(l => l.status === 'expired').length
    };
};
