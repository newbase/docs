import React from 'react';
import { Button } from '@/components/shared/ui';
import { ChevronLeft } from 'lucide-react';

export interface FullScreenHeaderProps {
    title: string;
    onBack?: () => void;
    rightContent?: React.ReactNode;
    className?: string;
}

/**
 * FullScreenHeader - FullScreenLayout용 표준 헤더 컴포넌트
 * 
 * 공통 헤더 구조:
 * - 좌측: 뒤로가기 버튼 + 구분선 + 타이틀
 * - 우측: 커스텀 컨텐츠
 */
export const FullScreenHeader: React.FC<FullScreenHeaderProps> = ({
    title,
    onBack,
    rightContent,
    className = ''
}) => {
    return (
        <div className={`w-full mx-auto pl-4 pr-8 h-16 flex items-center justify-between ${className}`}>
            <div className="flex items-center space-x-4">
                {onBack && (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="h-11 w-11"
                        >
                            <ChevronLeft size={20} />
                        </Button>
                        <div className="h-6 w-px bg-slate-200 mx-2"></div>
                    </>
                )}
                <h1 className="font-semibold text-slate-900 leading-tight">
                    {title}
                </h1>
            </div>

            {rightContent && (
                <div className="flex items-center gap-4">
                    {rightContent}
                </div>
            )}
        </div>
    );
};
