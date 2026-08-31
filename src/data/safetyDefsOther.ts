/** QScript and other safety considerations. */

import type { DiffGroup } from './differentialTypes.ts';

export const OTHER_SAFETY_GROUPS: DiffGroup[] = [
  {
    id: 'qscript',
    title: 'QScript / prescription monitoring check',
    subtitle: 'Queensland prescription monitoring',
    conditions: [
      {
        id: 'qscript_checked',
        label: 'QScript checked',
        chips: [
          { id: 'nil', label: 'No concerning patterns' },
          { id: 'multi_rx', label: 'Multiple prescribers for controlled drugs' },
          { id: 'early', label: 'Early refills noted' },
          { id: 'lost', label: 'Frequent "lost" prescription reports' },
          { id: 'shopping', label: 'Doctor shopping pattern' },
          { id: 'other', label: 'Other concern' },
        ],
        texts: [
          { id: 'date', label: 'Date', placeholder: 'Date checked…' },
          { id: 'other_detail', label: 'Other concern', placeholder: 'Other concern…' },
          { id: 'action', label: 'Action taken', placeholder: 'Action taken if concerns…' },
        ],
      },
    ],
  },
  {
    id: 'other',
    title: 'Other safety considerations',
    conditions: [
      {
        id: 'pregnancy',
        label: 'Pregnancy / contraception',
        chips: [
          { id: 'na', label: 'Not applicable (male / post-menopausal)' },
          { id: 'not_active', label: 'Not sexually active' },
          { id: 'contraception', label: 'Using reliable contraception' },
          { id: 'bhcg_neg', label: 'Pregnancy test today — negative' },
          { id: 'bhcg_pos', label: 'Pregnancy test today — positive (defer medication)' },
          { id: 'pregnant', label: 'Currently pregnant — defer medication; non-pharm offered' },
          { id: 'planning', label: 'Planning pregnancy — risks/benefits discussed' },
        ],
        texts: [{ id: 'method', label: 'Contraception method', placeholder: 'Contraception method…' }],
      },
      {
        id: 'mood',
        label: 'Baseline mood',
        single: true,
        chips: [
          { id: 'euthymic', label: 'Euthymic' },
          { id: 'low', label: 'Low' },
          { id: 'anxious', label: 'Anxious' },
          { id: 'elevated', label: 'Elevated' },
        ],
      },
      {
        id: 'psychosis',
        label: 'Psychotic symptoms',
        single: true,
        chips: [
          { id: 'none', label: 'None' },
          { id: 'present', label: 'Present' },
        ],
        texts: [{ id: 'detail', label: 'Detail', placeholder: 'Detail if present…' }],
      },
      {
        id: 'si',
        label: 'Suicidal ideation',
        single: true,
        note: 'If active → safety plan / crisis referral required',
        chips: [
          { id: 'none', label: 'None' },
          { id: 'passive', label: 'Passive' },
          { id: 'active', label: 'Active' },
        ],
      },
      {
        id: 'aggression',
        label: 'Aggression / irritability',
        single: true,
        chips: [
          { id: 'none', label: 'None' },
          { id: 'mild', label: 'Mild' },
          { id: 'moderate', label: 'Moderate' },
        ],
      },
      {
        id: 'tics',
        label: 'Tics',
        single: true,
        note: 'May worsen with stimulants — counsel and monitor',
        chips: [
          { id: 'none', label: 'No tics present' },
          { id: 'present', label: 'Tics present' },
        ],
        texts: [{ id: 'describe', label: 'Description', placeholder: 'Describe tics…' }],
      },
      {
        id: 'interactions',
        label: 'Medication interactions',
        note: 'Current medications reviewed',
        chips: [
          { id: 'nil', label: 'No significant interactions identified' },
          { id: 'potential', label: 'Potential interaction' },
        ],
        texts: [
          { id: 'detail', label: 'Interaction', placeholder: 'Potential interaction…' },
          { id: 'action', label: 'Action', placeholder: 'Action…' },
        ],
      },
    ],
  },
];
