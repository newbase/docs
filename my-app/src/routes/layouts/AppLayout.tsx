import React from 'react';
import { Outlet } from 'react-router-dom';
import { CommonLayout } from '@/components/shared/layout';

/**
 * AppLayout - General application layout
 * 
 * 일반 앱 페이지용 레이아웃
 * - CommonLayout 사용 (default width: max-w-[1280px])
 * - GNB/Footer 포함
 * - Student, Master 페이지에 사용
 */
export const AppLayout: React.FC = () => {
  return (
    <CommonLayout maxWidth="default">
      <Outlet />
    </CommonLayout>
  );
};
