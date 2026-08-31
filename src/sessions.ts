import type { ScribeDocument, SessionGroup } from './types.ts';

/** Backfill session fields for notes saved before session naming existed. */
export function migrateNote(note: ScribeDocument): ScribeDocument {
  const sessionId = note.sessionId || note.id;
  const sessionName = (note.sessionName || note.title || 'Untitled session').trim() || 'Untitled session';
  return { ...note, sessionId, sessionName };
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
  return who ? `${who} — ${day}` : '';
}
