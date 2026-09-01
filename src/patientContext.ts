export type ContextSectionId =
  | 'thisConsult'
  | 'lastSession'
  | 'meds'
  | 'pmhx'
  | 'investigations'
  | 'letters'
  | 'other';

export interface ContextFields {
  thisConsult: string;
  lastSession: string;
  meds: string;
  pmhx: string;
  investigations: string;
  letters: string;
  other: string;
}

export interface ContextSectionDef {
  id: ContextSectionId;
  tag: string;
  label: string;
  hint: string;
  placeholder: string;
}

export const CONTEXT_SECTIONS: ContextSectionDef[] = [
  {
    id: 'thisConsult',
    tag: 'THIS_CONSULT',
    label: 'This consult',
    hint: 'Extra file info for TODAY. May be written into the matching note sections.',
    placeholder: 'e.g. PMHx restated for today, labs reviewed this visit, meds confirmed on screen…',
  },
  {
    id: 'lastSession',
    tag: 'LAST_SESSION',
    label: 'Last session',
    hint: 'Prior notes for trajectory only. Prior vitals/exam stay out of today’s note.',
    placeholder: 'Paste the previous progress note. Used for comparison and follow-up flow — not copied in.',
  },
  {
    id: 'meds',
    tag: 'CURRENT_MEDICATIONS',
    label: 'Meds',
    hint: 'Current Rx if the BP screenshot missed the list. Standing meds — not a new prescription unless said today.',
    placeholder: 'e.g. metformin XR 1000 mg nocte, ramipril 5 mg daily…',
  },
  {
    id: 'pmhx',
    tag: 'PMHX_ALLERGIES',
    label: 'PMHx',
    hint: 'Standing history and allergies. Background only — not today’s examination.',
    placeholder: 'e.g. T2DM 2016, HTN, penicillin rash…',
  },
  {
    id: 'investigations',
    tag: 'INVESTIGATIONS',
    label: 'Ix',
    hint: 'Results reviewed this visit. May appear under Investigations if the template allows.',
    placeholder: 'e.g. HbA1c 7.8% (12/08/2026), eGFR 82…',
  },
  {
    id: 'letters',
    tag: 'SPECIALIST_LETTERS',
    label: 'Letters',
    hint: 'Specialist / discharge advice for this problem. Do not dump the whole letter into exam.',
    placeholder: 'e.g. Cardiology 03/2026: continue ramipril 5 mg; echo LVEF 55%…',
  },
  {
    id: 'other',
    tag: 'OTHER',
    label: 'Other',
    hint: 'Directives or uncategorised paste. Do not copy historical vitals into today’s note.',
    placeholder: 'e.g. prefers concise notes; carer for spouse; work certificate requested…',
  },
];

const TAG_TO_ID: Record<string, ContextSectionId> = Object.fromEntries(
  CONTEXT_SECTIONS.map((s) => [s.tag, s.id]),
) as Record<string, ContextSectionId>;

const ALIASES: Record<string, ContextSectionId> = {
  PREVIOUS_CONSULTATIONS_PROGRESS_NOTES: 'lastSession',
  PAST_MEDICAL_HISTORY_PMHX_ALLERGIES: 'pmhx',
  CURRENT_RX: 'meds',
  MEDICATIONS: 'meds',
  CURRENT_LAB_RADIOLOGY_RESULTS: 'investigations',
  SPECIALIST_LETTERS_EXTERNAL_REPORTS: 'letters',
  ADDITIONAL_NOTES_DIRECTIVES: 'other',
  ADDITIONAL_NOTES_SPECIAL_CLINICAL_DIRECTIVES: 'other',
};

export function emptyContextFields(): ContextFields {
  return {
    thisConsult: '',
    lastSession: '',
    meds: '',
    pmhx: '',
    investigations: '',
    letters: '',
    other: '',
  };
}

function normTag(raw: string): string {
  return raw
    .replace(/&/g, ' ')
    .replace(/[()]/g, ' ')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

function resolveTag(raw: string): ContextSectionId | null {
  const key = normTag(raw);
  return TAG_TO_ID[key] || ALIASES[key] || null;
}

export function parsePatientContext(raw: string): ContextFields {
  const fields = emptyContextFields();
  const text = (raw || '').trim();
  if (!text) return fields;

  const re = /^\[([^\]]+)\]:\s*\n?/gm;
  const matches = [...text.matchAll(re)];
  if (!matches.length) {
    fields.other = text;
    return fields;
  }

  const first = matches[0];
  const lead = text.slice(0, first.index).trim();
  if (lead) fields.other = lead;

  matches.forEach((match, i) => {
    const start = (match.index || 0) + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index || text.length : text.length;
    const body = text.slice(start, end).trim();
    if (!body) return;
    const id = resolveTag(match[1] || '');
    if (id) {
      fields[id] = fields[id] ? `${fields[id]}\n\n${body}` : body;
    } else {
      fields.other = fields.other ? `${fields.other}\n\n${body}` : body;
    }
  });
  return fields;
}

export function formatPatientContext(fields: ContextFields): string {
  return CONTEXT_SECTIONS.filter((s) => fields[s.id].trim())
    .map((s) => `[${s.tag}]:\n${fields[s.id].trim()}`)
    .join('\n\n');
}

export function filledSectionCount(fields: ContextFields): number {
  return CONTEXT_SECTIONS.filter((s) => fields[s.id].trim()).length;
}
