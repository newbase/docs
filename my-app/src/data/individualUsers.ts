// Mock data for individual users (개인사용자 - 기관에 소속되지 않은 사용자)
// These users can be added to organizations via AddMemberModal
import { User } from '../types/admin';

export interface IndividualUser extends Partial<User> {
    id: string | number;
    name: string;
    email: string;
    department?: string;
    specialty?: string;
}

export const individualUsers: IndividualUser[] = [
    {
        id: 'IND001',
        name: '김철수',
        email: 'kim.cs@example.com',
        department: '의과대학',
        specialty: '내과',
        registeredDate: '2024-11-15'
    },
    {
        id: 'IND002',
        name: '이영희',
        email: 'lee.yh@example.com',
        department: '간호대학',
        specialty: '응급간호',
        registeredDate: '2024-11-20'
    },
    {
        id: 'IND003',
        name: '박민수',
        email: 'park.ms@example.com',
        department: '약학대학',
        specialty: '임상약학',
        registeredDate: '2024-12-01'
    },
    {
        id: 'IND004',
        name: '정수진',
        email: 'jung.sj@example.com',
        department: '의과대학',
        specialty: '외과',
        registeredDate: '2024-12-03'
    },
    {
        id: 'IND005',
        name: '최동욱',
        email: 'choi.dw@example.com',
        department: '간호대학',
        specialty: '중환자간호',
        registeredDate: '2024-12-05'
    },
    {
        id: 'IND006',
        name: '강지혜',
        email: 'kang.jh@example.com',
        department: '의과대학',
        specialty: '소아과',
        registeredDate: '2024-12-08'
    },
    {
        id: 'IND007',
        name: '윤성호',
        email: 'yoon.sh@example.com',
        department: '치의학대학',
        specialty: '구강외과',
        registeredDate: '2024-12-10'
    },
    {
        id: 'IND008',
        name: '임하늘',
        email: 'lim.hn@example.com',
        department: '간호대학',
        specialty: '정신간호',
        registeredDate: '2024-12-11'
    },
    {
        id: 'IND009',
        name: '한별',
        email: 'han.byul@example.com',
        department: '의과대학',
        specialty: '정형외과',
        registeredDate: '2024-12-12'
    },
    {
        id: 'IND010',
        name: '서민지',
        email: 'seo.mj@example.com',
        department: '약학대학',
        specialty: '병원약학',
        registeredDate: '2024-12-13'
    },
    {
        id: 'IND011',
        name: '오준석',
        email: 'oh.js@example.com',
        department: '의과대학',
        specialty: '신경과',
        registeredDate: '2024-12-14'
    },
    {
        id: 'IND012',
        name: '송하영',
        email: 'song.hy@example.com',
        department: '간호대학',
        specialty: '아동간호',
        registeredDate: '2024-12-15'
    },
    {
        id: 'IND013',
        name: '권태양',
        email: 'kwon.ty@example.com',
        department: '의과대학',
        specialty: '마취통증의학',
        registeredDate: '2024-12-16'
    },
    {
        id: 'IND014',
        name: '장미래',
        email: 'jang.mr@example.com',
        department: '간호대학',
        specialty: '지역사회간호',
        registeredDate: '2024-12-17'
    },
    {
        id: 'IND015',
        name: '배준영',
        email: 'bae.jy@example.com',
        department: '의과대학',
        specialty: '영상의학',
        registeredDate: '2024-12-18'
    }
];

export const searchIndividualUsers = (query: string): IndividualUser[] => {
    if (!query || query.trim() === '') {
        return [];
    }

    const lowerQuery = query.toLowerCase();
    return individualUsers.filter(user =>
        (user.name?.toLowerCase().includes(lowerQuery) || false) ||
        (user.email?.toLowerCase().includes(lowerQuery) || false) ||
        (user.department?.toLowerCase().includes(lowerQuery) || false) ||
        (user.specialty?.toLowerCase().includes(lowerQuery) || false)
    );
};

export const getIndividualUserById = (userId: string | number): IndividualUser | undefined => {
    return individualUsers.find(user => user.id === userId);
};
