import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DifferentialConditionCard } from './DifferentialConditionCard.tsx';
import { SafetyVitalsFields } from './SafetyVitals.tsx';
import {
  ALL_SAFETY_GROUPS,
  emptySafety,
  safetyHasContent,
  type SafetyState,
} from '../data/safety.ts';
import { emptyDiffEntry, type DiffEntry } from '../data/differential.ts';
import { emptySafetyVitals } from '../data/safetyVitals.ts';

interface Props {
  value: SafetyState | null | undefined;
  onChange: (next: SafetyState) => void;
}

function active(e: DiffEntry): boolean {
  return e.on || e.chips.length > 0 || Object.values(e.texts).some((t) => t.trim());
}

export function SafetyAssessment({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const state: SafetyState = value
    ? { entries: value.entries || {}, vitals: value.vitals || emptySafetyVitals() }
    : emptySafety();
  const used = safetyHasContent(state);
  const count = Object.values(state.entries).filter(active).length;

  function setEntry(id: string, next: DiffEntry) {
    const entries = { ...state.entries, [id]: next };
    if (id === 'cardiac_no_risk' && active(next)) {
      entries.cardiac_risk_present = emptyDiffEntry();
      entries.cardiac_plan = emptyDiffEntry();
    }
    if ((id === 'cardiac_risk_present' || id === 'cardiac_plan') && active(next)) {
      entries.cardiac_no_risk = emptyDiffEntry();
    }
    onChange({ ...state, entries });
  }

  return (
    <div className="rounded-lg border border-stone-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold"
      >
        <span>
          Pre-treatment safety assessment
          {used ? (
            <span className="ml-2 text-xs font-normal text-stone-500">
              {count ? `${count} noted` : 'Vitals noted'}
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
            Optional. Fill what you assessed this session before considering stimulant. Nothing here
            is required. Syncs into the note as a plain safety checklist.
          </p>
          <SafetyVitalsFields
            value={state.vitals}
            onChange={(vitals) => onChange({ ...state, vitals })}
          />
          {ALL_SAFETY_GROUPS.map((group) => (
            <div key={group.id} className="space-y-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  {group.title}
                </p>
                {group.subtitle ? (
                  <p className="text-[11px] text-stone-500">{group.subtitle}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                {group.conditions.map((cond) => (
                  <DifferentialConditionCard
                    key={cond.id}
                    condition={cond}
                    value={state.entries[cond.id]}
                    onChange={(next) => setEntry(cond.id, next)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
