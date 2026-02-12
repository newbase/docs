import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../lib/constants/routes';

interface RequirePermissionProps {
  children: React.ReactNode;
  permission: string;
  redirectTo?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * RequirePermission - Permission-based route guard
 * 
 * 권한 기반 라우트 보호 컴포넌트
 * - 인증 상태 확인
 * - 특정 권한 확인 (향후 확장 가능)
 * - 권한 없을 경우 403 페이지로 리다이렉트
 * 
 * Note: 현재는 기본 구조만 제공하며, 실제 권한 시스템 구현 시 확장 필요
 */
export const RequirePermission: React.FC<RequirePermissionProps> = ({
  children,
  permission,
  redirectTo = ROUTES.ERROR.FORBIDDEN,
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth() as AuthContextType;

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

  // TODO: Implement permission check logic
  // For now, this is a placeholder that always allows access if authenticated
  // In the future, this should check against a permissions system
  const hasPermission = true; // Placeholder

  if (!hasPermission) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{
          from: location,
          message: `This page requires ${permission} permission.`,
        }}
      />
    );
  }

  // All checks passed, render the protected component
  return <>{children}</>;
};
