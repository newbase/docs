import React from 'react';

export interface FullScreenLayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    className?: string;
    backgroundColor?: string;
}

/**
 * FullScreenLayout - GNB 없는 전체 화면 레이아웃
 *
 * 전체 화면 페이지용 레이아웃
 * - GNB/Footer 없음
 * - 고정 헤더 + 스크롤 가능한 컨텐츠 영역
 * - SimulationResults, LicenseDetail, ClassCurriculum 등에 사용
 */
export const FullScreenLayout: React.FC<FullScreenLayoutProps> = ({
    children,
    header,
    className = '',
    backgroundColor = 'bg-gray-50'
}) => {
    return (
        <div className={`flex flex-col min-h-screen ${backgroundColor} ${className}`}>
            {header && (
                <header className="flex-none bg-white border-b border-slate-200 shadow-sm z-20">
                    {header}
                </header>
            )}
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );
};
