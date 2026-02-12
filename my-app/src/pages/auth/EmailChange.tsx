import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/shared/ui';
import { Input } from '@/components/shared/ui';

// Logo is now in public folder
const medicrewLogo = '/assets/images/brand/medicrew_blue_logo.png';

export default function EmailChange(): React.ReactElement {
    const [email, setEmail] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSendCode = () => {
        // 인증번호 전송 로직 (추후 구현)
        setMessage('인증 메일이 재전송되었습니다');
        // 3초 후 메시지 제거 (데모용)
        setTimeout(() => setMessage(null), 3000);
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        // 인증 확인 로직 (추후 구현)
        if (code === '123456') {
            navigate('/email-change/complete');
        } else {
            alert('인증번호가 올바르지 않습니다.');
        }
    };

    const handleCancel = () => {
        navigate('/settings');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
            {/* Email Change Card */}
            <div className="w-full max-w-[460px] bg-white rounded-3xl p-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100">
                {/* Logo */}
                <div className="text-center mb-10">
                    <img src={medicrewLogo} alt="Medicrew" className="h-7 w-auto mx-auto" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-semibold text-brand-500 text-center mb-4">
                    이메일 변경
                </h1>
                <p className="text-center text-gray-600 text-base mb-10">
                    변경 후 사용하실 새 이메일을 인증해주세요
                </p>

                {/* Form */}
                <form onSubmit={handleVerify} className="flex flex-col gap-6">
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-900">
                            새로운 이메일
                        </label>
                        <Input
                            type="email"
                            id="email"
                            className="bg-gray-50 focus:bg-white border-transparent focus:border-brand-500 rounded-xl"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="code" className="block mb-2 text-sm font-semibold text-gray-900">
                            인증번호
                        </label>
                        <div className="flex gap-3">
                            <Input
                                type="text"
                                id="code"
                                className="flex-1 bg-gray-50 focus:bg-white border-transparent focus:border-brand-500 rounded-xl"
                                placeholder="숫자 6자리"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                            <Button
                                type="button"
                                onClick={handleSendCode}
                                variant="secondary"
                                className="shrink-0 px-6 border-2 border-brand-500 text-brand-500 rounded-xl h-10"
                            >
                                인증번호 전송
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 mt-2">
                        {message && (
                            <p className="text-red-500 text-sm font-medium animate-pulse">
                                {message}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <Button
                            type="submit"
                            className="flex-1 rounded-full text-lg h-12"
                            variant="primary"
                        >
                            확인
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 rounded-full text-lg h-12"
                            variant="secondary"
                        >
                            취소
                        </Button>
                    </div>
                </form>

                {/* Help Section */}
                <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
                    <h2 className="text-sm font-bold text-gray-900 mb-4">
                        이메일 수신에 어려움이 있으신가요?
                    </h2>
                    <ul className="text-xs text-gray-500 space-y-2 list-none p-0">
                        <li className="relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-gray-400">
                            이메일 수신에 <span className="font-bold">2~3분</span> 정도 소요될 수 있습니다.
                        </li>
                        <li className="relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-gray-400">
                            <span className="font-bold">스팸 메일함</span>을 확인해주세요.
                        </li>
                        <li className="relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-gray-400">
                            방화벽 차단 가능성이 있다면, 스마트폰이나 다른 장소에서 다시 시도해주세요.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
