// Consolidated user data for user management
// Combines organization users and individual users with customer type

import { organizationUsers } from './organizationUsers';
import { individualUsers } from './individualUsers';
import { organizationsData } from './organizations';
import { User } from '../types/admin';

// Helper to get organization name by ID
const getOrgName = (orgId: string): string => {
    const org = organizationsData.find(o => o.id === orgId);
    return org ? org.name : '';
};

// Convert organization users to unified format
const orgUsersWithType = Object.entries(organizationUsers).flatMap(([orgId, users]) =>
    users.map(user => ({
        ...user,
        customerType: '기관고객',
        organizationId: orgId,
        organizationName: getOrgName(orgId),
        simulationCount: 0,
        classCount: 0
    }))
);

// Convert individual users to unified format
const individualUsersWithType = individualUsers.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    accountType: '정회원',
    role: 'Student',
    registeredDate: user.registeredDate,
    lastLogin: undefined,
    status: 'active',
    customerType: '개인고객',
    organizationId: null,
    organizationName: '개인',
    simulationCount: 0,
    classCount: 0,
    department: user.department,
    specialty: user.specialty,
    // Add default values for required User properties if missing
    registeredAt: user.registeredDate, // Alias or mapping
    type: 'regular' // Assuming 'regular' for individual users?
})) as User[]; // Cast because individualUsers source is partial but we are filling in gaps.
// Actually individualUsers has id, name, email. We add role, status.
// But we might be missing other optional fields? User interface has many optional fields.
// The cast is likely safe or we can rely on inference.

// Combine all users
export const allUsers: User[] = [...orgUsersWithType, ...individualUsersWithType];

// Get all users
export const getAllUsers = (): User[] => {
    return allUsers;
};

// Get user by ID
export const getUserById = (userId: string | number): User | undefined => {
    return allUsers.find(user => user.id === userId);
};

// Search users
export const searchUsers = (query: string): User[] => {
    if (!query || query.trim() === '') {
        return allUsers;
    }

    const lowerQuery = query.toLowerCase();
    return allUsers.filter(user =>
        user.name.toLowerCase().includes(lowerQuery) ||
        (user.email && user.email.toLowerCase().includes(lowerQuery)) ||
        (user.organizationName && user.organizationName.toLowerCase().includes(lowerQuery))
    );
};

// Filter by customer type
export const filterByCustomerType = (customerType: string): User[] => {
    if (!customerType) {
        return allUsers;
    }
    return allUsers.filter(user => user.customerType === customerType);
};

// Get user statistics
export const getUserStatistics = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const newUsers = allUsers.filter(user => {
        if (!user.registeredDate) return false;
        const registeredDate = new Date(user.registeredDate);
        return registeredDate >= thirtyDaysAgo && registeredDate <= today;
    });

    return {
        total: allUsers.length,
        organization: allUsers.filter(u => u.customerType === '기관고객').length,
        individual: allUsers.filter(u => u.customerType === '개인고객').length,
        active: allUsers.filter(u => u.status === 'active').length,
        withdrawal: allUsers.filter(u => u.status === 'withdrawal').length,
        newUsers: newUsers.length,
        masters: allUsers.filter(u => u.role === 'Master').length,
        students: allUsers.filter(u => u.role === 'Student').length,
        guests: allUsers.filter(u => u.role === 'Guest').length
    };
};
