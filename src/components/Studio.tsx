import { useEffect, useState } from 'react';
import type {
  AdhdToolsState,
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
import { AdhdToolsPanel } from './AdhdToolsPanel.tsx';
import { StudioFoot } from './StudioFoot.tsx';
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
  /** ADHD tools filled during the consult (slide-over); applied when template is Adult ADHD. */
  tools: AdhdToolsState | null;
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
  const [tools, setTools] = useState<AdhdToolsState | null>(prior?.tools || null);
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
      tools,
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
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 pb-24">
      <AdhdToolsPanel
        available={mode !== 'derive'}
        value={tools}
        onChange={setTools}
      />
      <h1 className="text-xl font-semibold">{heading}</h1>

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
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:items-stretch">
            <Recorder
              disabled={!canRecord}
              onAudio={(blobs, mimeType, durationSec) => {
                void handleAudio(blobs, mimeType, durationSec).catch((e) => {
                  alert(e instanceof Error ? e.message : 'Transcription failed');
                });
              }}
            />
            <BpScreenCapture ehr={ehr} onChange={setEhr} />
          </div>
          <label className="block text-sm">
            <span className="font-medium">Transcript</span>
            <span className="ml-1 text-stone-500">
              (after Stop &amp; transcribe, or paste)
            </span>
            <textarea
              rows={4}
              value={paste}
              onChange={(e) => {
                setPaste(e.target.value);
                if (!e.target.value.trim()) setAddedDurationSec(0);
              }}
              className="mt-1 w-full rounded-lg border border-stone-200 p-2 font-mono text-xs"
              placeholder="Transcript appears here after you stop recording…"
            />
          </label>
          {paste.trim() ? (
            <p className="text-xs text-emerald-900">
              {mode === 'resume'
                ? `New segment ready (${paste.trim().length} chars) — Generate appends it to the session.`
                : `Transcript ready (${paste.trim().length} chars).`}{' '}
              Choose template below, then Generate.
            </p>
          ) : null}
        </div>
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

      <StudioFoot
        letter={letter}
        canGenerate={canGenerate}
        nameOk={nameOk}
        hasSource={hasSource}
        refOk={refOk}
        mode={mode}
        templateId={templateId}
        busyMsg={busyMsg}
        error={error}
        onGenerate={() => onSubmit(draft())}
      />
    </div>
  );
}
