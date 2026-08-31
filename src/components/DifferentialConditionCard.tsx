import { ChipToggle } from './ChipToggle.tsx';
import {
  emptyDiffEntry,
  type DiffEntry,
} from '../data/differential.ts';
import type { DiffCondition } from '../data/differentialTypes.ts';

interface Props {
  condition: DiffCondition;
  value: DiffEntry | undefined;
  onChange: (next: DiffEntry) => void;
}

export function DifferentialConditionCard({ condition, value, onChange }: Props) {
  const e = value || emptyDiffEntry();
  const open = e.on || e.chips.length > 0 || Object.values(e.texts).some((t) => t.trim());

  function patch(partial: Partial<DiffEntry>) {
    onChange({ ...e, ...partial, on: true });
  }

  return (
    <div className="rounded-lg border border-stone-100 p-2">
      <label className="flex cursor-pointer items-start gap-2 text-xs text-stone-800">
        <input
          type="checkbox"
          checked={open}
          onChange={() => {
            if (open) onChange(emptyDiffEntry());
            else onChange({ ...emptyDiffEntry(), on: true });
          }}
          className="mt-0.5 h-3.5 w-3.5 shrink-0"
        />
        <span>
          <span className="font-medium">{condition.label}</span>
          {condition.note ? (
            <span className="mt-0.5 block text-[11px] font-normal text-stone-500">
              {condition.note}
            </span>
          ) : null}
        </span>
      </label>
      {open ? (
        <div className="mt-2 space-y-2 pl-5">
          {condition.chips?.length ? (
            <ChipToggle
              options={condition.chips}
              selected={e.chips}
              single={condition.single}
              onToggle={(id) => {
                const chips = condition.single
                  ? e.chips.includes(id)
                    ? []
                    : [id]
                  : e.chips.includes(id)
                    ? e.chips.filter((x) => x !== id)
                    : [...e.chips, id];
                patch({ chips });
              }}
            />
          ) : null}
          {condition.texts?.map((t) => (
            <input
              key={t.id}
              type="text"
              value={e.texts[t.id] || ''}
              onChange={(ev) =>
                patch({ texts: { ...e.texts, [t.id]: ev.target.value } })
              }
              placeholder={t.placeholder || t.label}
              className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
