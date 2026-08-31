import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ChipToggle } from './ChipToggle.tsx';
import { CriterionFlagRow } from './CriterionFlagRow.tsx';
import { Dsm5FormulationImpairment } from './Dsm5FormulationImpairment.tsx';
import {
  EXCLUSIONS,
  ONSET_EVIDENCE,
  SETTINGS,
  UNCERTAIN_REASONS,
  emptyDsm5Formulation,
  formulationHasContent,
  resolvedCriterionC,
  resolvedCriterionD,
  type Dsm5FormulationState,
  type FormulationPhase,
  type OnsetStatus,
} from '../data/dsm5Formulation.ts';

interface Props {
  value: Dsm5FormulationState | null | undefined;
  onChange: (next: Dsm5FormulationState) => void;
}

export function Dsm5Formulation({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const state = value || emptyDsm5Formulation();
  const used = formulationHasContent(state);
  const provisional = state.phase !== 'final';
  const c = resolvedCriterionC(state);
  const d = resolvedCriterionD(state);

  function patch(partial: Partial<Dsm5FormulationState>) {
    onChange({ ...state, ...partial });
  }

  function toggleId(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }

  function setPhase(phase: FormulationPhase) {
    patch({ phase });
  }

  function setOnset(onset: OnsetStatus) {
    patch({ onset: state.onset === onset ? null : onset });
  }

  return (
    <div className="rounded-lg border border-stone-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold"
      >
        <span>
          Diagnostic formulation (DSM-5 Criteria B–E)
          {used ? (
            <span className="ml-2 text-xs font-normal text-stone-500">
              {state.phase === 'final' ? 'Final session' : 'In progress'}
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
            Optional. Use across 2–3 sessions as evidence accumulates. Keep{' '}
            <strong>In progress</strong> until the last session when you give the diagnosis — only
            then mark <strong>Final diagnostic session</strong> for met/not-met language in the note.
          </p>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setPhase('in_progress')}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                state.phase === 'in_progress'
                  ? 'border-amber-500 bg-amber-50 font-semibold text-amber-950'
                  : 'border-stone-200 text-stone-600'
              }`}
            >
              In progress (multi-session)
            </button>
            <button
              type="button"
              onClick={() => setPhase('final')}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                state.phase === 'final'
                  ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-950'
                  : 'border-stone-200 text-stone-600'
              }`}
            >
              Final diagnostic session
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Criterion B — Age of onset
            </p>
            <p className="text-[11px] text-stone-500">
              Several symptoms present prior to age 12.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ['yes', 'Yes — clear childhood evidence'],
                  ['uncertain', 'Uncertain — limited childhood history'],
                  ['no', 'No — onset clearly after 12'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOnset(id)}
                  className={`rounded-full border px-2 py-0.5 text-[11px] ${
                    state.onset === id
                      ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-950'
                      : 'border-stone-200 text-stone-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {state.onset === 'yes' ? (
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-stone-600">Evidence source</p>
                <ChipToggle
                  options={[...ONSET_EVIDENCE]}
                  selected={state.onsetEvidence}
                  onToggle={(id) => patch({ onsetEvidence: toggleId(state.onsetEvidence, id) })}
                />
                <textarea
                  rows={2}
                  value={state.childhoodDescription}
                  onChange={(e) => patch({ childhoodDescription: e.target.value })}
                  placeholder="Describe childhood symptoms…"
                  className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                />
              </div>
            ) : null}
            {state.onset === 'uncertain' ? (
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-stone-600">Reasons</p>
                <ChipToggle
                  options={[...UNCERTAIN_REASONS]}
                  selected={state.uncertainReasons}
                  onToggle={(id) =>
                    patch({ uncertainReasons: toggleId(state.uncertainReasons, id) })
                  }
                />
                <p className="text-[11px] text-stone-500">
                  If adult presentation is compelling, consider Other Specified ADHD at the final
                  session.
                </p>
              </div>
            ) : null}
            {state.onset === 'no' ? (
              <p className="text-[11px] text-amber-800">
                ADHD diagnosis not supported on onset alone — consider late-onset attention problems.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Criterion C — Pervasiveness
            </p>
            <p className="text-[11px] text-stone-500">Settings where symptoms are present</p>
            <ChipToggle
              options={[...SETTINGS]}
              selected={state.settings}
              onToggle={(id) => patch({ settings: toggleId(state.settings, id) })}
            />
            <CriterionFlagRow
              label={provisional ? 'Criterion C (provisional)' : 'Criterion C'}
              value={c}
              provisional={provisional}
              onChange={(criterionC) => patch({ criterionC })}
            />
          </div>

          <Dsm5FormulationImpairment
            impairment={state.impairment}
            onChange={(impairment) => patch({ impairment })}
          />
          <CriterionFlagRow
            label={provisional ? 'Criterion D (provisional)' : 'Criterion D'}
            value={d}
            provisional={provisional}
            onChange={(criterionD) => patch({ criterionD })}
          />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Criterion E — Exclusion
            </p>
            <p className="text-[11px] text-stone-500">Considered and ruled out</p>
            <ChipToggle
              options={[...EXCLUSIONS]}
              selected={state.exclusions}
              onToggle={(id) => patch({ exclusions: toggleId(state.exclusions, id) })}
            />
            <CriterionFlagRow
              label={provisional ? 'Criterion E (provisional)' : 'Criterion E'}
              value={state.criterionE}
              provisional={provisional}
              onChange={(criterionE) => patch({ criterionE })}
            />
            {state.criterionE === 'not_met' ? (
              <input
                type="text"
                value={state.alternativeDiagnosis}
                onChange={(e) => patch({ alternativeDiagnosis: e.target.value })}
                placeholder="Primary alternative diagnosis…"
                className="w-full rounded-lg border border-stone-200 p-2 text-xs"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
