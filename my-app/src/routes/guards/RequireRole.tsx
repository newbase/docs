import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../lib/constants/routes';
import { isFeatureEnabled, FeatureFlags } from '../../config/featureFlags';

interface RequireRoleProps {
  children?: React.ReactNode;
  role: string;
  requirePremium?: boolean;
  requiredFeature?: keyof FeatureFlags;
  redirectTo?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  isPremiumUser: () => boolean;
  isLoading: boolean;
}

/**
 * RequireRole - Role-based route guard
 * 
 * 역할 기반 라우트 보호 컴포넌트
 * - 인증 상태 확인
 * - 역할 권한 확인
 * - 프리미엄 라이선스 확인 (선택)
 * - Feature flag 확인 (선택)
 * - 권한 없을 경우 적절한 페이지로 리다이렉트
 * 
 * 사용법:
 * 1. children과 함께 사용 (기존 방식)
 *    <RequireRole role="admin"><Component /></RequireRole>
 * 
 * 2. Route element로 사용 (권장)
 *    <Route element={<RequireRole role="admin" />}>
 *      <Route path="..." element={<Component />} />
 *    </Route>
 */
export const RequireRole: React.FC<RequireRoleProps> = ({
  children,
  role,
  requirePremium = false,
  requiredFeature,
  redirectTo = ROUTES.ERROR.FORBIDDEN,
}) => {
  const location = useLocation();
  const { isAuthenticated, hasRole, isPremiumUser, isLoading } = useAuth() as AuthContextType;

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl mb-4">Loading...</div>
        </div>
      </div>
    );
  }

  // Check feature flag first (before authentication)
  if (requiredFeature && !isFeatureEnabled(requiredFeature)) {
    return (
      <Navigate
        to={ROUTES.HOME}
        replace
        state={{
          from: location,
          message: 'This feature is not available.',
        }}
      />
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.AUTH.LOGIN}
        replace
        state={{ from: location }}
      />
    );
  }

  // Check role requirement
  if (!hasRole(role)) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{
          from: location,
          message: `This page requires ${role} role or higher.`,
        }}
      />
    );
  }

  // Check premium license requirement
  if (requirePremium && !isPremiumUser()) {
    return (
      <Navigate
        to={ROUTES.ERROR.UPGRADE}
        replace
        state={{
          from: location,
          message: 'This feature requires a Pro license.',
        }}
      />
    );
  }

  // All checks passed, render the protected component
  // If used as Route element, render Outlet; otherwise render children
  return children ? <>{children}</> : <Outlet />;
};
