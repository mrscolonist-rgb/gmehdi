/** Patient education — accommodations, resources, response (split for file size). */

import type { DiffGroup } from './differentialTypes.ts';

export const EDUCATION_GROUPS_MORE: DiffGroup[] = [
  {
    id: 'accommodations',
    title: 'Workplace / academic accommodations',
    conditions: [
      {
        id: 'dda',
        label: 'Rights under Disability Discrimination Act discussed',
      },
      {
        id: 'workplace',
        label: 'Reasonable workplace adjustments discussed',
        note: 'e.g. quiet workspace, written instructions, clear deadlines, check-ins, flexible hours',
      },
      {
        id: 'academic',
        label: 'Academic accommodations discussed',
        note: 'e.g. extra exam time, quiet room, note-taking support, extensions, reduced load',
      },
      {
        id: 'documentation',
        label: 'Documentation offered',
        chips: [
          { id: 'med_cert', label: 'Medical certificate for employer' },
          { id: 'support_letter', label: 'Support letter for workplace accommodations' },
          { id: 'uni_tafe', label: 'Documentation for university/TAFE' },
        ],
      },
    ],
  },
  {
    id: 'resources',
    title: 'Resources & support',
    conditions: [
      {
        id: 'written_info',
        label: 'Written information provided',
        chips: [
          { id: 'aadpa', label: 'AADPA patient information sheet' },
          { id: 'med_leaflet', label: 'Medication information leaflet' },
          { id: 'driving_info', label: 'Driving safety information' },
          { id: 'websites', label: 'Reliable websites (ADHD Australia, CHADD)' },
        ],
      },
      {
        id: 'support',
        label: 'Support resources provided',
        chips: [
          { id: 'groups', label: 'ADHD support groups (local/online)' },
          { id: 'crisis', label: 'Crisis contacts (Lifeline, Beyond Blue)' },
          { id: 'books_apps', label: 'Recommended books or apps' },
        ],
      },
      { id: 'questions', label: 'Patient questions answered' },
    ],
  },
  {
    id: 'response',
    title: 'Patient response to diagnosis',
    subtitle: 'Source reference: AADPA Guideline 3.0 — Information & Support',
    conditions: [
      {
        id: 'reaction',
        label: "Patient's reaction",
        chips: [
          { id: 'relieved', label: 'Relieved / validated' },
          { id: 'anxious', label: 'Concerned / anxious' },
          { id: 'surprised', label: 'Surprised' },
          { id: 'skeptical', label: 'Skeptical / questioning diagnosis' },
          { id: 'overwhelmed', label: 'Overwhelmed' },
          { id: 'other', label: 'Other' },
        ],
        texts: [{ id: 'other_text', label: 'Other', placeholder: 'Other reaction…' }],
      },
      {
        id: 'readiness',
        label: "Patient's readiness for treatment",
        chips: [
          { id: 'ready', label: 'Ready to start today' },
          { id: 'consider', label: 'Wants time to consider options' },
          { id: 'nonmed_first', label: 'Prefers non-medication approach first' },
          { id: 'uncertain', label: 'Uncertain / needs more information' },
        ],
      },
      {
        id: 'extra_notes',
        label: 'Additional notes',
        texts: [{ id: 'notes', label: 'Notes', placeholder: 'Additional notes…' }],
      },
    ],
  },
];
