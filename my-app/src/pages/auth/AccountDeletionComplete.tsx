import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '@/components/shared/ui';

export default function AccountDeletionComplete(): React.ReactElement {
    const navigate = useNavigate();

    const handleBackToLanding = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-8">
            <div className="w-full max-w-[520px] bg-white rounded-3xl p-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col items-center text-center">

                {/* Icon */}
                <div className="mb-8 relative">
                    <div className="absolute -top-1 -right-1">
                        <Star size={32} className="text-blue-500 fill-blue-500" strokeWidth={1.5} />
                    </div>
                    <div className="rotate-[-15deg] translate-x-[-10px] translate-y-[10px]">
                        <div className="flex flex-col gap-1 items-end">
                            <div className="w-6 h-0.5 bg-blue-400 rounded-full opacity-40"></div>
                            <div className="w-8 h-0.5 bg-blue-500 rounded-full opacity-70"></div>
                            <div className="w-10 h-0.5 bg-blue-600 rounded-full"></div>
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-semibold text-brand-500 mb-12">
                    회원계정 삭제완료
                </h1>

                <div className="text-[#374151] text-lg leading-relaxed mb-12">
                    <p className="mb-1">그동안 메디크루와 함께 해주셔서 감사합니다.</p>
                    <p>더 나은 서비스로 다음에 다시 뵙기를 바랍니다.</p>
                </div>

                {/* Action */}
                <div className="w-full max-w-[200px]">
                    <Button
                        onClick={handleBackToLanding}
                        className="w-full rounded-full text-lg shadow-lg shadow-blue-500/20 h-11 bg-[#0085FF] hover:bg-[#0077E6]"
                        variant="primary"
                    >
                        확인
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 flex items-center gap-2">
                <span className="text-xs text-gray-400">Powered by</span>
                <span className="text-sm font-bold text-gray-800 tracking-tight">NEWBASE</span>
            </div>
        </div>
    );
}
