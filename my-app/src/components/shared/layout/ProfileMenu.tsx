/**
 * ProfileMenu.tsx
 * 
 * 모바일 프로필 메뉴 컴포넌트 모음
 * - UserInfoCard: 사용자 정보 표시 (이름, 조직, 뱃지)
 * - MainMenuActions: 사용자 액션 메뉴 (설정, 계정전환, 로그아웃 등)
 * - AccountSelectionView: 계정 선택 화면
 * 
 * 주요 사용 위치: Gnb.tsx의 모바일 메뉴 내부
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, ChevronDown, PlusCircle, Settings, ChevronRight, ChevronLeft, Users, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleBadgeClasses, getRoleLabel, getLicenseBadgeClasses, getGuestExpirationDate } from '@/utils/roleUtils';
import { ROUTES } from '@/lib/constants/routes';

// --- Interfaces ---

interface LicenseBadge {
    label: string;
    className: string;
}

interface Account {
    accountId: string;
    organizationId: string;
    organizationName: string;
    role: string;
    license: string;
    isActive?: boolean;
}

interface User {
    id: string | number;
    name: string;
    email: string;
    currentAccount: Account;
    accounts: Account[];
    isAuthenticated: boolean;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    logout: () => void;
    switchAccount: (accountId: string) => void;
    getCurrentRole: () => string;
}

// --- Sub-Components ---

interface UserInfoCardProps {
    user: User;
    currentAccount: Account;
    isGuest: boolean;
    getRoleBadgeClasses: (role: string) => string;
    getRoleLabel: (role: string) => string;
    getLicenseBadgeClasses: (license: string) => LicenseBadge;
}

/**
 * UserInfoCard
 * 모바일 프로필 메뉴 - 사용자 정보 카드
 * Displays the user's name, organization, and badges.
 * 사용 위치: Gnb.tsx의 모바일 메뉴 프로필 섹션 상단
 */
export const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, currentAccount, isGuest, getRoleBadgeClasses, getRoleLabel, getLicenseBadgeClasses }) => {
    return (
        <div className="px-6 py-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h4>
                    <span
                        className={`px-2 rounded text-xs font-bold border whitespace-nowrap ${getRoleBadgeClasses(currentAccount?.role)}`}
                    >
                        {getRoleLabel(currentAccount?.role)} - {getLicenseBadgeClasses(currentAccount?.license).label}
                    </span>
                </div>

                {/* 기관명: 기관 소속이 있으면 표시 (게스트/정회원 무관) */}
                {currentAccount?.organizationName && (
                    <div>
                        <span className="text-sm font-medium text-gray-600 block truncate">
                            {currentAccount.organizationName}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

interface MainMenuActionsProps {
    user: User;  // 🆕 user props 추가
    isGuest: boolean;
    hasMultipleAccounts: boolean;
    handleEmailVerification: () => void;
    getGuestExpirationDate: (expirationDate?: string | null) => string;
    onSwitchView: (view: 'main' | 'accounts') => void;
    handleAddAccount: () => void;
    navigate: (path: string) => void;
    handleLogout: () => void;
}

/**
 * MainMenuActions
 * 모바일 프로필 메뉴 - 사용자 액션 목록
 * Displays the list of actions (orders, verify, switch account, add account, password reset, settings, logout).
 * 사용 위치: Gnb.tsx의 모바일 메뉴 프로필 섹션
 */
export const MainMenuActions: React.FC<MainMenuActionsProps> = ({
    user,  // 🆕 user 추가
    isGuest,
    hasMultipleAccounts,
    handleEmailVerification,
    getGuestExpirationDate,
    onSwitchView,
    handleAddAccount,
    navigate,
    handleLogout
}) => {
    return (
        <div className="py-2">
            {/* ========== 모바일 프로필 메뉴 액션 리스트 시작 ========== */}
            
            {/* 게스트 사용자: 이메일 인증 버튼 */}
            {isGuest && (
                <button
                    onClick={handleEmailVerification}
                    className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 transition-colors group"
                >
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-red-500 text-sm">이메일 인증하기</span>
                        <span className="text-xs text-gray-400">
                            {getGuestExpirationDate(user.guestExpirationDate)} 만료 예정
                        </span>
                    </div>
                </button>
            )}

            {/* 계정 전환 버튼 (복수 계정 보유 시) */}
            {hasMultipleAccounts && (
                <button
                    onClick={() => onSwitchView('accounts')}
                    className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <span className="text-sm font-medium">다른 계정으로 전환</span>
                    <ChevronRight size={16} className="text-gray-400" />
                </button>
            )}

            {/* 다른 계정 추가 버튼 */}
            <button onClick={handleAddAccount} className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">다른 계정 추가</span>
            </button>

            {/* 비밀번호 변경 버튼 */}
            <button onClick={() => navigate('/password-reset')} className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">비밀번호 변경</span>
            </button>

            {/* 설정 버튼 */}
            <button onClick={() => navigate('/settings')} className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">설정</span>
            </button>

            {/* 로그아웃 버튼 */}
            <button onClick={handleLogout} className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">로그아웃</span>
            </button>
            
            {/* ========== 모바일 프로필 메뉴 액션 리스트 끝 ========== */}
        </div>
    );
};

interface AccountSelectionViewProps {
    accounts: Account[];
    currentAccount: Account;
    handleAccountSwitch: (accountId: string) => void;
    onBack: () => void;
    getRoleBadgeClasses: (role: string) => string;
    getRoleLabel: (role: string) => string;
    getLicenseBadgeClasses: (license: string) => LicenseBadge;
    showHeader?: boolean;
}

/**
 * AccountSelectionView
 * 모바일 프로필 메뉴 - 계정 선택 뷰
 * Displays the list of available accounts for switching.
 * 사용 위치: Gnb.tsx의 모바일 메뉴에서 "다른 계정으로 전환" 클릭 시 표시
 */
export const AccountSelectionView: React.FC<AccountSelectionViewProps> = ({ accounts, currentAccount, handleAccountSwitch, onBack, getRoleBadgeClasses, getRoleLabel, getLicenseBadgeClasses, showHeader = true }) => {
    return (
        <>
            {showHeader && (
                <div className="flex items-center gap-2 px-4 py-3">
                    <button onClick={onBack} className="p-1 -ml-1 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-semibold text-gray-900">계정 선택</span>
                </div>
            )}

            <div className="max-h-[300px] overflow-y-auto p-2">
                {accounts.map(account => {
                    const isActive = currentAccount?.accountId === account.accountId;
                    return (
                        <button
                            key={account.accountId}
                            onClick={() => !isActive && handleAccountSwitch(account.accountId)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${isActive
                                ? 'bg-blue-50 cursor-default'
                                : 'hover:bg-gray-50'
                                }`}
                            disabled={isActive}
                        >
                            <div className="flex flex-col gap-1">
                                <div className={`text-sm font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                                    {account.organizationName}
                                </div>
                                <div className="flex flex-wrap gap-1.5">

                                    <div className={`text-xs font-bold px-1.5 py-0.5 rounded border inline-block w-fit ${getRoleBadgeClasses(account.role)}`}>
                                        {getRoleLabel(account.role)} - {getLicenseBadgeClasses(account.license).label}
                                    </div>
                                </div>
                            </div>
                            {isActive && <Check size={16} className="text-blue-600" />}
                        </button>
                    );
                })}
            </div>
        </>
    );
};

// --- Main Component ---

export default function ProfileMenu() {
    const { user, logout, switchAccount, getCurrentRole } = useAuth() as AuthContextType;
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [view, setView] = useState<'main' | 'accounts'>('main');
    const [imageError, setImageError] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset view when menu is closed
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setView('main');
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Reset image error when user changes
    useEffect(() => {
        setImageError(false);
    }, [user?.profileImageUrl]);

    if (!user) return null;

    const currentAccount = user.currentAccount;
    const accounts = user.accounts || [];
    const isGuest = getCurrentRole() === 'guest';
    const hasMultipleAccounts = accounts.length > 1;

    // --- Actions ---
    const handleAccountSwitch = (accountId: string) => {
        switchAccount(accountId);
        setIsOpen(false);

        // Find the target account to determine role
        const targetAccount = accounts.find(acc => acc.accountId === accountId);
        const role = targetAccount?.role || 'student';

        if (role === 'master') {
            navigate('/master/dashboard');
        } else if (role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/student/dashboard');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAddAccount = () => {
        setIsOpen(false);
        navigate(ROUTES.AUTH.ADD_ACCOUNT);
    };

    const handleEmailVerification = () => {
        setIsOpen(false);
        navigate('/verify-email');
    };

    return (
        <div ref={menuRef} className="relative">
            {/* Profile Trigger Button (GNB) */}
            <button
                className={`flex items-center gap-2 px-1 py-1 rounded-full transition-colors ${isOpen ? 'bg-blue-50' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* 프로필 이미지 또는 기본 아이콘 */}
                {user.profileImageUrl && user.profileImageUrl.trim() !== '' && !imageError ? (
                    <img
                        src={user.profileImageUrl}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${isGuest ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                            }`}
                    >
                        <UserIcon size={18} />
                    </div>
                )}
                <div className="hidden lg:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user.name}
                </div>
                <div className="flex items-center gap-2">
                    <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    />
                </div>
            </button>


            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[1005] animate-in fade-in slide-in-from-top-2 duration-200">
                    {view === 'main' ? (
                        <>
                            <UserInfoCard
                                user={user}
                                currentAccount={currentAccount}
                                isGuest={isGuest}
                                getRoleBadgeClasses={getRoleBadgeClasses}
                                getRoleLabel={getRoleLabel}
                                getLicenseBadgeClasses={getLicenseBadgeClasses}
                            />
                            <MainMenuActions
                                user={user}
                                isGuest={isGuest}
                                hasMultipleAccounts={hasMultipleAccounts}
                                handleEmailVerification={handleEmailVerification}
                                getGuestExpirationDate={getGuestExpirationDate}
                                onSwitchView={setView}
                                handleAddAccount={handleAddAccount}
                                navigate={navigate}
                                handleLogout={handleLogout}
                            />
                        </>
                    ) : (
                        <AccountSelectionView
                            accounts={accounts.filter(acc => acc.accountId !== currentAccount?.accountId)}
                            currentAccount={currentAccount}
                            handleAccountSwitch={handleAccountSwitch}
                            onBack={() => setView('main')}
                            getRoleBadgeClasses={getRoleBadgeClasses}
                            getRoleLabel={getRoleLabel}
                            getLicenseBadgeClasses={getLicenseBadgeClasses}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
