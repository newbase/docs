import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ROUTES } from '../../lib/constants/routes';

/**
 * NotFoundPage - 404 Error Page
 */
export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 mt-2 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          to={ROUTES.HOME}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

/**
 * ForbiddenPage - 403 Error Page
 */
export const ForbiddenPage: React.FC = () => {
  const location = useLocation();
  const message = (location.state as { message?: string })?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">403</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4">접근 권한이 없습니다</h2>
        {message && (
          <p className="text-gray-600 mt-2 mb-4">{message}</p>
        )}
        <p className="text-gray-600 mb-8">
          이 페이지에 접근하려면 적절한 권한이 필요합니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to={ROUTES.HOME}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          <Link
            to={ROUTES.AUTH.SETTINGS}
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            설정으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * UpgradePage - Premium License Required Page
 */
export const UpgradePage: React.FC = () => {
  const location = useLocation();
  const message = (location.state as { message?: string })?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">프리미엄 라이선스가 필요합니다</h1>
        {message && (
          <p className="text-gray-600 mb-4">{message}</p>
        )}
        <p className="text-gray-600 mb-8">
          이 기능을 사용하려면 Pro 라이선스가 필요합니다.
          <br />
          라이선스를 업그레이드하여 더 많은 기능을 이용하세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to={ROUTES.HOME}
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          <Link
            to={ROUTES.AUTH.SETTINGS}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            라이선스 업그레이드
          </Link>
        </div>
      </div>
    </div>
  );
};
