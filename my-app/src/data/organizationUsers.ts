// Mock data for organization users
import { User } from '../types/admin';

export const organizationUsers: Record<string, User[]> = {
    'ORG001': [
        // Master (정회원)
        {
            id: 'USR001',
            name: '김의사',
            email: 'kim.doctor@snuh.org',
            accountType: '정회원',
            role: 'Master',
            registeredDate: '2025-01-20',
            lastLogin: '2025-12-10',
            status: 'active'
        },
        // Students (정회원)
        {
            id: 'USR002',
            name: '이간호사',
            email: 'lee.nurse@snuh.org',
            accountType: '정회원',
            role: 'Student',
            registeredDate: '2025-01-25',
            lastLogin: '2025-12-09',
            status: 'active'
        },
        {
            id: 'USR003',
            name: '박레지던트',
            email: 'park.resident@snuh.org',
            accountType: '정회원',
            role: 'Student',
            registeredDate: '2025-01-28',
            lastLogin: '2025-12-11',
            status: 'active'
        },
        {
            id: 'USR004',
            name: '정인턴',
            email: 'jung.intern@snuh.org',
            accountType: '정회원',
            role: 'Student',
            registeredDate: '2025-02-05',
            lastLogin: '2025-12-08',
            status: 'active'
        },
        {
            id: 'USR005',
            name: '최간호사',
            email: 'choi.nurse@snuh.org',
            accountType: '정회원',
            role: 'Student',
            registeredDate: '2025-02-10',
            lastLogin: '2025-12-07',
            status: 'active'
        },
        {
            id: 'USR006',
            name: '강의학생',
            email: 'kang.student@snuh.org',
            accountType: '정회원',
            role: 'Student',
            registeredDate: '2025-02-15',
            lastLogin: undefined,
            status: 'inactive'
        },
        // Guest accounts (게스트)
        {
            id: 'GUEST001',
            name: 'Guest1',
            email: '',
            accountType: '게스트',
            role: 'Guest',
            registeredDate: '2025-02-01',
            lastLogin: '2025-11-30',
            status: 'active'
        },
        {
            id: 'GUEST002',
            name: 'Guest2',
            email: '',
            accountType: '게스트',
            role: 'Guest',
            registeredDate: '2025-02-01',
            lastLogin: '2025-12-05',
            status: 'active'
        },
        {
            id: 'GUEST003',
            name: 'Guest3',
            email: '',
            accountType: '게스트',
            role: 'Guest',
            registeredDate: '2025-02-01',
            lastLogin: undefined,
            status: 'active'
        },
        {
            id: 'GUEST004',
            name: 'Guest4',
            email: '',
            accountType: '게스트',
            role: 'Guest',
            registeredDate: '2025-02-01',
            lastLogin: undefined,
            status: 'inactive'
        },
        {
            id: 'GUEST005',
            name: 'Guest5',
            email: '',
            accountType: '게스트',
            role: 'Guest',
            registeredDate: '2025-02-01',
            lastLogin: '2025-12-01',
            status: 'active'
        }
    ],
    'ORG002': [
        // Master (정회원)
        {
            id: 'USR007',
            name: '박교수',
            email: 'prof.park@yuhs.ac',
            accountType: '정회원',
            role: 'Master',
            registeredDate: '2025-02-25',
            lastLogin: '2025-12-11',
            status: 'active'
        },
        // Students (정회원)
        {
            id: 'USR008',
            name: '윤조교',
            email: 'yoon.assistant@yuhs.ac',
            accountType: '정회원',
            role: 'Student',
            registeredDate: '2025-02-28',
            lastLogin: '2025-12-10',
            status: 'active'
        },
        {
            id: 'USR009',
            name: '임학생',
            email: 'lim.student@yuhs.ac',
            accountType: '정회원',
            role: 'Student',
            registeredDate: '2025-03-01',
            lastLogin: '2025-12-09',
            status: 'active'
        },
        {
            id: 'USR010',
            name: '한연구원',
            email: 'han.researcher@yuhs.ac',
            accountType: '정회원',
            role: 'Student',
            registeredDate: '2025-03-05',
            lastLogin: '2025-12-11',
            status: 'active'
        },
        // Guest accounts (게스트)
        {
            id: 'GUEST006',
            name: 'Guest1',
            email: '',
            accountType: '게스트',
            role: 'Guest',
            registeredDate: '2025-03-10',
            lastLogin: '2025-12-08',
            status: 'active'
        },
        {
            id: 'GUEST007',
            name: 'Guest2',
            email: '',
            accountType: '게스트',
            role: 'Guest',
            registeredDate: '2025-03-10',
            lastLogin: undefined,
            status: 'active'
        },
        {
            id: 'GUEST008',
            name: 'Guest3',
            email: '',
            accountType: '게스트',
            role: 'Guest',
            registeredDate: '2025-03-10',
            lastLogin: '2025-12-06',
            status: 'active'
        }
    ],
    'ORG003': [
        // Master (정회원)
        {
            id: 'USR011',
            name: '최원장',
            email: 'director.choi@samsung.hospital',
            accountType: '정회원',
            role: 'Master',
            registeredDate: '2025-03-15',
            lastLogin: '2025-12-10',
            status: 'active'
        },
        // Students (정회원)
        {
            id: 'USR012',
            name: '송과장',
            email: 'song.manager@samsung.hospital',
            accountType: '정회원',
            role: 'Student',
            registeredDate: '2025-03-18',
            lastLogin: '2025-12-11',
            status: 'active'
        },
        {
            id: 'USR013',
            name: '오의사',
            email: 'oh.doctor@samsung.hospital',
            accountType: '정회원',
            role: 'Student',
            registeredDate: '2025-03-20',
            lastLogin: '2025-12-09',
            status: 'active'
        },
        {
            id: 'USR014',
            name: '서간호사',
            email: 'seo.nurse@samsung.hospital',
            accountType: '정회원',
            role: 'Student',
            registeredDate: '2025-03-22',
            lastLogin: '2025-12-10',
            status: 'active'
        },
        {
            id: 'USR015',
            name: '권기사',
            email: 'kwon.tech@samsung.hospital',
            accountType: '정회원',
            role: 'Student',
            registeredDate: '2025-03-25',
            lastLogin: undefined,
            status: 'inactive'
        },
        // Guest accounts (게스트)
        {
            id: 'GUEST009',
            name: 'Guest1',
            email: '',
            accountType: '게스트',
            role: 'Guest',
            registeredDate: '2025-03-28',
            lastLogin: '2025-12-07',
            status: 'active'
        },
        {
            id: 'GUEST010',
            name: 'Guest2',
            email: '',
            accountType: '게스트',
            role: 'Guest',
            registeredDate: '2025-03-28',
            lastLogin: '2025-12-05',
            status: 'active'
        },
        {
            id: 'GUEST011',
            name: 'Guest3',
            email: '',
            accountType: '게스트',
            role: 'Guest',
            registeredDate: '2025-03-28',
            lastLogin: undefined,
            status: 'active'
        },
        {
            id: 'GUEST012',
            name: 'Guest4',
            email: '',
            accountType: '게스트',
            role: 'Guest',
            registeredDate: '2025-03-28',
            lastLogin: undefined,
            status: 'inactive'
        }
    ]
};

export const getUsersByOrgId = (orgId: string): User[] => {
    return organizationUsers[orgId] || [];
};

export const getUserStats = (orgId: string) => {
    const users = getUsersByOrgId(orgId);
    return {
        total: users.length,
        members: users.filter(u => u.accountType === '정회원').length,
        guests: users.filter(u => u.accountType === '게스트').length,
        active: users.filter(u => u.status === 'active').length
    };
};

// Get users by license ID (for now, returns all users in the organization)
// TODO: Implement proper license-user mapping when data structure is available
export const getUsersByLicenseId = (orgId: string, licenseId: string): User[] => {
    // For now, return all users in the organization
    // In a real implementation, this would filter by licenseId
    return getUsersByOrgId(orgId);
};
