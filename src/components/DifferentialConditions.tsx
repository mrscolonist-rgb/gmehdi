import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DifferentialConditionCard } from './DifferentialConditionCard.tsx';
import {
  DIFFERENTIAL_GROUPS,
  differentialHasContent,
  emptyDifferential,
  type DifferentialState,
} from '../data/differential.ts';

interface Props {
  value: DifferentialState | null | undefined;
  onChange: (next: DifferentialState) => void;
}

export function DifferentialConditions({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const state = value || emptyDifferential();
  const used = differentialHasContent(state);
  const count = Object.values(state.entries || {}).filter(
    (e) => e.on || e.chips.length > 0 || Object.values(e.texts).some((t) => t.trim()),
  ).length;

  return (
    <div className="rounded-lg border border-stone-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold"
      >
        <span>
          Differential &amp; co-occurring conditions
          {used ? (
            <span className="ml-2 text-xs font-normal text-stone-500">{count} noted</span>
          ) : (
            <span className="ml-2 text-xs font-normal text-stone-400">Optional</span>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open ? (
        <div className="space-y-4 border-t border-stone-100 p-3">
          <p className="text-[11px] text-stone-500">
            Optional. Tick only what you assess this session — can accumulate across a multi-session
            workup. Syncs into the note as plain findings (not a forced differential list).
          </p>
          {DIFFERENTIAL_GROUPS.map((group) => (
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
                    onChange={(next) =>
                      onChange({
                        ...state,
                        entries: { ...state.entries, [cond.id]: next },
                      })
                    }
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
