import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/shared/ui';

export default function EmailChangeComplete(): React.ReactElement {
    const navigate = useNavigate();

    const handleConfirm = () => {
        navigate('/settings');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
            {/* Success Card */}
            <div className="w-full max-w-[460px] bg-white rounded-3xl p-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col items-center">

                {/* Success Icon */}
                <div className="mb-8 w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center">
                    <Check className="w-12 h-12 text-white" strokeWidth={3} />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-semibold text-brand-500 text-center mb-6">
                    이메일 변경완료
                </h1>

                {/* Message */}
                <div className="text-center space-y-2 mb-10">
                    <p className="text-gray-700 text-lg">
                        새로운 이메일로 변경을 완료했습니다.
                    </p>
                </div>

                {/* Action Button */}
                <Button
                    onClick={handleConfirm}
                    className="w-full rounded-full text-lg shadow-lg shadow-brand-500/20 h-12"
                    variant="primary"
                >
                    확인
                </Button>
            </div>

            {/* Footer */}
            <div className="mt-10 flex justify-center items-center gap-2">
                <span className="text-xs text-gray-400">Powered by</span>
                <span className="text-sm font-bold text-gray-500">NEWBASE</span>
            </div>
        </div>
    );
}
