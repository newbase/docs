import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isFeatureEnabled, FeatureFlags } from '../config/featureFlags';

interface PrivateRouteProps {
    children: React.ReactNode;
    requiredRole?: string | null;
    requirePremium?: boolean;
    redirectTo?: string;
    requiredFeature?: keyof FeatureFlags; // Feature flag로 라우트 보호
}

interface AuthContextType {
    isAuthenticated: boolean;
    hasRole: (role: string) => boolean;
    isPremiumUser: () => boolean;
    isLoading: boolean;
}

/**
 * PrivateRoute - Route protection component
 * 
 * Protects routes based on:
 * - Authentication status
 * - Role requirements
 * - Premium license requirements
 * - Feature flags
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({
    children,
    requiredRole = null,
    requirePremium = false,
    redirectTo = '/login',
    requiredFeature
}) => {
    // Assert the type of useAuth return value since AuthContext is JS
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
                to="/"
                replace
                state={{ message: 'This feature is not available.' }}
            />
        );
    }

    // Check authentication
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    // Check role requirement
    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <Navigate
                to="/403"
                replace
                state={{ message: `This page requires ${requiredRole} role or higher.` }}
            />
        );
    }

    // Check premium license requirement
    if (requirePremium && !isPremiumUser()) {
        return (
            <Navigate
                to="/upgrade"
                replace
                state={{ message: 'This feature requires a Pro license.' }}
            />
        );
    }

    // All checks passed, render the protected component
    return <>{children}</>;
}

export default PrivateRoute;
