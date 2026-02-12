export interface Category {
    id: string;
    parentId?: string; // For sub-categories
    type: string;
    childType: string;
    depth: number;
    order: number;
    name: string;
    englishName: string;
    permissions: {
        c: boolean;
        r: boolean;
        u: boolean;
        d: boolean;
    };
}

export const categories: Category[] = [
    {
        id: 'dialogue_category_1',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 1,
        name: '인사',
        englishName: 'Introduction',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_2',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 2,
        name: '환자확인',
        englishName: 'Patient Identification',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_3',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 3,
        name: '입원정보',
        englishName: 'Admission Information',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_4',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 4,
        name: '주호소/증상',
        englishName: 'Chief Complaint',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_5',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 5,
        name: '과거력',
        englishName: 'Past Medical History',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_6',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 6,
        name: '혈액형/안전정보',
        englishName: 'Blood Type / Safety Info',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_7',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 7,
        name: '사회력/가족력',
        englishName: 'Social / Family History',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_8',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 8,
        name: '심리/정서사정',
        englishName: 'Emotional Assessment',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_9',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 9,
        name: '산과력',
        englishName: 'Obstetric History',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_10',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 10,
        name: '산과징후',
        englishName: 'Obstetric Signs',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_11',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 11,
        name: '섭취/배설',
        englishName: 'Intake / Output',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_12',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 12,
        name: '신경계/반응 확인',
        englishName: 'Neurological / Response Assessment',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_13',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 13,
        name: '활력징후/검사',
        englishName: 'Vital Signs / Tests',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_14',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 14,
        name: '투약/처치',
        englishName: 'Medication / Procedures',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_15',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 15,
        name: '환자교육',
        englishName: 'Patient Education',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_16',
        type: 'dialogue',
        childType: '환자대화',
        depth: 1,
        order: 16,
        name: '보고/향후계획',
        englishName: 'Plan of Care',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_17',
        type: 'dialogue',
        childType: '의사보고',
        depth: 1,
        order: 1,
        name: '상황',
        englishName: 'Situation',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_18',
        type: 'dialogue',
        childType: '의사보고',
        depth: 1,
        order: 2,
        name: '배경',
        englishName: 'Background',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_19',
        type: 'dialogue',
        childType: '의사보고',
        depth: 1,
        order: 3,
        name: '평가',
        englishName: 'Assessment',
        permissions: { c: false, r: true, u: true, d: false }
    },
    {
        id: 'dialogue_category_20',
        type: 'dialogue',
        childType: '의사보고',
        depth: 1,
        order: 4,
        name: '권유',
        englishName: 'Recommendation',
        permissions: { c: false, r: true, u: true, d: false }
    }
];
