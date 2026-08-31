/** Patient education & discussion checklist groups (ADHD). */

import type { DiffGroup } from './differentialTypes.ts';

export const EDUCATION_GROUPS: DiffGroup[] = [
  {
    id: 'diagnosis_discussion',
    title: 'Diagnosis discussion',
    conditions: [
      { id: 'dx_discussed', label: 'Diagnosis discussed with patient' },
      {
        id: 'neurobiology',
        label: 'ADHD neurobiology explained',
        chips: [
          { id: 'exec', label: 'Executive function deficits' },
          { id: 'da_ne', label: 'Dopamine/norepinephrine dysregulation' },
          { id: 'brain_dev', label: 'Brain development differences' },
          { id: 'genetic', label: 'Genetic/hereditary factors' },
        ],
      },
      {
        id: 'not_myths',
        label: 'Clarified that ADHD is NOT',
        chips: [
          { id: 'not_iq', label: 'A deficit of intelligence' },
          { id: 'not_lazy', label: 'Laziness or character flaw' },
          { id: 'not_parenting', label: 'Result of poor parenting' },
          { id: 'not_cure', label: 'Something that can be "cured"' },
        ],
      },
      {
        id: 'strengths',
        label: 'Strengths and positive traits discussed',
        texts: [
          {
            id: 'examples',
            label: 'Examples',
            placeholder: 'e.g. creativity, hyperfocus, energy, problem-solving…',
          },
        ],
      },
    ],
  },
  {
    id: 'treatment',
    title: 'Treatment options discussed',
    conditions: [
      {
        id: 'multimodal',
        label: 'Multimodal approach recommended',
        note: '"Pills don\'t teach skills" — medication enables strategies that still must be learned',
      },
      {
        id: 'medication',
        label: 'Medication options explained',
        chips: [
          { id: 'stimulants', label: 'Stimulants (first-line, ~70–80% response)' },
          { id: 'nonstim', label: 'Non-stimulants (alternative if needed)' },
          { id: 'benefits', label: 'Expected benefits and limitations' },
          { id: 'side_effects', label: 'Common side effects' },
          { id: 'monitoring', label: 'Monitoring requirements' },
        ],
      },
      {
        id: 'nonpharm',
        label: 'Non-pharmacological interventions explained',
        chips: [
          { id: 'psych', label: 'Psychological strategies (CBT, coaching)' },
          { id: 'lifestyle', label: 'Lifestyle (sleep, exercise, diet)' },
          { id: 'env', label: 'Environmental accommodations' },
          { id: 'org', label: 'Organisational strategies and tools' },
        ],
      },
      {
        id: 'expectations',
        label: 'Realistic expectations set',
        chips: [
          { id: 'helps_not_cure', label: 'Treatment helps but doesn\'t "cure"' },
          { id: 'trial', label: 'May need trial of different medications' },
          { id: 'ongoing', label: 'Ongoing management usually required' },
          { id: 'time', label: 'Improvement takes time (weeks to months)' },
        ],
      },
    ],
  },
  {
    id: 'risks',
    title: 'Risks if untreated discussed',
    conditions: [
      {
        id: 'substance_risk',
        label: 'Substance misuse risk',
        note: 'Higher rates of smoking, alcohol, drug use (often self-medication)',
      },
      {
        id: 'driving_risk',
        label: 'Driving risks',
        note: 'Increased accident risk; Austroads guidelines discussed',
      },
      {
        id: 'work_risk',
        label: 'Work/occupational consequences',
        note: 'Job loss, underemployment, workplace conflict',
      },
      {
        id: 'relationship_risk',
        label: 'Relationship difficulties',
        note: 'Relationship breakdown, social isolation',
      },
      {
        id: 'financial_risk',
        label: 'Financial problems',
        note: 'Impulsive spending, disorganisation, missed bills',
      },
      {
        id: 'mh_risk',
        label: 'Mental health impact',
        note: 'Depression, anxiety, low self-esteem from chronic struggles',
      },
    ],
  },
];
