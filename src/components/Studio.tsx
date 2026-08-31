import { useState } from 'react';
import type { AssistanceDegree, DetailLevel, EhrContext, ScribeDocument, TemplateId } from '../types.ts';
import { templateById } from '../data/templates.ts';
import { TemplatePicker } from './TemplatePicker.tsx';
import { PatientContext } from './PatientContext.tsx';
import { BpScreenCapture } from './BpScreenCapture.tsx';
import { Recorder } from './Recorder.tsx';

interface Draft {
  templateId: TemplateId;
  assistance: AssistanceDegree;
  detail: DetailLevel;
  patientContext: string;
  ehr: EhrContext | null;
  paste: string;
  audio: { blobs: Blob[]; mimeType: string; durationSec: number } | null;
}

export interface StudioSubmit extends Draft {
  prior?: ScribeDocument | null;
}

interface Props {
  prior?: ScribeDocument | null;
  busy: string;
  error: string;
  onSubmit: (draft: StudioSubmit) => void;
}

export function Studio({ prior, busy, error, onSubmit }: Props) {
  const seed = prior ? templateById(prior.templateId) : templateById('hp_brief');
  const [templateId, setTemplateId] = useState<TemplateId>(seed.id);
  const [assistance, setAssistance] = useState<AssistanceDegree>(
    prior?.assistanceDegree || seed.defaultAssistance,
  );
  const [detail, setDetail] = useState<DetailLevel>(prior?.detailLevel || seed.defaultDetail);
  const [patientContext, setPatientContext] = useState(prior?.patientContext || '');
  const [ehr, setEhr] = useState<EhrContext | null>(prior?.ehrContext || null);
  const [paste, setPaste] = useState('');

  function pickTemplate(id: TemplateId) {
    setTemplateId(id);
    const t = templateById(id);
    setAssistance(t.defaultAssistance);
    setDetail(t.defaultDetail);
  }

  function draft(audio: Draft['audio'] = null): StudioSubmit {
    return { templateId, assistance, detail, patientContext, ehr, paste, audio, prior };
  }

  const locked = Boolean(prior) || Boolean(busy);

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div>
        <h1 className="text-xl font-semibold">{prior ? 'Resume recording' : 'New consult'}</h1>
        <p className="text-sm text-stone-600">
          {prior
            ? 'New audio is transcribed and appended, then the same note is re-structured.'
            : 'Pick a template, optionally capture Best Practice, then record, upload, or paste a transcript.'}
        </p>
      </div>
      <TemplatePicker value={templateId} disabled={locked} onChange={pickTemplate} />
      <BpScreenCapture ehr={ehr} onChange={setEhr} />
      <PatientContext value={patientContext} onChange={setPatientContext} />
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
      <Recorder disabled={Boolean(busy)} onAudio={(blobs, mimeType, durationSec) => onSubmit(draft({ blobs, mimeType, durationSec }))} />
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
      <button
        type="button"
        disabled={Boolean(busy) || !paste.trim()}
        onClick={() => onSubmit(draft(null))}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        Structure pasted transcript
      </button>
      {busy ? <p className="text-sm text-emerald-800">{busy}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
