/** Differential & co-occurring conditions — optional, fill what this session covers. */

import { DIFFERENTIAL_GROUPS } from './differentialDefs.ts';
import type { DiffCondition } from './differentialTypes.ts';

export type { DiffCondition, DiffGroup } from './differentialTypes.ts';
export { DIFFERENTIAL_GROUPS } from './differentialDefs.ts';

export interface DiffEntry {
  on: boolean;
  chips: string[];
  texts: Record<string, string>;
}

export type DifferentialState = {
  entries: Record<string, DiffEntry>;
};

export function emptyDiffEntry(): DiffEntry {
  return { on: false, chips: [], texts: {} };
}

export function emptyDifferential(): DifferentialState {
  return { entries: {} };
}

function entryOf(state: DifferentialState, id: string): DiffEntry {
  return state.entries[id] || emptyDiffEntry();
}

export function differentialHasContent(state: DifferentialState | null | undefined): boolean {
  if (!state?.entries) return false;
  return Object.values(state.entries).some(
    (e) => e.on || e.chips.length > 0 || Object.values(e.texts).some((t) => t.trim()),
  );
}

function activeEntry(e: DiffEntry): boolean {
  return e.on || e.chips.length > 0 || Object.values(e.texts).some((t) => t.trim());
}

function chipLabels(cond: DiffCondition, ids: string[]): string {
  if (!cond.chips?.length) return '';
  return cond.chips
    .filter((c) => ids.includes(c.id))
    .map((c) => c.label)
    .join('; ');
}

export function formatDifferentialBlock(state: DifferentialState): string {
  if (!differentialHasContent(state)) return '';
  const lines = ['[Differential & co-occurring conditions]'];
  lines.push(
    '- Status: Documented findings for this assessment (optional; may accumulate across sessions)',
  );

  for (const group of DIFFERENTIAL_GROUPS) {
    const groupLines: string[] = [];
    for (const cond of group.conditions) {
      const e = entryOf(state, cond.id);
      if (!activeEntry(e)) continue;
      const chips = chipLabels(cond, e.chips);
      const textBits = (cond.texts || [])
        .map((t) => {
          const v = (e.texts[t.id] || '').trim();
          return v ? `${t.label}: ${v}` : '';
        })
        .filter(Boolean);
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

  lines.push('[/Differential & co-occurring conditions]');
  return lines.join('\n');
}

const DIFF_RE =
  /\[Differential & co-occurring conditions\][\s\S]*?\[\/Differential & co-occurring conditions\]\n*/g;

export function mergeDifferentialIntoContent(
  content: string,
  state: DifferentialState,
): string {
  const base = (content || '').replace(DIFF_RE, '').trimEnd();
  const block = formatDifferentialBlock(state);
  if (!block) return base;
  return base ? `${base}\n\n${block}` : block;
}
