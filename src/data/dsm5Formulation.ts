/** DSM-5-TR Criteria B–E diagnostic formulation — optional, multi-session aware. */

import {
  EXCLUSIONS,
  IMPAIRMENT_DOMAINS,
  ONSET_EVIDENCE,
  SETTINGS,
  UNCERTAIN_REASONS,
} from './dsm5FormulationDefs.ts';

export type FormulationPhase = 'in_progress' | 'final';
export type OnsetStatus = 'yes' | 'uncertain' | 'no';
export type CriterionFlag = 'met' | 'not_met';

export type {
  ImpairmentDomainDef,
} from './dsm5FormulationDefs.ts';
export {
  EXCLUSIONS,
  IMPAIRMENT_DOMAINS,
  ONSET_EVIDENCE,
  SETTINGS,
  UNCERTAIN_REASONS,
} from './dsm5FormulationDefs.ts';

export interface ImpairmentDomainState {
  on: boolean;
  items: string[];
  examples: string;
}

export interface Dsm5FormulationState {
  /** in_progress until the last session where diagnosis is given. */
  phase: FormulationPhase;
  onset: OnsetStatus | null;
  onsetEvidence: string[];
  childhoodDescription: string;
  uncertainReasons: string[];
  settings: string[];
  criterionC: CriterionFlag | null;
  impairment: Record<string, ImpairmentDomainState>;
  criterionD: CriterionFlag | null;
  exclusions: string[];
  criterionE: CriterionFlag | null;
  alternativeDiagnosis: string;
}

export function emptyImpairment(): Record<string, ImpairmentDomainState> {
  const out: Record<string, ImpairmentDomainState> = {};
  for (const d of IMPAIRMENT_DOMAINS) {
    out[d.id] = { on: false, items: [], examples: '' };
  }
  return out;
}

export function emptyDsm5Formulation(): Dsm5FormulationState {
  return {
    phase: 'in_progress',
    onset: null,
    onsetEvidence: [],
    childhoodDescription: '',
    uncertainReasons: [],
    settings: [],
    criterionC: null,
    impairment: emptyImpairment(),
    criterionD: null,
    exclusions: [],
    criterionE: null,
    alternativeDiagnosis: '',
  };
}

export function formulationHasContent(s: Dsm5FormulationState | null | undefined): boolean {
  if (!s) return false;
  if (s.onset || s.onsetEvidence.length || s.childhoodDescription.trim()) return true;
  if (s.uncertainReasons.length || s.settings.length || s.criterionC) return true;
  if (s.criterionD || s.criterionE || s.exclusions.length) return true;
  if (s.alternativeDiagnosis.trim()) return true;
  return Object.values(s.impairment || {}).some(
    (d) => d.on || d.items.length > 0 || d.examples.trim(),
  );
}

function labels(ids: string[], opts: readonly { id: string; label: string }[]): string {
  return opts.filter((o) => ids.includes(o.id)).map((o) => o.label).join('; ');
}

function autoC(settings: string[]): CriterionFlag | null {
  if (!settings.length) return null;
  return settings.length >= 2 ? 'met' : 'not_met';
}

function autoD(imp: Record<string, ImpairmentDomainState>): CriterionFlag | null {
  const any = Object.values(imp || {}).some((d) => d.on || d.items.length > 0);
  if (!any) return null;
  return 'met';
}

export function resolvedCriterionC(s: Dsm5FormulationState): CriterionFlag | null {
  return s.criterionC ?? autoC(s.settings);
}

export function resolvedCriterionD(s: Dsm5FormulationState): CriterionFlag | null {
  return s.criterionD ?? autoD(s.impairment);
}

const FORM_RE = /\[DSM-5-TR Criteria B–E[^\]]*\][\s\S]*?\[\/DSM-5-TR Criteria B–E[^\]]*\]\n*/g;

export function formatFormulationBlock(s: Dsm5FormulationState): string {
  if (!formulationHasContent(s)) return '';
  const final = s.phase === 'final';
  const tag = final ? 'FINAL' : 'IN PROGRESS';
  const lines = [`[DSM-5-TR Criteria B–E — ${tag}]`];
  lines.push(
    final
      ? '- Formulation status: Final diagnostic session (Criteria B–E determinations as recorded)'
      : '- Formulation status: In progress (multi-session — not a final met/not-met determination)',
  );

  if (s.onset === 'yes') {
    lines.push(
      final
        ? '- Criterion B (onset before 12): Met — clear childhood evidence'
        : '- Criterion B (onset before 12): Documented as yes — clear childhood evidence (provisional until final session)',
    );
    const ev = labels(s.onsetEvidence, ONSET_EVIDENCE);
    if (ev) lines.push(`  - Evidence: ${ev}`);
    if (s.childhoodDescription.trim()) {
      lines.push(`  - Childhood symptoms: ${s.childhoodDescription.trim()}`);
    }
  } else if (s.onset === 'uncertain') {
    lines.push('- Criterion B (onset before 12): Uncertain — limited childhood history');
    const r = labels(s.uncertainReasons, UNCERTAIN_REASONS);
    if (r) lines.push(`  - Reasons: ${r}`);
    if (final) {
      lines.push('  - Note: consider Other Specified ADHD if adult presentation is compelling');
    }
  } else if (s.onset === 'no') {
    lines.push(
      final
        ? '- Criterion B (onset before 12): Not met — onset clearly after age 12'
        : '- Criterion B (onset before 12): Documented as no — onset after 12 (provisional)',
    );
  }

  if (s.settings.length) {
    lines.push(`- Criterion C settings: ${labels(s.settings, SETTINGS)}`);
  }
  const c = resolvedCriterionC(s);
  if (c) {
    lines.push(
      final
        ? `- Criterion C (pervasiveness): ${c === 'met' ? 'Met (2+ settings)' : 'Not met'}`
        : `- Criterion C (pervasiveness): ${c === 'met' ? '2+ settings noted' : 'Only one setting noted'} (provisional)`,
    );
  }

  for (const d of IMPAIRMENT_DOMAINS) {
    const st = s.impairment[d.id];
    if (!st || (!st.on && !st.items.length && !st.examples.trim())) continue;
    const itemLabels = d.items.filter((i) => st.items.includes(i.id)).map((i) => i.label);
    lines.push(`- Impairment — ${d.label}${itemLabels.length ? `: ${itemLabels.join('; ')}` : ''}`);
    if (st.examples.trim()) lines.push(`  - Examples: ${st.examples.trim()}`);
  }
  const dFlag = resolvedCriterionD(s);
  if (dFlag) {
    lines.push(
      final
        ? `- Criterion D (impairment): ${dFlag === 'met' ? 'Met' : 'Not met'}`
        : `- Criterion D (impairment): ${dFlag === 'met' ? 'Impairment domains documented' : 'Not yet supporting impairment'} (provisional)`,
    );
  }

  if (s.exclusions.length) {
    lines.push(`- Criterion E considered/ruled out: ${labels(s.exclusions, EXCLUSIONS)}`);
  }
  if (s.criterionE) {
    lines.push(
      final
        ? `- Criterion E (exclusion): ${s.criterionE === 'met' ? 'Met' : 'Not met'}`
        : `- Criterion E (exclusion): ${s.criterionE === 'met' ? 'Documented as not better explained by other' : 'Alternative explanation under review'} (provisional)`,
    );
  }
  if (s.alternativeDiagnosis.trim()) {
    lines.push(`- Primary alternative diagnosis: ${s.alternativeDiagnosis.trim()}`);
  }

  lines.push(`[/DSM-5-TR Criteria B–E — ${tag}]`);
  return lines.join('\n');
}

export function mergeFormulationIntoContent(content: string, s: Dsm5FormulationState): string {
  const base = (content || '').replace(FORM_RE, '').trimEnd();
  const block = formatFormulationBlock(s);
  if (!block) return base;
  return base ? `${base}\n\n${block}` : block;
}
