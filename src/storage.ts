import type { ScribeDocument } from './types.ts';
import { migrateNote } from './sessions.ts';

const KEY = 'myscribe_notes_v1';

let lastSaveError: string | null = null;

export function getLastSaveError(): string | null {
  return lastSaveError;
}

export function loadNotes(): ScribeDocument[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScribeDocument[];
    if (!Array.isArray(parsed)) return [];
    const migrated = parsed.map(migrateNote);
    saveNotes(migrated);
    return migrated;
  } catch {
    return [];
  }
}

/** Persist all documents (H&P, GPCCMP, Adult ADHD, referrals). Returns false on quota/failure. */
export function saveNotes(notes: ScribeDocument[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(notes));
    lastSaveError = null;
    return true;
  } catch (e) {
    lastSaveError =
      e instanceof DOMException && e.name === 'QuotaExceededError'
        ? 'Browser storage is full. Delete old sessions from Library, then try again.'
        : 'Could not save notes in this browser. Check private mode / storage settings.';
    return false;
  }
}

export function upsertNote(notes: ScribeDocument[], note: ScribeDocument): ScribeDocument[] {
  const idx = notes.findIndex((n) => n.id === note.id);
  const next = idx >= 0 ? notes.map((n, i) => (i === idx ? note : n)) : [note, ...notes];
  saveNotes(next);
  return next;
}

export function removeNote(notes: ScribeDocument[], id: string): ScribeDocument[] {
  const next = notes.filter((n) => n.id !== id);
  saveNotes(next);
  return next;
}

export function removeSession(notes: ScribeDocument[], sessionId: string): ScribeDocument[] {
  const next = notes.filter((n) => n.sessionId !== sessionId);
  saveNotes(next);
  return next;
}
