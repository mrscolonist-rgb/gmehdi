import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  COLLATERAL_OPTIONS,
  DSM5_HYPER_IMPULSE,
  DSM5_INATTENTION,
  emptyDsm5CriteriaA,
  scoreDsm5CriteriaA,
  type CollateralId,
  type Dsm5CriteriaAState,
  type Dsm5Symptom,
} from '../data/dsm5CriteriaA.ts';

interface Props {
  value: Dsm5CriteriaAState | null | undefined;
  onChange: (next: Dsm5CriteriaAState) => void;
}

function CheckRow({
  item,
  checked,
  onToggle,
}: {
  item: Dsm5Symptom;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-stone-100 bg-stone-50/50 px-2.5 py-2 text-xs text-stone-800 hover:border-stone-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-stone-300"
      />
      <span>{item.text}</span>
    </label>
  );
}

export function Dsm5SymptomChecklist({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const state = value || emptyDsm5CriteriaA();
  const totals = scoreDsm5CriteriaA(state);
  const hyper = DSM5_HYPER_IMPULSE.filter((s) => s.group === 'hyperactivity');
  const impulse = DSM5_HYPER_IMPULSE.filter((s) => s.group === 'impulsivity');

  function patch(next: Dsm5CriteriaAState) {
    onChange(next);
  }

  function toggleCollateral(id: CollateralId) {
    const cur = new Set(state.collateral);
    if (id === 'none') {
      patch({ ...state, collateral: cur.has('none') ? [] : ['none'] });
      return;
    }
    cur.delete('none');
    if (cur.has(id)) cur.delete(id);
    else cur.add(id);
    patch({ ...state, collateral: [...cur] as CollateralId[] });
  }

  function toggleSymptom(id: string) {
    patch({
      ...state,
      checked: { ...state.checked, [id]: !state.checked[id] },
    });
  }

  return (
    <div className="rounded-lg border border-stone-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold"
      >
        <span>
          Symptom checklist (DSM-5 Criteria A)
          {totals.inattention + totals.hyperImpulsive > 0 ? (
            <span className="ml-2 text-xs font-normal text-stone-500">
              {totals.inattention}/9 · {totals.hyperImpulsive}/9
            </span>
          ) : (
            <span className="ml-2 text-xs font-normal text-stone-400">Optional</span>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open ? (
        <div className="space-y-4 border-t border-stone-100 p-3">
          <p className="text-[11px] text-stone-500">
            Optional. This is DSM-5 Criterion A. Ticked symptoms sync into Diagnostic Impression —
            not Assessment Tools. Adult domain threshold ≥5 (as on the form). Unticked items stay out
            of the note.
          </p>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-stone-700">
              Collateral information obtained?
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COLLATERAL_OPTIONS.map((opt) => {
                const on = state.collateral.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleCollateral(opt.id)}
                    className={`rounded-full border px-2 py-0.5 text-[11px] ${
                      on
                        ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-950'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              A. Inattention symptoms
            </p>
            <div className="mt-2 space-y-1.5">
              {DSM5_INATTENTION.map((item) => (
                <CheckRow
                  key={item.id}
                  item={item}
                  checked={Boolean(state.checked[item.id])}
                  onToggle={() => toggleSymptom(item.id)}
                />
              ))}
            </div>
            <p className="mt-2 rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white">
              Inattention total: {totals.inattention} / {totals.inattentionMax}
              <span className="ml-2 text-xs font-normal text-stone-300">
                {totals.inattentionMet ? 'Domain ≥5' : 'Domain <5'}
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              B. Hyperactivity / impulsivity symptoms
            </p>
            <p className="mt-2 text-[11px] font-medium text-stone-500">Hyperactivity</p>
            <div className="mt-1 space-y-1.5">
              {hyper.map((item) => (
                <CheckRow
                  key={item.id}
                  item={item}
                  checked={Boolean(state.checked[item.id])}
                  onToggle={() => toggleSymptom(item.id)}
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] font-medium text-stone-500">Impulsivity</p>
            <div className="mt-1 space-y-1.5">
              {impulse.map((item) => (
                <CheckRow
                  key={item.id}
                  item={item}
                  checked={Boolean(state.checked[item.id])}
                  onToggle={() => toggleSymptom(item.id)}
                />
              ))}
            </div>
            <p className="mt-2 rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white">
              Hyperactivity/Impulsivity total: {totals.hyperImpulsive} /{' '}
              {totals.hyperImpulsiveMax}
              <span className="ml-2 text-xs font-normal text-stone-300">
                {totals.hyperImpulsiveMet ? 'Domain ≥5' : 'Domain <5'}
              </span>
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
            <p className="font-semibold text-stone-900">Criterion A summary</p>
            <p className="mt-1 text-xs text-stone-700">
              Inattention: {totals.inattention} / 9 · Hyperactivity/Impulsivity:{' '}
              {totals.hyperImpulsive} / 9
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span
                className={`rounded-full border px-2 py-0.5 ${
                  totals.criterionAMet && totals.inattention + totals.hyperImpulsive > 0
                    ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-950'
                    : 'border-stone-200 text-stone-500'
                }`}
              >
                Criterion A Met (≥5 in at least one domain)
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 ${
                  !totals.criterionAMet && totals.inattention + totals.hyperImpulsive > 0
                    ? 'border-amber-500 bg-amber-50 font-semibold text-amber-950'
                    : 'border-stone-200 text-stone-500'
                }`}
              >
                Criterion A Not Met
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
