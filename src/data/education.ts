/** Patient education & discussion — optional session checklist. */

import { EDUCATION_GROUPS } from './educationDefs.ts';
import { EDUCATION_GROUPS_MORE } from './educationDefsMore.ts';
import type { DiffCondition, DiffGroup } from './differentialTypes.ts';
import {
  emptyDiffEntry,
  type DiffEntry,
  type DifferentialState,
} from './differential.ts';

/** Same shape as differential — reusable entry map. */
export type EducationState = DifferentialState;

export const ALL_EDUCATION_GROUPS: DiffGroup[] = [
  ...EDUCATION_GROUPS,
  ...EDUCATION_GROUPS_MORE,
];

export function emptyEducation(): EducationState {
  return { entries: {} };
}

export function educationHasContent(state: EducationState | null | undefined): boolean {
  if (!state?.entries) return false;
  return Object.values(state.entries).some(
    (e) => e.on || e.chips.length > 0 || Object.values(e.texts).some((t) => t.trim()),
  );
}

function entryOf(state: EducationState, id: string): DiffEntry {
  return state.entries[id] || emptyDiffEntry();
}

function active(e: DiffEntry): boolean {
  return e.on || e.chips.length > 0 || Object.values(e.texts).some((t) => t.trim());
}

function chipLabels(cond: DiffCondition, ids: string[]): string {
  if (!cond.chips?.length) return '';
  return cond.chips
    .filter((c) => ids.includes(c.id))
    .map((c) => c.label)
    .join('; ');
}

export function formatEducationBlock(state: EducationState): string {
  if (!educationHasContent(state)) return '';
  const lines = ['[Patient education & discussion]'];
  lines.push('- Topics covered this session (optional checklist)');

  for (const group of ALL_EDUCATION_GROUPS) {
    const groupLines: string[] = [];
    for (const cond of group.conditions) {
      const e = entryOf(state, cond.id);
      if (!active(e)) continue;
      const chips = chipLabels(cond, e.chips);
      const textBits = (cond.texts || [])
        .map((t) => {
          const v = (e.texts[t.id] || '').trim();
          return v ? `${t.label}: ${v}` : '';
        })
        .filter(Boolean);
      // Notes-only rows need text; skip an empty tick.
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

  lines.push('[/Patient education & discussion]');
  return lines.join('\n');
}

const EDU_RE = /\[Patient education & discussion\][\s\S]*?\[\/Patient education & discussion\]\n*/g;

export function mergeEducationIntoContent(content: string, state: EducationState): string {
  const base = (content || '').replace(EDU_RE, '').trimEnd();
  const block = formatEducationBlock(state);
  if (!block) return base;
  return base ? `${base}\n\n${block}` : block;
}
