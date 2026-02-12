import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classesData } from '../../data/classes';
import { FullScreenLayout } from '../../routes/layouts/FullScreenLayout';
import { FullScreenHeader } from '@/components/shared/layout';
import { useAuth } from '../../contexts/AuthContext';
import CurriculumSidebar from './components/CurriculumSidebar';

export default function ClassCurriculum(): React.ReactElement {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const { getCurrentRole } = useAuth();

    const role = getCurrentRole();
    const isManagerPath = role === 'master' || role === 'admin';
    const basePath = role === 'master' ? '/master' : '/admin';

    // Get Class Data
    const classItem = (classesData as any)[classId || '001'];

    // Redirect to first session if curriculum exists
    useEffect(() => {
        if (classItem?.curriculum && classItem.curriculum.length > 0) {
            const firstSession = classItem.curriculum[0];
            const sessionPath = isManagerPath
                ? `${basePath}/class-management/${classId}/curriculum/${firstSession.id}`
                : `/class/${classId}/curriculum/${firstSession.id}`;
            navigate(sessionPath, { replace: true });
        }
    }, [classId, classItem, isManagerPath, basePath, navigate]);

    if (!classItem) {
        return <div className="p-8">Class not found</div>;
    }

    if (!classItem.curriculum || classItem.curriculum.length === 0) {
        return (
            <FullScreenLayout
                header={
                    <FullScreenHeader
                        title={classItem.title}
                        onBack={() => navigate(isManagerPath
                            ? `${basePath}/class-management/${classId}`
                            : `/class-detail?tab=${classId}`
                        )}
                    />
                }
            >
                <div className="flex items-center justify-center h-full text-gray-400">
                    커리큘럼이 없습니다.
                </div>
            </FullScreenLayout>
        );
    }

    // This component now redirects to the first session
    // The actual session content is handled by ClassSession component
    return (
        <FullScreenLayout
            header={
                <FullScreenHeader
                    title={classItem.title}
                    onBack={() => navigate(isManagerPath
                        ? `${basePath}/class-management/${classId}`
                        : `/class-detail?tab=${classId}`
                    )}
                />
            }
        >
            <div className="flex items-center justify-center h-full text-gray-400">
                세션으로 이동 중...
            </div>
        </FullScreenLayout>
    );
}
