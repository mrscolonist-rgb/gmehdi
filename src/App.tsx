import { useEffect, useState } from 'react';
import { Header } from './components/Header.tsx';
import { Studio, type StudioSubmit } from './components/Studio.tsx';
import { NoteEditor } from './components/NoteEditor.tsx';
import { Library } from './components/Library.tsx';
import { fetchHealth } from './api.ts';
import { loadNotes, removeNote, upsertNote } from './storage.ts';
import { assembleNote, mergeTranscript, structureFromTranscript, transcribeBlobs } from './pipeline.ts';
import type { HealthStatus, ScribeDocument } from './types.ts';

export default function App() {
  const [notes, setNotes] = useState<ScribeDocument[]>(() => loadNotes());
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [view, setView] = useState<'studio' | 'editor'>('studio');
  const [resume, setResume] = useState<ScribeDocument | null>(null);
  const [library, setLibrary] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const current = notes.find((n) => n.id === currentId) || null;

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => setHealth({ status: 'error', hasApiKey: false }));
  }, []);

  function persist(note: ScribeDocument) {
    setNotes((prev) => upsertNote(prev, note));
    setCurrentId(note.id);
  }

  function newSession() {
    setResume(null);
    setError('');
    setView('studio');
  }

  async function run(draft: StudioSubmit) {
    setError('');
    try {
      let transcript = draft.paste.trim();
      let duration = draft.prior?.audioDurationSec || 0;
      if (draft.audio?.blobs.length) {
        transcript = await transcribeBlobs(draft.audio.blobs, draft.audio.mimeType, (i, n) =>
          setBusy(`Transcribing chunk ${i} of ${n}…`),
        );
        duration += draft.audio.durationSec;
      }
      transcript = mergeTranscript(draft.prior?.transcript || '', transcript);
      if (!transcript) throw new Error('No transcript. Record, upload, or paste dialogue.');

      setBusy('Structuring note…');
      const structured = await structureFromTranscript({
        transcript,
        templateId: draft.templateId,
        assistanceDegree: draft.assistance,
        detailLevel: draft.detail,
        ehrContext: draft.ehr,
        patientContext: draft.patientContext,
      });
      const note = assembleNote({
        id: draft.prior?.id,
        createdAt: draft.prior?.createdAt,
        templateId: draft.templateId,
        assistanceDegree: draft.assistance,
        detailLevel: draft.detail,
        transcript,
        patientContext: draft.patientContext,
        ehrContext: draft.ehr,
        audioDurationSec: duration,
        structured,
      });
      persist(note);
      setResume(null);
      setView('editor');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate note');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        hasNote={view === 'editor'}
        noteCount={notes.length}
        health={health}
        onNew={newSession}
        onLibrary={() => setLibrary(true)}
      />
      {view === 'studio' || !current ? (
        <Studio prior={resume} busy={busy} error={error} onSubmit={(d) => void run(d)} />
      ) : (
        <NoteEditor
          doc={current}
          onChange={persist}
          onResume={() => {
            setResume(current);
            setView('studio');
          }}
        />
      )}
      {library ? (
        <Library
          notes={notes}
          onClose={() => setLibrary(false)}
          onOpen={(id) => {
            setCurrentId(id);
            setResume(null);
            setView('editor');
            setLibrary(false);
          }}
          onDelete={(id) => {
            setNotes((prev) => removeNote(prev, id));
            if (currentId === id) {
              setCurrentId(null);
              setView('studio');
            }
          }}
        />
      ) : null}
    </div>
  );
}
