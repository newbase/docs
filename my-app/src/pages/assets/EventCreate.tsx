import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/shared/ui';
import { EventForm } from './components/EventForm';
import { assetEvents, type AssetEvent, type EventCategory } from '../../data/assetEvents';

export default function EventCreate(): React.ReactElement {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category') as EventCategory | null;

    const handleSave = (eventData: AssetEvent) => {
        // Add to events array (In a real app, this would be an API call)
        assetEvents.unshift(eventData);

        // Show success message
        alert(`이벤트 "${eventData.displayName}"가 성공적으로 생성되었습니다.`);

        // Navigate back
        navigate(-1);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="이벤트 생성"
                breadcrumbs={[
                    { label: '에셋 관리' },
                    { label: '이벤트', link: '/admin/assets/events' },
                    { label: '생성' }
                ]}
            />

            <EventForm
                onSave={handleSave}
                onCancel={handleCancel}
                initialData={categoryParam ? { category: categoryParam } as AssetEvent : null}
            />
        </div>
    );
}
