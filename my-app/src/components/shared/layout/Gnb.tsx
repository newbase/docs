import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, ShoppingCart, GraduationCap, Clapperboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileMenu, { UserInfoCard, MainMenuActions, AccountSelectionView } from './ProfileMenu';
import { getRoleBadgeClasses, getRoleLabel, getLicenseBadgeClasses, getGuestExpirationDate, hasStudioAccess, Role, LicenseType } from '@/utils/roleUtils';
import { menuConfig, subMenuData, MenuItem, SubMenuItem, SubMenuCategory } from '@/config/menuConfig';
import { Button } from '@/components/shared/ui';
import { ROUTES } from '@/lib/constants/routes';

// Logo is now in public folder
const medicrewLogo = '/assets/images/brand/medicrew_blue_logo.png';

// 데스크톱 서브메뉴 아이템 렌더링
const renderDesktopSubMenuItems = (menuKey: string, data: SubMenuCategory, userRole: string, organizationId?: string | null) => {
  // 공통 렌더링 로직 (Link vs a 태그 처리)
  const renderItem = (key: string, item: SubMenuItem) => {
    const isAnchor = item.to && item.to.startsWith('#');

    // organizationdetail 메뉴는 /master/organization으로 직접 이동 (MyOrganization에서 organizationId 자동 처리)
    let itemPath = item.to;

    const CardContent = () => (
      <div className="flex flex-col">
        <div className="flex flex-col">
          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
          )}
        </div>
      </div>
    );

    const baseClasses = "block p-3 rounded-lg hover:bg-gray-50 transition-colors group";

    if (isAnchor) {
      return (
        <a href={itemPath} key={key} className={baseClasses}>
          <CardContent />
        </a>
      );
    }
    return (
      <Link to={itemPath || '#'} key={key} className={baseClasses}>
        <CardContent />
      </Link>
    );
  };

  // 모든 다른 서브메뉴는 1열 리스트 스타일로 통일
  return (
    <div className="flex flex-col gap-1 p-2 w-64">
      {Object.keys(data).map((key) => renderItem(key, data[key]))}
    </div>
  );
};

interface DesktopMenuItemProps {
  item: MenuItem;
  hoveredMenus: Record<string, boolean>;
  setHoveredMenus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  userRole: string;
  organizationId?: string | null;
}

// 데스크톱 메뉴 아이템 컴포넌트
const DesktopMenuItem: React.FC<DesktopMenuItemProps> = ({ item, hoveredMenus, setHoveredMenus, userRole, organizationId }) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (item.hasSubmenu) {
    const menuData = subMenuData[item.key];
    const isHovered = hoveredMenus[item.key] || false;

    return (
      <div
        className="relative"
        onMouseEnter={() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setHoveredMenus(prev => {
            const newState: Record<string, boolean> = {};
            Object.keys(subMenuData).forEach(key => {
              newState[key] = false;
            });
            newState[item.key] = true;
            return newState;
          });
        }}
        onMouseLeave={() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            setHoveredMenus(prev => ({
              ...prev,
              [item.key]: false
            }));
          }, 100);
        }}
      >
        <div
          className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors bg-transparent border-none cursor-default inline-flex items-center"
        >
          {item.label}
          <ChevronDown
            size={16}
            className={`ml-1 transition-transform duration-200 ${isHovered ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
        <div
          className={`absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 transition-all duration-200 ${isHovered ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
            }`}
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            setHoveredMenus(prev => ({
              ...prev,
              [item.key]: true
            }));
          }}
          onMouseLeave={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
              setHoveredMenus(prev => ({
                ...prev,
                [item.key]: false
              }));
            }, 100);
          }}
        >
          {renderDesktopSubMenuItems(item.key, menuData, userRole, organizationId)}
        </div>
      </div>
    );
  }

  const btnClasses = "px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer inline-flex items-center";

  if (item.to) {
    return (
      <Link to={item.to} className={btnClasses}>
        {item.label}
      </Link>
    );
  }

  return (
    <a href={item.href} className={btnClasses}>
      {item.label}
    </a>
  );
};

interface MobileMenuItemProps {
  item: MenuItem;
  openSubMenus: Record<string, boolean>;
  toggleSubMenu: (key: string) => void;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  closeAllSubMenus: () => void;
  userRole: string;
  organizationId?: string | null;
}

// 모바일 메뉴 아이템 컴포넌트
const MobileMenuItem: React.FC<MobileMenuItemProps> = ({ item, openSubMenus, toggleSubMenu, setIsMobileMenuOpen, closeAllSubMenus, userRole, organizationId }) => {
  const isOpen = openSubMenus[item.key] || false;

  const renderSubMenuItems = (menuKey: string, data: SubMenuCategory) => {
    // Helper for rendering generic items
    const renderGenericItems = (items: string[]) => items.map((key) => {
      const item = data[key];
      const isAnchor = item.to && item.to.startsWith('#');

      // organizationdetail 메뉴는 /master/organization으로 직접 이동 (MyOrganization에서 organizationId 자동 처리)
      let itemPath = item.to;

      const props = {
        key,
        className: "block px-6 py-3 text-base text-gray-600 hover:bg-gray-50",
        onClick: () => {
          setIsMobileMenuOpen(false);
          closeAllSubMenus();
        }
      };

      if (isAnchor) {
        return (
          <a href={itemPath} {...props}>
            {item.title}
          </a>
        );
      }
      return (
        <Link to={itemPath || '#'} {...props}>
          {item.title}
        </Link>
      );
    });

    if (menuKey === 'scenarios') {
      const filteredData = userRole === 'guest'
        ? Object.keys(data).filter(key => key !== 'records')
        : Object.keys(data);
      return renderGenericItems(filteredData);
    }

    // Default handler for all other submenus (organization, support, adminMode, etc.)
    return renderGenericItems(Object.keys(data));
  };

  const menuItemClasses = "w-full flex items-center justify-between px-6 py-4 text-base font-medium text-gray-900 bg-transparent";

  if (item.hasSubmenu) {
    const menuData = subMenuData[item.key];
    return (
      <div>
        <button
          className={menuItemClasses}
          onClick={() => toggleSubMenu(item.key)}
        >
          <span>{item.label}</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>
        {isOpen && (
          <div className="bg-gray-50 py-2">
            {renderSubMenuItems(item.key, menuData)}
          </div>
        )}
      </div>
    );
  }

  if (item.to) {
    return (
      <Link
        to={item.to}
        className={menuItemClasses}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <a
      href={item.href}
      className={menuItemClasses}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <span>{item.label}</span>
    </a>
  );
};

export default function Gnb(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  // @ts-ignore
  const { getCurrentRole, getCurrentLicense, user, logout, switchAccount } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
  const [hoveredMenus, setHoveredMenus] = useState<Record<string, boolean>>({});
  const [isAccountAccordionOpen, setIsAccountAccordionOpen] = useState<boolean>(false);
  const [isProfileActionsOpen, setIsProfileActionsOpen] = useState<boolean>(false);

  const userRole: string = getCurrentRole();
  const isLoggedIn = user !== null;
  const menuItems: MenuItem[] = menuConfig[userRole] || menuConfig.guest;

  const currentAccount = user?.currentAccount;
  const accounts: any[] = user?.accounts || [];
  const isGuest = userRole === 'guest';
  const hasMultipleAccounts = accounts.length > 1;

  // Helpers moved to utils/roleUtils.js

  const handleAccountSwitch = (accountId: string | number) => {
    switchAccount(String(accountId));
    setIsMobileMenuOpen(false);

    // Find the target account to determine role
    const targetAccount = accounts.find(acc => acc.accountId === accountId);
    const role = targetAccount?.role || 'student';

    // Navigate based on role
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
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleAddAccount = () => {
    setIsMobileMenuOpen(false);
    navigate(ROUTES.AUTH.ADD_ACCOUNT);
  };

  const handleEmailVerification = () => {
    setIsMobileMenuOpen(false);
    navigate('/verify-email');
  };

  const toggleSubMenu = (menuKey: string) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const closeAllSubMenus = () => {
    setOpenSubMenus({});
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
    closeAllSubMenus();
  }, [location.pathname]);

  // 모바일 메뉴 열림/닫힘 시 body 스크롤 제어
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setIsAccountAccordionOpen(false);
      setIsProfileActionsOpen(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'master': return '/master/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/student/dashboard';
    }
  };

  const containerMaxWidth = userRole === 'admin' ? 'max-w-[1600px]' : 'max-w-7xl';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-[998] transition-all">
        <div className={`mx-auto px-4 h-full flex items-center justify-between relative z-[998] ${containerMaxWidth}`}>
          <div className="flex items-center gap-12">
            <Link to={isLoggedIn ? getDashboardPath(userRole) : "/"} className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
              <img src={medicrewLogo} alt="Medicrew" className="h-6 w-auto" />
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <DesktopMenuItem
                  key={item.key}
                  item={item}
                  hoveredMenus={hoveredMenus}
                  setHoveredMenus={setHoveredMenus}
                  userRole={userRole}
                  organizationId={currentAccount?.organizationId}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn && (
                <Link to={userRole === 'master' ? '/master/class-management' : '/student/my-classes'}>
                  <Button variant="primary" size="md">
                    마이 클래스
                  </Button>
                </Link>
              )}
              {/* 장바구니 아이콘 (admin 제외) → 장바구니 페이지 연결 */}
              {isLoggedIn && userRole !== 'admin' && (
                <Link to={userRole === 'master' ? '/master/cart' : '/student/cart'}>
                  <Button variant="ghost" size="md" className="relative">
                    <ShoppingCart size={20} />
                    {/* 장바구니 개수 뱃지 (선택적) */}
                    {/* <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span> */}
                  </Button>
                </Link>
              )}
              {isLoggedIn ? (
                <ProfileMenu />
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="md">
                      로그인
                    </Button>
                  </Link>
                  <Link to="/contact-us">
                    <Button variant="primary" size="md">
                      데모 신청
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 -mr-2"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 (nav 외부) */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 bg-black/50 z-[997] lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-x-0 top-16 bottom-0 bg-white z-[998] lg:hidden overflow-y-auto animate-in slide-in-from-top-10 duration-200">

            {/* ========== 모바일 프로필 메뉴 섹션 시작 ========== */}
            {/* 프로필 섹션 (로그인한 사용자만) */}
            {isLoggedIn && user && (
              <div>
                <button
                  onClick={() => setIsProfileActionsOpen(!isProfileActionsOpen)}
                  className="w-full hover:bg-gray-50 transition-colors"
                >
                  <div className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-gray-900 text-left truncate mb-1">{user.name}</h4>
                        {currentAccount?.organizationName && (
                          <span className="text-sm font-medium text-gray-600 text-left block truncate">
                            {currentAccount.organizationName}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-bold border whitespace-nowrap flex-shrink-0 ${getRoleBadgeClasses(currentAccount?.role || '')}`}
                      >
                        {getRoleLabel(currentAccount?.role || '')} - {getLicenseBadgeClasses(currentAccount?.license || '').label}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ${isProfileActionsOpen ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </div>
                  </div>
                </button>

                {isProfileActionsOpen && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <div>
                      {isAccountAccordionOpen ? (
                        <AccountSelectionView
                          accounts={accounts.filter(acc => acc.accountId !== currentAccount?.accountId)}
                          currentAccount={currentAccount as any}
                          handleAccountSwitch={handleAccountSwitch}
                          onBack={() => setIsAccountAccordionOpen(false)}
                          getRoleBadgeClasses={getRoleBadgeClasses}
                          getRoleLabel={getRoleLabel}
                          getLicenseBadgeClasses={getLicenseBadgeClasses}
                          showHeader={true}
                        />
                      ) : (
                        <MainMenuActions
                          user={user as any}
                          isGuest={isGuest}
                          hasMultipleAccounts={hasMultipleAccounts}
                          handleEmailVerification={handleEmailVerification}
                          getGuestExpirationDate={getGuestExpirationDate}
                          onSwitchView={(view) => {
                            if (view === 'accounts') {
                              setIsAccountAccordionOpen(true);
                            }
                          }}
                          handleAddAccount={handleAddAccount}
                          navigate={navigate}
                          handleLogout={handleLogout}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* ========== 모바일 프로필 메뉴 섹션 끝 ========== */}

            {/* 액션 버튼들 */}
            {isLoggedIn && (
              <div className="flex gap-2 px-6 py-1">
                {isLoggedIn && (
                  <Link
                    to={userRole === 'master' ? '/master/class-management' : '/student/my-classes'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    <GraduationCap size={18} className="text-white" />
                    <span>마이 클래스</span>
                  </Link>
                )}
                {isLoggedIn && userRole !== 'admin' && (
                  <Link
                    to={userRole === 'master' ? '/master/cart' : '/student/cart'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium text-brand-600 border border-brand-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <ShoppingCart size={18} className="text-brand-600" />
                    <span>장바구니</span>
                  </Link>
                )}
              </div>
            )}

            {/* 메인 메뉴 항목들 */}
            <div className="py-2">
              {menuItems.map((item) => (
                <MobileMenuItem
                  key={item.key}
                  item={item}
                  openSubMenus={openSubMenus}
                  toggleSubMenu={toggleSubMenu}
                  organizationId={currentAccount?.organizationId}
                  setIsMobileMenuOpen={setIsMobileMenuOpen}
                  closeAllSubMenus={closeAllSubMenus}
                  userRole={userRole}
                />
              ))}
            </div>

            {/* 비로그인 사용자 버튼 */}
            {!isLoggedIn && (
              <div className="px-6 py-4 flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="md" className="w-full">
                    로그인
                  </Button>
                </Link>
                <Link to="/contact-us" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    데모 신청
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
