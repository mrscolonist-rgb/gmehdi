import { useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import type { EhrContext } from '../types.ts';
import { extractEhr } from '../api.ts';
import { captureBpWindow, ehrSummaryLine } from '../utils/screenCapture.ts';

interface Props {
  ehr: EhrContext | null;
  onChange: (ehr: EhrContext | null) => void;
}

export function BpScreenCapture({ ehr, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function capture() {
    setError('');
    setBusy(true);
    try {
      const image = await captureBpWindow();
      const extracted = await extractEhr(image);
      onChange(extracted);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Screen capture failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full min-h-[148px] flex-col rounded-xl border border-stone-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Best Practice screen</p>
          <p className="text-xs text-stone-500">
            Optional. Share BP Premier window — still frame to Gemini Vision.
          </p>
        </div>
        {ehr ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-stone-400 hover:text-stone-700"
            aria-label="Clear BP capture"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {ehr ? (
        <p className="mt-2 line-clamp-3 text-xs text-emerald-800">{ehrSummaryLine(ehr)}</p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
        <button
          type="button"
          onClick={() => void capture()}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm hover:bg-stone-50 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          {ehr ? 'Recapture BP' : 'Capture BP window'}
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
