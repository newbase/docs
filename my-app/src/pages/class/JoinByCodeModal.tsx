import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Input } from '@/components/shared/ui';
import { classInviteService } from '../../services/classInviteService';
import { AlertCircle, Loader2 } from 'lucide-react';

interface JoinByCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function JoinByCodeModal({ isOpen, onClose }: JoinByCodeModalProps) {
    const navigate = useNavigate();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Reset state when opening
            setCode(['', '', '', '', '', '']);
            setError(null);
            setIsLoading(false);
            // Focus first input after a short delay to ensure modal animation finished
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleChange = (index: number, value: string) => {
        const newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
        if (!newValue && value !== '') return;

        const newCode = [...code];
        newCode[index] = newValue;
        setCode(newCode);
        setError(null);

        // Move to next input if value is entered
        if (newValue && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        const newCode = [...code];
        
        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i];
        }
        
        setCode(newCode);
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');
        
        if (fullCode.length < 6) {
            setError('6자리 초대 코드를 모두 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const invite = await classInviteService.getInviteByCode(fullCode);
            if (invite) {
                onClose();
                navigate(`/class/invite/${invite.token}`);
            } else {
                setError('유효하지 않은 초대 코드입니다. 다시 확인해주세요.');
            }
        } catch (err) {
            setError('코드 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="초대 코드로 클래스 참여"
            size="small"
        >
            <form onSubmit={handleSubmit} className="py-4 space-y-6">
                <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                        전달받은 6자리 초대 코드를 입력해주세요.
                    </p>
                </div>

                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className={`w-10 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                            }`}
                            maxLength={1}
                        />
                    ))}
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={onClose}
                    >
                        취소
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        disabled={isLoading || code.join('').length < 6}
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            '참여하기'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
