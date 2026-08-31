import type { NoteTemplate, TemplateId } from '../types.ts';

export function isReferralTemplate(id: TemplateId | string): boolean {
  return id === 'referral_new' || id === 'referral_continuing';
}

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
    description: 'Adult ADHD note for 30–60 min sessions. Tools section always present.',
    defaultAssistance: 'balanced',
    defaultDetail: 'comprehensive',
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
  {
    id: 'referral_new',
    label: 'Referral (new)',
    shortLabel: 'New specialist letter',
    description: 'New referral letter. No clinical assumptions. Specialty and reason required.',
    defaultAssistance: 'pure_scribe',
    defaultDetail: 'standard',
    sections: [
      {
        id: 'sec_ref_opening',
        title: 'Opening',
        type: 'text',
        guidance: 'Omit entirely if output_type is body_only. State referral reason and urgency if specified.',
      },
      {
        id: 'sec_ref_body',
        title: 'Body',
        type: 'text',
        guidance:
          'Paragraph prose: history, exam, investigations, current management relevant to referral_reason and specialty only.',
      },
      {
        id: 'sec_ref_closing',
        title: 'Closing',
        type: 'text',
        guidance: 'Omit entirely if output_type is body_only. Thank specialist and state the specific request.',
      },
    ],
  },
  {
    id: 'referral_continuing',
    label: 'Referral (continuing)',
    shortLabel: 'Ongoing specialist care',
    description: 'Continuing-care letter for an established specialist relationship.',
    defaultAssistance: 'pure_scribe',
    defaultDetail: 'standard',
    sections: [
      {
        id: 'sec_refc_opening',
        title: 'Opening',
        type: 'text',
        guidance: 'Omit if body_only. Reference ongoing care and name continuing_condition.',
      },
      {
        id: 'sec_refc_body',
        title: 'Body',
        type: 'text',
        guidance:
          'Paragraph updates relevant to specialty/continuing_condition. Respect brevity_level (standard vs brief).',
      },
      {
        id: 'sec_refc_closing',
        title: 'Closing',
        type: 'text',
        guidance: 'Omit if body_only. Thank for ongoing care; request continued management.',
      },
    ],
  },
];

export function templateById(id: string): NoteTemplate {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}
