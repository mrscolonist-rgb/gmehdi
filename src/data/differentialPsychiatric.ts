import type { DiffGroup } from './differentialTypes.ts';

export const PSYCHIATRIC_GROUP: DiffGroup =   {
    id: 'psychiatric',
    title: 'Psychiatric comorbidities',
    subtitle: 'Can coexist with ADHD — treat concurrently where relevant',
    conditions: [
      {
        id: 'mdd',
        label: 'Major depressive disorder',
        chips: [
          { id: 'current', label: 'Currently depressed' },
          { id: 'past', label: 'Past history' },
          { id: 'independent', label: 'Independent (treat both)' },
          { id: 'secondary', label: 'Secondary to ADHD struggles' },
        ],
        texts: [{ id: 'treatment', label: 'Treatment', placeholder: 'Current treatment…' }],
      },
      {
        id: 'bipolar',
        label: 'Bipolar disorder (I or II)',
        chips: [
          { id: 'outside_mood', label: 'ADHD symptoms outside mood episodes' },
          { id: 'only_mood', label: 'Only during mood episodes' },
          { id: 'euthymic', label: 'Euthymic' },
          { id: 'depressed', label: 'Depressed' },
          { id: 'hypomanic', label: 'Hypomanic' },
          { id: 'manic', label: 'Manic' },
        ],
        texts: [{ id: 'treatment', label: 'Treatment', placeholder: 'Current treatment…' }],
      },
      { id: 'dysthymia', label: 'Persistent depressive disorder (dysthymia)' },
      {
        id: 'gad',
        label: 'Generalised anxiety disorder',
        chips: [
          { id: 'primary', label: 'Primary (attention secondary to anxiety)' },
          { id: 'secondary', label: 'Secondary to ADHD' },
          { id: 'independent', label: 'Independent comorbidity' },
        ],
        texts: [{ id: 'treatment', label: 'Treatment', placeholder: 'Current treatment…' }],
      },
      { id: 'social_anxiety', label: 'Social anxiety disorder' },
      { id: 'panic', label: 'Panic disorder' },
      {
        id: 'phobias',
        label: 'Specific phobias',
        texts: [{ id: 'treatment', label: 'Treatment', placeholder: 'Current treatment…' }],
      },
      {
        id: 'ptsd',
        label: 'PTSD',
        note: 'Hypervigilance/dissociation can mimic ADHD',
        texts: [
          { id: 'trauma', label: 'Trauma history', placeholder: 'Trauma history…' },
          { id: 'treatment', label: 'Treatment', placeholder: 'Current treatment…' },
        ],
      },
      { id: 'cptsd', label: 'Complex PTSD / developmental trauma' },
      {
        id: 'ocd',
        label: 'Obsessive-compulsive disorder',
        note: 'Intrusive thoughts can impair concentration',
      },
      { id: 'bdd', label: 'Body dysmorphic disorder' },
      {
        id: 'binge',
        label: 'Binge eating disorder',
        note: 'High comorbidity with ADHD',
        texts: [{ id: 'treatment', label: 'Treatment', placeholder: 'Current treatment…' }],
      },
      { id: 'bulimia', label: 'Bulimia nervosa' },
      { id: 'anorexia', label: 'Anorexia nervosa' },
      {
        id: 'bpd',
        label: 'Borderline personality disorder',
        note: 'Emotional dysregulation overlaps with ADHD',
      },
      { id: 'aspd', label: 'Antisocial personality disorder' },
      {
        id: 'personality_other',
        label: 'Other personality disorder',
        texts: [{ id: 'other', label: 'Specify', placeholder: 'Other…' }],
      },
      {
        id: 'aud',
        label: 'Alcohol use disorder',
        chips: [
          { id: 'mild', label: 'Mild' },
          { id: 'moderate', label: 'Moderate' },
          { id: 'severe', label: 'Severe' },
          { id: 'active', label: 'Active' },
          { id: 'early_remission', label: 'Early remission' },
          { id: 'sustained', label: 'Sustained remission' },
        ],
        texts: [{ id: 'treatment', label: 'Support', placeholder: 'Treatment/support…' }],
      },
      { id: 'cud', label: 'Cannabis use disorder' },
      { id: 'stim_ud', label: 'Stimulant use disorder' },
      { id: 'oud', label: 'Opioid use disorder' },
      {
        id: 'sed_ud',
        label: 'Sedative/hypnotic use disorder',
        texts: [{ id: 'treatment', label: 'Support', placeholder: 'Treatment/support…' }],
      },
    ],
  };
