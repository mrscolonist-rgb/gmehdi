import type { TemplateId } from '../types.ts';

interface Props {
  letter: boolean;
  canGenerate: boolean;
  nameOk: boolean;
  hasSource: boolean;
  refOk: boolean;
  mode: 'new' | 'resume' | 'derive';
  templateId: TemplateId;
  busyMsg: string;
  /** Transcription in progress — tip to fill tools/context in parallel. */
  transcribing?: boolean;
  error: string;
  onGenerate: () => void;
}

export function StudioFoot({
  letter,
  canGenerate,
  nameOk,
  hasSource,
  refOk,
  mode,
  templateId,
  busyMsg,
  transcribing = false,
  error,
  onGenerate,
}: Props) {
  return (
    <>
      <button
        type="button"
        disabled={!canGenerate}
        onClick={onGenerate}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {letter ? 'Generate referral letter' : 'Generate note'}
      </button>
      {!nameOk ? (
        <p className="text-sm text-amber-800">Enter a session name before recording.</p>
      ) : null}
      {transcribing ? (
        <p className="text-sm text-emerald-800">
          Transcription running. Keep using <span className="font-medium">ADHD tools</span> and{' '}
          <span className="font-medium">patient context</span> — they are saved into the note on
          Generate (Adult ADHD for tools).
        </p>
      ) : null}
      {nameOk && !hasSource && !transcribing && mode !== 'derive' ? (
        <p className="text-sm text-stone-500">
          Pause only pauses the mic. Stop &amp; transcribe fills the transcript only. While it runs
          (and while recording), open <span className="font-medium">ADHD tools</span> and patient
          context anytime.
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
    </>
  );
}
