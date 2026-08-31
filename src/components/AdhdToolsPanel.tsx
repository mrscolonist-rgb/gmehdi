import { useState } from 'react';
import { ClipboardList, X } from 'lucide-react';
import type { AdhdToolsState } from '../types.ts';
import { adhdToolsHasContent } from '../utils/adhdToolsNote.ts';
import { AdhdTools } from './AdhdTools.tsx';

interface Props {
  value: AdhdToolsState | null | undefined;
  onChange: (next: AdhdToolsState) => void;
  /** Hide launcher (e.g. derive-only screens). */
  available?: boolean;
  /** Extra guidance (e.g. while transcription runs). */
  hint?: string;
}

/** Floating entry + right slide-over. Usable while recording or while STT runs. */
export function AdhdToolsPanel({ value, onChange, available = true, hint }: Props) {
  const [open, setOpen] = useState(false);
  if (!available) return null;
  const filled = adhdToolsHasContent(value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-emerald-800"
      >
        <ClipboardList className="h-4 w-4" />
        ADHD tools
        {filled ? (
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
            In use
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/30"
            aria-label="Close ADHD tools"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-stone-200 bg-stone-50 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-stone-200 bg-white px-3 py-2.5">
              <div>
                <p className="text-sm font-semibold text-stone-900">ADHD assessment tools</p>
                <p className="text-[11px] text-stone-500">
                  {hint ||
                    'Use while recording or while Stop & transcribe runs. Merges into Adult ADHD on Generate.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-stone-200 p-1.5 hover:bg-stone-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <AdhdTools value={value} onChange={onChange} />
            </div>
            <div className="border-t border-stone-200 bg-white p-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Done — return to consult
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
