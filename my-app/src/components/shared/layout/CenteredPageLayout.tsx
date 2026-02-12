import React from 'react';
import { PageHeader } from '../ui';
import Breadcrumbs from './Breadcrumbs';

interface BreadcrumbItem {
    label: string;
    link?: string;
}

interface CenteredPageLayoutProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
    maxWidth?: string;
}

/**
 * 주문관리 스타일의 센터 정렬 페이지 레이아웃
 * - breadcrumbs prop이 있으면 상단에 브레드크럼 한 줄 표시
 * - 센터 정렬된 타이틀 (PageHeader 사용)
 * - max-w-5xl 중앙 정렬 컨테이너
 */
export default function CenteredPageLayout({
    title,
    description,
    breadcrumbs = [],
    children,
    maxWidth = 'max-w-5xl'
}: CenteredPageLayoutProps): React.ReactElement {
    return (
        <div className="min-h-screen">
            <div className={`${maxWidth} mx-auto px-4 py-4`}>
                {breadcrumbs.length > 0 && (
                    <div className="min-h-[52px] flex items-center border-b border-gray-100 mb-4">
                        <Breadcrumbs items={breadcrumbs} className="mb-0" />
                    </div>
                )}
                <PageHeader
                    title={title}
                    description={description}
                    align="center"
                />
                {children}
            </div>
        </div>
    );
}
