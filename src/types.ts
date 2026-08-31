export type TemplateId = 'hp_brief' | 'gpccmp' | 'adhd_multi_session';
export type AssistanceDegree = 'pure_scribe' | 'balanced' | 'senior_colleague';
export type DetailLevel = 'concise' | 'standard' | 'comprehensive';
export type SectionType = 'text' | 'bullets' | 'checklist';

export interface TemplateSection {
  id: string;
  title: string;
  type: SectionType;
  guidance: string;
}

export interface NoteTemplate {
  id: TemplateId;
  label: string;
  shortLabel: string;
  description: string;
  defaultAssistance: AssistanceDegree;
  defaultDetail: DetailLevel;
  sections: TemplateSection[];
}

export interface EhrContext {
  patientName?: string;
  ageDob?: string;
  gender?: string;
  mrn?: string;
  allergies?: string[];
  currentMedications?: string[];
  pastMedicalHistory?: string[];
  recentVitals?: string[];
  recentInvestigations?: string[];
  currentDiagnosisOrReason?: string;
  rawVisualSummary?: string;
  sourceAppName?: string;
  capturedAt?: string;
}

export interface Advisory {
  title: string;
  body: string;
}

export interface DocumentSection {
  id: string;
  title: string;
  type: SectionType;
  content: string;
}

export interface ScribeDocument {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  templateId: TemplateId;
  assistanceDegree: AssistanceDegree;
  detailLevel: DetailLevel;
  sections: DocumentSection[];
  advisories: Advisory[];
  transcript: string;
  patientContext: string;
  ehrContext: EhrContext | null;
  createdAt: string;
  updatedAt: string;
  audioDurationSec: number;
}

export interface HealthStatus {
  status: string;
  hasApiKey: boolean;
  models?: { transcribe: string; structure: string; vision: string };
}
