import { getLastSaveError, saveNotes, upsertNote } from './storage.ts';
import { syncSessionConsult } from './sessions.ts';
import type { ScribeDocument } from './types.ts';

/**
 * Upsert one document, then mirror transcript / patient context / BP capture / ADHD tools
 * onto siblings that share the same sessionId only.
 */
export function upsertPersisted(
  prev: ScribeDocument[],
  note: ScribeDocument,
): { notes: ScribeDocument[]; saveError: string | null } {
  const withNote = upsertNote(prev, note);
  const next = syncSessionConsult(withNote, note.sessionId, {
    transcript: note.transcript,
    audioDurationSec: note.audioDurationSec,
    patientContext: note.patientContext,
    ehrContext: note.ehrContext,
    tools: note.tools || null,
  });
  saveNotes(next);
  return { notes: next, saveError: getLastSaveError() };
}
