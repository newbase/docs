import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, ChevronDown, PlusCircle, Settings, ChevronRight, ChevronLeft, Users, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleBadgeClasses, getRoleLabel, getLicenseBadgeClasses, getGuestExpirationDate } from '../../utils/roleUtils';
import { ROUTES } from '../../lib/constants/routes';

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
 * Displays the user's avatar, name, organization, and badges.
 */
export const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, currentAccount, isGuest, getRoleBadgeClasses, getRoleLabel, getLicenseBadgeClasses }) => {
    return (
        <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-start gap-3">
                <div
                    className={`w-14 h-14 mt-1 rounded-full flex items-center justify-center shrink-0 ${isGuest ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                        }`}
                >
                    <UserIcon size={28} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="mb-1">
                        <h4 className="text-lg font-bold text-gray-900 truncate">{user.name}</h4>
                    </div>

                    <div className="mb-2">
                        <span className="text-sm font-medium text-gray-600 block truncate">
                            {currentAccount?.organizationName}
                        </span>
                    </div>

                    <div className={`flex flex-wrap gap-2 ${isGuest ? 'mb-2' : ''}`}>
                        <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${getRoleBadgeClasses(currentAccount?.role)}`}
                        >
                            {getRoleLabel(currentAccount?.role)} - {getLicenseBadgeClasses(currentAccount?.license).label}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface MainMenuActionsProps {
    isGuest: boolean;
    hasMultipleAccounts: boolean;
    handleEmailVerification: () => void;
    getGuestExpirationDate: () => string;
    onSwitchView: (view: 'main' | 'accounts') => void;
    handleAddAccount: () => void;
    navigate: (path: string) => void;
    handleLogout: () => void;
}

/**
 * MainMenuActions
 * Displays the list of actions (verify, switch account, add account, settings, logout).
 */
export const MainMenuActions: React.FC<MainMenuActionsProps> = ({
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
            {isGuest && (
                <button
                    onClick={handleEmailVerification}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                >
                    <AlertCircle size={18} className="text-red-500 group-hover:text-red-600" />
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-red-500 text-sm">이메일 인증하기</span>
                        <span className="text-xs text-gray-400">
                            {getGuestExpirationDate()} 만료 예정
                        </span>
                    </div>
                </button>
            )}

            {hasMultipleAccounts && (
                <button
                    onClick={() => onSwitchView('accounts')}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Users size={18} />
                        <span className="text-sm font-medium">다른 계정으로 전환</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                </button>
            )}

            <button onClick={handleAddAccount} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                <PlusCircle size={18} />
                <span className="text-sm font-medium">새 계정 추가</span>
            </button>

            <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings size={18} />
                <span className="text-sm font-medium">설정</span>
            </button>

            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100 mt-2 pt-3">
                <LogOut size={18} />
                <span className="text-sm font-medium">로그아웃</span>
            </button>
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
 * Displays the list of available accounts for switching.
 */
export const AccountSelectionView: React.FC<AccountSelectionViewProps> = ({ accounts, currentAccount, handleAccountSwitch, onBack, getRoleBadgeClasses, getRoleLabel, getLicenseBadgeClasses, showHeader = true }) => {
    return (
        <>
            {showHeader && (
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <button onClick={onBack} className="p-1 -ml-1 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-base font-semibold text-gray-900">계정 선택</span>
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
                className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-colors ${isOpen ? 'bg-gray-100' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isGuest ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                        }`}
                >
                    <UserIcon size={16} />
                </div>
                <div className="hidden lg:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user.name}
                </div>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white/100 rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[1005] animate-in fade-in slide-in-from-top-2 duration-200">
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
