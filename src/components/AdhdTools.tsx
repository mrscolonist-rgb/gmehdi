import { RotateCcw } from 'lucide-react';
import type { AsrsAnswers } from '../data/asrs.ts';
import { emptyDsm5CriteriaA, scoreDsm5CriteriaA } from '../data/dsm5CriteriaA.ts';
import type { AdhdToolsState } from '../types.ts';
import { AsrsTool } from './AsrsTool.tsx';
import { Dsm5SymptomChecklist } from './Dsm5SymptomChecklist.tsx';

interface Props {
  value: AdhdToolsState | null | undefined;
  onChange: (next: AdhdToolsState) => void;
}

export function AdhdTools({ value, onChange }: Props) {
  const asrs: AsrsAnswers = value?.asrs || {};
  const dsm5 = value?.dsm5 || emptyDsm5CriteriaA();
  const hasAsrs = Object.keys(asrs).length > 0;
  const hasDsm5 = scoreDsm5CriteriaA(dsm5).anyChecked;
  const hasAny = hasAsrs || hasDsm5;

  return (
    <section className="space-y-3 rounded-xl border border-emerald-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-stone-900">ADHD assessment tools</h2>
          <p className="text-[11px] text-stone-500">
            Click through during the consult. Scores sync into Assessment and Outcome Tools as plain
            numbers only.
          </p>
        </div>
        {hasAny ? (
          <button
            type="button"
            onClick={() => onChange({ asrs: {}, dsm5: emptyDsm5CriteriaA() })}
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800"
          >
            <RotateCcw className="h-3 w-3" />
            Clear tools
          </button>
        ) : null}
      </div>
      <AsrsTool answers={asrs} onChange={(next) => onChange({ ...value, asrs: next })} />
      <Dsm5SymptomChecklist
        value={dsm5}
        onChange={(next) => onChange({ ...value, dsm5: next })}
      />
    </section>
  );
}
