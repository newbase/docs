/**
 * Route Path Constants
 * 
 * 모든 라우트 경로를 상수로 관리하여 타입 안정성과 유지보수성 향상
 */
export const ROUTES = {
  // Public Routes
  HOME: '/',

  // Authentication Routes
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    SIGNUP_COMPLETE: '/signup/complete',
    EMAIL_VERIFICATION: '/verify-email',
    EMAIL_VERIFICATION_COMPLETE: '/verify-email/complete',
    PASSWORD_RESET: '/password-reset',
    PASSWORD_RESET_NEW: '/password-reset/new',
    EMAIL_CHANGE: '/email-change',
    EMAIL_CHANGE_COMPLETE: '/email-change/complete',
    ACCOUNT_DELETION_REQUEST: '/account-deletion/request',
    ACCOUNT_DELETION_CONFIRM: '/account-deletion/confirm',
    ACCOUNT_DELETION_COMPLETE: '/account-deletion/complete',
    SETTINGS: '/settings',
    ADD_ACCOUNT: '/settings/add-account',
  },

  // Student Routes
  STUDENT: {
    BASE: '/student',
    DASHBOARD: '/student/dashboard',
  },

  // Master Routes
  MASTER: {
    BASE: '/master',
    DASHBOARD: '/master/dashboard',
    CLASS_MANAGEMENT: '/master/class-management',
    CLASS_DETAIL: (id: string) => `/master/class-management/${id}`,
    CLASS_CREATE: '/master/class/create',
    CLASS_CREATE_ORGANIZATION: '/master/class/create/organization',
    CLASS_EDIT: (id: string) => `/master/class/edit/${id}`,
    CLASS_CURRICULUM: (classId: string) => `/master/class-management/${classId}/curriculum`,
    CLASS_SESSION: (classId: string, sessionId: string) => `/master/class-management/${classId}/curriculum/${sessionId}`,
    CLASS_RESULTS: (classId: string, sessionId: string) => `/master/class-management/${classId}/results/${sessionId}`,
    PRODUCT_MANAGEMENT: '/master/product-management',
    OPEN_CLASS_CREATE: '/master/open-class/create',
    SCENARIOS: '/master/scenarios',
    SCENARIO_DETAIL: (id: string) => `/master/scenarios/${id}`,
    ASSETS_EVENTS: '/master/assets/events',
    ASSETS_EVENT_CREATE: '/master/assets/events/create',
    ASSETS_EVENT_EDIT: (id: string) => `/master/assets/events/${id}/edit`,
    ASSETS_SYMPTOMS: '/master/assets/symptoms',
    ASSETS_TASKS: '/master/assets/tasks',
    ASSETS_ACTIONS: '/master/assets/actions',
    ASSETS_DIALOGUES: '/master/assets/dialogues',
    ORGANIZATION: '/master/organization',
  },

  // Admin Routes
  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin/dashboard',
    ORGANIZATIONS: '/admin/organizations',
    ORGANIZATION_DETAIL: (id: string) => `/admin/organizations/${id}`,
    ORGANIZATION_LICENSE_DETAIL: (orgId: string, licenseId: string) => `/admin/organizations/${orgId}/licenses/${licenseId}`,
    USERS: '/admin/users',
    SCENARIOS: '/admin/scenarios',
    SCENARIO_DETAIL: (id: string) => `/admin/scenarios/${id}`,
    CLASS_MANAGEMENT: '/admin/class-management',
    CLASS_DETAIL: (id: string) => `/admin/class-management/${id}`,
    CLASS_CREATE: '/admin/class/create',
    CLASS_CREATE_ORGANIZATION: '/admin/class/create/organization',
    CLASS_EDIT: (id: string) => `/admin/class/edit/${id}`,
    CLASS_CURRICULUM: (classId: string) => `/admin/class-management/${classId}/curriculum`,
    CLASS_SESSION: (classId: string, sessionId: string) => `/admin/class-management/${classId}/curriculum/${sessionId}`,
    CLASS_RESULTS: (classId: string, sessionId: string) => `/admin/class-management/${classId}/results/${sessionId}`,
    PRODUCT_MANAGEMENT: '/admin/product-management',
    OPEN_CLASS_CREATE: '/admin/open-class/create',
    OPEN_CLASS_DETAIL: (id: string) => `/admin/open-class/${id}`,
    OPEN_CLASS_EDIT: (id: string) => `/admin/open-class/edit/${id}`,
    ASSETS_EVENTS: '/admin/assets/events',
    ASSETS_EVENT_CREATE: '/admin/assets/events/create',
    ASSETS_EVENT_EDIT: (id: string) => `/admin/assets/events/${id}/edit`,
    ASSETS_SYMPTOMS: '/admin/assets/symptoms',
    ASSETS_TASKS: '/admin/assets/tasks',
    ASSETS_ACTIONS: '/admin/assets/actions',
    ASSETS_DIALOGUES: '/admin/assets/dialogues',
    ASSETS_ITEMS: '/admin/assets/items',
  },

  // Common Routes
  COMMON: {
    DASHBOARD: '/dashboard', // Legacy redirect
    CLASS_LIST: '/open-class-list',
    OPEN_CLASS_DETAIL: (id: string) => `/open-class/${id}`,
    CLASS_DETAIL: '/class-detail',
    CLASS_INVITE_ACCEPT: (token: string) => `/class/invite/${token}`,
    CLASS_CURRICULUM: (classId: string) => `/class/${classId}/curriculum`,
    CLASS_SESSION: (classId: string, sessionId: string) => `/class/${classId}/curriculum/${sessionId}`,
    CLASS_RESULTS: (classId: string, sessionId: string) => `/class/${classId}/results/${sessionId}`,
    SCENARIOS: '/scenarios',
    SCENARIO_DETAIL: (id: string) => `/scenario/${id}`,
  },

  // Studio Routes
  STUDIO: {
    EDIT: '/studio/edit',
  },

  // Development Routes
  DEV: {
    EMAIL_PREVIEW: '/dev/email-preview',
  },

  // Error Pages
  ERROR: {
    NOT_FOUND: '/404',
    FORBIDDEN: '/403',
    UPGRADE: '/upgrade',
  },
} as const;

/**
 * Helper function to generate route paths with parameters
 */
export const buildRoute = {
  master: {
    classDetail: (id: string) => ROUTES.MASTER.CLASS_DETAIL(id),
    classEdit: (id: string) => ROUTES.MASTER.CLASS_EDIT(id),
    classCurriculum: (classId: string) => ROUTES.MASTER.CLASS_CURRICULUM(classId),
    classSession: (classId: string, sessionId: string) => ROUTES.MASTER.CLASS_SESSION(classId, sessionId),
    classResults: (classId: string, sessionId: string) => ROUTES.MASTER.CLASS_RESULTS(classId, sessionId),
    scenarioDetail: (id: string) => ROUTES.MASTER.SCENARIO_DETAIL(id),
    eventEdit: (id: string) => ROUTES.MASTER.ASSETS_EVENT_EDIT(id),
  },
  admin: {
    organizationDetail: (id: string) => ROUTES.ADMIN.ORGANIZATION_DETAIL(id),
    classDetail: (id: string) => ROUTES.ADMIN.CLASS_DETAIL(id),
    classEdit: (id: string) => ROUTES.ADMIN.CLASS_EDIT(id),
    classCurriculum: (classId: string) => ROUTES.ADMIN.CLASS_CURRICULUM(classId),
    classSession: (classId: string, sessionId: string) => ROUTES.ADMIN.CLASS_SESSION(classId, sessionId),
    classResults: (classId: string, sessionId: string) => ROUTES.ADMIN.CLASS_RESULTS(classId, sessionId),
    scenarioDetail: (id: string) => ROUTES.ADMIN.SCENARIO_DETAIL(id),
    eventEdit: (id: string) => ROUTES.ADMIN.ASSETS_EVENT_EDIT(id),
  },
  common: {
    classCurriculum: (classId: string) => ROUTES.COMMON.CLASS_CURRICULUM(classId),
    classSession: (classId: string, sessionId: string) => ROUTES.COMMON.CLASS_SESSION(classId, sessionId),
    classResults: (classId: string, sessionId: string) => ROUTES.COMMON.CLASS_RESULTS(classId, sessionId),
    scenarioDetail: (id: string) => ROUTES.COMMON.SCENARIO_DETAIL(id),
  },
};
