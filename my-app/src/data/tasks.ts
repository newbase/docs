import { ChecklistItem, EvaluationType } from '../types/admin';

export interface TaskTemplate extends Omit<ChecklistItem, 'order' | 'status' | 'value' | 'correctValue'> {
    category?: string;
    actionKeys?: string[];  // References to actions from actions.ts
}


export const tasks: TaskTemplate[] = [
    {
        id: 'task_hand_hygiene',
        evaluationType: 'performance',
        eventName: '공통',
        taskType: 'To-do',
        taskName: '손 위생',
        description: '환자 접촉 전 손 소독을 시행한다.',
        score: 10,
        feedback: '감염 관리의 기본인 손 위생을 소홀히 하였습니다.',
        category: '공통술기'
    },
    {
        id: 'task_patient_id',
        evaluationType: 'performance',
        eventName: '공통',
        taskType: 'To-do',
        taskName: '환자 확인',
        description: '개방형 질문으로 환자의 이름과 등록번호를 확인한다.',
        score: 15,
        feedback: '정확한 환자 확인은 환자 안전의 첫걸음입니다.',
        category: '공통술기'
    },
    {
        id: 'task_vitals_bp',
        evaluationType: 'performance',
        eventName: '활력징후',
        taskType: 'To-do',
        taskName: '혈압 측정',
        description: '비침습적 혈압계를 사용하여 혈압을 측정한다.',
        score: 15,
        feedback: '혈압 측정 시 커프의 위치와 크기가 적절했는지 확인하세요.',
        category: '활력징후'
    },
    {
        id: 'task_must_not_contam',
        evaluationType: 'performance',
        eventName: '공통',
        taskType: 'Must-not',
        taskName: '오염된 장비 사용 금지',
        description: '소독되지 않은 물품을 멸균 부위에 접촉하지 않는다.',
        score: -20,
        feedback: '멸균 원칙을 위반하여 감염 위험이 발생했습니다.',
        category: '무균술'
    }
];
