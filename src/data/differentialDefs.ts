import type { DiffGroup } from './differentialTypes.ts';
import { PSYCHIATRIC_GROUP } from './differentialPsychiatric.ts';

export type { DiffChip, DiffCondition, DiffGroup, DiffText } from './differentialTypes.ts';

export const DIFFERENTIAL_GROUPS: DiffGroup[] = [
  {
    id: 'medical',
    title: 'Medical & neurological rule-outs',
    conditions: [
      {
        id: 'thyroid',
        label: 'Thyroid disorder',
        chips: [
          { id: 'normal', label: 'Normal' },
          { id: 'abnormal', label: 'Abnormal' },
        ],
        texts: [
          { id: 'tsh', label: 'TSH', placeholder: 'TSH' },
          { id: 'date', label: 'Date', placeholder: 'Date' },
        ],
      },
      {
        id: 'anaemia',
        label: 'Anaemia / iron deficiency',
        chips: [
          { id: 'normal', label: 'Normal' },
          { id: 'low', label: 'Low' },
        ],
        texts: [
          { id: 'hb', label: 'Hb', placeholder: 'Hb' },
          { id: 'ferritin', label: 'Ferritin', placeholder: 'Ferritin' },
        ],
      },
      {
        id: 'sleep',
        label: 'Sleep disorder',
        chips: [
          { id: 'osa', label: 'OSA screened/investigated' },
          { id: 'insufficient', label: 'Insufficient sleep (<7 h)' },
          { id: 'insomnia', label: 'Insomnia / maintenance issues' },
          { id: 'rls', label: 'Restless legs' },
        ],
        texts: [{ id: 'action', label: 'Action', placeholder: 'Action…' }],
      },
      {
        id: 'hearing',
        label: 'Hearing impairment',
        chips: [
          { id: 'done', label: 'Test done' },
          { id: 'normal', label: 'Normal' },
          { id: 'impaired', label: 'Impaired' },
          { id: 'needed', label: 'Needed' },
        ],
      },
      {
        id: 'vision',
        label: 'Vision impairment',
        chips: [
          { id: 'done', label: 'Test done' },
          { id: 'normal', label: 'Normal' },
          { id: 'impaired', label: 'Impaired' },
          { id: 'needed', label: 'Needed' },
        ],
      },
      {
        id: 'seizure',
        label: 'Seizure disorder',
        note: 'Absence seizures can mimic inattention',
      },
      {
        id: 'tbi',
        label: 'Traumatic brain injury history',
        texts: [{ id: 'details', label: 'Details', placeholder: 'Details…' }],
      },
      {
        id: 'med_side_effects',
        label: 'Medication side effects',
        texts: [
          { id: 'reviewed', label: 'Meds reviewed', placeholder: 'Current medications reviewed…' },
          { id: 'culprits', label: 'Possible culprits', placeholder: 'Possible culprits…' },
        ],
      },
      {
        id: 'substance_effects',
        label: 'Substance use effects',
        chips: [
          { id: 'cannabis', label: 'Cannabis' },
          { id: 'alcohol', label: 'Alcohol' },
          { id: 'stimulants', label: 'Stimulants' },
          { id: 'other', label: 'Other' },
        ],
        texts: [{ id: 'impact', label: 'Impact', placeholder: 'Impact on symptoms…' }],
      },
    ],
  },
  PSYCHIATRIC_GROUP,
  {
    id: 'neuro',
    title: 'Neurodevelopmental comorbidities',
    subtitle: 'Often coexist with ADHD',
    conditions: [
      {
        id: 'asd',
        label: 'Autism spectrum disorder',
        note: 'ASD can coexist with ADHD per DSM-5-TR',
        chips: [
          { id: 'diagnosed', label: 'Diagnosed' },
          { id: 'suspected', label: 'Suspected' },
          { id: 'negative', label: 'Screened negative' },
        ],
        texts: [{ id: 'action', label: 'Action', placeholder: 'Action…' }],
      },
      {
        id: 'sld',
        label: 'Specific learning disorders',
        chips: [
          { id: 'dyslexia', label: 'Dyslexia' },
          { id: 'dyscalculia', label: 'Dyscalculia' },
          { id: 'dysgraphia', label: 'Dysgraphia' },
          { id: 'dx_yes', label: 'Diagnosed' },
          { id: 'dx_suspected', label: 'Suspected' },
          { id: 'dx_no', label: 'No' },
        ],
        texts: [{ id: 'when', label: 'When diagnosed', placeholder: 'When…' }],
      },
      { id: 'dcd', label: 'Developmental coordination disorder (dyspraxia)' },
      {
        id: 'id',
        label: 'Intellectual disability',
        chips: [
          { id: 'iq_done', label: 'IQ testing done' },
          { id: 'iq_not', label: 'Not done' },
          { id: 'iq_unneeded', label: 'Not needed' },
        ],
        texts: [{ id: 'iq', label: 'IQ', placeholder: 'IQ…' }],
      },
      {
        id: 'tics',
        label: 'Tic disorders',
        note: 'Tics may worsen with stimulants — monitor',
        chips: [
          { id: 'tourette', label: "Tourette's" },
          { id: 'persistent', label: 'Persistent motor/vocal tic' },
          { id: 'provisional', label: 'Provisional tic' },
        ],
      },
      { id: 'speech', label: 'Speech/language disorder' },
    ],
  },
];
