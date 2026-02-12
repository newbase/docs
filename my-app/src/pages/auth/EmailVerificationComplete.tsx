import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/shared/ui';

export default function EmailVerificationComplete(): React.ReactElement {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
            {/* Success Card */}
            <div className="w-full max-w-[460px] bg-white rounded-3xl p-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col items-center">

                {/* Success Icon */}
                <div className="mb-8 p-6 bg-blue-50 rounded-full">
                    <ThumbsUp className="w-16 h-16 text-brand-500" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-semibold text-brand-500 text-center mb-6">
                    정회원 인증 성공
                </h1>

                {/* Message */}
                <div className="text-center space-y-2 mb-10">
                    <p className="text-gray-700 text-lg">
                        메디크루 정회원 인증에 성공했습니다.
                    </p>
                    <p className="text-gray-500 text-base">
                        이제 더 다양한 서비스를 이용하실 수 있습니다.
                    </p>
                </div>

                {/* Action Button */}
                <Button
                    onClick={handleLogin}
                    className="w-full rounded-full text-lg shadow-lg shadow-brand-500/20 h-12"
                    variant="primary"
                >
                    로그인하기
                </Button>
            </div>

            {/* Footer Rules Links placeholder */}
            <div className="mt-10 flex justify-center items-center gap-2">
                <span className="text-xs text-gray-400">Powered by</span>
                <span className="text-sm font-bold text-gray-500">NEWBASE</span>
            </div>
        </div>
    );
}
