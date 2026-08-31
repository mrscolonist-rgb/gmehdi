import { ChipToggle } from './ChipToggle.tsx';
import {
  IMPAIRMENT_DOMAINS,
  type Dsm5FormulationState,
  type ImpairmentDomainState,
} from '../data/dsm5Formulation.ts';

interface Props {
  impairment: Dsm5FormulationState['impairment'];
  onChange: (next: Dsm5FormulationState['impairment']) => void;
}

export function Dsm5FormulationImpairment({ impairment, onChange }: Props) {
  function patch(id: string, partial: Partial<ImpairmentDomainState>) {
    const cur = impairment[id] || { on: false, items: [], examples: '' };
    onChange({ ...impairment, [id]: { ...cur, ...partial } });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        Criterion D — Functional impairment
      </p>
      <p className="text-[11px] text-stone-500">
        Clear evidence symptoms interfere with social, academic, or occupational functioning. Optional
        — fill only what this session covers.
      </p>
      {IMPAIRMENT_DOMAINS.map((d) => {
        const st = impairment[d.id] || { on: false, items: [], examples: '' };
        const active = st.on || st.items.length > 0;
        return (
          <div key={d.id} className="rounded-lg border border-stone-100 p-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-stone-800">
              <input
                type="checkbox"
                checked={active}
                onChange={() => {
                  if (active) patch(d.id, { on: false, items: [], examples: '' });
                  else patch(d.id, { on: true });
                }}
                className="h-3.5 w-3.5"
              />
              {d.label}
            </label>
            {active ? (
              <div className="mt-2 space-y-2">
                <ChipToggle
                  options={d.items}
                  selected={st.items}
                  onToggle={(id) => {
                    const items = st.items.includes(id)
                      ? st.items.filter((x) => x !== id)
                      : [...st.items, id];
                    patch(d.id, { on: true, items });
                  }}
                />
                <textarea
                  rows={2}
                  value={st.examples}
                  onChange={(e) => patch(d.id, { on: true, examples: e.target.value })}
                  placeholder="Examples (optional)…"
                  className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
