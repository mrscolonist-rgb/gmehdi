/** Diversion & misuse risk (pre-treatment safety). */

import type { DiffGroup } from './differentialTypes.ts';

export const DIVERSION_GROUPS: DiffGroup[] = [
  {
    id: 'diversion',
    title: 'Diversion & misuse risk assessment',
    subtitle: 'If considering stimulant',
    conditions: [
      { id: 'no_sud', label: 'No history of substance use disorder' },
      {
        id: 'current_sud',
        label: 'Current substance use disorder',
        chips: [
          { id: 'mild', label: 'Mild' },
          { id: 'moderate', label: 'Moderate' },
          { id: 'severe', label: 'Severe' },
          { id: 'active', label: 'Active use' },
          { id: 'in_tx', label: 'In treatment' },
          { id: 'controlled', label: 'Controlled' },
        ],
        texts: [
          { id: 'substances', label: 'Substance(s)', placeholder: 'Substance(s)…' },
          { id: 'details', label: 'Details', placeholder: 'Details…' },
        ],
      },
      {
        id: 'past_sud',
        label: 'Past substance use disorder (in remission)',
        chips: [
          { id: 'stable_2y', label: 'Stable >2 years' },
          { id: 'recent', label: 'Recent remission' },
        ],
        texts: [
          { id: 'substances', label: 'Substance(s)', placeholder: 'Substance(s)…' },
          { id: 'remission', label: 'Duration of remission', placeholder: 'Duration of remission…' },
        ],
      },
      {
        id: 'lives_with_misuse',
        label: 'Lives with person(s) who misuse substances',
        texts: [
          { id: 'relationship', label: 'Relationship', placeholder: 'Relationship…' },
          { id: 'substance', label: 'Substance', placeholder: 'Substance…' },
        ],
      },
      { id: 'hx_diversion', label: 'History of diversion (selling/sharing prescribed medications)' },
      { id: 'lost_scripts', label: 'History of "losing" prescriptions or early requests' },
      { id: 'share_pressure', label: 'Pressure from others to share medication' },
      { id: 'chaotic', label: 'Chaotic social environment' },
      {
        id: 'protective',
        label: 'Protective factors',
        chips: [
          { id: 'support', label: 'Stable social support system' },
          { id: 'engaged', label: 'Engaged in treatment and follow-up' },
          { id: 'insight', label: 'Insightful about addiction risks' },
          { id: 'motivation', label: 'Strong motivation for functional improvement (not seeking euphoria)' },
        ],
      },
      {
        id: 'diversion_overall',
        label: 'Overall diversion/misuse risk',
        single: true,
        note: 'Low: any stimulant. Moderate: prefer long-acting; avoid short-acting dexamphetamine; closer monitoring; consider contract. High: consider non-stimulant first (atomoxetine, bupropion, guanfacine); if stimulant — long-acting only, frequent review, contract, consider UDS.',
        chips: [
          { id: 'low', label: 'Low risk' },
          { id: 'moderate', label: 'Moderate risk' },
          { id: 'high', label: 'High risk' },
        ],
      },
      {
        id: 'mitigation',
        label: 'Risk mitigation strategies implemented',
        chips: [
          { id: 'storage', label: 'Discussed secure medication storage' },
          { id: 'contract', label: 'Treatment agreement/contract signed' },
          { id: 'pharmacy', label: 'Pharmacy notified' },
        ],
        texts: [
          { id: 'partner', label: 'Accountability partner', placeholder: 'Accountability partner…' },
          { id: 'schedule', label: 'Prescribing schedule', placeholder: 'Frequent prescribing schedule…' },
          { id: 'other', label: 'Other', placeholder: 'Other mitigation…' },
        ],
      },
    ],
  },
];
