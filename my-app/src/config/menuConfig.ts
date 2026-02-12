// Menu Configuration for Global Navigation Bar (Gnb)

// Menu Types
export interface MenuItem {
    key: string;
    label: string;
    to?: string;
    href?: string;
    hasSubmenu?: boolean;
}

export interface SubMenuItem {
    menuKey: string;
    title: string;
    to: string;
    description?: string;
}

export interface SubMenuCategory {
    [key: string]: SubMenuItem;
}

export interface SubMenuConfig {
    [key: string]: SubMenuCategory;
}

export interface MenuConfig {
    [role: string]: MenuItem[];
}

// Submenu Data Configuration
export const subMenuData: SubMenuConfig = {
    'customers': {
        'organizations': { menuKey: 'organizations', title: '기관 관리', to: '/admin/organizations' },
        'users': { menuKey: 'users', title: '사용자 관리', to: '/admin/users' }
    },
    sales: {
        'orders': { menuKey: 'orders', title: '주문 관리', to: '/admin/order-management' },
        'product-management': { menuKey: 'product-management', title: '프로덕트 관리', to: '/admin/product-management' },
        'class-management': { menuKey: 'class-management', title: '클래스 관리', to: '/admin/class-management' },
    },
    'assets': {
        'dialogues': { menuKey: 'dialogues', title: '대화 관리', to: '/admin/assets/dialogues', description: '환자 대화 & 의사 보고' },
        'tasks': { menuKey: 'tasks', title: '태스크 관리', to: '/admin/assets/tasks', description: '시나리오 공통 태스크 관리' },
        'events': { menuKey: 'events', title: '이벤트 관리', to: '/admin/assets/events', description: 'Engine & Skill Logic 이벤트' },
        'symptoms': { menuKey: 'symptoms', title: '증상 템플릿 관리', to: '/admin/assets/symptoms', description: '환자 증상 및 활력징후 템플릿' },
        'items': { menuKey: 'items', title: '아이템 관리', to: '/admin/assets/items', description: '캐릭터, 맵, 장비' },
    },
    'support': {
        'resources': { menuKey: 'resources', title: '리소스', to: '#resources' },
        'contact': { menuKey: 'contact', title: '이용문의', to: '#contact' }
    }
};

// Role-based Menu Configuration
export const menuConfig: MenuConfig = {
    visitor: [
        { key: 'openClasses', label: '오픈 클래스', to: '/open-class-list' },
        { key: 'support', label: '서포트', hasSubmenu: true },
        { key: 'blog', label: '블로그', href: '#blog' }
    ],
    guest: [
        { key: 'dashboard', label: '대시보드', to: '/dashboard' },
        { key: 'openClasses', label: '오픈 클래스', to: '/open-class-list' },
        { key: 'support', label: '서포트', hasSubmenu: true },
        { key: 'blog', label: '블로그', href: '#blog' }
    ],
    student: [
        { key: 'dashboard', label: '대시보드', to: '/dashboard' },
        { key: 'openClasses', label: '오픈 클래스', to: '/open-class-list' },
        { key: 'orders', label: '주문내역', to: '/student/orders' },
        { key: 'support', label: '서포트', hasSubmenu: true },
        { key: 'blog', label: '블로그', href: '#blog' }
    ],
    master: [
        { key: 'dashboard', label: '대시보드', to: '/master/dashboard' },
        { key: 'openClasses', label: '오픈클래스', to: '/master/open-class-list' },
        { key: 'scenarioManagement', label: '시나리오', to: '/master/scenarios' },
        { key: 'support', label: '서포트', hasSubmenu: true },
        { key: 'blog', label: '블로그', href: '#blog' },
        { key: 'MyOrganization', label: '관리자 설정', to: '/master/organization' }
    ],
    admin: [
        { key: 'dashboard', label: '대시보드', to: '/admin/dashboard' },
        { key: 'customers', label: '고객', hasSubmenu: true },
        { key: 'sales', label: '판매', hasSubmenu: true },
        { key: 'scenarioManagement', label: '시나리오', to: '/admin/scenarios' },
        { key: 'assets', label: '에셋', hasSubmenu: true },
        { key: 'support', label: '서포트', hasSubmenu: true },
        { key: 'blog', label: '블로그', href: '#blog' }
    ]
};
