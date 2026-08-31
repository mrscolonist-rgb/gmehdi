import { useEffect, useState } from 'react';
import type { AssistanceDegree, DetailLevel, EhrContext, ScribeDocument, TemplateId } from '../types.ts';
import { templateById } from '../data/templates.ts';
import { suggestSessionName } from '../sessions.ts';
import { TemplatePicker } from './TemplatePicker.tsx';
import { PatientContext } from './PatientContext.tsx';
import { BpScreenCapture } from './BpScreenCapture.tsx';
import { Recorder } from './Recorder.tsx';

export type StudioMode = 'new' | 'resume' | 'derive';

interface Draft {
  templateId: TemplateId;
  assistance: AssistanceDegree;
  detail: DetailLevel;
  patientContext: string;
  ehr: EhrContext | null;
  paste: string;
  sessionName: string;
  audio: { blobs: Blob[]; mimeType: string; durationSec: number } | null;
}

export interface StudioSubmit extends Draft {
  prior?: ScribeDocument | null;
  mode: StudioMode;
  /** When derive: create a new note id but keep sessionId/name/transcript. */
  replaceNoteId?: string | null;
}

interface Props {
  mode?: StudioMode;
  prior?: ScribeDocument | null;
  busy: string;
  error: string;
  onSubmit: (draft: StudioSubmit) => void;
}

export function Studio({ mode = 'new', prior, busy, error, onSubmit }: Props) {
  const seed = prior ? templateById(prior.templateId) : templateById('hp_brief');
  const [sessionName, setSessionName] = useState(
    prior?.sessionName || suggestSessionName(prior?.ehrContext?.patientName),
  );
  const [templateId, setTemplateId] = useState<TemplateId>(
    mode === 'derive' ? 'gpccmp' : seed.id,
  );
  const [assistance, setAssistance] = useState<AssistanceDegree>(
    prior?.assistanceDegree || seed.defaultAssistance,
  );
  const [detail, setDetail] = useState<DetailLevel>(prior?.detailLevel || seed.defaultDetail);
  const [patientContext, setPatientContext] = useState(prior?.patientContext || '');
  const [ehr, setEhr] = useState<EhrContext | null>(prior?.ehrContext || null);
  const [paste, setPaste] = useState('');

  useEffect(() => {
    if (!prior && !sessionName.trim() && ehr?.patientName) {
      setSessionName(suggestSessionName(ehr.patientName));
    }
  }, [ehr?.patientName, prior, sessionName]);

  function pickTemplate(id: TemplateId) {
    setTemplateId(id);
    const t = templateById(id);
    setAssistance(t.defaultAssistance);
    setDetail(t.defaultDetail);
  }

  function draft(audio: Draft['audio'] = null): StudioSubmit {
    return {
      templateId,
      assistance,
      detail,
      patientContext,
      ehr,
      paste,
      sessionName: sessionName.trim(),
      audio,
      prior,
      mode,
      replaceNoteId: mode === 'resume' ? prior?.id : null,
    };
  }

  const nameOk = sessionName.trim().length > 0;
  const canStructurePaste =
    Boolean(busy) === false && nameOk && (mode === 'derive' ? Boolean(prior?.transcript) : Boolean(paste.trim()));
  const templateLocked = mode === 'resume' || Boolean(busy);

  const heading =
    mode === 'resume'
      ? 'Resume recording'
      : mode === 'derive'
        ? 'Another document from this session'
        : 'New consult';

  const blurb =
    mode === 'resume'
      ? 'New audio is transcribed and appended, then this note is re-structured. Other docs in the session keep the updated transcript.'
      : mode === 'derive'
        ? 'Uses the same transcript and session name. Pick a different template (e.g. GPCCMP after H&P).'
        : 'Name the session first so you can find it in the library. You can add more document types from the same consult later.';

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div>
        <h1 className="text-xl font-semibold">{heading}</h1>
        <p className="text-sm text-stone-600">{blurb}</p>
      </div>

      <label className="block text-sm">
        <span className="font-medium">Session name</span>
        <span className="ml-1 text-stone-500">(required — how this consult appears in the library)</span>
        <input
          type="text"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          disabled={Boolean(busy)}
          className="mt-1 w-full rounded-lg border border-stone-200 p-2.5 text-base font-medium"
          placeholder="e.g. Arthur Pendelton — T2DM review"
          autoFocus={mode === 'new'}
        />
      </label>

      <TemplatePicker value={templateId} disabled={templateLocked} onChange={pickTemplate} />
      {mode !== 'derive' ? <BpScreenCapture ehr={ehr} onChange={setEhr} /> : null}
      {mode !== 'derive' ? (
        <PatientContext value={patientContext} onChange={setPatientContext} />
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium">Assistance</span>
          <select
            className="mt-1 w-full rounded-lg border border-stone-200 p-2"
            value={assistance}
            onChange={(e) => setAssistance(e.target.value as AssistanceDegree)}
          >
            <option value="pure_scribe">Pure scribe</option>
            <option value="balanced">Balanced</option>
            <option value="senior_colleague">Senior colleague</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium">Detail</span>
          <select
            className="mt-1 w-full rounded-lg border border-stone-200 p-2"
            value={detail}
            onChange={(e) => setDetail(e.target.value as DetailLevel)}
          >
            <option value="concise">Concise</option>
            <option value="standard">Standard</option>
            <option value="comprehensive">Comprehensive</option>
          </select>
        </label>
      </div>

      {mode !== 'derive' ? (
        <>
          <Recorder
            disabled={Boolean(busy) || !nameOk}
            onAudio={(blobs, mimeType, durationSec) => onSubmit(draft({ blobs, mimeType, durationSec }))}
          />
          <label className="block text-sm">
            <span className="font-medium">Or paste a transcript</span>
            <textarea
              rows={6}
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 p-2 font-mono text-xs"
              placeholder="Paste consult dialogue…"
            />
          </label>
        </>
      ) : (
        <p className="rounded-lg bg-stone-100 px-3 py-2 text-xs text-stone-600">
          Source transcript: {prior?.transcript?.length || 0} characters · session kept as-is
        </p>
      )}

      <button
        type="button"
        disabled={!canStructurePaste}
        onClick={() => onSubmit(draft(null))}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {mode === 'derive' ? 'Generate this document' : 'Structure pasted transcript'}
      </button>
      {!nameOk ? <p className="text-sm text-amber-800">Enter a session name before recording or structuring.</p> : null}
      {busy ? <p className="text-sm text-emerald-800">{busy}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
