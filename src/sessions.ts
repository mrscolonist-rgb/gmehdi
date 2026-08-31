import type { ScribeDocument, SessionGroup } from './types.ts';
import {
  mergeAdhdFormulationIntoDiagnosis,
  mergeAdhdFormulationIntoTools,
  mergeAdhdToolsIntoContent,
} from './utils/adhdToolsNote.ts';

/** Backfill session fields; resync ADHD tool blocks into the right note sections. */
export function migrateNote(note: ScribeDocument): ScribeDocument {
  const sessionId = note.sessionId || note.id;
  const sessionName = (note.sessionName || note.title || 'Untitled session').trim() || 'Untitled session';
  if (note.templateId !== 'adhd_multi_session' || !note.tools) {
    return { ...note, sessionId, sessionName };
  }
  const sections = note.sections.map((s) => {
    if (s.id === 'sec_adhd_tools') {
      const withAsrs = mergeAdhdToolsIntoContent(s.content, note.tools);
      return { ...s, content: mergeAdhdFormulationIntoTools(withAsrs, note.tools) };
    }
    if (s.id === 'sec_adhd_diagnosis_plan') {
      return { ...s, content: mergeAdhdFormulationIntoDiagnosis(s.content, note.tools) };
    }
    return s;
  });
  return { ...note, sessionId, sessionName, sections };
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

export function syncSessionTranscript(
  notes: ScribeDocument[],
  sessionId: string,
  transcript: string,
  audioDurationSec: number,
): ScribeDocument[] {
  const now = new Date().toISOString();
  return notes.map((n) =>
    n.sessionId === sessionId
      ? { ...n, transcript, audioDurationSec, updatedAt: now }
      : n,
  );
}

export function suggestSessionName(ehrName?: string): string {
  const day = new Date().toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const who = ehrName?.trim();
  // Always seed a name so Record is enabled; clinician can edit before/after.
  return who ? `${who} — ${day}` : day;
}
