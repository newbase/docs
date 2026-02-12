export interface DialoguePresetItem {
    id: string;
    label: string;
    question: string;
    answer: string;
}

export interface DialogueCategory {
    id: string;
    title: string;
    items: DialoguePresetItem[];
}

export const DIALOGUE_PRESETS: DialogueCategory[] = [
    {
        id: 'assessment',
        title: '초기 평가 (Assessment)',
        items: [
            { id: 'assess-1', label: '성함 확인', question: '환자분 성함이 어떻게 되시나요?', answer: '제 이름은 김철수입니다.' },
            { id: 'assess-2', label: '주호소 확인', question: '지금 어디가 불편하신가요?', answer: '가슴이 너무 답답하고 숨쉬기가 힘들어요.' },
            { id: 'assess-3', label: '발병 시점', question: '통증이 언제부터 시작되었나요?', answer: '30분 전부터 갑자기 시작됐습니다.' },
        ]
    },
    {
        id: 'history',
        title: '병력 청취 (History)',
        items: [
            { id: 'hist-1', label: '기저 질환', question: '평소에 앓고 있는 질환이 있으신가요?', answer: '고혈압이랑 당뇨가 있습니다.' },
            { id: 'hist-2', label: '복용 약물', question: '현재 복용 중인 약이 있으신가요?', answer: '혈압약이랑 당뇨약을 아침마다 먹고 있습니다.' },
            { id: 'hist-3', label: '과거력 확인', question: '이전에도 이런 증상이 있었나요?', answer: '아니요, 이렇게 아픈 건 처음입니다.' },
        ]
    },
    {
        id: 'symptoms',
        title: '증상 상세 (Symptoms)',
        items: [
            { id: 'symp-1', label: '방사통 여부', question: '통증이 어디로 뻗치나요? (방사통)', answer: '왼쪽 어깨랑 턱 쪽으로 찌릿한 느낌이 듭니다.' },
            { id: 'symp-2', label: '통증 양상', question: '통증의 양상은 어떤가요? (쥐어짜는 듯, 찌르는 듯)', answer: '누가 가슴을 꽉 쥐어짜는 것 같아요.' },
            { id: 'symp-3', label: '동반 증상', question: '호흡 곤란이 심하신가요?', answer: '네, 숨을 깊게 들이마시기가 어려워요.' },
        ]
    }
];
