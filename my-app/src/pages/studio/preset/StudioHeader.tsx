import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Wand2, RefreshCcw, Save } from 'lucide-react';
import { Button } from '@/components/shared/ui';
import { ScenarioData } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';

interface StudioHeaderProps {
    data: ScenarioData;
    onOpenGeneralSettings: () => void;
    setIsAIModalOpen: (isOpen: boolean) => void;
    handleSaveToLocalStorage: () => void;
    isSaving: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
    data,
    onOpenGeneralSettings,
    setIsAIModalOpen,
    handleSaveToLocalStorage,
    isSaving
}) => {
    const navigate = useNavigate();
    // @ts-ignore
    const { getCurrentRole } = useAuth();
    const userRole = getCurrentRole();

    const getDashboardPath = (role: string) => {
        switch (role) {
            case 'master': return '/master/dashboard';
            case 'admin': return '/admin/dashboard';
            default: return '/student/dashboard';
        }
    };

    const handleLogoClick = () => {
        navigate(getDashboardPath(userRole));
    };

    return (
        <header className="flex-none bg-white border-b border-slate-200 shadow-sm z-20">
            <div className="w-full mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <img
                        src="/assets/images/brand/medicrew_mini_logo.png"
                        alt="Medicrew"
                        className="h-8 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleLogoClick}
                    />
                    <div className="h-6 w-px bg-slate-200 mx-2"></div>
                    <div className="flex flex-col justify-center">
                        <h1 className="font-semibold text-slate-900 leading-tight">{data.metadata.title}</h1>
                    </div>
                    <Button variant="ghost" className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 h-auto" onClick={onOpenGeneralSettings}>
                        <Settings size={18} />
                    </Button>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-500">브라우저에 자동 저장됨</span>
                    <Button variant="outline" size="sm" icon={<Wand2 size={16} />} onClick={() => setIsAIModalOpen(true)}>AI 도우미</Button>
                    <Button variant="primary" size="sm" icon={isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />} onClick={handleSaveToLocalStorage} disabled={isSaving}> {isSaving ? '저장 중...' : '프로젝트 저장'} </Button>
                </div>
            </div>
        </header>
    );
};
