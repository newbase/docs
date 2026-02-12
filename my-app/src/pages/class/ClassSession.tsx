import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import ReactPlayer from 'react-player';
import { classesData } from '../../data/classes';
import { FullScreenLayout } from '../../routes/layouts/FullScreenLayout';
import { FullScreenHeader } from '@/components/shared/layout';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../lib/constants/routes';
import { ScenarioDetail } from '../scenario';
import { VideoLecture } from '../../types/curriculum';
import CurriculumSidebar from './components/CurriculumSidebar';

export default function ClassSession(): React.ReactElement {
    const { classId, sessionId } = useParams<{ classId: string; sessionId: string }>();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { getCurrentRole } = useAuth();

    const role = getCurrentRole();
    const isManagerPath = pathname.includes('class-management');
    const basePath = role === 'master' ? '/master' : '/admin';

    // Get Class Data
    const classItem = (classesData as any)[classId || '001'];
    
    if (!classItem) {
        return <div className="p-8">Class not found</div>;
    }

    // Find session item
    const sessionItem = classItem.curriculum.find((item: any) => item.id.toString() === sessionId);

    if (!sessionItem) {
        return <div className="p-8">Session not found</div>;
    }

    // 헤더 이전 버튼: 관리자 경로면 class-management 상세, 아니면 마이클래스 상세로 이동
    const classDetailPath = isManagerPath
        ? `${basePath}/class-management/${classId}`
        : (role === 'master' ? `${ROUTES.MASTER.BASE}/my-classes/${classId}` : `${ROUTES.STUDENT.BASE}/my-classes/${classId}`);

    return (
        <FullScreenLayout
            header={
                <FullScreenHeader
                    title={classItem.title}
                    onBack={() => navigate(classDetailPath)}
                />
            }
        >
            {/* Main Workspace */}
            <div className="flex flex-1">
                {/* Sidebar - Curriculum List */}
                <CurriculumSidebar
                    classId={classId || ''}
                    curriculum={classItem.curriculum}
                    activeSessionId={sessionId || null}
                    basePath={basePath}
                    isManagerPath={isManagerPath}
                />

                {/* Main Content Area */}
                <div className="flex-1 bg-white">
                {sessionItem.type === 'video' ? (
                    <div className="flex flex-col h-full p-8">
                        <div className="w-full max-w-4xl mx-auto space-y-6">
                            {/* 강의 제목 */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{sessionItem.name}</h2>
                            </div>

                            {/* 동영상 플레이어 */}
                            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
                                {(() => {
                                    // 동영상 URL 추출 (여러 데이터 구조 지원)
                                    const videoUrl = (sessionItem as any).url || 
                                                   ((sessionItem as any).data as VideoLecture)?.url || 
                                                   null;
                                    
                                    if (videoUrl) {
                                        return (
                                            <ReactPlayer
                                                {...({ url: videoUrl } as any)}
                                                controls={true}
                                                width="100%"
                                                height="100%"
                                                className="react-player"
                                                playing={false}
                                            />
                                        );
                                    } else {
                                        return (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="text-white opacity-50 flex flex-col items-center gap-4">
                                                    <PlayCircle size={64} />
                                                    <span className="text-xl font-medium">동영상 URL이 없습니다</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>

                            {/* 동영상 강의내용 */}
                            <div className="w-full space-y-4">
                                {(() => {
                                    // 여러 데이터 소스에서 강의 내용 추출
                                    const videoData = (sessionItem as any).data as VideoLecture | undefined;
                                    const description = 
                                        videoData?.description ||           // VideoLecture의 description
                                        (sessionItem as any).includes ||    // CurriculumItem의 includes
                                        (sessionItem as any).description || // 직접 description 필드
                                        null;
                                    
                                    if (description) {
                                        return (
                                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 whitespace-pre-wrap leading-relaxed">
                                                <p className="text-gray-700">{description}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 max-w-7xl mx-auto">
                        <ScenarioDetail scenarioId={sessionItem.id.toString()} hideBreadcrumbs={true} />
                    </div>
                )}
                </div>
            </div>
        </FullScreenLayout>
    );
}
