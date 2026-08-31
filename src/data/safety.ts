/** Pre-treatment safety assessment — optional session checklist. */

import { CARDIAC_GROUPS } from './safetyDefs.ts';
import { DIVERSION_GROUPS } from './safetyDefsDiversion.ts';
import { OTHER_SAFETY_GROUPS } from './safetyDefsOther.ts';
import {
  emptySafetyVitals,
  formatVitalsLines,
  vitalsHasContent,
  type SafetyVitals,
} from './safetyVitals.ts';
import type { DiffCondition, DiffGroup } from './differentialTypes.ts';
import {
  emptyDiffEntry,
  type DiffEntry,
  type DifferentialState,
} from './differential.ts';

export type SafetyState = DifferentialState & { vitals: SafetyVitals };

export const ALL_SAFETY_GROUPS: DiffGroup[] = [
  ...CARDIAC_GROUPS,
  ...DIVERSION_GROUPS,
  ...OTHER_SAFETY_GROUPS,
];

export function emptySafety(): SafetyState {
  return { entries: {}, vitals: emptySafetyVitals() };
}

function entryActive(e: DiffEntry): boolean {
  return e.on || e.chips.length > 0 || Object.values(e.texts).some((t) => t.trim());
}

export function safetyHasContent(state: SafetyState | null | undefined): boolean {
  if (!state) return false;
  if (vitalsHasContent(state.vitals)) return true;
  return Object.values(state.entries || {}).some(entryActive);
}

function entryOf(state: SafetyState, id: string): DiffEntry {
  return state.entries[id] || emptyDiffEntry();
}

function chipLabels(cond: DiffCondition, ids: string[]): string {
  if (!cond.chips?.length) return '';
  return cond.chips
    .filter((c) => ids.includes(c.id))
    .map((c) => c.label)
    .join('; ');
}

export function formatSafetyBlock(state: SafetyState): string {
  if (!safetyHasContent(state)) return '';
  const lines = ['[Pre-treatment safety assessment]'];
  lines.push(...formatVitalsLines(state.vitals || emptySafetyVitals()));

  for (const group of ALL_SAFETY_GROUPS) {
    const groupLines: string[] = [];
    for (const cond of group.conditions) {
      const e = entryOf(state, cond.id);
      if (!entryActive(e)) continue;
      const chips = chipLabels(cond, e.chips);
      const textBits = (cond.texts || [])
        .map((t) => {
          const v = (e.texts[t.id] || '').trim();
          return v ? `${t.label}: ${v}` : '';
        })
        .filter(Boolean);
      if (!chips && !textBits.length && cond.texts?.length && !cond.chips?.length) continue;
      let line = `- ${cond.label}`;
      if (chips) line += ` — ${chips}`;
      if (textBits.length) line += ` (${textBits.join('; ')})`;
      groupLines.push(line);
    }
    if (groupLines.length) {
      lines.push(`${group.title}:`);
      lines.push(...groupLines);
    }
  }

  lines.push('[/Pre-treatment safety assessment]');
  return lines.join('\n');
}

const SAFETY_RE =
  /\[Pre-treatment safety assessment\][\s\S]*?\[\/Pre-treatment safety assessment\]\n*/g;

export function mergeSafetyIntoContent(content: string, state: SafetyState): string {
  const base = (content || '').replace(SAFETY_RE, '').trimEnd();
  const block = formatSafetyBlock(state);
  if (!block) return base;
  return base ? `${base}\n\n${block}` : block;
}
