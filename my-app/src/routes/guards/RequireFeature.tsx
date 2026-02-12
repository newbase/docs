import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../lib/constants/routes';
import { isFeatureEnabled, FeatureFlags } from '../../config/featureFlags';

interface RequireFeatureProps {
  children?: React.ReactNode;
  feature: keyof FeatureFlags;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * RequireFeature - Feature flag route guard
 * 
 * Feature flag 기반 라우트 보호 컴포넌트
 * - Feature flag 활성화 확인
 * - 비활성화일 경우 홈으로 리다이렉트
 * 
 * 사용법:
 * <Route element={<RequireFeature feature="FEATURE_STUDIO_EDITOR" />}>
 *   <Route path="..." element={<Component />} />
 * </Route>
 */
export const RequireFeature: React.FC<RequireFeatureProps> = ({
  children,
  feature,
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

  // Check feature flag
  if (!isFeatureEnabled(feature)) {
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

  // All checks passed, render the protected component
  return children ? <>{children}</> : <Outlet />;
};
