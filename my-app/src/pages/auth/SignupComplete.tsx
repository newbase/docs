import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/shared/ui';

// Logo is now in public folder
const medicrewLogo = '/assets/images/brand/medicrew_blue_logo.png';

export default function SignupComplete(): React.ReactElement {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };

    const handleEmailVerification = () => {
        navigate('/verify-email');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
            {/* Complete Card */}
            <div className="w-full max-w-[460px] bg-white rounded-3xl p-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100">
                {/* Logo */}
                <div className="text-center mb-12">
                    <Link to="/" className="inline-block">
                        <img src={medicrewLogo} alt="Medicrew" className="h-7 w-auto" />
                    </Link>
                </div>

                {/* Success Icon */}
                <div className="flex justify-center mb-8">
                    <div className="text-6xl animate-bounce-subtle">
                        <span>✨</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-semibold text-brand-500 text-center mb-8">
                    회원가입 완료
                </h1>

                {/* Message */}
                <div className="text-center space-y-4 mb-10">
                    <p className="text-gray-700 text-base">
                        현재 <span className="text-brand-500 font-medium">게스트 회원</span>으로 가입이 완료되었습니다.
                    </p>
                    <p className="text-gray-700 text-base">
                        로그인 후 수강생 모드를 시작하세요. <br />
                        관리자 및 정회원 서비스는 <span className="text-brand-500 font-medium">이메일 인증</span>이 필요합니다.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={handleLogin}
                        className="w-full rounded-2xl text-lg h-12"
                        variant="primary"
                    >
                        로그인하기
                    </Button>
                    <Button
                        onClick={handleEmailVerification}
                        className="w-full rounded-2xl text-lg h-12 border-2 border-brand-500 text-brand-500 hover:bg-gray-50"
                        variant="secondary"
                    >
                        이메일 인증하기
                    </Button>
                </div>
            </div>

            {/* Powered By */}
            <div className="mt-10 flex justify-center items-center gap-2">
                <span className="text-xs text-gray-400">Powered by</span>
                <span className="text-sm font-bold text-gray-500">NEWBASE</span>
            </div>

            {/* Footer Rules Links */}
            <div className="w-full max-w-[460px] flex justify-between items-center text-xs text-gray-400 mt-8">
                {/* Left: Home Button */}
                <Link to="/" className="flex items-center gap-2 hover:text-gray-600 transition-colors font-medium">
                    ← 홈으로
                </Link>

                {/* Right: Terms & Privacy */}
                <div className="flex gap-6">
                    <button type="button" className="bg-transparent border-none p-0 cursor-pointer hover:underline text-inherit">이용약관</button>
                    <button type="button" className="bg-transparent border-none p-0 cursor-pointer hover:underline text-inherit">개인정보처리방침</button>
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 2s ease-in-out infinite;
                    display: inline-block;
                }
            `}</style>
        </div>
    );
}
