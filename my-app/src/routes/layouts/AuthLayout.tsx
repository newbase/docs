import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * AuthLayout - Authentication pages layout
 * 
 * 인증 관련 페이지용 레이아웃
 * - GNB/Footer 없음
 * - 독립적인 레이아웃이 필요한 페이지에 사용
 * - Landing, Login, Signup 등
 */
export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};
