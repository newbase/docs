import { type PatientClassification } from './assetEvents';

export interface LabItemOption {
    specimen: string;
    name: string;
    abbreviation: string;
    englishName: string;
    unit: string;
    ranges: Record<PatientClassification, string>;
}

export const labItemOptions: LabItemOption[] = [
    {
        specimen: 'EDTA -CBC',
        name: '백혈구',
        abbreviation: 'WBC',
        englishName: 'White Blood Cell',
        unit: 'x10³/μL',
        ranges: {
            Adult_Male: '4.0–10.0',
            Adult_Female: '4.0–10.0',
            Elderly_Male: '4.0–10.0',
            Elderly_Female: '4.0–10.0',
            Pregnant: '6–16',
            Pediatric: '4.5–12.0',
            Newborn: '9–30'
        }
    },
    {
        specimen: 'EDTA -CBC',
        name: '적혈구',
        abbreviation: 'RBC',
        englishName: 'Red Blood Cell',
        unit: 'x10⁶/μL',
        ranges: {
            Adult_Male: '4.7–6.1',
            Adult_Female: '3.8–5.2',
            Elderly_Male: '4.2–5.4',
            Elderly_Female: '3.8–5.0',
            Pregnant: '3.5–5.0',
            Pediatric: '4.0–5.2',
            Newborn: '4.0–6.0'
        }
    },
    {
        specimen: 'EDTA -CBC',
        name: '헤모글로빈',
        abbreviation: 'Hb',
        englishName: 'Hemoglobin',
        unit: 'g/dL',
        ranges: {
            Adult_Male: '13.5–17.5',
            Adult_Female: '12.0–16.0',
            Elderly_Male: '13.0–17.0',
            Elderly_Female: '11.5–15.5',
            Pregnant: '10.5–13.5',
            Pediatric: '11.0–13.0',
            Newborn: '16-22'
        }
    },
    {
        specimen: 'EDTA -CBC',
        name: '헤마토크리트',
        abbreviation: 'Hct',
        englishName: 'Hematocrit',
        unit: '%',
        ranges: {
            Adult_Male: '40–50',
            Adult_Female: '36–46',
            Elderly_Male: '40–52',
            Elderly_Female: '36–46',
            Pregnant: '30–41',
            Pediatric: '35–45',
            Newborn: '48-65'
        }
    },
    {
        specimen: 'EDTA -CBC',
        name: '평균 적혈구 부피',
        abbreviation: 'MCV',
        englishName: 'Mean Corpuscular Volume',
        unit: 'fL',
        ranges: {
            Adult_Male: '80–100',
            Adult_Female: '80–100',
            Elderly_Male: '80–100',
            Elderly_Female: '80–100',
            Pregnant: '80–100',
            Pediatric: '70–85',
            Newborn: '95-120'
        }
    },
    {
        specimen: 'EDTA -CBC',
        name: '평균 적혈구 혈색소 농도',
        abbreviation: 'MCHC',
        englishName: 'Mean Corpuscular Hemoglobin Concentration',
        unit: 'g/dL',
        ranges: {
            Adult_Male: '32–36',
            Adult_Female: '32–36',
            Elderly_Male: '32–36',
            Elderly_Female: '32–36',
            Pregnant: '32–36',
            Pediatric: '30–35',
            Newborn: '30-36'
        }
    },
    {
        specimen: 'EDTA -CBC',
        name: '혈소판',
        abbreviation: 'PLT',
        englishName: 'Platelets',
        unit: 'x10³/μL',
        ranges: {
            Adult_Male: '150–450',
            Adult_Female: '150–400',
            Elderly_Male: '150–400',
            Elderly_Female: '150–400',
            Pregnant: '150–400',
            Pediatric: '150–450',
            Newborn: '150-400'
        }
    },
    {
        specimen: 'Citrate',
        name: '프로트롬빈 시간',
        abbreviation: 'PT',
        englishName: 'Prothrombin Time',
        unit: '초',
        ranges: {
            Adult_Male: '11.0–13.5',
            Adult_Female: '11.0–13.5',
            Elderly_Male: '11.0–13.5',
            Elderly_Female: '11.0–13.5',
            Pregnant: '10-13',
            Pediatric: '11-14',
            Newborn: '11-15'
        }
    },
    {
        specimen: 'Citrate',
        name: '국제표준화비율',
        abbreviation: 'INR',
        englishName: 'International Normalized Ratio',
        unit: '-',
        ranges: {
            Adult_Male: '0.8-1.2',
            Adult_Female: '0.8-1.2',
            Elderly_Male: '0.8-1.2',
            Elderly_Female: '0.8-1.2',
            Pregnant: '0.8-1.2',
            Pediatric: '0.8-1.2',
            Newborn: '0.8-6.0'
        }
    },
    {
        specimen: 'Citrate',
        name: '부분 트롬보플라스틴 시간',
        abbreviation: 'aPTT',
        englishName: 'Activated Partial Thromboplastin Time',
        unit: '초',
        ranges: {
            Adult_Male: '25–35',
            Adult_Female: '25–35',
            Elderly_Male: '25–35',
            Elderly_Female: '25–35',
            Pregnant: '24-32',
            Pediatric: '25–35',
            Newborn: '35-60'
        }
    },
    {
        specimen: 'SST',
        name: '아스파르타트 아미노전달효소',
        abbreviation: 'AST',
        englishName: 'Aspartate Aminotransferase',
        unit: 'U/L',
        ranges: {
            Adult_Male: '10–40',
            Adult_Female: '10-35',
            Elderly_Male: '10–40',
            Elderly_Female: '10-35',
            Pregnant: '10-35',
            Pediatric: '10-40',
            Newborn: '30-120'
        }
    },
    {
        specimen: 'SST',
        name: '알라닌 아미노전달효소',
        abbreviation: 'ALT',
        englishName: 'Alanine Aminotransferase',
        unit: 'U/L',
        ranges: {
            Adult_Male: '10–40',
            Adult_Female: '7-35',
            Elderly_Male: '10–40',
            Elderly_Female: '7-35',
            Pregnant: '7-35',
            Pediatric: '10–40',
            Newborn: '10-50'
        }
    },
    {
        specimen: 'SST',
        name: '알칼리성 포스파타제',
        abbreviation: 'ALP',
        englishName: 'Alkaline Phosphatase',
        unit: 'U/L',
        ranges: {
            Adult_Male: '40-120',
            Adult_Female: '40-120',
            Elderly_Male: '40-120',
            Elderly_Female: '40-120',
            Pregnant: '100-300',
            Pediatric: '150-350',
            Newborn: '150-450'
        }
    },
    {
        specimen: 'SST',
        name: '총 단백질',
        abbreviation: 'TP',
        englishName: 'Total Protein',
        unit: 'g/dL',
        ranges: {
            Adult_Male: '6.4-8.3',
            Adult_Female: '6.4-8.3',
            Elderly_Male: '6.2-8.0',
            Elderly_Female: '6.2-8.0',
            Pregnant: '6.0-7.0',
            Pediatric: '6.0-8.0',
            Newborn: '4.6-7.0'
        }
    },
    {
        specimen: 'SST',
        name: '알부민',
        abbreviation: 'ALB',
        englishName: 'Albumin',
        unit: 'g/dL',
        ranges: {
            Adult_Male: '3.5-5.0',
            Adult_Female: '3.5-5.0',
            Elderly_Male: '3.2-4.8',
            Elderly_Female: '3.2-4.8',
            Pregnant: '2.8-3.8',
            Pediatric: '3.5-5.0',
            Newborn: '2.8-4.4'
        }
    },
    {
        specimen: 'SST',
        name: '총 빌리루빈',
        abbreviation: 'TBIL',
        englishName: 'Total Bilirubin',
        unit: 'mg/dL',
        ranges: {
            Adult_Male: '0.3-1.2',
            Adult_Female: '0.3-1.2',
            Elderly_Male: '0.3-1.2',
            Elderly_Female: '0.3-1.2',
            Pregnant: '0.3-1.2',
            Pediatric: '0.2-1.0',
            Newborn: '0.2-1.0'
        }
    },
    {
        specimen: 'SST',
        name: '콜레스테롤',
        abbreviation: 'CHOL',
        englishName: 'Cholesterol',
        unit: 'mg/dL',
        ranges: {
            Adult_Male: '140–200',
            Adult_Female: '140–200',
            Elderly_Male: '140–200',
            Elderly_Female: '140–200',
            Pregnant: '200–300',
            Pediatric: '120-200',
            Newborn: '70-170'
        }
    },
    {
        specimen: 'ABGA',
        name: '산소포화도',
        abbreviation: 'SpO2',
        englishName: 'Oxygen Saturation',
        unit: '%',
        ranges: {
            Adult_Male: '95–99',
            Adult_Female: '95–99',
            Elderly_Male: '95–99',
            Elderly_Female: '95–99',
            Pregnant: '95–99',
            Pediatric: '95–99',
            Newborn: '95–99'
        }
    },
    {
        specimen: 'ABGA',
        name: 'pH',
        abbreviation: 'pH',
        englishName: 'pH',
        unit: '-',
        ranges: {
            Adult_Male: '7.35–7.45',
            Adult_Female: '7.35–7.45',
            Elderly_Male: '7.35–7.45',
            Elderly_Female: '7.35–7.45',
            Pregnant: '7.40–7.47',
            Pediatric: '7.35–7.45',
            Newborn: '7.30-7.45'
        }
    },
    {
        specimen: 'Urine Test',
        name: '요당',
        abbreviation: 'GLU',
        englishName: 'Glucose',
        unit: 'mg/dL',
        ranges: {
            Adult_Male: 'Negative',
            Adult_Female: 'Negative',
            Elderly_Male: 'Negative',
            Elderly_Female: 'Negative',
            Pregnant: 'Negative',
            Pediatric: 'Negative',
            Newborn: 'Negative'
        }
    },
    {
        specimen: 'Urine Test',
        name: '요단백',
        abbreviation: 'PRO',
        englishName: 'Protein',
        unit: 'mg/dL',
        ranges: {
            Adult_Male: 'Negative',
            Adult_Female: 'Negative',
            Elderly_Male: 'Negative',
            Elderly_Female: 'Negative',
            Pregnant: 'Negative',
            Pediatric: 'Negative',
            Newborn: 'Negative'
        }
    },
    {
        specimen: 'Urine Test',
        name: '요비중',
        abbreviation: 'SG',
        englishName: 'Specific Gravity',
        unit: '-',
        ranges: {
            Adult_Male: '1.005–1.030',
            Adult_Female: '1.005–1.030',
            Elderly_Male: '1.005–1.025',
            Elderly_Female: '1.005–1.025',
            Pregnant: '1.005–1.030',
            Pediatric: '1.005–1.030',
            Newborn: '1.002-1.012'
        }
    },
    {
        specimen: 'Blood Sugar',
        name: '혈당 (당화혈색소)',
        abbreviation: 'HbA1c',
        englishName: 'Glycated Hemoglobin',
        unit: '%',
        ranges: {
            Adult_Male: '4.0–5.6',
            Adult_Female: '4.0–5.6',
            Elderly_Male: '4.0–5.6',
            Elderly_Female: '4.0–5.6',
            Pregnant: '4.0–5.6',
            Pediatric: '4.0–5.6',
            Newborn: '4.0–5.6'
        }
    },
    {
        specimen: 'Blood Sugar',
        name: '간이 혈당 검사',
        abbreviation: 'BST',
        englishName: 'Blood Sugar Test',
        unit: 'mg/dL',
        ranges: {
            Adult_Male: '70–110',
            Adult_Female: '70–110',
            Elderly_Male: '70–110',
            Elderly_Female: '70–110',
            Pregnant: '70–110',
            Pediatric: '70–110',
            Newborn: '40–90'
        }
    },
    {
        specimen: 'Stool',
        name: '잠혈검사',
        abbreviation: 'Occult Blood',
        englishName: 'Fecal Occult Blood',
        unit: '-',
        ranges: {
            Adult_Male: 'Negative',
            Adult_Female: 'Negative',
            Elderly_Male: 'Negative',
            Elderly_Female: 'Negative',
            Pregnant: 'Negative',
            Pediatric: 'Negative',
            Newborn: 'Negative'
        }
    },
    {
        specimen: 'Saliva',
        name: '타액 pH',
        abbreviation: 's-pH',
        englishName: 'Salivary pH',
        unit: '-',
        ranges: {
            Adult_Male: '6.2–7.6',
            Adult_Female: '6.2–7.6',
            Elderly_Male: '6.2–7.6',
            Elderly_Female: '6.2–7.6',
            Pregnant: '6.2–7.6',
            Pediatric: '6.2–7.6',
            Newborn: '6.2–7.6'
        }
    },
    {
        specimen: 'Saliva',
        name: '타액 아밀라아제',
        abbreviation: 's-AMY',
        englishName: 'Salivary Alpha-Amylase',
        unit: 'U/mL',
        ranges: {
            Adult_Male: '2.0–15.0',
            Adult_Female: '2.0–15.0',
            Elderly_Male: '2.0–15.0',
            Elderly_Female: '2.0–15.0',
            Pregnant: '2.0–15.0',
            Pediatric: '2.0–15.0',
            Newborn: '2.0–15.0'
        }
    }
];
