import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/**
 * Loading - 로딩 상태 표시 컴포넌트
 * 
 * 공통으로 사용되는 로딩 인디케이터입니다.
 */
export const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...',
  size = 'md',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const containerClasses = fullScreen
    ? 'flex justify-center items-center min-h-screen'
    : 'flex justify-center items-center py-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto ${sizeClasses[size]}`}></div>
        {message && (
          <p className="mt-4 text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
};
