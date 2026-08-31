import type { ScribeDocument } from './types.ts';

const KEY = 'myscribe_notes_v1';

export function loadNotes(): ScribeDocument[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScribeDocument[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes: ScribeDocument[]): void {
  localStorage.setItem(KEY, JSON.stringify(notes));
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
