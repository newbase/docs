// Mock data for organization notes
import { Note } from '../types/admin';

export const organizationNotes: Record<string, Note[]> = {
    'ORG001': [
        {
            id: 'NOTE001',
            adminId: 'admin@medicrew.com',
            adminName: '김관리',
            createdAt: '2025-02-15 14:30',
            content: '2025년 1분기 라이센스 갱신 완료. 추가 라이센스 요청 있음.',
            links: ['https://example.com/license-renewal'],
            attachments: ['2025_Q1_License_Report.xlsx'],
            images: []
        },
        {
            id: 'NOTE002',
            adminId: 'admin@medicrew.com',
            adminName: '이관리',
            createdAt: '2025-01-20 09:15',
            content: 'VR 기기 10대 추가 구매 예정. 견적서 첨부.',
            links: [],
            attachments: ['VR_Device_Quote.pdf'],
            images: ['device_photo.jpg']
        }
    ],
    'ORG002': [
        {
            id: 'NOTE003',
            adminId: 'admin@medicrew.com',
            adminName: '박관리',
            createdAt: '2025-02-10 16:45',
            content: '신규 게스트 계정 50개 생성 완료. 교육 일정 조율 중.',
            links: ['https://example.com/training-schedule'],
            attachments: ['Guest_Account_List.xlsx'],
            images: []
        },
        {
            id: 'NOTE005',
            adminId: 'admin@medicrew.com',
            adminName: '이관리',
            createdAt: '2025-12-01 10:00',
            content: 'VR 기기 추가 구매 완료. 총 50대 운영 중.',
            links: [],
            attachments: ['VR_Purchase_Receipt.pdf'],
            images: []
        }
    ],
    'ORG003': [
        {
            id: 'NOTE004',
            adminId: 'admin@medicrew.com',
            adminName: '최관리',
            createdAt: '2025-02-05 11:20',
            content: '시스템 업데이트 안내 완료. 다음 주 화요일 점검 예정.',
            links: ['https://example.com/system-update'],
            attachments: ['Update_Notice.pdf'],
            images: ['update_screenshot.png']
        }
    ],
    'ORG007': [
        {
            id: 'NOTE006',
            adminId: 'admin@medicrew.com',
            adminName: '한관리',
            createdAt: '2025-11-15 14:30',
            content: '간호대학 학생 교육 프로그램 시작. 80대 VR 기기 배치 완료.',
            links: ['https://example.com/nursing-program'],
            attachments: ['Nursing_Program_Schedule.xlsx'],
            images: ['training_room.jpg']
        }
    ]
};

export function getNotesByOrgId(orgId: string): Note[] {
    return organizationNotes[orgId] || [];
}

export function addNote(orgId: string, note: Note): Note[] {
    if (!organizationNotes[orgId]) {
        organizationNotes[orgId] = [];
    }
    organizationNotes[orgId].unshift(note);
    return organizationNotes[orgId];
}
