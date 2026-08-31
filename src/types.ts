import type { AsrsAnswers } from './data/asrs.ts';

export type TemplateId =
  | 'hp_brief'
  | 'gpccmp'
  | 'adhd_multi_session'
  | 'referral_new'
  | 'referral_continuing';
export type AssistanceDegree = 'pure_scribe' | 'balanced' | 'senior_colleague';
export type DetailLevel = 'concise' | 'standard' | 'comprehensive';
export type SectionType = 'text' | 'bullets' | 'checklist';
export type ReferralOutputType = 'full_letter' | 'body_only';
export type ReferralBrevity = 'standard' | 'brief';

export interface ReferralOptions {
  specialty: string;
  referralReason: string;
  continuingCondition: string;
  outputType: ReferralOutputType;
  brevityLevel: ReferralBrevity;
}

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

export interface AdhdToolsState {
  asrs?: AsrsAnswers;
}

export interface ScribeDocument {
  id: string;
  /** Groups multiple notes (e.g. H&P + GPCCMP) from one consult. */
  sessionId: string;
  /** Clinician-chosen label shown in the library (set at session start). */
  sessionName: string;
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
  referral?: ReferralOptions | null;
  /** Interactive ADHD tools (ASRS, …) filled in the note editor. */
  tools?: AdhdToolsState | null;
  createdAt: string;
  updatedAt: string;
  audioDurationSec: number;
}

export interface SessionGroup {
  sessionId: string;
  sessionName: string;
  updatedAt: string;
  docs: ScribeDocument[];
}

export interface HealthStatus {
  status: string;
  hasApiKey: boolean;
  models?: { transcribe: string; structure: string; vision: string };
}
