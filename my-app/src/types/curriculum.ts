import { ScenarioDetail } from '../data/scenarioDetails';

export type CurriculumItemType = 'scenario' | 'video';

export type AuthorType = 'institution' | 'individual';

export interface AuthorInfo {
    name: string;
    type: AuthorType;
}

export interface VideoLecture {
    id: string;
    title: string;
    url: string;
    duration: string; // e.g. "10분"
    author: AuthorInfo;
    description?: string;
}

export interface CurriculumItem {
    id: string; // Unique ID for drag-drop
    type: CurriculumItemType;
    data: ScenarioDetail | VideoLecture;
}
