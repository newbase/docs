import React from 'react';
import { Modal } from '@/components/shared/ui';
import { Button } from '@/components/shared/ui';
import { Wand2, Loader2, Sparkles } from 'lucide-react';

interface AIModalProps {
    isOpen: boolean;
    onClose: () => void;
    prompt: string;
    setPrompt: (value: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

export const AIModal: React.FC<AIModalProps> = ({
    isOpen,
    onClose,
    prompt,
    setPrompt,
    onGenerate,
    isGenerating
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI 시나리오 생성 도우미" maxWidth="max-w-2xl">
            <div className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start">
                    <Sparkles className="text-indigo-600 mt-1 mr-3 shrink-0" size={20} />
                    <div className="text-sm text-indigo-900">
                        <p className="font-semibold mb-1">AI가 시나리오 초안을 만들어 드립니다.</p>
                        <p className="text-indigo-700">만들고 싶은 시나리오의 상황을 구체적으로 설명해주세요. (예: "응급실에 내원한 흉통 환자, 심근경색 의심, 초기 처치 후 카테터실로 이동")</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">프롬프트 입력</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-40 resize-none text-base"
                        placeholder="시나리오 상황을 자세히 묘사해주세요..."
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        onClick={onGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className="w-full sm:w-auto"
                        icon={isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
                    >
                        {isGenerating ? 'AI가 시나리오를 생성하고 있습니다...' : '시나리오 생성하기'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
