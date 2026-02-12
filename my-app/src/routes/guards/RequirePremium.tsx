import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../lib/constants/routes';

interface RequirePremiumProps {
  children?: React.ReactNode;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isPremiumUser: () => boolean;
  isLoading: boolean;
}

/**
 * RequirePremium - Premium license route guard
 * 
 * 프리미엄 라이선스 기반 라우트 보호 컴포넌트
 * - 인증 상태 확인
 * - 프리미엄 라이선스 확인
 * - 권한 없을 경우 업그레이드 페이지로 리다이렉트
 * 
 * 사용법:
 * <Route element={<RequirePremium />}>
 *   <Route path="..." element={<Component />} />
 * </Route>
 */
export const RequirePremium: React.FC<RequirePremiumProps> = ({
  children,
}) => {
  const location = useLocation();
  const { isAuthenticated, isPremiumUser, isLoading } = useAuth() as AuthContextType;

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

  // Check premium license requirement
  if (!isPremiumUser()) {
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
  return children ? <>{children}</> : <Outlet />;
};
