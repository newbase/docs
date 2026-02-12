import { ScenarioData } from '../types/index';
import { getRoleColor } from '../utils/studioUtils';

export const INITIAL_DATA: ScenarioData = {
    metadata: {
        title: "새 시뮬레이션 시나리오",
        handover: "54세 남성, 흉통을 호소하며 구급차로 내원...",
        mission: "10분 이내에 급성 심근경색을 파악하고 처치하시오."
    },
    environment: {
        mapId: 'er_trauma',
        availableItemIds: ['monitor', 'defib', 'crash_cart', 'iv_pump'],
        storageSetup: {
            'crash_cart': [
                {
                    id: 'top',
                    name: '상단 선반',
                    items: [],
                    backgroundImageUrl: '/assets/images/Items/storages/Type=CartTop.png'
                },
                {
                    id: 'd1',
                    name: '서랍 1 (기도)',
                    items: [],
                    backgroundImageUrl: '/assets/images/Items/storages/Type=Drawer.png'
                },
                {
                    id: 'd2',
                    name: '서랍 2 (호흡)',
                    items: [],
                    backgroundImageUrl: '/assets/images/Items/storages/Type=Drawer.png'
                },
                {
                    id: 'd3',
                    name: '서랍 3 (순환)',
                    items: [],
                    backgroundImageUrl: '/assets/images/Items/storages/Type=Drawer.png'
                }
            ]
        }
    },
    roles: [
        { id: '1', name: '책임 간호사', type: 'Nurse', color: getRoleColor('Nurse') },
        { id: '2', name: '응급의학과 의사', type: 'Doctor', color: getRoleColor('Doctor') },
    ],
    states: [
        {
            id: 'state-1',
            title: '초기 평가',
            events: [
                {
                    id: 'evt-1',
                    roleId: '1',
                    title: '환자 도착',
                    description: '환자가 구급차 들것 실려 도착함.',
                    triggerType: 'immediate',
                    timeLimit: 180,
                    onTimeLimitFail: 'state-2',
                    todos: [
                        { id: 'td-1', content: '활력 징후 측정', type: 'todo' },
                        { id: 'td-2', content: '심전도 모니터 부착', type: 'todo' }
                    ]
                }
            ]
        },
        {
            id: 'state-2',
            title: '환자 상태 악화',
            events: []
        }
    ]
};
