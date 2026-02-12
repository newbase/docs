import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CommonLayout from './CommonLayout';
import { LayoutWidthProvider } from '@/contexts/LayoutWidthContext';

export type LayoutWidth = 'default' | 'wide' | 'full';

export type AppLayoutOutletContext = {
  setLayoutWidth?: (width: LayoutWidth) => void;
};

/**
 * AppLayout - General application layout
 *
 * 일반 앱 페이지용 레이아웃
 * - CommonLayout 사용 (default width: max-w-[1280px])
 * - GNB/Footer 포함
 * - LayoutWidthContext + Outlet context로 setLayoutWidth 제공 (중첩 라우트에서도 wide/full 요청 가능)
 */
export const AppLayout: React.FC = () => {
  const [layoutWidth, setLayoutWidth] = useState<LayoutWidth>('default');
  const layoutWidthValue = { setLayoutWidth };
  return (
    <LayoutWidthProvider value={layoutWidthValue}>
      <CommonLayout maxWidth={layoutWidth}>
        <Outlet context={layoutWidthValue} />
      </CommonLayout>
    </LayoutWidthProvider>
  );
};
