import React from 'react';
import { Outlet } from 'react-router-dom';
import { CommonLayout } from '@/components/shared/layout';

/**
 * AdminLayout - Admin pages layout
 * 
 * Admin 전용 페이지용 레이아웃
 * - CommonLayout 사용 (wide width: max-w-[1600px])
 * - GNB/Footer 포함
 * - Admin 페이지에 사용
 */
export const AdminLayout: React.FC = () => {
  return (
    <CommonLayout maxWidth="wide">
      <Outlet />
    </CommonLayout>
  );
};
