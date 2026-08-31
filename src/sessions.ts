import type {
  AdhdToolsState,
  EhrContext,
  ScribeDocument,
  SessionGroup,
} from './types.ts';
import { adhdToolsHasContent, applyAdhdToolsToSections } from './utils/adhdToolsNote.ts';

/** Backfill session fields; resync ADHD tool blocks into the right note sections. */
export function migrateNote(note: ScribeDocument): ScribeDocument {
  const sessionId = note.sessionId || note.id;
  const sessionName = (note.sessionName || note.title || 'Untitled session').trim() || 'Untitled session';
  if (note.templateId !== 'adhd_multi_session' || !note.tools) {
    return { ...note, sessionId, sessionName };
  }
  return {
    ...note,
    sessionId,
    sessionName,
    sections: applyAdhdToolsToSections(note.sections, note.tools),
  };
}

/** Tools filled during Record / Studio — kept on any session doc for Adult ADHD Generate. */
export function findSessionTools(
  notes: ScribeDocument[],
  sessionId: string,
): AdhdToolsState | null {
  for (const n of notes) {
    if (n.sessionId === sessionId && adhdToolsHasContent(n.tools)) return n.tools || null;
  }
  return null;
}

/**
 * Mirror consult-scoped fields onto every document in THIS session only.
 * Never touches other sessionIds (prevents cross-consult mix-ups).
 */
export function syncSessionConsult(
  notes: ScribeDocument[],
  sessionId: string,
  fields: {
    transcript: string;
    audioDurationSec: number;
    patientContext: string;
    ehrContext: EhrContext | null;
    tools?: AdhdToolsState | null;
  },
): ScribeDocument[] {
  const now = new Date().toISOString();
  const tools = fields.tools;
  const hasTools = adhdToolsHasContent(tools);
  return notes.map((n) => {
    if (n.sessionId !== sessionId) return n;
    const nextTools = hasTools ? tools : n.tools;
    return {
      ...n,
      transcript: fields.transcript,
      audioDurationSec: fields.audioDurationSec,
      patientContext: fields.patientContext,
      ehrContext: fields.ehrContext,
      tools: nextTools,
      sections:
        n.templateId === 'adhd_multi_session' && hasTools
          ? applyAdhdToolsToSections(n.sections, tools)
          : n.sections,
      updatedAt: now,
    };
  });
}

export function groupBySession(notes: ScribeDocument[]): SessionGroup[] {
  const map = new Map<string, ScribeDocument[]>();
  for (const n of notes) {
    const list = map.get(n.sessionId) || [];
    list.push(n);
    map.set(n.sessionId, list);
  }
  return [...map.values()]
    .map((docs) => {
      const sorted = [...docs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return {
        sessionId: sorted[0].sessionId,
        sessionName: sorted[0].sessionName,
        updatedAt: sorted.reduce((max, d) => (d.updatedAt > max ? d.updatedAt : max), sorted[0].updatedAt),
        docs: sorted,
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function renameSession(
  notes: ScribeDocument[],
  sessionId: string,
  sessionName: string,
): ScribeDocument[] {
  const name = sessionName.trim() || 'Untitled session';
  const now = new Date().toISOString();
  return notes.map((n) =>
    n.sessionId === sessionId ? { ...n, sessionName: name, updatedAt: now } : n,
  );
}

export function suggestSessionName(ehrName?: string): string {
  const when = new Date().toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const who = ehrName?.trim();
  // Date+time keeps same-day consults visually distinct in Library.
  return who ? `${who} — ${when}` : when;
}
