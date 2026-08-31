/** Option lists for DSM-5-TR Criteria B–E formulation. */

export const ONSET_EVIDENCE = [
  { id: 'patient_recall', label: 'Patient recall with specific examples' },
  { id: 'collateral_family', label: 'Collateral from parent/family' },
  { id: 'school_records', label: 'School reports or records' },
  { id: 'previous_records', label: 'Previous medical/psychological records' },
  { id: 'previous_diagnosis', label: 'Previous ADHD diagnosis' },
] as const;

export const UNCERTAIN_REASONS = [
  { id: 'unable_recall', label: 'Unable to recall details' },
  { id: 'no_collateral', label: 'No collateral available' },
  { id: 'records_unavailable', label: 'Records unavailable' },
] as const;

export const SETTINGS = [
  { id: 'home', label: 'Home/domestic life' },
  { id: 'work', label: 'Work/employment' },
  { id: 'school', label: 'School/university' },
  { id: 'social', label: 'Social situations' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'community', label: 'Community activities' },
] as const;

export const EXCLUSIONS = [
  { id: 'psychotic', label: 'Psychotic disorder' },
  { id: 'mood', label: 'Mood disorder (symptoms only during mood episodes)' },
  { id: 'anxiety', label: 'Anxiety disorder (attention issues only when anxious)' },
  { id: 'dissociative', label: 'Dissociative disorder' },
  { id: 'personality', label: 'Personality disorder' },
  { id: 'substance', label: 'Substance intoxication/withdrawal' },
  { id: 'medication', label: 'Medication side effects' },
] as const;

export interface ImpairmentDomainDef {
  id: string;
  label: string;
  items: { id: string; label: string }[];
}

export const IMPAIRMENT_DOMAINS: ImpairmentDomainDef[] = [
  {
    id: 'work',
    label: 'Work / occupational',
    items: [
      { id: 'job_loss', label: 'Job loss or risk of job loss' },
      { id: 'job_changes', label: 'Frequent job changes / underemployment' },
      { id: 'performance', label: 'Performance issues, warnings, poor reviews' },
      { id: 'lateness', label: 'Chronic lateness or absenteeism' },
      { id: 'deadlines', label: 'Difficulty meeting deadlines/organisation' },
      { id: 'conflicts', label: 'Workplace conflicts' },
    ],
  },
  {
    id: 'academic',
    label: 'Academic / educational',
    items: [
      { id: 'grades', label: 'Failed courses or grades below ability' },
      { id: 'incomplete', label: 'Incomplete qualifications' },
      { id: 'extended', label: 'Extended time to complete studies' },
    ],
  },
  {
    id: 'relationships',
    label: 'Relationships / social',
    items: [
      { id: 'breakdown', label: 'Relationship breakdown or chronic conflict' },
      { id: 'friendships', label: 'Difficulty maintaining friendships' },
      { id: 'isolation', label: 'Social isolation' },
      { id: 'unreliable', label: 'Perceived as unreliable' },
    ],
  },
  {
    id: 'daily',
    label: 'Daily living / self-management',
    items: [
      { id: 'financial', label: 'Financial difficulties (bills, debt, overspending)' },
      { id: 'accidents', label: 'Frequent accidents or injuries' },
      { id: 'driving', label: 'Driving issues (accidents, fines)' },
      { id: 'home', label: 'Home management chaos' },
      { id: 'appointments', label: 'Missed appointments/obligations' },
    ],
  },
  {
    id: 'emotional',
    label: 'Emotional / psychological',
    items: [
      { id: 'self_esteem', label: 'Low self-esteem' },
      { id: 'burnout', label: 'Chronic stress/burnout' },
      { id: 'secondary', label: 'Anxiety/depression secondary to ADHD' },
      { id: 'substance', label: 'Substance use (self-medication)' },
    ],
  },
];
