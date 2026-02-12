
export interface Role {
  id: string;
  name: string;
  type: 'Doctor' | 'Nurse' | 'Patient' | 'Technician' | 'Family' | 'Other';
  color: string;
}

export type TaskType = 'todo' | 'decision' | 'must-not' | 'symptom';
export type TriggerType = 'immediate' | 'time' | 'event' | 'simultaneous';

export interface Todo {
  id: string;
  content: string;
  type: TaskType;
  timeLimit?: number; // Optional time limit in seconds
  // Logic connections
  successStateId?: string; // Used for Decision (target on select) or Single Todo success
  failStateId?: string;    // Used for Must-not (target on select) or Todo timeout
}

// --- New Event Feature Types ---
export interface VitalSigns {
  bpSys: number;
  bpDia: number;
  hr: number;
  rr: number;
  bt: number;
  spo2: number;
}

export type ConsciousnessLevel = string; // e.g. "E4V5M6"

export interface DialogueItem {
  id: string;
  question: string;
  answer: string;
  isRequired?: boolean;
}

export interface Event {
  id: string;
  roleId: string;          // Character responsible/involved
  title: string;
  description: string;

  // Trigger conditions
  triggerType: TriggerType | 'simultaneous'; // added 'simultaneous'
  triggerValue?: string;   // e.g. "30" (seconds) or "evt-id" (preceding event)

  // Logic for the whole event block (primarily for 'todo' lists)
  timeLimit?: number;      // Seconds to complete all 'todo' items
  onAllTodosSuccess?: string; // State ID to move to when all todos are checked
  onTimeLimitFail?: string;   // State ID to move to when time runs out

  todos: Todo[];

  // Attributes
  vitalSigns?: VitalSigns;
  consciousness?: ConsciousnessLevel;

  // Dialogue
  dialogues?: DialogueItem[];
}

export interface ScenarioState {
  id: string;
  title: string;
  events: Event[];
}

export interface ScenarioMetadata {
  title: string;
  handover: string;
  mission: string;
  authors?: string[];
  organization?: string;
  licenseType?: string;
  sourceType?: 'original' | 'customized';
  baseScenarioId?: string | number;
  originalSourceTitle?: string;
  originalSourceAuthor?: string;
  year?: string;
}

// --- Storage Types ---
export interface StorageItem {
  id: string;
  name: string;
  category: 'medication' | 'supply' | 'equipment';
  subCategory?: string;
  attributes?: {
    volume?: string;
    gauge?: string;
    size?: string;
    [key: string]: any;
  };
  width: number;  // Width in pixels (or relative units)
  height: number; // Height in pixels
  imageUrl?: string; // Optional URL for the realistic image
}

export interface PlacedItem extends StorageItem {
  uid: string; // Unique Instance ID
  x: number;   // X coordinate on shelf/drawer
  y: number;   // Y coordinate on shelf/drawer
  rotation: number; // Rotation in degrees (0, 90, 180, 270)
}

export interface StorageItemSet {
  id: string;
  name: string;
  items: PlacedItem[];
}

export interface StorageSection {
  id: string;
  name: string; // e.g., "Top Shelf", "Drawer 1"
  items: PlacedItem[]; // Currently displayed items (for backward compatibility / active view)
  backgroundImageUrl?: string;
  sets?: StorageItemSet[];
  activeSetId?: string;
} // Optional background image for the shelf/drawer

export interface ScenarioEnvironment {
  mapId: string;
  availableItemIds: string[];
  // Map of ItemID (e.g. 'nursing_cart') -> List of Sections with items
  storageSetup: Record<string, StorageSection[]>;
}

export interface ScenarioData {
  metadata: ScenarioMetadata;
  environment: ScenarioEnvironment;
  roles: Role[];
  states: ScenarioState[];
}

// AI Generation Types
export interface AIScenarioResponse {
  title: string;
  handover: string;
  mission: string;
  roles: Array<{ name: string; type: string }>;
  states: Array<{
    title: string;
    events: Array<{
      roleName?: string; // Helper for mapping AI response to IDs
      title: string;
      description: string;
      todos: Array<{ content: string; type: TaskType }>;
    }>;
  }>;
}

// ===== User Types =====
export * from './user';
export * from './auth';
export * from './terms';
