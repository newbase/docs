import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { masterRoutes } from './config/masterRoutes';

/**
 * Loading fallback component for lazy-loaded routes
 */
const LoadingFallback: React.FC = () => {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
                <div className="text-2xl mb-4">Loading...</div>
                <div className="text-gray-500">Please wait while we load the page.</div>
            </div>
        </div>
    );
};

/**
 * MasterRoutes - Master 라우트 컴포넌트
 * 
 * routes/config/masterRoutes.ts의 설정을 사용하여 라우트 생성
 * Lazy loading 적용으로 초기 번들 크기 감소
 */
export default function MasterRoutes(): React.ReactElement {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {masterRoutes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={<route.component />}
                    />
                ))}
            </Routes>
        </Suspense>
    );
}
