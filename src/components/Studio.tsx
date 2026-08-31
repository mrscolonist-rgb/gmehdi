import { useEffect, useState } from 'react';
import type {
  AssistanceDegree,
  DetailLevel,
  EhrContext,
  ReferralOptions,
  ScribeDocument,
  TemplateId,
} from '../types.ts';
import { isReferralTemplate, templateById } from '../data/templates.ts';
import { suggestSessionName } from '../sessions.ts';
import { TemplatePicker } from './TemplatePicker.tsx';
import { PatientContext } from './PatientContext.tsx';
import { BpScreenCapture } from './BpScreenCapture.tsx';
import { Recorder } from './Recorder.tsx';
import { EMPTY_REFERRAL, ReferralFields, referralReady } from './ReferralFields.tsx';

export type StudioMode = 'new' | 'resume' | 'derive';

export interface StudioSubmit {
  templateId: TemplateId;
  assistance: AssistanceDegree;
  detail: DetailLevel;
  patientContext: string;
  ehr: EhrContext | null;
  paste: string;
  sessionName: string;
  referral: ReferralOptions | null;
  /** Extra seconds from the recording just transcribed (added onto prior on resume). */
  addedDurationSec: number;
  prior?: ScribeDocument | null;
  mode: StudioMode;
}

interface Props {
  mode?: StudioMode;
  prior?: ScribeDocument | null;
  preferredTemplateId?: TemplateId | null;
  busy: string;
  error: string;
  onTranscribe: (blobs: Blob[], mimeType: string) => Promise<string>;
  onSubmit: (draft: StudioSubmit) => void;
}

export function Studio({
  mode = 'new',
  prior,
  preferredTemplateId = null,
  busy,
  error,
  onTranscribe,
  onSubmit,
}: Props) {
  const seed = prior ? templateById(prior.templateId) : templateById('hp_brief');
  const initialId = preferredTemplateId || (mode === 'derive' ? 'gpccmp' : seed.id);
  const [sessionName, setSessionName] = useState(
    prior?.sessionName || suggestSessionName(prior?.ehrContext?.patientName),
  );
  const [templateId, setTemplateId] = useState<TemplateId>(initialId);
  const [assistance, setAssistance] = useState<AssistanceDegree>(
    templateById(initialId).defaultAssistance,
  );
  const [detail, setDetail] = useState<DetailLevel>(templateById(initialId).defaultDetail);
  const [patientContext, setPatientContext] = useState(prior?.patientContext || '');
  const [ehr, setEhr] = useState<EhrContext | null>(prior?.ehrContext || null);
  const [paste, setPaste] = useState('');
  const [addedDurationSec, setAddedDurationSec] = useState(0);
  const [localBusy, setLocalBusy] = useState('');
  const [referral, setReferral] = useState<ReferralOptions>(
    prior?.referral || EMPTY_REFERRAL,
  );

  const busyMsg = busy || localBusy;

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

  const letter = isReferralTemplate(templateId);
  const sourceForReasons =
    mode === 'derive' ? prior?.transcript || '' : paste || prior?.transcript || '';

  function draft(): StudioSubmit {
    return {
      templateId,
      assistance: letter ? 'pure_scribe' : assistance,
      detail: letter ? 'concise' : detail,
      patientContext,
      ehr,
      paste,
      sessionName: sessionName.trim(),
      referral: letter ? referral : null,
      addedDurationSec,
      prior,
      mode,
    };
  }

  async function handleAudio(blobs: Blob[], mimeType: string, durationSec: number) {
    setLocalBusy('Transcribing audio…');
    try {
      const text = await onTranscribe(blobs, mimeType);
      if (!text.trim()) throw new Error('Transcription returned empty text.');
      setPaste(text);
      setAddedDurationSec(durationSec);
    } catch (e) {
      setPaste('');
      setAddedDurationSec(0);
      throw e;
    } finally {
      setLocalBusy('');
    }
  }

  const nameOk = sessionName.trim().length > 0;
  const refOk = !letter || referralReady(templateId, referral);
  const hasSource =
    mode === 'derive' ? Boolean(prior?.transcript) : Boolean(paste.trim());
  const canGenerate = !busyMsg && nameOk && refOk && hasSource;
  const canRecord = !busyMsg && nameOk && mode !== 'derive';
  const templateLocked = mode === 'resume' || Boolean(busyMsg);

  const heading =
    mode === 'resume'
      ? 'Resume recording'
      : mode === 'derive'
        ? 'Another document from this session'
        : 'New consult';

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div>
        <h1 className="text-xl font-semibold">{heading}</h1>
        <p className="text-sm text-stone-600">
          {mode === 'derive'
            ? 'Uses the existing transcript. Choose a template, then Generate.'
            : '1) Name the session → 2) Record / upload / paste → 3) Stop transcribes only → 4) Choose template (and referral reason if needed) → 5) Generate.'}
        </p>
      </div>

      <label className="block text-sm">
        <span className="font-medium">Session name</span>
        <span className="ml-1 text-stone-500">(required)</span>
        <input
          type="text"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          disabled={Boolean(busyMsg)}
          className="mt-1 w-full rounded-lg border border-stone-200 p-2.5 text-base font-medium"
          placeholder="e.g. Arthur Pendelton — T2DM review"
          autoFocus={mode === 'new'}
        />
      </label>

      {mode !== 'derive' ? (
        <>
          <Recorder
            disabled={!canRecord}
            onAudio={(blobs, mimeType, durationSec) => {
              void handleAudio(blobs, mimeType, durationSec).catch((e) => {
                alert(e instanceof Error ? e.message : 'Transcription failed');
              });
            }}
          />
          <label className="block text-sm">
            <span className="font-medium">Transcript</span>
            <span className="ml-1 text-stone-500">
              (filled after Stop / upload, or paste manually)
            </span>
            <textarea
              rows={6}
              value={paste}
              onChange={(e) => {
                setPaste(e.target.value);
                if (!e.target.value.trim()) setAddedDurationSec(0);
              }}
              className="mt-1 w-full rounded-lg border border-stone-200 p-2 font-mono text-xs"
              placeholder="After you stop recording, the transcript appears here…"
            />
          </label>
          {paste.trim() ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              {mode === 'resume'
                ? `New audio segment transcribed (${paste.trim().length} chars). Generate will append it to the existing session transcript.`
                : `Transcript ready (${paste.trim().length} characters).`}{' '}
              Choose the template below
              {letter ? ', pick specialty and referral reason,' : ','} then press <strong>Generate</strong>.
            </p>
          ) : null}
        </>
      ) : (
        <p className="rounded-lg bg-stone-100 px-3 py-2 text-xs text-stone-600">
          Source transcript: {prior?.transcript?.length || 0} characters · session kept as-is
        </p>
      )}

      <TemplatePicker value={templateId} disabled={templateLocked} onChange={pickTemplate} />
      {letter ? (
        <ReferralFields
          templateId={templateId}
          value={referral}
          sourceText={sourceForReasons}
          patientContext={patientContext}
          disabled={Boolean(busyMsg)}
          onChange={setReferral}
        />
      ) : null}
      {mode !== 'derive' ? <BpScreenCapture ehr={ehr} onChange={setEhr} /> : null}
      {mode !== 'derive' || letter ? (
        <PatientContext value={patientContext} onChange={setPatientContext} />
      ) : null}
      {!letter ? (
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
      ) : null}

      <button
        type="button"
        disabled={!canGenerate}
        onClick={() => onSubmit(draft())}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {letter ? 'Generate referral letter' : 'Generate note'}
      </button>
      {!nameOk ? (
        <p className="text-sm text-amber-800">Enter a session name before recording.</p>
      ) : null}
      {nameOk && !hasSource && mode !== 'derive' ? (
        <p className="text-sm text-stone-500">
          Pause only pauses the mic. Stop finishes the recording and runs transcription — it does not
          generate the note yet.
        </p>
      ) : null}
      {nameOk && hasSource && !refOk ? (
        <p className="text-sm text-amber-800">
          Fill specialty and{' '}
          {templateId === 'referral_continuing' ? 'continuing condition' : 'referral reason'}.
        </p>
      ) : null}
      {busyMsg ? <p className="text-sm text-emerald-800">{busyMsg}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
