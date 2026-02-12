export interface Participant {
    id: string;
    name: string;
    department: string;
}

export const participants: Participant[] = [
    { id: 'ST001', name: '김철수', department: '간호학과' },
    { id: 'ST002', name: '이영희', department: '간호학과' },
    { id: 'ST003', name: '박지민', department: '응급구조과' },
    { id: 'ST004', name: '최유진', department: '의학과' },
    { id: 'ST005', name: '정태우', department: '간호학과' },
];
