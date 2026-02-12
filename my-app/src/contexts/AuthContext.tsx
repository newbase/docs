import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { initializeTokenRefresh } from '../services/apiClient';

// Interfaces
interface Account {
    accountId: string;
    organizationId: string | null;
    organizationName: string;
    role: string;
    license: string;
    licenseType?: 'device' | 'user'; // 'device' for unlimited users, 'user' for limited
    isActive: boolean;
}

interface User {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string | null;  // 프로필 이미지 URL
    guestExpirationDate?: string | null;  // 🆕 게스트 만료일 (백엔드 작업 후 사용)
    isAuthenticated: boolean;
    currentAccount: Omit<Account, 'isActive'>;
    accounts: Account[];
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    updateUserProfile: (profileData: { name?: string; email?: string; profileImageUrl?: string | null; role?: string; license?: string }) => void;  // 프로필 업데이트 함수
    switchAccount: (accountId: string) => void;
    addAccount: (accountData: Partial<Account>) => void;
    isAuthenticated: boolean;
    getCurrentRole: () => string;
    getCurrentLicense: () => string | null;
    getLicenseInfo: () => { type: 'device' | 'user', count: number, usedCount: number };
    hasRole: (requiredRole: string) => boolean;
    isPremiumUser: () => boolean;
    canAccessScenario: (scenarioId: string, isPremium?: boolean) => boolean;
    canJoinClass: (classId: string, classType?: string) => boolean;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Initialize auth state (check localStorage or session)
    useEffect(() => {
        // 토큰 갱신 함수 초기화
        initializeTokenRefresh();

        const savedUser = localStorage.getItem('medicrew_user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                // Check if user data is stale (old test ID was numeric 1)
                if (parsedUser.id === 1) {
                    localStorage.removeItem('medicrew_user');
                    apiClient.clearTokens();
                    setUser(null);
                } else {
                    setUser(parsedUser);
                }
            } catch (error) {
                console.error('Failed to parse saved user:', error);
                localStorage.removeItem('medicrew_user');
                apiClient.clearTokens();
            }
        }
        setIsLoading(false);
    }, []);

    // Login function
    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('medicrew_user', JSON.stringify(userData));
        // 토큰은 authService의 login 함수에서 이미 저장됨
    };

    /**
     * 로그아웃 함수
     * @description 사용자 상태 초기화 및 localStorage 정리
     */
    const logout = () => {
        setUser(null);
        localStorage.removeItem('medicrew_user');
        localStorage.removeItem('medicrew_access_token');
        localStorage.removeItem('medicrew_refresh_token');
    };

    /**
     * 프로필 정보 업데이트 함수
     * @description 사용자 프로필 (이름, 이메일, 프로필 이미지, role, license)을 업데이트
     * @param profileData - 업데이트할 프로필 정보
     */
    const updateUserProfile = (profileData: {
        name?: string;
        email?: string;
        profileImageUrl?: string | null;
        role?: string;
        license?: string;
    }) => {
        if (!user) return;

        const updatedUser: User = {
            ...user,
            ...(profileData.name !== undefined && { name: profileData.name }),
            ...(profileData.email !== undefined && { email: profileData.email }),
            ...(profileData.profileImageUrl !== undefined && { profileImageUrl: profileData.profileImageUrl }),
        };

        // role과 license 업데이트 (currentAccount와 accounts 모두)
        if (profileData.role !== undefined || profileData.license !== undefined) {
            updatedUser.currentAccount = {
                ...updatedUser.currentAccount,
                ...(profileData.role !== undefined && { role: profileData.role }),
                ...(profileData.license !== undefined && { license: profileData.license }),
            };

            updatedUser.accounts = updatedUser.accounts.map(acc =>
                acc.accountId === updatedUser.currentAccount.accountId
                    ? {
                        ...acc,
                        ...(profileData.role !== undefined && { role: profileData.role }),
                        ...(profileData.license !== undefined && { license: profileData.license }),
                    }
                    : acc
            );
        }

        setUser(updatedUser);
        localStorage.setItem('medicrew_user', JSON.stringify(updatedUser));
    };

    // Switch account function
    const switchAccount = (accountId: string) => {
        if (!user || !user.accounts) return;

        const targetAccount = user.accounts.find(acc => acc.accountId === accountId);
        if (!targetAccount) {
            console.error('Account not found:', accountId);
            return;
        }

        // Update accounts active status
        const updatedAccounts = user.accounts.map(acc => ({
            ...acc,
            isActive: acc.accountId === accountId
        }));

        const updatedUser: User = {
            ...user,
            accounts: updatedAccounts,
            currentAccount: {
                accountId: targetAccount.accountId,
                organizationId: targetAccount.organizationId,
                organizationName: targetAccount.organizationName,
                role: targetAccount.role,
                license: targetAccount.license
            }
        };

        setUser(updatedUser);
        localStorage.setItem('medicrew_user', JSON.stringify(updatedUser));
    };

    // Add new account function
    const addAccount = (accountData: Partial<Account>) => {
        if (!user) return;

        const newAccount: Account = {
            accountId: `acc_${Date.now()}`,
            organizationId: accountData.organizationId || null,
            organizationName: accountData.organizationName || 'Unknown',
            role: accountData.role || 'guest',
            license: accountData.license || 'free',
            isActive: false,
            ...accountData
        };

        const updatedUser: User = {
            ...user,
            accounts: [...user.accounts, newAccount]
        };

        setUser(updatedUser);
        localStorage.setItem('medicrew_user', JSON.stringify(updatedUser));
    };

    // Helper functions
    const checkIsAuthenticated = () => {
        return user !== null && user.isAuthenticated;
    };

    const getCurrentRole = () => {
        return user?.currentAccount?.role || 'visitor';
    };

    const getCurrentLicense = () => {
        return user?.currentAccount?.license || null;
    };

    const hasRole = (requiredRole: string) => {
        const roleHierarchy = ['visitor', 'guest', 'student', 'master', 'admin'];
        const currentRole = getCurrentRole();
        const currentIndex = roleHierarchy.indexOf(currentRole);
        const requiredIndex = roleHierarchy.indexOf(requiredRole);
        return currentIndex >= requiredIndex;
    };

    const isPremiumUser = () => {
        // Admin and Master always have premium access
        const role = getCurrentRole();
        if (role === 'admin' || role === 'master') return true;

        const license = getCurrentLicense();
        if (!license) return false;

        // Use the centralized helper if possible, or explicit check
        // Check for pro licenses
        return license.startsWith('pro');
    };

    const canAccessScenario = (scenarioId: string, isPremium = false) => {
        if (!isPremium) return true; // Free scenarios accessible to all
        return isPremiumUser();
    };

    const canJoinClass = (classId: string, classType = 'regular') => {
        const role = getCurrentRole();
        const license = getCurrentLicense();

        // Visitor and Guest cannot join classes (unless invited - to be implemented)
        if (role === 'visitor') return false;

        // Class license users can join organization classes for free
        if (license === 'basic_class' || license === 'pro_class') {
            // TODO: Check if class belongs to user's organization
            return true;
        }

        // Personal license users need to purchase class access
        // TODO: Check if user has purchased this specific class
        return false;
    };

    const getLicenseInfo = () => {
        // Mock data
        // For testing 'device' licensing: return { type: 'device' as const, count: 0, usedCount: 0 };
        // For testing 'user' licensing: return { type: 'user' as const, count: 50, usedCount: 10 };

        // Default to user license for now based on previous requirements
        return { type: 'user' as const, count: 50, usedCount: 10 };
    };

    const value: AuthContextType = {
        user,
        isLoading,
        login,
        logout,
        updateUserProfile,  // 🆕 프로필 업데이트 함수 추가
        switchAccount,
        addAccount,
        isAuthenticated: checkIsAuthenticated(),
        getCurrentRole,
        getCurrentLicense,
        getLicenseInfo,
        hasRole,
        isPremiumUser,
        canAccessScenario,
        canJoinClass
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
