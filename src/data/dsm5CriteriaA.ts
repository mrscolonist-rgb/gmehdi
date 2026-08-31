/** DSM-5-TR Criteria A symptom checklist — counts only; adult threshold ≥5 noted as on the form. */

export const COLLATERAL_OPTIONS = [
  { id: 'partner', label: 'Partner/spouse' },
  { id: 'parent', label: 'Parent' },
  { id: 'family', label: 'Family member' },
  { id: 'school', label: 'School reports' },
  { id: 'medical', label: 'Medical records' },
  { id: 'work', label: 'Work documentation' },
  { id: 'none', label: 'None available (patient self-report only)' },
] as const;

export type CollateralId = (typeof COLLATERAL_OPTIONS)[number]['id'];

export interface Dsm5Symptom {
  id: string;
  text: string;
  group?: 'hyperactivity' | 'impulsivity';
}

export const DSM5_INATTENTION: Dsm5Symptom[] = [
  {
    id: 'ina_1',
    text: 'Fails to give close attention to details / makes careless mistakes in work or activities',
  },
  {
    id: 'ina_2',
    text: 'Difficulty sustaining attention in tasks or play (e.g., lectures, conversations, lengthy reading)',
  },
  {
    id: 'ina_3',
    text: 'Does not seem to listen when spoken to directly (mind seems elsewhere, even without distraction)',
  },
  {
    id: 'ina_4',
    text: 'Does not follow through on instructions / fails to finish work, chores, or duties (starts but loses focus, gets sidetracked)',
  },
  {
    id: 'ina_5',
    text: 'Difficulty organizing tasks and activities (managing sequential tasks, keeping materials in order, messy/disorganized work, poor time management, fails to meet deadlines)',
  },
  {
    id: 'ina_6',
    text: 'Avoids, dislikes, or is reluctant to engage in tasks requiring sustained mental effort (preparing reports, completing forms, reviewing lengthy papers)',
  },
  {
    id: 'ina_7',
    text: 'Loses things necessary for tasks/activities (school materials, pencils, books, tools, wallets, keys, paperwork, eyeglasses, mobile phones)',
  },
  {
    id: 'ina_8',
    text: 'Easily distracted by extraneous stimuli (for older adolescents and adults, may include unrelated thoughts)',
  },
  {
    id: 'ina_9',
    text: 'Forgetful in daily activities (doing chores, running errands, returning calls, paying bills, keeping appointments)',
  },
];

export const DSM5_HYPER_IMPULSE: Dsm5Symptom[] = [
  {
    id: 'hyp_1',
    group: 'hyperactivity',
    text: 'Fidgets with or taps hands or feet, squirms in seat',
  },
  {
    id: 'hyp_2',
    group: 'hyperactivity',
    text: 'Leaves seat in situations when remaining seated is expected (e.g., leaves place in office, classroom, or other workplace)',
  },
  {
    id: 'hyp_3',
    group: 'hyperactivity',
    text: 'Feels restless (in adults, may be limited to subjective feeling of restlessness)',
  },
  {
    id: 'hyp_4',
    group: 'hyperactivity',
    text: 'Unable to engage in leisure activities quietly or has difficulty doing so',
  },
  {
    id: 'hyp_5',
    group: 'hyperactivity',
    text: 'Is "on the go," acting as if "driven by a motor" (uncomfortable being still for extended time, others may find it difficult to keep up)',
  },
  {
    id: 'hyp_6',
    group: 'hyperactivity',
    text: 'Talks excessively',
  },
  {
    id: 'imp_1',
    group: 'impulsivity',
    text: "Blurts out answers before questions completed (completes people's sentences, can't wait turn in conversation)",
  },
  {
    id: 'imp_2',
    group: 'impulsivity',
    text: 'Difficulty waiting turn (e.g., while waiting in line)',
  },
  {
    id: 'imp_3',
    group: 'impulsivity',
    text: "Interrupts or intrudes on others (butts into conversations, games, or activities; may start using other people's things without permission; for adults, may intrude or take over what others are doing)",
  },
];

export interface Dsm5CriteriaAState {
  collateral: CollateralId[];
  checked: Partial<Record<string, boolean>>;
}

export function emptyDsm5CriteriaA(): Dsm5CriteriaAState {
  return { collateral: [], checked: {} };
}

export interface Dsm5CriteriaATotals {
  inattention: number;
  inattentionMax: 9;
  hyperImpulsive: number;
  hyperImpulsiveMax: 9;
  inattentionMet: boolean;
  hyperImpulsiveMet: boolean;
  criterionAMet: boolean;
  anyChecked: boolean;
}

const ADULT_THRESHOLD = 5;

export function scoreDsm5CriteriaA(state: Dsm5CriteriaAState): Dsm5CriteriaATotals {
  const checked = state.checked || {};
  let inattention = 0;
  for (const s of DSM5_INATTENTION) {
    if (checked[s.id]) inattention += 1;
  }
  let hyperImpulsive = 0;
  for (const s of DSM5_HYPER_IMPULSE) {
    if (checked[s.id]) hyperImpulsive += 1;
  }
  const anyChecked = inattention + hyperImpulsive > 0 || (state.collateral?.length || 0) > 0;
  const inattentionMet = inattention >= ADULT_THRESHOLD;
  const hyperImpulsiveMet = hyperImpulsive >= ADULT_THRESHOLD;
  return {
    inattention,
    inattentionMax: 9,
    hyperImpulsive,
    hyperImpulsiveMax: 9,
    inattentionMet,
    hyperImpulsiveMet,
    criterionAMet: inattentionMet || hyperImpulsiveMet,
    anyChecked,
  };
}

const DSM5_BLOCK_RE = /\[DSM-5-TR Criteria A\][\s\S]*?\[\/DSM-5-TR Criteria A\]\n*/g;

function tickedLines(list: Dsm5Symptom[], checked: Partial<Record<string, boolean>>): string[] {
  return list.filter((s) => checked[s.id]).map((s) => `- ${s.text}`);
}

/** Ticked Criterion A symptoms — Diagnostic Impression. Unticked items omitted. */
export function formatDsm5NoteBlock(state: Dsm5CriteriaAState): string {
  const t = scoreDsm5CriteriaA(state);
  if (!t.anyChecked) return '';
  const checked = state.checked || {};
  const collateralLabels = COLLATERAL_OPTIONS.filter((o) => state.collateral.includes(o.id)).map(
    (o) => o.label,
  );
  const lines = ['[DSM-5-TR Criteria A]'];
  if (collateralLabels.length) {
    lines.push(`- Collateral: ${collateralLabels.join('; ')}`);
  }
  const ina = tickedLines(DSM5_INATTENTION, checked);
  const hyp = tickedLines(
    DSM5_HYPER_IMPULSE.filter((s) => s.group === 'hyperactivity'),
    checked,
  );
  const imp = tickedLines(
    DSM5_HYPER_IMPULSE.filter((s) => s.group === 'impulsivity'),
    checked,
  );
  if (ina.length) {
    lines.push('Inattention:');
    lines.push(...ina);
  }
  if (hyp.length) {
    lines.push('Hyperactivity:');
    lines.push(...hyp);
  }
  if (imp.length) {
    lines.push('Impulsivity:');
    lines.push(...imp);
  }
  if (t.inattention + t.hyperImpulsive > 0) {
    lines.push(
      `- Inattention total: ${t.inattention} / ${t.inattentionMax}${t.inattentionMet ? ' (domain ≥5)' : ''}`,
    );
    lines.push(
      `- Hyperactivity/Impulsivity total: ${t.hyperImpulsive} / ${t.hyperImpulsiveMax}${t.hyperImpulsiveMet ? ' (domain ≥5)' : ''}`,
    );
    lines.push(`- Criterion A: ${t.criterionAMet ? 'Met (≥5 in at least one domain)' : 'Not met'}`);
  }
  lines.push('[/DSM-5-TR Criteria A]');
  return lines.join('\n');
}

export function mergeDsm5IntoContent(content: string, state: Dsm5CriteriaAState): string {
  const base = (content || '').replace(DSM5_BLOCK_RE, '').trimEnd();
  const block = formatDsm5NoteBlock(state);
  if (!block) return base;
  return base ? `${base}\n\n${block}` : block;
}

/** Strip a leftover Criteria A block (it belongs in Diagnostic Impression). */
export function stripDsm5FromContent(content: string): string {
  return mergeDsm5IntoContent(content, emptyDsm5CriteriaA());
}
