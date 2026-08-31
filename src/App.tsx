import { useEffect, useState } from 'react';
import { Header } from './components/Header.tsx';
import { Studio, type StudioMode, type StudioSubmit } from './components/Studio.tsx';
import { NoteEditor } from './components/NoteEditor.tsx';
import { Library } from './components/Library.tsx';
import { fetchHealth } from './api.ts';
import { loadNotes, removeNote, removeSession, saveNotes, upsertNote } from './storage.ts';
import { assembleNote, mergeTranscript, structureFromTranscript, transcribeBlobs } from './pipeline.ts';
import { renameSession, syncSessionTranscript } from './sessions.ts';
import { isReferralTemplate, templateById } from './data/templates.ts';
import type { HealthStatus, ScribeDocument, TemplateId } from './types.ts';

export default function App() {
  const [notes, setNotes] = useState<ScribeDocument[]>(() => loadNotes());
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [view, setView] = useState<'studio' | 'editor'>('studio');
  const [studioMode, setStudioMode] = useState<StudioMode>('new');
  const [resume, setResume] = useState<ScribeDocument | null>(null);
  const [deriveTemplateId, setDeriveTemplateId] = useState<TemplateId | null>(null);
  const [library, setLibrary] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const current = notes.find((n) => n.id === currentId) || null;
  const siblingIds = current
    ? notes.filter((n) => n.sessionId === current.sessionId).map((n) => n.templateId)
    : [];

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => setHealth({ status: 'error', hasApiKey: false }));
  }, []);

  function persist(note: ScribeDocument) {
    setNotes((prev) => upsertNote(prev, note));
    setCurrentId(note.id);
  }

  function newSession() {
    setResume(null);
    setDeriveTemplateId(null);
    setStudioMode('new');
    setError('');
    setView('studio');
  }

  function openDerive(source: ScribeDocument, templateId: TemplateId) {
    setResume(source);
    setDeriveTemplateId(templateId);
    setStudioMode('derive');
    setLibrary(false);
    setError('');
    setView('studio');
  }

  async function generateSibling(source: ScribeDocument, templateId: TemplateId) {
    setError('');
    setLibrary(false);
    if (isReferralTemplate(templateId)) {
      openDerive(source, templateId);
      return;
    }
    const t = templateById(templateId);
    try {
      setBusy(`Structuring ${t.label}…`);
      const structured = await structureFromTranscript({
        transcript: source.transcript,
        templateId,
        assistanceDegree: t.defaultAssistance,
        detailLevel: t.defaultDetail,
        ehrContext: source.ehrContext,
        patientContext: source.patientContext,
        referral: null,
      });
      const note = assembleNote({
        sessionId: source.sessionId,
        sessionName: source.sessionName,
        templateId,
        assistanceDegree: t.defaultAssistance,
        detailLevel: t.defaultDetail,
        transcript: source.transcript,
        patientContext: source.patientContext,
        ehrContext: source.ehrContext,
        referral: null,
        audioDurationSec: source.audioDurationSec,
        structured,
      });
      persist(note);
      setResume(null);
      setDeriveTemplateId(null);
      setStudioMode('new');
      setView('editor');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate document');
      setView('editor');
      setCurrentId(source.id);
    } finally {
      setBusy('');
    }
  }

  async function run(draft: StudioSubmit) {
    setError('');
    if (!draft.sessionName.trim()) {
      setError('Enter a session name first.');
      return;
    }
    try {
      let transcript =
        draft.mode === 'derive' ? draft.prior?.transcript || '' : draft.paste.trim();
      let duration = draft.prior?.audioDurationSec || 0;

      if (draft.mode !== 'derive' && draft.audio?.blobs.length) {
        transcript = await transcribeBlobs(draft.audio.blobs, draft.audio.mimeType, (i, n) =>
          setBusy(`Transcribing chunk ${i} of ${n}…`),
        );
        duration += draft.audio.durationSec;
      }
      if (draft.mode === 'resume') {
        transcript = mergeTranscript(draft.prior?.transcript || '', transcript);
      }
      if (!transcript) throw new Error('No transcript. Record, upload, or paste dialogue.');

      setBusy(isReferralTemplate(draft.templateId) ? 'Generating referral letter…' : 'Structuring note…');
      const structured = await structureFromTranscript({
        transcript,
        templateId: draft.templateId,
        assistanceDegree: draft.assistance,
        detailLevel: draft.detail,
        ehrContext: draft.ehr,
        patientContext: draft.patientContext,
        referral: draft.referral,
      });

      const replaceId = draft.mode === 'resume' ? draft.prior?.id : undefined;
      const note = assembleNote({
        id: replaceId,
        sessionId: draft.prior?.sessionId,
        sessionName: draft.sessionName,
        createdAt: draft.mode === 'resume' ? draft.prior?.createdAt : undefined,
        templateId: draft.templateId,
        assistanceDegree: draft.assistance,
        detailLevel: draft.detail,
        transcript,
        patientContext: draft.patientContext,
        ehrContext: draft.ehr,
        referral: draft.referral,
        audioDurationSec: duration,
        structured,
      });

      if (draft.mode === 'resume' && note.sessionId) {
        setNotes((prev) => {
          const synced = syncSessionTranscript(prev, note.sessionId, transcript, duration);
          return upsertNote(synced, note);
        });
        setCurrentId(note.id);
      } else {
        persist(note);
      }
      setResume(null);
      setDeriveTemplateId(null);
      setStudioMode('new');
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
      {busy && view === 'editor' ? (
        <p className="bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-900">{busy}</p>
      ) : null}
      {error && view === 'editor' ? (
        <p className="bg-red-50 px-4 py-2 text-center text-sm text-red-700">{error}</p>
      ) : null}
      {view === 'studio' || !current ? (
        <Studio
          mode={studioMode}
          prior={resume}
          preferredTemplateId={deriveTemplateId}
          busy={busy}
          error={error}
          onSubmit={(d) => void run(d)}
        />
      ) : (
        <NoteEditor
          doc={current}
          siblingTemplateIds={siblingIds}
          onChange={persist}
          onRenameSession={(name) => {
            const next = renameSession(notes, current.sessionId, name);
            saveNotes(next);
            setNotes(next);
          }}
          onResume={() => {
            setResume(current);
            setStudioMode('resume');
            setView('studio');
          }}
          onGenerateAnother={(templateId) => void generateSibling(current, templateId)}
        />
      )}
      {library ? (
        <Library
          notes={notes}
          onClose={() => setLibrary(false)}
          onOpen={(id) => {
            setCurrentId(id);
            setResume(null);
            setStudioMode('new');
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
          onDeleteSession={(sessionId) => {
            setNotes((prev) => removeSession(prev, sessionId));
            if (current?.sessionId === sessionId) {
              setCurrentId(null);
              setView('studio');
            }
          }}
          onGenerateAnother={(sourceId, templateId) => {
            const source = notes.find((n) => n.id === sourceId);
            if (source) void generateSibling(source, templateId);
          }}
        />
      ) : null}
    </div>
  );
}
