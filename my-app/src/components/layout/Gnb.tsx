import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, PlusCircle, Settings, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileMenu, { UserInfoCard, AccountSelectionView } from './ProfileMenu';
import { getRoleBadgeClasses, getRoleLabel, getLicenseBadgeClasses, getGuestExpirationDate, hasStudioAccess, Role, LicenseType } from '../../utils/roleUtils';
import { menuConfig, subMenuData, MenuItem, SubMenuItem, SubMenuCategory } from '../../config/menuConfig';
import { Button } from '../ui/Button';
import { ROUTES } from '../../lib/constants/routes';

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
        className: "block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50",
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

  const menuItemClasses = "w-full flex items-center justify-between px-4 py-4 text-base font-medium text-gray-900 bg-transparent";

  if (item.hasSubmenu) {
    const menuData = subMenuData[item.key];
    return (
      <div className="border-b border-gray-100 last:border-none">
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
        className={`${menuItemClasses} border-b border-gray-100 last:border-none`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <a
      href={item.href}
      className={`${menuItemClasses} border-b border-gray-100 last:border-none`}
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
  const [isUserActionsOpen, setIsUserActionsOpen] = useState<boolean>(false);

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
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn && hasStudioAccess(userRole as Role, getCurrentLicense() as LicenseType) && (
              <Link to="/studio/edit">
                <Button variant="primary" size="md">
                  시나리오 스튜디오
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

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 bg-black/50 z-[997] lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-x-0 top-16 bottom-0 bg-white z-[998] lg:hidden overflow-y-auto animate-in slide-in-from-top-10 duration-200 flex flex-col">
            {/* 모바일 메뉴 콘텐츠 */}
            <div className="flex-1 overflow-y-auto">
              {/* 프로필 메뉴 (로그인한 사용자만) */}
              {isLoggedIn && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  {/* Collapsible User Header */}
                  <button
                    onClick={() => setIsUserActionsOpen(!isUserActionsOpen)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex-1 text-left">
                      {user && (
                        <UserInfoCard
                          user={user as any}
                          currentAccount={currentAccount as any}
                          isGuest={isGuest}
                          getRoleBadgeClasses={getRoleBadgeClasses}
                          getRoleLabel={getRoleLabel}
                          getLicenseBadgeClasses={getLicenseBadgeClasses}
                        />
                      )}
                    </div>
                    <div className="pl-4">
                      <ChevronDown
                        size={20}
                        className={`text-gray-500 transition-transform duration-200 ${isUserActionsOpen ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${isUserActionsOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col gap-2">
                      {isGuest && (
                        <button
                          onClick={handleEmailVerification}
                          className="flex items-center gap-3 w-full p-3 bg-white border border-red-100 rounded-lg text-left shadow-sm hover:shadow-md transition-all group"
                        >
                          <AlertCircle size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-red-500 text-sm">이메일 인증하기</span>
                            <span className="text-xs text-gray-500">
                              {getGuestExpirationDate()} 만료 예정
                            </span>
                          </div>
                        </button>
                      )}

                      {hasMultipleAccounts && (
                        <>
                          <button
                            onClick={() => setIsAccountAccordionOpen(!isAccountAccordionOpen)}
                            className="flex items-center justify-between w-full p-3 bg-white border border-gray-200 rounded-lg text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Users size={18} />
                              <span>다른 계정으로 전환</span>
                            </div>
                            <ChevronDown
                              size={16}
                              className={`text-gray-400 transition-transform duration-200 ${isAccountAccordionOpen ? 'rotate-180' : 'rotate-0'}`}
                            />
                          </button>

                          <div className={`overflow-hidden transition-all duration-300 ${isAccountAccordionOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-2 bg-gray-100 rounded-lg mt-2">
                              <AccountSelectionView
                                accounts={accounts.filter(acc => acc.accountId !== currentAccount?.accountId)}
                                currentAccount={currentAccount as any}
                                handleAccountSwitch={handleAccountSwitch}
                                onBack={() => { }}
                                getRoleBadgeClasses={getRoleBadgeClasses}
                                getRoleLabel={getRoleLabel}
                                getLicenseBadgeClasses={getLicenseBadgeClasses}
                                showHeader={false}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <button onClick={handleAddAccount} className="flex items-center gap-3 w-full p-3 bg-white border border-gray-200 rounded-lg text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <PlusCircle size={18} />
                        <span>새 계정 추가</span>
                      </button>

                      <button onClick={() => navigate('/settings')} className="flex items-center gap-3 w-full p-3 bg-white border border-gray-200 rounded-lg text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings size={18} />
                        <span>설정</span>
                      </button>

                      <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 bg-white border border-gray-200 rounded-lg text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <LogOut size={18} />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Studio Button for Mobile (shown for admin or master+pro) */}
              {isLoggedIn && hasStudioAccess(userRole as Role, getCurrentLicense() as LicenseType) && (
                <div className="px-4 py-3 border-b border-gray-200">
                  <Link
                    to="/studio/edit"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="primary" size="md" className="w-full">
                      시나리오 스튜디오
                    </Button>
                  </Link>
                </div>
              )}

              {/* 메인 메뉴 항목들 */}
              <div className="py-2">
                {menuItems.map((item, index) => (
                  <React.Fragment key={item.key}>
                    <MobileMenuItem
                      item={item}
                      openSubMenus={openSubMenus}
                      toggleSubMenu={toggleSubMenu}
                      organizationId={currentAccount?.organizationId}
                      setIsMobileMenuOpen={setIsMobileMenuOpen}
                      closeAllSubMenus={closeAllSubMenus}
                      userRole={userRole}
                    />

                    {item.key === 'blog' && !isLoggedIn && (
                      <div className="mt-4 px-4 flex flex-col gap-3">
                        <Link
                          to="/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button variant="ghost" size="md" className="w-full">
                            로그인
                          </Button>
                        </Link>
                        <Link
                          to="/contact-us"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button variant="primary" size="md" className="w-full">
                            데모 신청
                          </Button>
                        </Link>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
