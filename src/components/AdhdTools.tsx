import { RotateCcw } from 'lucide-react';
import type { AsrsAnswers } from '../data/asrs.ts';
import type { AdhdToolsState } from '../types.ts';
import { AsrsTool } from './AsrsTool.tsx';

interface Props {
  value: AdhdToolsState | null | undefined;
  onChange: (next: AdhdToolsState) => void;
}

export function AdhdTools({ value, onChange }: Props) {
  const asrs: AsrsAnswers = value?.asrs || {};
  const hasAsrs = Object.keys(asrs).length > 0;

  return (
    <section className="rounded-xl border border-emerald-200 bg-white p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-stone-900">ADHD assessment tools</h2>
          <p className="text-[11px] text-stone-500">
            Click through during the consult. Scores sync into Assessment and Outcome Tools as plain
            numbers only.
          </p>
        </div>
        {hasAsrs ? (
          <button
            type="button"
            onClick={() => onChange({ ...value, asrs: {} })}
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800"
          >
            <RotateCcw className="h-3 w-3" />
            Clear ASRS
          </button>
        ) : null}
      </div>
      <AsrsTool answers={asrs} onChange={(next) => onChange({ ...value, asrs: next })} />
    </section>
  );
}
