import { useEffect, useState } from 'react';
import { Header } from './components/Header.tsx';
import { Studio, type StudioMode, type StudioSubmit } from './components/Studio.tsx';
import { NoteEditor } from './components/NoteEditor.tsx';
import { Library } from './components/Library.tsx';
import { fetchHealth } from './api.ts';
import { loadNotes, removeNote, removeSession, saveNotes } from './storage.ts';
import { assembleNote, mergeTranscript, structureFromTranscript, transcribeBlobs } from './pipeline.ts';
import { buildSiblingDocument } from './generateSibling.ts';
import { upsertPersisted } from './persistNote.ts';
import { findSessionTools, renameSession } from './sessions.ts';
import { isReferralTemplate, templateById } from './data/templates.ts';
import type { HealthStatus, ScribeDocument, TemplateId } from './types.ts';

export default function App() {
  const [notes, setNotes] = useState<ScribeDocument[]>(() => loadNotes());
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [view, setView] = useState<'studio' | 'editor'>('studio');
  const [studioMode, setStudioMode] = useState<StudioMode>('new');
  const [resume, setResume] = useState<ScribeDocument | null>(null);
  const [deriveTemplateId, setDeriveTemplateId] = useState<TemplateId | null>(null);
  /** Bumps on each New session so Studio remounts with empty consult state. */
  const [studioEpoch, setStudioEpoch] = useState(0);
  const [library, setLibrary] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [health, setHealth] = useState<HealthStatus | null>(null);

  // Remount Studio when starting a fresh consult or switching resume/derive session.
  const studioKey =
    studioMode === 'new'
      ? `new-${studioEpoch}`
      : `${studioMode}-${resume?.sessionId || 'none'}-${deriveTemplateId || ''}`;

  const current = notes.find((n) => n.id === currentId) || null;
  const siblingIds = current
    ? notes.filter((n) => n.sessionId === current.sessionId).map((n) => n.templateId)
    : [];

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => setHealth({ status: 'error', hasApiKey: false }));
  }, []);

  function persist(note: ScribeDocument) {
    setNotes((prev) => {
      const { notes: next, saveError } = upsertPersisted(prev, note);
      if (saveError) queueMicrotask(() => setError(saveError));
      return next;
    });
    setCurrentId(note.id);
  }

  function newSession() {
    setResume(null);
    setDeriveTemplateId(null);
    setStudioMode('new');
    setCurrentId(null);
    setStudioEpoch((n) => n + 1);
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
    try {
      setBusy(`Structuring ${templateById(templateId).label}…`);
      const result = await buildSiblingDocument(notes, source, templateId);
      if (result.kind === 'referral') {
        openDerive(result.source, result.templateId);
        return;
      }
      persist(result.note);
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

  async function transcribeAudio(blobs: Blob[], mimeType: string): Promise<string> {
    setError('');
    try {
      return await transcribeBlobs(blobs, mimeType, (i, n) =>
        setBusy(`Transcribing chunk ${i} of ${n}…`),
      );
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
      let duration = draft.prior?.audioDurationSec || 0;
      duration += draft.addedDurationSec || 0;

      let transcript = '';
      if (draft.mode === 'derive') {
        transcript = draft.prior?.transcript || '';
      } else if (draft.mode === 'resume') {
        // paste holds the new segment (or pasted add-on); merge onto the prior session transcript.
        transcript = draft.paste.trim()
          ? mergeTranscript(draft.prior?.transcript || '', draft.paste.trim())
          : draft.prior?.transcript || '';
      } else {
        transcript = draft.paste.trim();
      }

      if (!transcript) throw new Error('No transcript. Record, upload, or paste dialogue first.');

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
      const sessionTools =
        draft.tools ||
        (draft.prior ? findSessionTools(notes, draft.prior.sessionId) : null) ||
        null;
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
        tools: sessionTools,
        structured,
      });

      // New consult → new sessionId. Resume/derive → same sessionId only.
      persist(note);
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
          key={studioKey}
          mode={studioMode}
          prior={resume}
          preferredTemplateId={deriveTemplateId}
          busy={busy}
          error={error}
          onTranscribe={transcribeAudio}
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
