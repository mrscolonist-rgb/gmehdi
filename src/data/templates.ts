import type { NoteTemplate } from '../types.ts';

export const TEMPLATES: NoteTemplate[] = [
  {
    id: 'hp_brief',
    label: 'H&P Brief',
    shortLabel: 'Daily GP notes',
    description: 'Literal evidence-ceiling brief for ordinary GP consults. Dash bullets for Best Practice.',
    defaultAssistance: 'pure_scribe',
    defaultDetail: 'concise',
    sections: [
      {
        id: 'sec_hp_history',
        title: 'History',
        type: 'bullets',
        guidance:
          'Primary complaint, onset, duration, progression, relevant symptoms. Flat dash bullets. Number 1., 2. only for multiple distinct problems.',
      },
      {
        id: 'sec_hp_background',
        title: 'Background (Optional)',
        type: 'text',
        guidance:
          'Omit unless 3+ chronic conditions not related to today. Comma-separated PMHx / SHx.',
      },
      {
        id: 'sec_hp_meds_allergies',
        title: 'Medications & Allergies (Optional)',
        type: 'bullets',
        guidance: 'Omit unless 3+ background medications or allergies not changed today.',
      },
      {
        id: 'sec_hp_examination',
        title: 'Examination (Optional)',
        type: 'bullets',
        guidance: 'Omit if no exam. One consolidated line per system plus vitals.',
      },
      {
        id: 'sec_hp_investigations',
        title: 'Investigations (Optional)',
        type: 'bullets',
        guidance: 'Omit unless 2+ distinct formal results reviewed.',
      },
      {
        id: 'sec_hp_assessment_plan',
        title: 'Assessment & Plan',
        type: 'checklist',
        guidance:
          '[Diagnosis] - [one-line reasoning]. Indented plan bullets with [NEW]/[CONTINUE]/[CHANGE]/[DISCONTINUED]. Other Care Provided last.',
      },
    ],
  },
  {
    id: 'gpccmp',
    label: 'GPCCMP',
    shortLabel: 'Chronic condition plan',
    description: 'Australian GP Chronic Condition Management Plan with SMART goals and MBS-aligned review.',
    defaultAssistance: 'senior_colleague',
    defaultDetail: 'standard',
    sections: [
      {
        id: 'sec_gpccmp_assessment',
        title: "Today's Assessment",
        type: 'bullets',
        guidance: 'Include only if assessment data exists: condition, severity, control, exam/labs.',
      },
      {
        id: 'sec_gpccmp_goals',
        title: 'SMART Goals',
        type: 'text',
        guidance: 'Action verb + metric + timeframe. Group related conditions into synergistic goals.',
      },
      {
        id: 'sec_gpccmp_tasks',
        title: 'Tasks (Action Plan)',
        type: 'checklist',
        guidance: "Patient, GP, Practice Nurse, Allied Health / ATSI. Every task starts with a verb.",
      },
      {
        id: 'sec_gpccmp_treatments',
        title: 'Required Treatment and Services',
        type: 'bullets',
        guidance: 'Concise noun phrases for required treatments and services.',
      },
      {
        id: 'sec_gpccmp_arrangements',
        title: 'Required Arrangements',
        type: 'bullets',
        guidance: 'Referrals and practice coordination if specified.',
      },
      {
        id: 'sec_gpccmp_review',
        title: 'Review Schedule',
        type: 'text',
        guidance: 'Default 3-month formal review (MBS 732) unless specified.',
      },
    ],
  },
  {
    id: 'adhd_multi_session',
    label: 'Adult ADHD',
    shortLabel: 'Multi-session assessment',
    description: 'Scribe-only Adult ADHD note for 30–60 min sessions. Tools section always present.',
    defaultAssistance: 'pure_scribe',
    defaultDetail: 'standard',
    sections: [
      {
        id: 'sec_adhd_context',
        title: 'Session Context & Presentation',
        type: 'bullets',
        guidance: 'Session sequence, purpose, who is present, item/duration/referral, reasons for presenting.',
      },
      {
        id: 'sec_adhd_history',
        title: 'Patient History',
        type: 'text',
        guidance:
          'Dynamic sub-headers (HPC, developmental, occupational, social, medical, psychiatric, family, meds, substance use).',
      },
      {
        id: 'sec_adhd_collateral_functional',
        title: 'Collateral & Functional Impairment',
        type: 'bullets',
        guidance: 'Collateral by source. Function by work, academic, relationships, daily living, financial, self-concept.',
      },
      {
        id: 'sec_adhd_mse_risk_exam',
        title: 'Mental State, Risk & Physical Exam',
        type: 'bullets',
        guidance: 'Objective MSE. Risk (or limited-risk line). Vitals/cardiac/ECG/TFTs/UDS if stated.',
      },
      {
        id: 'sec_adhd_tools',
        title: 'Assessment and Outcome Tools',
        type: 'bullets',
        guidance: 'ALWAYS. ASRS / K10 or "No assessment tools administered or referenced in this session".',
      },
      {
        id: 'sec_adhd_diagnosis_plan',
        title: 'Diagnostic Impression & Management Plan',
        type: 'checklist',
        guidance: 'Exact doctor wording. Plan, safety/Austroads, next session agenda if stated.',
      },
    ],
  },
];

export function templateById(id: string): NoteTemplate {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}
