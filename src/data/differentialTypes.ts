/** Shared types for differential & co-occurring conditions. */

export interface DiffChip {
  id: string;
  label: string;
}

export interface DiffText {
  id: string;
  label: string;
  placeholder?: string;
}

export interface DiffCondition {
  id: string;
  label: string;
  note?: string;
  chips?: DiffChip[];
  texts?: DiffText[];
  /** When true, chips are mutually exclusive. */
  single?: boolean;
}

export interface DiffGroup {
  id: string;
  title: string;
  subtitle?: string;
  conditions: DiffCondition[];
}
