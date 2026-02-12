import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/ui';
import { EventForm } from './components/EventForm';
import { assetEvents, type AssetEvent } from '../../data/assetEvents';

export default function EventEdit(): React.ReactElement {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<AssetEvent | null>(null);

    useEffect(() => {
        if (id) {
            const foundEvent = assetEvents.find(e => e.id === id);
            if (foundEvent) {
                setEvent(foundEvent);
            } else {
                alert('해당 이벤트를 찾을 수 없습니다.');
                navigate('/admin/assets/events');
            }
        }
    }, [id, navigate]);

    const handleSave = (eventData: AssetEvent) => {
        // Update events array (In a real app, this would be an API call)
        const index = assetEvents.findIndex(e => e.id === id);
        if (index !== -1) {
            assetEvents[index] = eventData;
        }

        // Show success message
        alert(`이벤트 "${eventData.displayName}"가 성공적으로 수정되었습니다.`);

        // Navigate back
        navigate(-1);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (!event) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <PageHeader
                title="이벤트 수정"
                breadcrumbs={[
                    { label: '에셋 관리' },
                    { label: '이벤트', link: '/admin/assets/events' },
                    { label: '수정' }
                ]}
            />

            <EventForm initialData={event} onSave={handleSave} onCancel={handleCancel} isEditing={true} />
        </div>
    );
}
