/** Cardiac risk screening (pre-treatment safety). */

import type { DiffGroup } from './differentialTypes.ts';

export const CARDIAC_GROUPS: DiffGroup[] = [
  {
    id: 'cardiac',
    title: 'Cardiac risk screening',
    subtitle: 'Before considering stimulant',
    conditions: [
      {
        id: 'structural',
        label: 'Structural cardiac disease',
        chips: [
          { id: 'congenital', label: 'History of congenital heart disease' },
          { id: 'surgery', label: 'Previous cardiac surgery' },
          { id: 'known', label: 'Known structural heart disease' },
          { id: 'murmur', label: 'Heart murmur (excluding confirmed innocent murmur)' },
        ],
      },
      {
        id: 'fhx_cardiac',
        label: 'Family history',
        chips: [
          {
            id: 'scd',
            label: 'Sudden cardiac death in 1st-degree relative <40 years (cardiac cause suspected)',
          },
          { id: 'familial', label: 'Familial cardiac condition (HCM, ARVC, Long QT, etc.)' },
        ],
      },
      {
        id: 'cardiac_symptoms',
        label: 'Cardiac symptoms',
        chips: [
          { id: 'syncope', label: 'Syncope on exertion' },
          { id: 'chest', label: 'Chest pain (cardiac origin suspected)' },
          { id: 'sob', label: 'SOB on exertion (worse than peers / disproportionate to fitness)' },
          { id: 'palp', label: 'Palpitations (rapid, regular, sudden start/stop)' },
        ],
      },
      {
        id: 'cardiac_exam',
        label: 'Examination / investigation',
        chips: [
          { id: 'htn_uncontrolled', label: 'Uncontrolled hypertension (≥160/100)' },
          { id: 'arrhythmia', label: 'Arrhythmia detected on examination' },
          { id: 'ecg_abn', label: 'Abnormal ECG (if performed)' },
        ],
      },
      {
        id: 'cardiac_no_risk',
        label: 'No cardiac risk factors — safe to proceed',
      },
      {
        id: 'cardiac_risk_present',
        label: 'Cardiac risk factors present',
        note: 'Action taken',
        chips: [
          { id: 'ecg', label: 'ECG performed' },
          { id: 'referral', label: 'Cardiology referral sent' },
          { id: 'echo', label: 'Echocardiogram ordered' },
          { id: 'est', label: 'Exercise stress test ordered' },
          { id: 'clearance', label: 'Cardiology clearance obtained' },
        ],
        texts: [
          { id: 'ecg_date', label: 'ECG date', placeholder: 'ECG date…' },
          { id: 'ecg_result', label: 'ECG result', placeholder: 'ECG result…' },
          { id: 'referral_date', label: 'Referral date', placeholder: 'Cardiology referral date…' },
          { id: 'clearance_date', label: 'Clearance date', placeholder: 'Cardiology clearance date…' },
        ],
      },
      {
        id: 'cardiac_plan',
        label: 'Treatment plan',
        chips: [
          { id: 'defer', label: 'Defer stimulant until cardiac clearance obtained' },
          { id: 'nonstim', label: 'Non-stimulant medication appropriate' },
          { id: 'approved', label: 'Stimulant approved by cardiologist' },
        ],
      },
    ],
  },
];
